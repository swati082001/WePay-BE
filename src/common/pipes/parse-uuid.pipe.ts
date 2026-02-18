import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate as isUUID } from 'uuid';

@Injectable()
export class ParseUuidPipe implements PipeTransform<string, string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (!value || !isUUID(value)) {
      throw new BadRequestException(
        `Validation failed: ${metadata.data || 'param'} must be a valid UUID`,
      );
    }
    return value;
  }
}
