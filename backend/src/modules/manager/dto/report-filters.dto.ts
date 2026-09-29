import { IsOptional, IsDateString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class ReportFiltersDto {
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsIn(['csv', 'pdf'])
  format?: 'csv' | 'pdf';
}
