import * as nodemailer from 'nodemailer';
import { CatchServiceErrors } from '../..';
import { config } from '../../config';
import { ServiceResponse } from '../../interfaces';
import { BaseEmailProvider, SendEmailProps } from './base.email.provider';
import Mail = require('nodemailer/lib/mailer');

@CatchServiceErrors()
export class NodeMailerEmailProvider extends BaseEmailProvider {
  async send(props: SendEmailProps): Promise<ServiceResponse> {
    const { to, subject, html = null, fromEmail = '', fromName = '' } = props;

    const {
      SMTP_HOST,
      SMTP_PORT = '',
      SMTP_USER = '',
      SMTP_PASSWORD = '',
      ENABLE_SECURE_SMTP = false,
      EMAIL_FROM = '',
      EMAIL_NAME = '',
    } = config;

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: ENABLE_SECURE_SMTP,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
      },
    } as nodemailer.TransportOptions);
    const from = `${fromName || EMAIL_NAME} <${fromEmail || EMAIL_FROM}>`;

    const mailOptions: Mail.Options = {
      from,
      to: to.map(({ email }) => email).join(', '),
      subject,
      ...(html ? { html } : {}),
    };

    const info = await transporter.sendMail(mailOptions);

    if (!info.messageId) {
      return {
        success: false,
        message: 'Email could not be sent',
      };
    }
    return {
      success: true,
      message: 'Email Queued',
    };
  }
}
