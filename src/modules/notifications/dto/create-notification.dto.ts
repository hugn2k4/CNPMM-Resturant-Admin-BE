import { IsString, IsNotEmpty, IsOptional, IsArray, IsEnum, IsBoolean } from 'class-validator';

export enum NotificationType {
  ORDER_NEW = 'ORDER_NEW',
  ORDER_CONFIRMED = 'ORDER_CONFIRMED',
  ORDER_PREPARING = 'ORDER_PREPARING',
  ORDER_SHIPPING = 'ORDER_SHIPPING',
  ORDER_DELIVERED = 'ORDER_DELIVERED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  REVIEW_NEW = 'REVIEW_NEW',
  REVIEW_REPLY = 'REVIEW_REPLY',
  VOUCHER_NEW = 'VOUCHER_NEW',
  EVENT_NEW = 'EVENT_NEW',
  CHAT_MESSAGE = 'CHAT_MESSAGE',
  SYSTEM = 'SYSTEM',
}

export class CreateNotificationDto {
  @IsEnum(NotificationType)
  @IsNotEmpty()
  type: NotificationType;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  data?: any;

  @IsBoolean()
  @IsOptional()
  sendEmail?: boolean;
}

export class SendToAllDto extends CreateNotificationDto {
  // Gửi cho tất cả users
}

export class SendToUserDto extends CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}

export class SendToMultipleDto extends CreateNotificationDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  userIds: string[];
}
