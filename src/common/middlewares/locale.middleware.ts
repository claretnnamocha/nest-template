import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as locales from '../i18n/locales';
import { asyncLocalStorage, RequestContext } from '../request.context';

@Injectable()
export class LocaleMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Extract locale from headers or query parameter, default to 'en'
    const locale: keyof typeof locales = (
      req.headers?.locale ||
      req.query?.locale ||
      'en'
    ).toString() as keyof typeof locales;

    if (req.query?.locale) {
      delete req.query.locale;
    }

    const context: RequestContext = { locale };

    // Run the rest of the request inside the async context
    asyncLocalStorage.run(context, () => {
      next();
    });
  }
}
