import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from 'src/common/database/repositories/user.repository';
import { BaseService, CatchServiceErrors, EmailService } from '../common';
import { UserStatuses } from '../common/database/models/types';
import { EmailSubjects, EmailTemplates } from '../common/email/email.service';
import { translate } from '../common/i18n';
import { ServiceResponse } from '../common/interfaces';
import { JwtService } from '../jwt/jwt.service';
import { SigninDTO, SignupDTO } from './dto';

@CatchServiceErrors()
@Injectable()
export class AuthService extends BaseService {
  @Inject(JwtService) private readonly jwtService: JwtService | undefined;
  @Inject(EmailService) private readonly emailService: EmailService | undefined;
  @Inject(UserRepository)
  private readonly userRepository!: UserRepository;

  async signup(payload: SignupDTO): Promise<ServiceResponse> {
    const { email } = payload;
    const exists = await this.userRepository.findOne({ where: { email } });

    if (exists)
      return {
        success: false,
        message: translate('MESSAGES.USER_ALREADY_EXISTS'),
      };

    await this.userRepository.create({ ...payload });

    this.emailService?.sendEmail({
      to: [{ email }],
      subject: EmailSubjects.welcome,
      template: EmailTemplates.welcome,
    });

    return {
      success: true,
      message: translate('MESSAGES.REGISTRATION_SUCCESSFUL'),
    };
  }

  async signin(payload: SigninDTO): Promise<ServiceResponse> {
    const { email, password } = payload;
    const user = await this.userRepository.findOne({ where: { email } });

    if (!(user && user.validatePassword(password)))
      return {
        success: false,
        message: translate('MESSAGES.LOGIN_FAILED'),
      };

    if (user.status.toLowerCase() !== UserStatuses.active) {
      return {
        success: false,
        message: translate('MESSAGES.PROFILE_NOT_ACTIVATED'),
      };
    }

    const lastLoggedInAt = Date.now();
    if (!this.jwtService) {
      throw new Error(translate('MESSAGES.UNAUTHORIZED'));
    }
    const { data: accessToken } = await this.jwtService.signJWT({
      email,
      lastLoggedInAt,
    });
    await user.update({ lastLoggedInAt });

    return {
      success: true,
      message: translate('MESSAGES.LOGIN_SUCCESSFUL'),
      data: { ...user.toJSON(), accessToken },
    };
  }
}
