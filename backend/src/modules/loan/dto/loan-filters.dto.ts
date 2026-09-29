import { IsOptional, IsInt, Min, Max, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { LoanStatus, ApprovalStatus } from '../../../enums';

export class LoanFiltersDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  @IsEnum(LoanStatus)
  status?: string;

  @IsOptional()
  @IsString()
  @IsEnum(ApprovalStatus)
  approval_status?: string;

  @IsOptional()
  @IsString()
  collaborator_id?: string;

  @IsOptional()
  @IsString()
  equipment_id?: string;
}