import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { User } from './entities/user.entity';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { ToggleStatusDto } from './dto/toggle-status.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll() {
    // Only get users with role USER
    const customers = await this.userRepository.find({
      where: { role: 'USER' },
      order: { createdAt: 'DESC' },
    });

    // Remove password from response
    return customers.map(({ password, ...customer }) => customer);
  }

  async findOne(id: string) {
    const customer = await this.userRepository.findOne({
      where: { _id: new ObjectId(id) as any },
    });

    if (!customer || customer.role !== 'USER') {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    const { password, ...customerWithoutPassword } = customer;
    return customerWithoutPassword;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    const customer = await this.userRepository.findOne({
      where: { _id: new ObjectId(id) as any },
    });

    if (!customer || customer.role !== 'USER') {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    // Check if email is being changed and already exists
    if (updateCustomerDto.email && updateCustomerDto.email !== customer.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateCustomerDto.email },
      });

      if (existingUser && existingUser._id.toString() !== id) {
        throw new ConflictException('Email already exists');
      }
    }

    // Hash password if provided
    if (updateCustomerDto.password) {
      updateCustomerDto.password = await bcrypt.hash(updateCustomerDto.password, 10);
    }

    await this.userRepository.update(
      { _id: new ObjectId(id) as any },
      updateCustomerDto,
    );

    const updatedCustomer = await this.findOne(id);
    return updatedCustomer;
  }

  async toggleStatus(id: string, toggleStatusDto: ToggleStatusDto) {
    const customer = await this.userRepository.findOne({
      where: { _id: new ObjectId(id) as any },
    });

    if (!customer || customer.role !== 'USER') {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    await this.userRepository.update(
      { _id: new ObjectId(id) as any },
      { status: toggleStatusDto.status },
    );

    const updatedCustomer = await this.findOne(id);
    return updatedCustomer;
  }

  async remove(id: string) {
    const customer = await this.userRepository.findOne({
      where: { _id: new ObjectId(id) as any },
    });

    if (!customer || customer.role !== 'USER') {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    await this.userRepository.delete({ _id: new ObjectId(id) as any });

    return { message: 'Customer deleted successfully' };
  }
}
