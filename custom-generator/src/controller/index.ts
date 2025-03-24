import { strings } from '@angular-devkit/core';
import {
  Rule,
  SchematicContext,
  Tree,
  apply,
  chain,
  mergeWith,
  move,
  template,
  url,
} from '@angular-devkit/schematics';
import * as path from 'path';
import { updateAppModuleForController } from '../update-app-module';

interface SchemaOptions {
  name: string;
  path?: string;
  flat?: boolean;
}

function customController(options: SchemaOptions): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    // Set default path if not provided
    options.path = options.path || 'src';

    // Use Node's path.normalize instead of Angular Devkit's normalize.
    const destination = options.flat
      ? path.normalize(options.path)
      : path.normalize(`${options.path}/${strings.dasherize(options.name)}`);

    // Scan the destination folder for existing .service.ts files.
    let services: string[] = [];
    const dir = tree.getDir(destination);
    if (dir && dir.subfiles && dir.subfiles.length > 0) {
      services = dir.subfiles
        .filter((file) => file.endsWith('.service.ts'))
        .map((file) => {
          // Remove the extension and form the service class name.
          const base = file.replace('.service.ts', '');
          return strings.classify(base) + 'Service';
        });
    }
    const templateSource = apply(url('../files/controllers'), [
      template({
        ...options,
        classify: strings.classify,
        dasherize: strings.dasherize,
        camelize: strings.camelize,
        services, // Pass the array of service class names to the template.
      }),
      move(destination),
    ]);

    return chain([mergeWith(templateSource)]);
  };
}

export function customControllerWithModuleUpdate(options: SchemaOptions): Rule {
  return chain([
    customController(options),
    updateAppModuleForController(options),
  ]);
}
