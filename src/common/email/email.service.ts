import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as Handlebars from 'handlebars';
import * as path from 'path';
import { v4 as uuid } from 'uuid';
import { BaseService, CatchServiceErrors } from '..';
import { ServiceResponse } from '../interfaces';
import { BaseEmailProvider, NodeMailerEmailProvider } from './providers';

// Register handlebars helpers
Handlebars.registerHelper('currentYear', function () {
  return new Date().getFullYear();
});
Handlebars.registerHelper('uuid', function () {
  return uuid();
});

export enum EmailTemplates {
  welcome = 'welcome',
}

export const EmailSubjects: { [key in keyof typeof EmailTemplates]: string } = {
  welcome: 'Welcome to our service!',
};

@CatchServiceErrors()
@Injectable()
export class EmailService extends BaseService {
  async sendEmail({
    to,
    subject,
    html = null,
    fromEmail = '',
    fromName = '',
    template,
    template_data = {},
    provider = new NodeMailerEmailProvider(),
  }: {
    to: { email: string }[];
    subject: string;
    html?: string | null;
    fromEmail?: string;
    fromName?: string;
    template?: EmailTemplates;
    template_data?: any;
    provider?: BaseEmailProvider;
  }): Promise<ServiceResponse> {
    if (!html && template) {
      const file_name = path.resolve(
        __dirname,
        '..',
        'common',
        'emails',
        `${template}.html`,
      );
      const html_file = fs.readFileSync(file_name, 'utf8');
      const handlebar_template = Handlebars.compile(html_file);
      html = handlebar_template(template_data);
    }

    return provider.send({
      to,
      subject,
      html: html || undefined,
      fromEmail,
      fromName,
    });
  }
}
