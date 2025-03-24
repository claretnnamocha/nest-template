import { normalize, strings } from '@angular-devkit/core';
import {
  Rule,
  apply,
  chain,
  mergeWith,
  move,
  template,
  url,
} from '@angular-devkit/schematics';
import { updateAppModuleForService } from '../update-app-module';

interface SchemaOptions {
  name: string;
  path?: string;
  flat?: boolean;
}

function customService(options: SchemaOptions): Rule {
  // Set default destination path to "src" if not provided
  options.path = options.path || 'src';

  // Compute the target folder: if flat is false, create a subfolder named after the service; otherwise, use the provided path.
  const destination = options.flat
    ? normalize(options.path)
    : normalize(`${options.path}/${strings.dasherize(options.name)}`);

  const templateSource = apply(url('../files/services'), [
    template({
      ...options,
      classify: strings.classify,
      dasherize: strings.dasherize,
    }),
    move(destination),
  ]);

  return chain([mergeWith(templateSource)]);
}

export function customServiceWithModuleUpdate(options: SchemaOptions): Rule {
  return chain([customService(options), updateAppModuleForService(options)]);
}
