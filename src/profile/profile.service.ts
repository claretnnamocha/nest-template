import { Inject, Injectable } from '@nestjs/common';
import { BaseService, EmailService } from '../common';
import { CatchServiceErrors } from '../common/base.service';
import { UserRepository } from '../common/database/repositories/user.repository';
import { translate } from '../common/i18n';
import { ServiceResponse } from '../common/interfaces';
import { MailgunEmailProvider } from 'src/common/email/providers';

@CatchServiceErrors()
@Injectable()
export class ProfileService extends BaseService {
  @Inject(UserRepository)
  private readonly userRepository!: UserRepository;
  @Inject(EmailService)
  private readonly emailService!: EmailService;

  async getProfile(email: string): Promise<ServiceResponse> {
    const user = await this.userRepository.findOne({ where: { email } });
    const r = await this.emailService.sendEmail({
      subject: 'Test',
      to: [{ email: 'devclareo@gmail.com' }],
      html: 'Test',
      provider: new MailgunEmailProvider(),
    });
    console.log({ r });

    return {
      success: true,
      data: user,
      message: translate('MESSAGES.PROFILE_DATA_RETRIEVED'),
    };
  }
}
