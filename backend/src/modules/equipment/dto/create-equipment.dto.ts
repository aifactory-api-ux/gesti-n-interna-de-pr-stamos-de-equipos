import { IsString, IsOptional, IsEnum, MaxLength, MinLength } from 'class-validator';
import { EquipmentType } from '../../../enums';

export class CreateEquipmentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @IsString()
  @IsEnum(EquipmentType)
  type: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  serial_number?: string;
}
