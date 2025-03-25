import FormData = require('form-data');
import { CatchServiceErrors } from '../../../common';
import { ServiceResponse } from '../../../common/interfaces';
import { config } from '../../config';
import { BaseEmailProvider, SendEmailProps } from './base.email.provider';

@CatchServiceErrors()
export class MailgunEmailProvider extends BaseEmailProvider {
  async send(props: SendEmailProps): Promise<ServiceResponse> {
    const { to, subject, html = null, fromEmail = '', fromName = '' } = props;

    const { MAILGUN_API_KEY, MAILGUN_DOMAIN, EMAIL_FROM, EMAIL_NAME } = config;

    const from = `${fromName || EMAIL_NAME} <${fromEmail || EMAIL_FROM}>`;

    const fd = new FormData();

    fd.append('from', from);
    fd.append('to', to.map((t) => t.email).join(','));
    fd.append('subject', subject);
    fd.append('text', '');
    fd.append('html', html);

    const response = await fetch(
      `https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`,
      {
        method: 'post',
        headers: {
          authorization: `Basic ${Buffer.from(
            `api:${MAILGUN_API_KEY}`,
          ).toString('base64')}`,
        },
        body: fd as unknown as BodyInit,
      },
    );

    const { id, message } = await response.json();

    return {
      success: true,
      message,
      data: id,
    };
  }
}
