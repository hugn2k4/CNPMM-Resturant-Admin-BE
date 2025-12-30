import { ArrayNotEmpty, IsArray, IsEnum, IsString } from 'class-validator';

export class BulkUpdateStatusDto {
  @IsArray()
  @ArrayNotEmpty()
  orderIds: string[];

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
  cancelReason?: string;
}
