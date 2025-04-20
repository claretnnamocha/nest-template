import { Module } from '@nestjs/common';
import { JwtModule } from '../jwt/jwt.module';
import { ProfileController } from './profile.controller';
import { UserRepository } from '../common/database/repositories/user.repository';
import { ProfileService } from './profile.service';

@Module({
  imports: [JwtModule],
  providers: [ProfileService, UserRepository],
  controllers: [ProfileController],
})
export class ProfileModule {}
