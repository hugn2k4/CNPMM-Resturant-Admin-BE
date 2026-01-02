import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { MongoRepository } from 'typeorm';
import { User } from '../modules/users/entities/user.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User)
    private usersRepository: MongoRepository<User>,
  ) {}

  async seedAdminUser() {
    try {
      // Check if admin already exists (SHARED DATABASE - cùng với Customer BE)
      const existingAdmin = await this.usersRepository.findOne({
        where: { email: 'cnpmm@admin.com' },
      });

      if (existingAdmin) {
        console.log('✅ Admin user already exists');
        console.log('📧 Email: cnpmm@admin.com');
        return { message: 'Admin user already exists', user: existingAdmin };
      }

      // Hash password - SAME AS CUSTOMER BE
      const hashedPassword = await bcrypt.hash('Admin@123456', 10);

      // Create admin user - SHARED ACCOUNT
      const adminUser = this.usersRepository.create({
        email: 'cnpmm@admin.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'System',
        fullName: 'Administrator',
        role: 'admin',
        authProvider: 'local',
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const savedUser = await this.usersRepository.save(adminUser);

      console.log('✅ Default admin created successfully!');
      console.log('📧 Email: cnpmm@admin.com');
      console.log('🔑 Password: Admin@123456');
      console.log('⚠️  Please change the password after first login!');

      return { message: 'Admin user created successfully', user: savedUser };
    } catch (error) {
      console.error('❌ Error seeding admin user:', error);
      throw error;
    }
  }

  async seedAll() {
    console.log('🌱 Starting database seeding...');

    await this.seedAdminUser();

    console.log('🎉 Seeding completed!');
  }
}
