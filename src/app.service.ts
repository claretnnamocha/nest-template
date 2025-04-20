import { Injectable } from '@nestjs/common';
import { DecryptDTO, EncryptDTO } from './app.controller';
import { BaseService, CatchServiceErrors, decrypt, encrypt } from './common';
import { translate } from './common/i18n';
import { ServiceResponse } from './common/interfaces';

@CatchServiceErrors()
@Injectable()
export class AppService extends BaseService {
  async health(): Promise<ServiceResponse> {
    return { success: true, message: translate('HTTP_RESPONSE.HEALTH') };
  }

  async encrypt(payload: EncryptDTO) {
    return encrypt(payload.data);
  }

  async decrypt(payload: DecryptDTO) {
    return decrypt(payload.data);
  }
}
