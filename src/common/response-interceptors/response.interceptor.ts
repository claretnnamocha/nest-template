import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const date = new Date();
    const timestamp = `${date.toDateString()} ${date.toTimeString()}`;

    return next.handle().pipe(
      map((data) => {
        context.switchToHttp().getResponse().status(data.statusCode);
        return { ...data, timestamp };
      }),
    );
  }
}
