import { Module } from '@nestjs/common';
import { EmailService } from '../common';
import { JwtModule } from '../jwt/jwt.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [JwtModule],
  providers: [AuthService, EmailService],
  controllers: [AuthController],
})
export class AuthModule {}
