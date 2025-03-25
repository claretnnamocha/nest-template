import { normalize } from '@angular-devkit/core';
import {
  apply,
  chain,
  mergeWith,
  move,
  Rule,
  SchematicContext,
  strings,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import * as prettier from 'prettier';
import * as ts from 'typescript';
import path = require('path');

function findLastImportPosition(sourceFile: ts.SourceFile): ts.Node | null {
  let lastImport: ts.Node | null = null;
  sourceFile.forEachChild((node) => {
    if (node.kind === ts.SyntaxKind.ImportDeclaration) {
      lastImport = node;
    }
  });
  return lastImport;
}

function cleanArrayContent(content: string): string {
  return content.trim().replace(/^,|,$/g, '').trim();
}

function addImport(
  sourceText: string,
  sourceFile: ts.SourceFile,
  importStatement: string,
): string {
  if (!sourceText.includes(importStatement)) {
    const lastImport = findLastImportPosition(sourceFile);
    if (lastImport) {
      const pos = lastImport.getEnd();
      return (
        sourceText.slice(0, pos) +
        '\n' +
        importStatement +
        '\n' +
        sourceText.slice(pos)
      );
    } else {
      return importStatement + '\n' + sourceText;
    }
  }
  return sourceText;
}

async function updateModuleEntry(
  tree: Tree,
  context: SchematicContext,
  modulePath: string,
  importStatement: string,
  arrayKey: string, // e.g., "controllers:", "providers:", or "imports:"
  entry: string,
): Promise<Tree> {
  const fileBuffer = tree.read(modulePath);
  if (!fileBuffer) {
    context.logger.error(`Module file (${modulePath}) not found.`);
    return tree;
  }
  let sourceText = fileBuffer.toString('utf-8');
  const sourceFile = ts.createSourceFile(
    modulePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
  );

  sourceText = addImport(sourceText, sourceFile, importStatement);

  // Locate the @Module decorator.
  const moduleDecoratorIndex = sourceText.indexOf('@Module(');
  if (moduleDecoratorIndex === -1) {
    context.logger.error(`@Module decorator not found in ${modulePath}`);
    return tree;
  }

  // Update the specified array.
  const keyIndex = sourceText.indexOf(arrayKey, moduleDecoratorIndex);
  if (keyIndex === -1) {
    // If the array doesn't exist, add a new one before the closing brace.
    const decoratorClose = sourceText.indexOf('}', moduleDecoratorIndex);
    if (decoratorClose === -1) {
      context.logger.error(
        `Could not find the end of @Module decorator in ${modulePath}`,
      );
      return tree;
    }
    sourceText =
      sourceText.slice(0, decoratorClose) +
      `\n  ${arrayKey} [${entry}],` +
      sourceText.slice(decoratorClose);
  } else {
    // If the array exists, update it.
    const arrayStart = sourceText.indexOf('[', keyIndex);
    const arrayEnd = sourceText.indexOf(']', arrayStart);
    if (arrayStart === -1 || arrayEnd === -1) {
      context.logger.error(
        `Could not parse ${arrayKey} array in ${modulePath}`,
      );
      return tree;
    }
    // Clean the current content to remove extra commas/spaces.
    const currentContent = cleanArrayContent(
      sourceText.substring(arrayStart + 1, arrayEnd),
    );
    if (!currentContent.includes(entry)) {
      const newContent = currentContent ? `${currentContent}, ${entry}` : entry;
      sourceText =
        sourceText.substring(0, arrayStart + 1) +
        ` ${newContent} ` +
        sourceText.substring(arrayEnd);
    }
  }

  const formattedSource = await formatFileContent(sourceText);
  tree.overwrite(modulePath, formattedSource);
  return tree;
}

const defaultModulePath = 'src/app.module.ts';

export async function formatFileContent(sourceText: string): Promise<string> {
  const prettierConfig = await prettier.resolveConfig(
    path.dirname(defaultModulePath),
  );
  const config = prettierConfig || {};
  const formatted = await prettier.format(sourceText, {
    ...config,
    parser: 'typescript',
  });
  return formatted;
}

export function applyGenerator(
  options: SchemaOptions,
  templateFolder: string,
  fileSuffix: string,
  updateModuleFn: Rule,
): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    // Set default path to 'src' if not provided.
    options.path = options.path || 'src';

    // Compute destination folder: if flat, use options.path directly;
    // otherwise, create a subfolder named after the dasherized name.
    const destination = options.flat
      ? normalize(options.path)
      : normalize(`${options.path}/${strings.dasherize(options.name)}`);

    let services: string[] = [];
    let controllers: string[] = [];

    const dir = tree.getDir(destination);
    if (dir && dir.subfiles && dir.subfiles.length > 0) {
      services = dir.subfiles
        .filter((file) => file.endsWith('.service.ts'))
        .map((file) => {
          // Remove the extension and form the service class name.
          const base = file.replace('.service.ts', '');
          return strings.classify(base) + 'Service';
        });
      controllers = dir.subfiles
        .filter((file) => file.endsWith('.controller.ts'))
        .map((file) => {
          // Remove the extension and form the controller class name.
          const base = file.replace('.controller.ts', '');
          return strings.classify(base) + 'Controller';
        });
    }

    // Prepare the template source from the specified folder.
    const templateSource = apply(url(`../templates/${templateFolder}`), [
      template({
        ...options,
        classify: strings.classify,
        dasherize: strings.dasherize,
        camelize: strings.camelize,
        services,
        controllers,
      }),
      move(destination),
    ]);

    // Compute the generated file path.
    const generatedFilePath = path.join(
      destination,
      `${strings.dasherize(options.name)}${fileSuffix}`,
    );

    return chain([
      mergeWith(templateSource),
      updateModuleFn,
      // Format the generated file.
      async (tree: Tree, context: SchematicContext) => {
        const fileBuffer = tree.read(generatedFilePath);
        if (fileBuffer) {
          const sourceText = fileBuffer.toString('utf-8');
          const formatted = await formatFileContent(sourceText);
          tree.overwrite(generatedFilePath, formatted);
        } else {
          context.logger.warn(
            `Generated file ${generatedFilePath} not found for formatting.`,
          );
        }
        return tree;
      },
    ]);
  };
}

