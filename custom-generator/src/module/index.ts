import { normalize, strings } from '@angular-devkit/core';
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
import { updateAppModuleForModule } from '../update-app-module';

interface SchemaOptions {
  name: string;
  path?: string;
  flat?: boolean;
}

function customModule(options: SchemaOptions): Rule {
  return (_tree: Tree, _context: SchematicContext) => {
    // Default path is 'src' if not provided.
    options.path = options.path || 'src';
    // Determine the destination folder.
    // If --flat is true, generate directly in the path; otherwise, create a folder with the module name.
    const destination = options.flat
      ? normalize(options.path)
      : normalize(`${options.path}/${strings.dasherize(options.name)}`);

    // The template URL points to our module file template.
    const templateSource = apply(url('../files/modules'), [
      template({
        ...options,
        classify: strings.classify,
        dasherize: strings.dasherize,
      }),
      move(destination),
    ]);

    return mergeWith(templateSource);
  };
}

export function customModuleWithModuleUpdate(options: SchemaOptions): Rule {
  return chain([customModule(options), updateAppModuleForModule(options)]);
}
