import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { EquipmentStatus, EquipmentType } from '../../../enums';

export class UpdateEquipmentDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @IsEnum(EquipmentType)
  type?: string;

  @IsOptional()
  @IsString()
  @IsEnum(EquipmentStatus)
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  serial_number?: string;
}
