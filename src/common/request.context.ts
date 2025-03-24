import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContext {
  locale: string;
}

export const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();
