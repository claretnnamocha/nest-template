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

function removeImportAndEntry(
  sourceText: string,
  className: string,
  arrayKey: string,
): string {
  const lines = sourceText.split('\n');
  const filteredLines = lines.filter(
    (line) => !line.includes(`import { ${className} }`),
  );
  sourceText = filteredLines.join('\n');
  const keyIndex = sourceText.indexOf(arrayKey);
  if (keyIndex !== -1) {
    const arrayStart = sourceText.indexOf('[', keyIndex);
    const arrayEnd = sourceText.indexOf(']', arrayStart);
    if (arrayStart !== -1 && arrayEnd !== -1) {
      let arrayContent = sourceText.substring(arrayStart + 1, arrayEnd);

      const regex = new RegExp(`,?\\s*${className}\\s*,?`, 'g');
      arrayContent = arrayContent.replace(regex, '');

      arrayContent = arrayContent.trim().replace(/^,|,$/g, '').trim();
      sourceText =
        sourceText.substring(0, arrayStart + 1) +
        (arrayContent ? ` ${arrayContent} ` : '') +
        sourceText.substring(arrayEnd);
    }
  }
  return sourceText;
}

async function updateModuleEntry(
  tree: Tree,
  context: SchematicContext,
  modulePath: string,
  importStatement: string,
  arrayKey: string,
  entry: string,
  exemptPath?: string,
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

  const moduleDecoratorIndex = sourceText.indexOf('@Module(');
  if (moduleDecoratorIndex === -1) {
    context.logger.error(`@Module decorator not found in ${modulePath}`);
    return tree;
  }

  const keyIndex = sourceText.indexOf(arrayKey, moduleDecoratorIndex);
  if (keyIndex === -1) {
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
    const arrayStart = sourceText.indexOf('[', keyIndex);
    const arrayEnd = sourceText.indexOf(']', arrayStart);
    if (arrayStart === -1 || arrayEnd === -1) {
      context.logger.error(
        `Could not parse ${arrayKey} array in ${modulePath}`,
      );
      return tree;
    }

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

  if (exemptPath) {
    const exemptDir = tree.getDir(normalize(exemptPath)).parent;

    if (exemptDir && exemptDir.subfiles && exemptDir.subfiles.length > 0) {
      exemptDir.subfiles.forEach((file) => {
        if (file.endsWith('.service.ts')) {
          const base = file.replace('.service.ts', '');
          const className = strings.classify(base) + 'Service';

          sourceText = removeImportAndEntry(
            sourceText,
            className,
            'providers:',
          );
        }
        if (file.endsWith('.controller.ts')) {
          const base = file.replace('.controller.ts', '');
          const className = strings.classify(base) + 'Controller';
          sourceText = removeImportAndEntry(
            sourceText,
            className,
            'controllers:',
          );
        }
      });
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
    options.path = options.path || 'src';

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
          const base = file.replace('.service.ts', '');
          return strings.classify(base) + 'Service';
        });
      controllers = dir.subfiles
        .filter((file) => file.endsWith('.controller.ts'))
        .map((file) => {
          const base = file.replace('.controller.ts', '');
          return strings.classify(base) + 'Controller';
        });
    }

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

    const generatedFilePath = path.join(
      destination,
      `${strings.dasherize(options.name)}${fileSuffix}`,
    );

    return chain([
      mergeWith(templateSource),
      updateModuleFn,

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
  exemptPath?: string;
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
      moduleImportPath,
    );
  };
}
