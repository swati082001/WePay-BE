import { IsMongoId, IsNumber, Min } from 'class-validator';

export class ExactSplitInputDto {
  @IsMongoId()
  userId: string;

  @IsNumber()
  @Min(0)
  amountOwed: number;
}

export class PercentageSplitInputDto {
  @IsMongoId()
  userId: string;

  @IsNumber()
  @Min(0)
  percentage: number;
}
