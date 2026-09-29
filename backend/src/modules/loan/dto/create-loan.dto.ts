import { IsString, IsOptional, IsDateString, MaxLength } from 'class-validator';

export class CreateLoanDto {
  @IsString()
  @MaxLength(255)
  equipment_id: string;

  @IsOptional()
  @IsDateString()
  due_date?: string;
}