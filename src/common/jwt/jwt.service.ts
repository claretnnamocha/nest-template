import { Inject, Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { Op } from 'sequelize';
import { config, decrypt, encrypt } from '../../common';
import { User } from '../../common/database/models';
import { UserRoles, UserStatuses } from '../../common/database/models/types';
import { translate } from '../../common/i18n';
import { ServiceResponse } from '../../common/interfaces';

@Injectable()
export class JwtService {
  @Inject(NestJwtService)
  private readonly nestJwtService!: NestJwtService;

  async signJWT(payload: any): Promise<ServiceResponse> {
    try {
      let accessToken = this.nestJwtService.sign(payload);

      if (config.ENABLE_ENCRYPTED_REQUESTS) {
        accessToken = await encrypt(accessToken);
      }

      return {
        success: true,
        data: accessToken,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : translate('MESSAGES.UNKNOWN_ERROR'),
      };
    }
  }

  async verifyJWT(jwt: string, roles = Object.values(UserRoles), totp = '') {
    try {
      if (config.ENABLE_ENCRYPTED_REQUESTS) {
        jwt = await decrypt(jwt);
      }

      const user = this.nestJwtService.verify(jwt);

      const account = await User.findOne({
        where: {
          email: user.email,
          status: UserStatuses.active,
          deletedAt: null,
          verifiedEmail: true,
          role: { [Op.in]: roles },
        },
      });

      if (
        !(
          account &&
          user.lastLoggedInAt &&
          !(user.lastLoggedInAt < account.lastLoggedInAt)
        )
      ) {
        return null;
      }

      if (totp && !account.validateTotp(totp, 6, 1)) return null;

      if (!account) return null;

      return user;
    } catch {
      return null;
    }
  }
}
