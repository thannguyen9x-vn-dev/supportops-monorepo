import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception';

export class ForbiddenException extends AppException {
  constructor(message = 'Insufficient permissions') {
    super(HttpStatus.FORBIDDEN, 'FORBIDDEN', message);
  }
}
