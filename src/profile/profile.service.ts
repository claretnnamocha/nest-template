import { Inject, Injectable } from '@nestjs/common';
import { CatchServiceErrors } from 'src/common/base.service';
import { translate } from 'src/common/i18n';
import { BaseService } from '../common';
import { ServiceResponse } from '../common/interfaces';
import { UserRepository } from '../common/database/repositories/user.repository';

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
