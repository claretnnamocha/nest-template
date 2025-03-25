import { Controller, HttpStatus, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { timestamp } from '.';
import { ServiceResponse } from './interfaces';

@Controller({ scope: Scope.REQUEST })
export class BaseController {
  @Inject(REQUEST) private readonly request: Request;

  async response(data: ServiceResponse) {
    let statusCode: number;

    if (data.statusCode) {
      statusCode = data.statusCode;
      delete data.statusCode;
    } else {
      statusCode = data.success ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
    }

    data.timestamp = timestamp();

    this.request.res.status(statusCode);
    return data;
  }

  // A generic handler for auth routes
  async handleAuthRequest<T>(
    serviceMethod:
      | ((dto: T) => Promise<ServiceResponse>)
      | (() => Promise<ServiceResponse>),
    dto?: T,
  ) {
    const data = await serviceMethod(dto);
    return this.response(data);
  }
}
