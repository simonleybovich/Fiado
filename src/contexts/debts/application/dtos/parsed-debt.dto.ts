import { IsISO8601, IsNumber, IsString, Min, MinLength } from 'class-validator';

export class ParsedDebtDto {
  @IsString()
  @MinLength(1)
  debtorName: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @MinLength(1)
  currency: string;

  @IsString()
  reason: string;

  @IsISO8601()
  date: string;
}
