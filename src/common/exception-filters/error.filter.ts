import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

@Catch()
export class ErrorFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const statusCode = exception.getStatus ? exception.getStatus() : 500;
    const date = new Date();
    const timestamp = `${date.toDateString()} ${date.toTimeString()}`;

    const errorResponse = {
      timestamp,
      statusCode,
      message: exception.message || 'Internal Server Error',
    };

    response.status(statusCode).json(errorResponse);
  }
}
