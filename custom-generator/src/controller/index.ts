import { Rule } from '@angular-devkit/schematics';
import {
  SchemaOptions,
  applyGenerator,
  updateAppModuleForController,
} from '..';

export function customControllerWithModuleUpdate(options: SchemaOptions): Rule {
  return applyGenerator(
    options,
    'controllers',
    '.controller.ts',
    updateAppModuleForController(options),
  );
}
