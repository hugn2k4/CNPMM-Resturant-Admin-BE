import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateCustomerDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  fullName?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE', 'BLOCKED'])
  status?: string;

  @IsOptional()
  @IsString()
  password?: string;
}
