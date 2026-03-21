import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception';

export class NotFoundException extends AppException {
  constructor(entity: string, id: string) {
    super(HttpStatus.NOT_FOUND, 'NOT_FOUND', `${entity} not found: ${id}`);
  }
}
