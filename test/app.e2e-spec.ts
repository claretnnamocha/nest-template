import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { ResponseInterceptor } from '../src/common/response-interceptors';
import { ErrorFilter } from '../src/common/exception-filters';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useGlobalFilters(new ErrorFilter());
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(HttpStatus.CREATED)
      .expect((response) => {
        expect(response.body).toHaveProperty('message', 'Hello World!');
      });
  });
});
