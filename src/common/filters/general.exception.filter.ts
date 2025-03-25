import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { config, timestamp } from '..';
import { translate } from '../i18n';
import { ServiceResponse } from '../interfaces';

@Catch()
export class GeneralExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    let statusCode = exception?.status || 500;
    const errorResponse = exception?.response || {};
    const responseBody: ServiceResponse = {
      success: false,
      message: errorResponse.message,
    };

    // Define handlers for specific error scenarios
    const handlers: { [key: number]: () => void } = {
      [HttpStatus.BAD_REQUEST]: () => {
        if (
          errorResponse.error === 'Bad Request' &&
          Array.isArray(errorResponse.message)
        ) {
          statusCode = HttpStatus.UNPROCESSABLE_ENTITY;
          responseBody.message = translate('VALIDATION.INVALID_PARAMETERS');
          responseBody.data = errorResponse.message.reduce(
            (acc: { [field: string]: string[] }, error: string) => {
              const [field] = error.split(' ');
              if (!acc[field]) acc[field] = [];
              acc[field].push(error);
              return acc;
            },
            {},
          );
        }
      },
      [HttpStatus.NOT_FOUND]: () => {
        responseBody.message = config.ENABLE_DEBUG_MODE
          ? `Cannot ${request.method} ${request.path}`
          : 'Not Found';
      },
    };

    // Execute the corresponding handler if one exists
    if (handlers[statusCode]) {
      handlers[statusCode]();
    }

    responseBody.timestamp = timestamp();

    return response.status(statusCode).json(responseBody);
  }
}
