import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CreateOrderDto } from './create-order.dto';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @IsString()
  @IsOptional()
  note?: string;

  @IsEnum(['COD', 'banking', 'e-wallet'])
  @IsOptional()
  paymentMethod?: string;

  @IsEnum(['pending', 'paid', 'failed'])
  @IsOptional()
  paymentStatus?: string;
}
