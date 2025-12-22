import { IsEnum } from 'class-validator';

export class ToggleStatusDto {
  @IsEnum(['ACTIVE', 'BLOCKED'])
  status: string;
}
