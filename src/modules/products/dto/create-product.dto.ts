import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty({ message: 'Giá không được để trống' })
  @IsNumber()
  @Min(0)
  price: number;

  @IsNotEmpty({ message: 'Category ID không được để trống' })
  @IsString()
  categoryId: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsString()
  preparationTime?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  calories?: number;

  @IsOptional()
  listProductImage?: Array<{ url: string }>;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;
}