export interface SchemaOptions {
  name: string;
  path?: string;
  modulePath?: string;
  flat?: boolean;
}

export function updateAppModuleForController(options: SchemaOptions): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const modulePath = options.modulePath || defaultModulePath;
    const controllerClassName = `${strings.classify(options.name)}Controller`;
    const name = `${strings.dasherize(options.name)}`;
    const controllerImportPath = options.flat
      ? `${options.path}/${name}.controller`
      : `${options.path}/${name}/${name}.controller`;
    const importStatement = `import { ${controllerClassName} } from '${controllerImportPath}';`;
    return updateModuleEntry(
      tree,
      context,
      modulePath,
      importStatement,
      'controllers:',
      controllerClassName,
    );
  };
}

export function updateAppModuleForService(options: SchemaOptions): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const modulePath = options.modulePath || defaultModulePath;
    const serviceClassName = `${strings.classify(options.name)}Service`;
    const name = `${strings.dasherize(options.name)}`;
    const serviceImportPath = options.flat
      ? `${options.path}/${name}.service`
      : `${options.path}/${name}/${name}.service`;
    const importStatement = `import { ${serviceClassName} } from '${serviceImportPath}';`;
    return updateModuleEntry(
      tree,
      context,
      modulePath,
      importStatement,
      'providers:',
      serviceClassName,
    );
  };
}

export function updateAppModuleForModule(options: SchemaOptions): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const modulePath = options.modulePath || defaultModulePath;
    const moduleClassName = `${strings.classify(options.name)}Module`;
    const name = `${strings.dasherize(options.name)}`;
    const moduleImportPath = options.flat
      ? `${options.path}/${name}.module`
      : `${options.path}/${name}/${name}.module`;
    const importStatement = `import { ${moduleClassName} } from '${moduleImportPath}';`;
    return updateModuleEntry(
      tree,
      context,
      modulePath,
      importStatement,
      'imports:',
      moduleClassName,
    );
  };
}
