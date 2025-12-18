import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateDishDto {
  @IsString()
  @MinLength(3, { message: 'Tên món ăn phải có ít nhất 3 ký tự' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0, { message: 'Giá phải lớn hơn 0' })
  price: number;

  @IsString()
  @IsIn(['appetizer', 'main-course', 'dessert', 'beverage'], {
    message: 'Loại món ăn không hợp lệ',
  })
  category: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;
}
