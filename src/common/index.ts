import { displayName } from '../../package.json';
import { FileLogger } from './file.logger';
import { asyncLocalStorage } from './request.context';

export { BaseController } from './base.controller';
export { BaseService, CatchServiceErrors } from './base.service';
export { config, setupConfig } from './config';
export { EmailService } from './email';
export { decrypt, encrypt } from './encryption.utils';
export * as interfaces from './interfaces';

export const logger = new FileLogger(displayName);

export const timestamp = () => {
  const date = new Date();
  const store = asyncLocalStorage.getStore();
  const locale = store?.locale || 'en';
  const timestamp = `${date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  })}, ${date.toLocaleTimeString(locale)}`;

  return timestamp;
};
