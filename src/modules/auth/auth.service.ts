import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { MongoRepository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { PendingRegistration } from './entities/pending-registration.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailerService: MailerService,
    @InjectRepository(PendingRegistration)
    private pendingRegRepository: MongoRepository<PendingRegistration>,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmailWithPassword(email);
    if (user && user.password && (await bcrypt.compare(pass, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user._id, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName || `${user.firstName} ${user.lastName}`,
        role: user.role,
        image: user.image,
      },
    };
  }

  async sendRegisterOtp(registerDto: any) {
    console.log('Sending registration OTP to:', registerDto.email);

    // Check if email already exists in users
    const existing = await this.usersService.findOneByEmail(registerDto.email);
    if (existing) {
      console.log('User already exists:', registerDto.email);
      throw new BadRequestException('Email already exists');
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 15); // 15 mins

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Delete any existing pending registration for this email
    await this.pendingRegRepository.deleteMany({ email: registerDto.email });

    // Store registration data in database
    const pendingReg = this.pendingRegRepository.create({
      email: registerDto.email,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      password: hashedPassword,
      otp,
      otpExpires: expires,
    });
    await this.pendingRegRepository.save(pendingReg);

    // Send Email
    try {
      await this.mailerService.sendMail({
        to: registerDto.email,
        subject: 'Xác thực đăng ký - Restaurant Admin',
        text: `Mã OTP của bạn là: ${otp}`,
        html: `
          <h3>Xác thực đăng ký tài khoản</h3>
          <p>Xin chào <b>${registerDto.firstName} ${registerDto.lastName}</b>,</p>
          <p>Mã OTP của bạn là: <b style="font-size: 24px; color: #ff6b35;">${otp}</b></p>
          <p>Mã này sẽ hết hạn sau 15 phút.</p>
          <p>Nếu bạn không yêu cầu đăng ký, vui lòng bỏ qua email này.</p>
        `,
      });
    } catch (e) {
      console.error('Email error:', e);
      throw new BadRequestException('Failed to send email');
    }

    return {
      message: 'OTP đã được gửi đến email của bạn',
      email: registerDto.email,
    };
  }

  async verifyRegisterOtp(email: string, otp: string) {
    // Find pending registration in database
    const pending = await this.pendingRegRepository.findOne({
      where: { email },
    });

    if (!pending) {
      throw new BadRequestException(
        'No pending registration found for this email',
      );
    }

    // Check OTP
    if (pending.otp !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    // Check expiry
    if (new Date() > new Date(pending.otpExpires)) {
      await this.pendingRegRepository.delete({ email });
      throw new BadRequestException('OTP has expired');
    }

    // OTP is valid, now create the user (password is already hashed)
    console.log('Creating user with data:', {
      firstName: pending.firstName,
      lastName: pending.lastName,
      email: pending.email,
    });

    const newUser = await this.usersService.create({
      firstName: pending.firstName,
      lastName: pending.lastName,
      email: pending.email,
      fullName: `${pending.firstName} ${pending.lastName}`,
      password: pending.password, // Already hashed
      role: 'admin',
      authProvider: 'local',
    });

    console.log('User created:', newUser);

    // Clean up pending registration
    await this.pendingRegRepository.delete({ email });

    // Auto login after successful registration
    const loginResponse = this.login(newUser);
    console.log('Login response:', loginResponse);
    return loginResponse;
  }

  async register(registerDto: any) {
    console.log('Registering user:', registerDto.email);
    // Check if exists
    const existing = await this.usersService.findOneByEmail(registerDto.email);
    if (existing) {
      console.log('User already exists:', registerDto.email);
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const { firstName, lastName, email } = registerDto;

    const newUser = await this.usersService.create({
      firstName,
      lastName,
      email,
      fullName: `${firstName} ${lastName}`,
      password: hashedPassword,
      role: 'admin', // Default to admin for this Admin Portal
      authProvider: 'local',
    });

    return this.login(newUser);
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) throw new BadRequestException('User not found');

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 15); // 15 mins

    user.otp = otp;
    user.otpExpires = expires;
    await this.usersService.update(user);

    // Send Email
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Reset Password OTP - Restaurant Admin',
        text: `Your OTP is: ${otp}`,
        html: `<h3>Password Reset Request</h3><p>Your OTP is: <b>${otp}</b></p><p>This OTP expires in 15 minutes.</p>`,
      });
    } catch (e) {
      console.error('Email error:', e);
      throw new BadRequestException('Failed to send email');
    }

    return { message: 'OTP sent to email', email };
  }

  async resetPassword(resetDto: any) {
    const { email, otp, newPassword } = resetDto;
    const user = await this.usersService.findOneByEmailWithPassword(email);
    if (!user) throw new BadRequestException('User not found');

    // Check OTP
    if (!user.otp || user.otp !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    // Check Expiry
    if (new Date() > new Date(user.otpExpires)) {
      throw new BadRequestException('OTP Expired');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp = null;
    user.otpExpires = null;

    await this.usersService.update(user);

    return { message: 'Password reset successful' };
  }
}
