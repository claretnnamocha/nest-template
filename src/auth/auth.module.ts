import { Module } from '@nestjs/common';
import { EmailService } from '../common';
import { JwtModule } from '../jwt/jwt.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRepository } from 'src/common/database/repositories/user.repository';

@Module({
  imports: [JwtModule],
  providers: [AuthService, EmailService, UserRepository],
  controllers: [AuthController],
})
export class AuthModule {}
