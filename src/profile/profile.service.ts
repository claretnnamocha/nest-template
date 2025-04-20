import { Inject, Injectable } from '@nestjs/common';
import { BaseService } from '../common';
import { CatchServiceErrors } from '../common/base.service';
import { UserRepository } from '../common/database/repositories/user.repository';
import { translate } from '../common/i18n';
import { ServiceResponse } from '../common/interfaces';

@CatchServiceErrors()
@Injectable()
export class ProfileService extends BaseService {
  @Inject(UserRepository)
  private readonly userRepository!: UserRepository;

  async getProfile(email: string): Promise<ServiceResponse> {
    const user = await this.userRepository.findOne({ where: { email } });

    return {
      success: true,
      data: user,
      message: translate('MESSAGES.PROFILE_DATA_RETRIEVED'),
    };
  }
}
