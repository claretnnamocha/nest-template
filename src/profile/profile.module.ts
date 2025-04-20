import { Module } from '@nestjs/common';
import { EmailService } from '../common';
import { UserRepository } from '../common/database/repositories';
import { JwtModule } from '../common/jwt/jwt.module';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [JwtModule],
  providers: [ProfileService, UserRepository, EmailService],
  controllers: [ProfileController],
})
export class ProfileModule {}
