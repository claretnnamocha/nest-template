import { HttpStatus, Injectable } from '@nestjs/common';
import { config } from '.';
import { ServiceResponse } from './interfaces';

export function CatchServiceErrors(): ClassDecorator {
  return (target: any) => {
    const methodNames = Object.getOwnPropertyNames(target.prototype).filter(
      (methodName) =>
        methodName !== 'constructor' &&
        typeof target.prototype[methodName] === 'function',
    );

    for (const methodName of methodNames) {
      const originalMethod = target.prototype[methodName];

      target.prototype[methodName] = async function (...args: any[]) {
        try {
          const result = originalMethod.apply(this, args);
          if (result && typeof result.then === 'function') {
            return await result;
          }
          return result;
        } catch (error) {
          return BaseService.handleError(error);
        }
      };
    }
  };
}

@Injectable()
export class BaseService {
  static async handleError(error: Error): Promise<ServiceResponse> {
    const message = config.ENABLE_DEBUG_MODE
      ? error.message
      : 'An unexpected error occurred on the server. Please try again later';
    const errorObj = config.ENABLE_DEBUG_MODE ? error : undefined;

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      success: false,
      message,
      error: errorObj,
    };
  }
}
