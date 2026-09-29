import { IsString, MaxLength } from 'class-validator';

export class ApproveLoanDto {
  @IsString()
  @MaxLength(255)
  approved_by: string;
}