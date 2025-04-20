import { BaseService } from '../../base.service';
import { ServiceResponse } from '../../interfaces';

export type SendEmailProps = {
  to: { email: string }[];
  subject: string;
  html?: string;
  fromEmail?: string;
  fromName?: string;
};

export abstract class BaseEmailProvider extends BaseService {
  abstract send(props: SendEmailProps): Promise<ServiceResponse>;
}
