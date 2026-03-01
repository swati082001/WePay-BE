import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateGroupDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  name: string;
}
