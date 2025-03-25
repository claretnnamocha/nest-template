import { HttpStatus } from '@nestjs/common';

export interface ServiceResponse {
  statusCode?: HttpStatus;
  success: boolean;
  message?: string;
  data?: any;
  error?: any;
  metadata?: any;
  timestamp?: string;
}
