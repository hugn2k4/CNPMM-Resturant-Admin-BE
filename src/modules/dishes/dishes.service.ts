import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { Repository } from 'typeorm';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { Dish } from './entities/dish.entity';

@Injectable()
export class DishesService {
  constructor(
    @InjectRepository(Dish)
    private readonly dishRepository: Repository<Dish>,
  ) {}

  // Tạo món ăn mới
  async create(createDishDto: CreateDishDto): Promise<Dish> {
    const dish = this.dishRepository.create(createDishDto);
    return await this.dishRepository.save(dish);
  }

  // Lấy danh sách tất cả món ăn
  async findAll(): Promise<Dish[]> {
    return await this.dishRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  // Lấy món ăn theo category
  async findByCategory(category: string): Promise<Dish[]> {
    return await this.dishRepository.find({
      where: { category },
      order: { name: 'ASC' },
    });
  }

  // Lấy chi tiết món ăn theo ID
  async findOne(id: string): Promise<Dish> {
    const dish = await this.dishRepository.findOneBy({
      _id: new ObjectId(id),
    } as any);
    if (!dish) {
      throw new NotFoundException(`Không tìm thấy món ăn có ID ${id}`);
    }
    return dish;
  }

  // Cập nhật món ăn
  async update(id: string, updateDishDto: UpdateDishDto): Promise<Dish> {
    const dish = await this.findOne(id);
    Object.assign(dish, updateDishDto);
    return await this.dishRepository.save(dish);
  }

  // Xóa món ăn
  async remove(id: string): Promise<void> {
    const dish = await this.findOne(id);
    await this.dishRepository.remove(dish);
  }

  // Cập nhật trạng thái món ăn
  async updateAvailability(id: string, isAvailable: boolean): Promise<Dish> {
    const dish = await this.findOne(id);
    dish.isAvailable = isAvailable;
    return await this.dishRepository.save(dish);
  }
}
