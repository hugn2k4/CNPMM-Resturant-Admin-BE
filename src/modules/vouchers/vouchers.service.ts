import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { Repository } from 'typeorm';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { Voucher } from './entities/voucher.entity';

@Injectable()
export class VouchersService {
  constructor(
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,
  ) {}

  async create(
    createVoucherDto: CreateVoucherDto,
    userId?: string,
  ): Promise<Voucher> {
    // Validate dates
    if (
      new Date(createVoucherDto.startDate) >= new Date(createVoucherDto.endDate)
    ) {
      throw new BadRequestException('Ngày bắt đầu phải trước ngày kết thúc');
    }

    // Check if code already exists
    const existingVoucher = await this.voucherRepository.findOne({
      where: { code: createVoucherDto.code.toUpperCase() },
    });

    if (existingVoucher) {
      throw new ConflictException('Mã voucher đã tồn tại');
    }

    // Validate discount value for percentage type
    if (
      createVoucherDto.discountType === 'PERCENTAGE' &&
      createVoucherDto.discountValue > 100
    ) {
      throw new BadRequestException(
        'Giảm giá theo phần trăm không được vượt quá 100%',
      );
    }

    const voucher = this.voucherRepository.create({
      ...createVoucherDto,
      code: createVoucherDto.code.toUpperCase(),
      createdBy: userId || null,
    });

    return await this.voucherRepository.save(voucher);
  }

  async findAll(filters?: {
    isActive?: boolean;
    discountType?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Voucher[]; total: number; page: number; limit: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const query: any = {};

    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    if (filters?.discountType) {
      query.discountType = filters.discountType;
    }

    if (filters?.search) {
      query.$or = [
        { code: { $regex: filters.search, $options: 'i' } },
        { name: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const [data, total] = await this.voucherRepository.findAndCount({
      where: query,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Voucher> {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('ID không hợp lệ');
    }

    const voucher = await this.voucherRepository.findOne({
      where: { _id: new ObjectId(id) },
    });

    if (!voucher) {
      throw new NotFoundException('Không tìm thấy voucher');
    }

    return voucher;
  }

  async findByCode(code: string): Promise<Voucher> {
    const voucher = await this.voucherRepository.findOne({
      where: { code: code.toUpperCase() },
    });

    if (!voucher) {
      throw new NotFoundException('Không tìm thấy voucher');
    }

    return voucher;
  }

  async update(
    id: string,
    updateVoucherDto: UpdateVoucherDto,
  ): Promise<Voucher> {
    const voucher = await this.findOne(id);

    // Validate dates if both are provided
    if (updateVoucherDto.startDate && updateVoucherDto.endDate) {
      if (
        new Date(updateVoucherDto.startDate) >=
        new Date(updateVoucherDto.endDate)
      ) {
        throw new BadRequestException('Ngày bắt đầu phải trước ngày kết thúc');
      }
    }

    // Check if code is being changed and if it already exists
    if (updateVoucherDto.code && updateVoucherDto.code !== voucher.code) {
      const existingVoucher = await this.voucherRepository.findOne({
        where: { code: updateVoucherDto.code.toUpperCase() },
      });

      if (existingVoucher) {
        throw new ConflictException('Mã voucher đã tồn tại');
      }
    }

    // Validate discount value for percentage type
    if (
      updateVoucherDto.discountType === 'PERCENTAGE' &&
      updateVoucherDto.discountValue &&
      updateVoucherDto.discountValue > 100
    ) {
      throw new BadRequestException(
        'Giảm giá theo phần trăm không được vượt quá 100%',
      );
    }

    Object.assign(voucher, updateVoucherDto);

    if (updateVoucherDto.code) {
      voucher.code = updateVoucherDto.code.toUpperCase();
    }

    return await this.voucherRepository.save(voucher);
  }

  async remove(id: string): Promise<void> {
    const voucher = await this.findOne(id);
    await this.voucherRepository.remove(voucher);
  }

  async toggleActive(id: string): Promise<Voucher> {
    const voucher = await this.findOne(id);
    voucher.isActive = !voucher.isActive;
    return await this.voucherRepository.save(voucher);
  }

  async getStatistics(): Promise<{
    total: number;
    active: number;
    expired: number;
    upcoming: number;
  }> {
    const now = new Date();

    // Get all vouchers and filter in memory since TypeORM MongoDB has issues with date operators
    const allVouchers = await this.voucherRepository.find();

    const total = allVouchers.length;
    const active = allVouchers.filter(
      (v) => v.isActive && v.startDate <= now && v.endDate >= now,
    ).length;
    const expired = allVouchers.filter((v) => v.endDate < now).length;
    const upcoming = allVouchers.filter((v) => v.startDate > now).length;

    return { total, active, expired, upcoming };
  }
}
