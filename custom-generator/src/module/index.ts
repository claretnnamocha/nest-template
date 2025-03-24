import { Rule } from '@angular-devkit/schematics';
import { SchemaOptions, applyGenerator, updateAppModuleForModule } from '..';

export function customModuleWithModuleUpdate(options: SchemaOptions): Rule {
  return applyGenerator(
    options,
    'modules',
    '.module.ts',
    updateAppModuleForModule(options),
  );
}
