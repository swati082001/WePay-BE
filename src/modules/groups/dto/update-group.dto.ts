import { IsString, MaxLength, IsOptional } from 'class-validator';

export class UpdateGroupDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;
}
