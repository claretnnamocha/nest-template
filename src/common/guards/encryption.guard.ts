import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { isInstance } from 'class-validator';
import { Request } from 'express';
import { UnAuthorizedMessage } from '.';
import { config, decrypt } from '..';
import { translate } from '../i18n';
import { MetadataKeys } from './types';

export class BadRequestEncryptionException extends HttpException {
  constructor() {
    const encryptionMessage = config.ENABLE_DEBUG_MODE
      ? translate('MESSAGES.UNENCRYPTED')
      : 'ERR 01';

    super(
      { statusCode: HttpStatus.BAD_REQUEST, message: encryptionMessage },
      HttpStatus.BAD_REQUEST,
    );
  }
}

@Injectable()
export class EncryptionGuard implements CanActivate {
  private context!: ExecutionContext;
  constructor(private readonly reflector: Reflector) {}

  getMetadata<T>(key: string): T {
    return (
      this.reflector.get<T>(key, this.context.getHandler()) ||
      this.reflector.get<T>(key, this.context.getClass())
    );
  }

  async canActivate(context: ExecutionContext): Promise<any> {
    this.context = context;

    try {
      const unEncrypted = this.getMetadata<boolean>(MetadataKeys.unEncrypted);

      if (unEncrypted) return true;

      const req: Request = context.switchToHttp().getRequest();

      if (config.ENABLE_ENCRYPTED_REQUESTS) {
        const { data } = req.body;
        const { q } = req.query;

        delete req.body.data;
        delete req.query.q;

        if (
          !(
            !(!data && Object.keys(req.body).length > 0) &&
            !(!q && Object.keys(req.query).length > 0)
          )
        ) {
          throw new BadRequestEncryptionException();
        }

        if (data) {
          const bodyString = await decrypt(data);
          const payload = JSON.parse(bodyString);
          req.body = payload;
        }

        if (q) {
          const queryString = await decrypt(q as string);
          const payload = JSON.parse(queryString);
          req.query = payload;
        }
      }

      return true;
    } catch (error) {
      if (isInstance(error, BadRequestEncryptionException)) {
        throw error;
      }
      throw new UnauthorizedException(UnAuthorizedMessage());
    }
  }
}
