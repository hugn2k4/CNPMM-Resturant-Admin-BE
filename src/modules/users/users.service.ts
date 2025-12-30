import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: MongoRepository<User>,
  ) {}

  async findOneByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }

  // Helper to get password for login
  async findOneByEmailWithPassword(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({
      where: { email },
      select: ['_id', 'email', 'password', 'role', 'firstName', 'lastName', 'fullName'],
    });
  }

  async findById(id: any): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { _id: id } });
  }

  async create(userData: Partial<User>): Promise<User> {
    const newUser = this.usersRepository.create(userData);
    return this.usersRepository.save(newUser);
  }

  async update(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }
}
