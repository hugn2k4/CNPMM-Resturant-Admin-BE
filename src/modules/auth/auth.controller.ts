import { BadRequestException, Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body) {
    const { email, password } = body;
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user); // returns { accessToken, user }
  }

  @Post('send-register-otp')
  async sendRegisterOtp(@Body() body: RegisterDto) {
    return this.authService.sendRegisterOtp(body);
  }

  @Post('verify-register-otp')
  async verifyRegisterOtp(@Body() body) {
    const { email, otp } = body;
    if (!email || !otp) {
      throw new BadRequestException('Email and OTP are required');
    }
    return this.authService.verifyRegisterOtp(email, otp);
  }

  @Post('register')
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body) {
    const { email } = body;
    if (!email) throw new BadRequestException('Email is required');
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body) {
    const { email, otp, newPassword } = body;
    if (!email || !otp || !newPassword) {
        throw new BadRequestException('Missing fields');
    }
    return this.authService.resetPassword(body);
  }
}
