import { Controller, Get, Inject, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { BaseController } from '../common';
import { AuthGuard, Authorized } from '../common/guards';
import { ProfileService } from './profile.service';

@ApiBearerAuth('jwt')
@Authorized()
@UseGuards(AuthGuard)
@Controller('profile')
export class ProfileController extends BaseController {
  @Inject(ProfileService) private readonly profileService: ProfileService;

  @Get('')
  async profile(@Req() request: Request) {
    return this.handleAuthRequest(
      this.profileService.getProfile.bind(this.profileService),
      request.user.email,
    );
  }
}
