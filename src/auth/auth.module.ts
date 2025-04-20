import { Module } from '@nestjs/common';
import { EmailService } from '../common';
import { UserRepository } from '../common/database/repositories';
import { JwtModule } from '../common/jwt/jwt.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [JwtModule],
  providers: [AuthService, EmailService, UserRepository],
  controllers: [AuthController],
})
export class AuthModule {}
