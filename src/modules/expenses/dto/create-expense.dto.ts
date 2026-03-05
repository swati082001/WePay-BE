import {
  IsString,
  IsNotEmpty,
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

export class CreateExpenseDto {
  @IsNotEmpty()
  @IsMongoId()
  groupId: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsNotEmpty()
  @IsMongoId()
  paidBy: string;

  @IsEnum(SPLIT_TYPES)
  splitType: SplitType;

  /** For equal split: optional list of participant user IDs (default: all group members). */
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  participantIds?: string[];

  /** For exact split: array of { userId, amountOwed }. Sum must equal amount. */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExactSplitInputDto)
  exactSplits?: ExactSplitInputDto[];

  /** For percentage split: array of { userId, percentage }. Sum must equal 100. */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PercentageSplitInputDto)
  percentageSplits?: PercentageSplitInputDto[];
}
