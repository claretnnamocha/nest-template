import { ValidationArguments } from 'class-validator';
import { asyncLocalStorage } from '../request.context';
import * as locales from './locales';
import * as base from './locales/base.json';

const deepMerge = (target: any, source: any) => {
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (
        source[key] &&
        typeof source[key] === 'object' &&
        !Array.isArray(source[key])
      ) {
        if (!target[key]) {
          target[key] = {};
        }
        deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }
  return target;
};

const getNestedValue = (obj: any, key: string) => {
  return key
    .split('.')
    .reduce(
      (acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined),
      obj,
    );
};

export const translate = (key: string) => {
  const store = asyncLocalStorage.getStore();
  const locale = store?.locale || 'en';

  const langTranslations = locales[locale] || locales.en;

  const mergedTranslations = deepMerge(
    JSON.parse(JSON.stringify(base)),
    langTranslations,
  );

  return getNestedValue(mergedTranslations, key) || key;
};

export const translateValidationMessage =
  (key: string) => (validationArguments: ValidationArguments) => {
    const message: string = translate(key);
    return message.replaceAll('{property}', validationArguments.property);
  };
