import { CatchServiceErrors } from '../..';
import { config } from '../../config';
import { ServiceResponse } from '../../interfaces';
import { BaseEmailProvider, SendEmailProps } from './base.email.provider';

@CatchServiceErrors()
export class PepipostEmailProvider extends BaseEmailProvider {
  async send(props: SendEmailProps): Promise<ServiceResponse> {
    const { to, subject, html = null, fromEmail = '', fromName = '' } = props;

    const { NETCORE_API = '', EMAIL_FROM = '', EMAIL_NAME = '' } = config;

    const options = {
      method: 'POST',
      headers: {
        api_key: NETCORE_API,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from: {
          email: fromEmail || EMAIL_FROM,
          name: fromName || EMAIL_NAME,
        },
        subject,
        content: [{ type: 'html', value: html }],
        personalizations: [{ to }],
      }),
    };

    const response = await fetch(
      'https://emailapi.netcorecloud.net/v5/mail/send',
      options,
    );
    const g = await response.json();

    console.log({ g });

    const { data, message, error: [error] = [{}] } = g;

    const success = !Object.keys(error).length;

    return {
      success,
      message: message || error.message,
      data,
    };
  }
}
