import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { config, logger } from '..';

@Injectable()
export class LogGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    if (config.ENABLE_PAYLOADS_LOGGING) {
      // Log the request data
      logger.log('Request Payload:', {
        method: request.method,
        url: request.url,
        headers: request.headers,
        body: request.body,
        query: request.query,
        params: request.params,
      });
    }

    // Hook into the response's finish event to log response data after it's sent
    response.on('finish', () => {
      if (config.ENABLE_PAYLOADS_LOGGING) {
        logger.log('Response Payload:', {
          method: request.method,
          url: request.url,
          statusCode: response.statusCode,
          statusMessage: response.statusMessage,
          headers: response.getHeaders(),
        });
      }
    });

    // Allow the request to proceed
    return true;
  }
}
