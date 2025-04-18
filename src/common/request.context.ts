import { AsyncLocalStorage } from 'async_hooks';
import * as locales from './i18n/locales';

export interface RequestContext {
  locale: keyof typeof locales;
}

export const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();
