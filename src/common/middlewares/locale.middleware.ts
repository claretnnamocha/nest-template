import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as locales from '../../common/i18n/locales';
import { asyncLocalStorage, RequestContext } from '../request.context';

@Injectable()
export class LocaleMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Extract locale from headers or query parameter, default to 'en'
    const locale: keyof typeof locales = (
      req.headers.locale ?? 'en'
    ).toString() as keyof typeof locales;
    const context: RequestContext = { locale };

    // Run the rest of the request inside the async context
    asyncLocalStorage.run(context, () => {
      next();
    });
  }
}
