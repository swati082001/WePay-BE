import { IsArray, IsMongoId, ArrayMinSize } from 'class-validator';

export class AddMembersDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsMongoId({ each: true })
  memberIds: string[];
}
