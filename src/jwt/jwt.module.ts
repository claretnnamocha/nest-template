import { Module } from '@nestjs/common';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';
import { config } from '../common';
import { JwtService } from './jwt.service';

@Module({
  providers: [JwtService],
  imports: [
    NestJwtModule.registerAsync({
      useFactory() {
        return { secret: config.JWT_SECRET };
      },
    }),
  ],
  exports: [JwtService],
})
export class JwtModule {}
