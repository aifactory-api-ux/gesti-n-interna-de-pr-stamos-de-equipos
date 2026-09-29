import { IsString, IsOptional, MaxLength } from 'class-validator';

export class ReturnLoanDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  returned_by?: string;
}