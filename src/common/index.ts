import { Logger } from '@nestjs/common';
import { displayName } from 'package.json';

export * as filters from './exception-filters';
export * as interceptors from './response-interceptors';

export const logger = new Logger(displayName);
