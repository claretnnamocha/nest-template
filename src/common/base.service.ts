import { HttpStatus, Injectable } from '@nestjs/common';
import { config } from '.';
import { ServiceResponse } from './interfaces';
import { translate } from './i18n';

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
          if (error instanceof Error) {
            return BaseService.handleError(error);
          }
          return BaseService.handleError(
            new Error(translate('MESSAGES.UNKNOWN_ERROR')),
          );
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
      : translate('MESSAGES.INTERNAL_SERVER_ERROR');
    const errorObj = config.ENABLE_DEBUG_MODE ? error : undefined;

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      success: false,
      message,
      error: errorObj,
    };
  }
}
