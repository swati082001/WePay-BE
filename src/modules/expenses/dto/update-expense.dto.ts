import {
  IsString,
  IsNumber,
  Min,
  IsMongoId,
  IsEnum,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SPLIT_TYPES } from '../schemas/expense.schema';
import type { SplitType } from '../schemas/expense.schema';
import { ExactSplitInputDto } from './split-input.dto';
import { PercentageSplitInputDto } from './split-input.dto';

export class UpdateExpenseDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @IsOptional()
  @IsMongoId()
  paidBy?: string;

  @IsOptional()
  @IsEnum(SPLIT_TYPES)
  splitType?: SplitType;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  participantIds?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExactSplitInputDto)
  exactSplits?: ExactSplitInputDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PercentageSplitInputDto)
  percentageSplits?: PercentageSplitInputDto[];
}
