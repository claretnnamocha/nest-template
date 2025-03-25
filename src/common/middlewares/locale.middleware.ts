import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { asyncLocalStorage, RequestContext } from '../request.context';

@Injectable()
export class LocaleMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Extract locale from headers or query parameter, default to 'en'
    const locale = (req.headers.locale || 'en').toString();
    const context: RequestContext = { locale };

    // Run the rest of the request inside the async context
    asyncLocalStorage.run(context, () => {
      next();
    });
  }
}
