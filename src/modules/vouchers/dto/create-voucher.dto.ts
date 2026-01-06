import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsDate,
  IsBoolean,
  IsOptional,
  IsArray,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVoucherDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(4, { message: 'Mã voucher phải có ít nhất 4 ký tự' })
  @MaxLength(20, { message: 'Mã voucher không được vượt quá 20 ký tự' })
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(['PERCENTAGE', 'FIXED_AMOUNT'], {
    message: 'Loại giảm giá phải là PERCENTAGE hoặc FIXED_AMOUNT',
  })
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';

  @IsNumber()
  @Min(0, { message: 'Giá trị giảm giá phải lớn hơn 0' })
  discountValue: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscountAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxUsage?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxUsagePerUser?: number;

  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  applicableProducts?: string[];

  @IsOptional()
  @IsArray()
  applicableCategories?: string[];

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
