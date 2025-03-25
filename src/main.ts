import { ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { displayName, version } from '../package.json';
import { AppModule } from './app.module';
import { config, logger, setupConfig } from './common';
import { GeneralExceptionFilter } from './common/filters';
import { EncryptionGuard, LogGuard } from './common/guards';
import { LocaleMiddleware } from './common/middlewares';

async function bootstrap() {
  const error = await setupConfig();
  if (error) return logger.log(error);

  const documentationRoute = '/documentation';
  const baseUrl = `http://localhost:${config.PORT}`;

  const app = await NestFactory.create(AppModule, { logger });

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  const reflector = app.get(Reflector);
  app.useGlobalFilters(new GeneralExceptionFilter());
  app.useGlobalGuards(new EncryptionGuard(reflector), new LogGuard());

  const localeMiddleware = new LocaleMiddleware();
  app.use((req: Request, res: Response, next: NextFunction) =>
    localeMiddleware.use(req, res, next),
  );

  if (config.ENABLE_DOCUMENTATION) {
    const documentationTitle = `${displayName} API Reference`;

    const builder = new DocumentBuilder()
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'jwt',
      )
      .addGlobalParameters({ name: 'locale', in: 'header' })
      .setTitle(documentationTitle)
      .setVersion(version)
      .build();

    SwaggerModule.setup(
      documentationRoute,
      app,
      SwaggerModule.createDocument(app, builder),
      { customSiteTitle: documentationTitle },
    );
  }

  app.enableCors({ credentials: true, origin: config.ACCEPTED_ORIGINS });
  app.use(helmet());

  await app.listen(config.PORT);

  logger.log(`${displayName} is running on ${baseUrl}`);
  if (config.ENABLE_DOCUMENTATION) {
    logger.log(`Documentation on ${baseUrl}${documentationRoute}`);
  }
}
bootstrap();
