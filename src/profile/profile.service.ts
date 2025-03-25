import { Injectable } from '@nestjs/common';
import { BaseService } from '../common';
import { User } from '../common/database/models';
import { ServiceResponse } from '../common/interfaces';
import { CatchServiceErrors } from 'src/common/base.service';

@CatchServiceErrors()
@Injectable()
export class ProfileService extends BaseService {
  async getProfile(email: string): Promise<ServiceResponse> {
    const user = await User.findOne({ where: { email } });
    return { success: true, data: user, message: 'profile details' };
  }
}
