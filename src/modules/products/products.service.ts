import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: MongoRepository<Product>,
  ) {}

  // Tạo sản phẩm mới
  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      const product = this.productRepository.create({
        ...createProductDto,
        categoryId: new ObjectId(createProductDto.categoryId),
      });
      return await this.productRepository.save(product);
    } catch (error) {
      throw new BadRequestException('Không thể tạo sản phẩm');
    }
  }

  // Lấy tất cả sản phẩm
  async findAll(): Promise<Product[]> {
    const products = await this.productRepository
      .aggregate([
        { $match: { isDeleted: false } },
        {
          $lookup: {
            from: 'images',
            localField: 'listProductImage',
            foreignField: '_id',
            as: 'imageDetails',
          },
        },
        {
          $addFields: {
            listProductImage: {
              $map: {
                input: '$imageDetails',
                as: 'img',
                in: { url: '$$img.url' },
              },
            },
          },
        },
        { $project: { imageDetails: 0 } },
        { $sort: { createdAt: -1 } },
      ])
      .toArray();

    return products as any;
  }

  // Lấy sản phẩm theo category
  async findByCategory(categoryId: string): Promise<Product[]> {
    try {
      const products = await this.productRepository
        .aggregate([
          {
            $match: {
              categoryId: new ObjectId(categoryId),
              isDeleted: false,
            },
          },
          {
            $lookup: {
              from: 'images',
              localField: 'listProductImage',
              foreignField: '_id',
              as: 'imageDetails',
            },
          },
          {
            $addFields: {
              listProductImage: {
                $map: {
                  input: '$imageDetails',
                  as: 'img',
                  in: { url: '$$img.url' },
                },
              },
            },
          },
          { $project: { imageDetails: 0 } },
          { $sort: { createdAt: -1 } },
        ])
        .toArray();

      return products as any;
    } catch (error) {
      throw new BadRequestException('Category ID không hợp lệ');
    }
  }

  // Lấy chi tiết một sản phẩm
  async findOne(id: string): Promise<Product> {
    try {
      const product = await this.productRepository.findOne({
        where: { _id: new ObjectId(id), isDeleted: false } as any,
      });

      if (!product) {
        throw new NotFoundException('Không tìm thấy sản phẩm');
      }

      return product;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('ID không hợp lệ');
    }
  }

  // Cập nhật sản phẩm
  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    const updateData: any = { ...updateProductDto };
    if (updateProductDto.categoryId) {
      updateData.categoryId = new ObjectId(updateProductDto.categoryId);
    }

    Object.assign(product, updateData);
    return await this.productRepository.save(product);
  }

  // Xóa sản phẩm (soft delete)
  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    product.isDeleted = true;
    await this.productRepository.save(product);
  }

  // Cập nhật trạng thái sản phẩm
  async updateStatus(id: string, status: string): Promise<Product> {
    const product = await this.findOne(id);
    product.status = status;
    return await this.productRepository.save(product);
  }
}
