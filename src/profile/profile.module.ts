import { Module } from '@nestjs/common';
import { JwtModule } from '../jwt/jwt.module';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [JwtModule],
  providers: [ProfileService],
  controllers: [ProfileController],
})
export class ProfileModule {}
