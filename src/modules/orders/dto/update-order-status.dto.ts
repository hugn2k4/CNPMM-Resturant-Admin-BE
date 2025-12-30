import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsEnum([
    'pending',
    'confirmed',
    'preparing',
    'shipping',
    'delivered',
    'cancelled',
  ])
  orderStatus:
    | 'pending'
    | 'confirmed'
    | 'preparing'
    | 'shipping'
    | 'delivered'
    | 'cancelled';

  @IsString()
  @IsOptional()
  cancelReason?: string;
}
