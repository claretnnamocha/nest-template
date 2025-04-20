import { Injectable } from '@nestjs/common';
import { CatchServiceErrors } from 'src/common/base.service';
import { translate } from 'src/common/i18n';
import { BaseService } from '../common';
import { User } from '../common/database/models';
import { ServiceResponse } from '../common/interfaces';

@CatchServiceErrors()
@Injectable()
export class ProfileService extends BaseService {
  async getProfile(email: string): Promise<ServiceResponse> {
    const user = await User.findOne({ where: { email } });
    return {
      success: true,
      data: user,
      message: translate('MESSAGES.PROFILE_DATA_RETRIEVED'),
    };
  }
}
