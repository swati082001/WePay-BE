import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (!value || !Types.ObjectId.isValid(value)) {
      throw new BadRequestException(
        `Validation failed: ${metadata.data || 'param'} must be a valid MongoDB ObjectId`,
      );
    }
    return value;
  }
}
