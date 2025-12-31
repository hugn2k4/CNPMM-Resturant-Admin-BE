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
      // Check if admin already exists
      const existingAdmin = await this.usersRepository.findOne({
        where: { email: 'admin@restaurant.com' },
      });

      if (existingAdmin) {
        console.log('✅ Admin user already exists');
        return { message: 'Admin user already exists', user: existingAdmin };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash('admin123', 10);

      // Create admin user
      const adminUser = this.usersRepository.create({
        email: 'admin@restaurant.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'Restaurant',
        fullName: 'Admin Restaurant',
        role: 'admin',
        authProvider: 'local',
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const savedUser = await this.usersRepository.save(adminUser);

      console.log('✅ Admin user created successfully');
      console.log('📧 Email: admin@restaurant.com');
      console.log('🔑 Password: admin123');

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
