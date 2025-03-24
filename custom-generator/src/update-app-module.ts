import {
  Rule,
  SchematicContext,
  strings,
  Tree,
} from '@angular-devkit/schematics';
import * as prettier from 'prettier';
import * as ts from 'typescript';

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

  // Format using Prettier.
  const prettierConfig = (await prettier.resolveConfig(modulePath)) || {};
  const formattedSource = await prettier.format(sourceText, {
    ...prettierConfig,
    parser: 'typescript',
  });
  tree.overwrite(modulePath, formattedSource);
  return tree;
}

export function updateAppModuleForController(options: {
  name: string;
  modulePath?: string;
}): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const modulePath = options.modulePath || 'src/app.module.ts';
    const controllerClassName = `${strings.classify(options.name)}Controller`;
    const controllerImportPath = `./${strings.dasherize(options.name)}/${strings.dasherize(
      options.name,
    )}.controller`;
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

export function updateAppModuleForService(options: {
  name: string;
  modulePath?: string;
}): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const modulePath = options.modulePath || 'src/app.module.ts';
    const serviceClassName = `${strings.classify(options.name)}Service`;
    const serviceImportPath = `./${strings.dasherize(options.name)}/${strings.dasherize(
      options.name,
    )}.service`;
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

export function updateAppModuleForModule(options: {
  name: string;
  modulePath?: string;
}): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const modulePath = options.modulePath || 'src/app.module.ts';
    const moduleClassName = `${strings.classify(options.name)}Module`;
    const moduleImportPath = `./${strings.dasherize(options.name)}/${strings.dasherize(
      options.name,
    )}.module`;
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
