import { NestFactory } from '@nestjs/core';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { logger } from './common';
import { ErrorFilter } from './common/exception-filters';
import { ResponseInterceptor } from './common/response-interceptors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const port = 8080;

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new ErrorFilter());

  app.use(helmet());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100,
    }),
  );

  await app.listen(port);

  logger.log(`Running on http://localhost:${port}`);
}
bootstrap();
