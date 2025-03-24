import { Rule } from '@angular-devkit/schematics';
import { SchemaOptions, applyGenerator, updateAppModuleForService } from '..';

export function customServiceWithModuleUpdate(options: SchemaOptions): Rule {
  return applyGenerator(
    options,
    'services',
    '.service.ts',
    updateAppModuleForService(options),
  );
}
