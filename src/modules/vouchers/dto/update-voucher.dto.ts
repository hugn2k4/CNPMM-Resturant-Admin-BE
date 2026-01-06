import { PartialType } from '@nestjs/mapped-types';
import { CreateVoucherDto } from './create-voucher.dto';
import { IsOptional, IsNumber, Min } from 'class-validator';

export class UpdateVoucherDto extends PartialType(CreateVoucherDto) {
  @IsOptional()
  @IsNumber()
  @Min(0)
  usageCount?: number;
}
