import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ErrorFilter } from './common/exception-filters';
import { ResponseInterceptor } from './common/response-interceptors';
import { logger } from './common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = 8080;

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new ErrorFilter());

  await app.listen(port);

  logger.log(`Running on http://localhost:${port}`);
}
bootstrap();
