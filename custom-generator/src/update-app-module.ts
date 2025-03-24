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

export function updateAppModuleForController(options: {
  name: string;
  modulePath?: string;
}): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const modulePath = options.modulePath || 'src/app.module.ts';
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

    const controllerClassName = `${strings.classify(options.name)}Controller`;
    const controllerImportPath = `./${strings.dasherize(options.name)}/${strings.dasherize(options.name)}.controller`;
    const importStatement = `import { ${controllerClassName} } from '${controllerImportPath}';`;

    if (!sourceText.includes(importStatement)) {
      const lastImport = findLastImportPosition(sourceFile);
      if (lastImport) {
        const insertionPos = lastImport.getEnd();
        sourceText =
          sourceText.slice(0, insertionPos) +
          '\n' +
          importStatement +
          '\n' +
          sourceText.slice(insertionPos);
      } else {
        sourceText = importStatement + '\n' + sourceText;
      }
      //   context.logger.info(`Added import for ${controllerClassName}.`);
    } else {
      //   context.logger.info(`${controllerClassName} import already exists.`);
    }

    const moduleDecoratorIndex = sourceText.indexOf('@Module(');
    if (moduleDecoratorIndex === -1) {
      context.logger.error(`@Module decorator not found in ${modulePath}`);
      return tree;
    }

    const controllersKey = 'controllers:';
    const controllersIndex = sourceText.indexOf(
      controllersKey,
      moduleDecoratorIndex,
    );

    if (controllersIndex === -1) {
      const decoratorClose = sourceText.indexOf('}', moduleDecoratorIndex);
      if (decoratorClose === -1) {
        context.logger.error(
          `Could not find the end of @Module decorator in ${modulePath}`,
        );
        return tree;
      }
      const newControllersArray = `\n  controllers: [${controllerClassName}],`;
      sourceText =
        sourceText.slice(0, decoratorClose) +
        newControllersArray +
        sourceText.slice(decoratorClose);
      //   context.logger.info(
      //     `Added new controllers array with ${controllerClassName}.`,
      //   );
    } else {
      const arrayStart = sourceText.indexOf('[', controllersIndex);
      const arrayEnd = sourceText.indexOf(']', arrayStart);
      if (arrayStart === -1 || arrayEnd === -1) {
        context.logger.error(
          `Could not parse controllers array in ${modulePath}`,
        );
        return tree;
      }

      const controllersArrayContent = sourceText.substring(
        arrayStart + 1,
        arrayEnd,
      );
      if (controllersArrayContent.includes(controllerClassName)) {
        // context.logger.info(
        //   `${controllerClassName} is already listed in controllers array.`,
        // );
      } else {
        const newArrayContent = controllersArrayContent.trim()
          ? `${controllersArrayContent.trim()}, ${controllerClassName}`
          : controllerClassName;
        sourceText =
          sourceText.substring(0, arrayStart + 1) +
          ` ${newArrayContent} ` +
          sourceText.substring(arrayEnd);
        // context.logger.info(
        //   `Appended ${controllerClassName} to controllers array.`,
        // );
      }
    }

    tree.overwrite(modulePath, sourceText);
    return tree;
  };
}

export function updateAppModuleForService(options: {
  name: string;
  modulePath?: string;
}): Rule {
  return (tree: Tree, context: SchematicContext) => {
    // Default app.module.ts location if not provided.
    const modulePath = options.modulePath || 'src/app.module.ts';
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

    // Prepare the service import details.
    const serviceClassName = `${strings.classify(options.name)}Service`;
    const serviceImportPath = `./${strings.dasherize(options.name)}/${strings.dasherize(options.name)}.service`;
    const importStatement = `import { ${serviceClassName} } from '${serviceImportPath}';`;

    // Check if the import already exists.
    if (!sourceText.includes(importStatement)) {
      const lastImport = findLastImportPosition(sourceFile);
      if (lastImport) {
        const insertionPos = lastImport.getEnd();
        sourceText =
          sourceText.slice(0, insertionPos) +
          '\n' +
          importStatement +
          '\n' +
          sourceText.slice(insertionPos);
      } else {
        // If no imports exist, prepend the import.
        sourceText = importStatement + '\n' + sourceText;
      }
      //   context.logger.info(`Added import for ${serviceClassName}.`);
    } else {
      //   context.logger.info(`${serviceClassName} import already exists.`);
    }

    // Locate the @Module decorator.
    const moduleDecoratorIndex = sourceText.indexOf('@Module(');
    if (moduleDecoratorIndex === -1) {
      context.logger.error(`@Module decorator not found in ${modulePath}`);
      return tree;
    }

    // Look for an existing "providers" array in the decorator.
    const providersKey = 'providers:';
    const providersIndex = sourceText.indexOf(
      providersKey,
      moduleDecoratorIndex,
    );

    if (providersIndex === -1) {
      // No providers array exists, so add one before the closing brace of the decorator.
      const decoratorClose = sourceText.indexOf('}', moduleDecoratorIndex);
      if (decoratorClose === -1) {
        context.logger.error(
          `Could not find the end of @Module decorator in ${modulePath}`,
        );
        return tree;
      }
      const newProvidersArray = `\n  providers: [${serviceClassName}],`;
      sourceText =
        sourceText.slice(0, decoratorClose) +
        newProvidersArray +
        sourceText.slice(decoratorClose);
      //   context.logger.info(
      //     `Added new providers array with ${serviceClassName}.`,
      //   );
    } else {
      // Providers array exists. Find its boundaries.
      const arrayStart = sourceText.indexOf('[', providersIndex);
      const arrayEnd = sourceText.indexOf(']', arrayStart);
      if (arrayStart === -1 || arrayEnd === -1) {
        context.logger.error(
          `Could not parse providers array in ${modulePath}`,
        );
        return tree;
      }
      const providersContent = sourceText.substring(arrayStart + 1, arrayEnd);
      if (providersContent.includes(serviceClassName)) {
        // context.logger.info(
        //   `${serviceClassName} is already listed in providers array.`,
        // );
      } else {
        const newProvidersContent = providersContent.trim()
          ? `${providersContent.trim()}, ${serviceClassName}`
          : serviceClassName;
        sourceText =
          sourceText.substring(0, arrayStart + 1) +
          ` ${newProvidersContent} ` +
          sourceText.substring(arrayEnd);
        // context.logger.info(`Appended ${serviceClassName} to providers array.`);
      }
    }

    // Overwrite app.module.ts with the updated content.
    tree.overwrite(modulePath, sourceText);
    return tree;
  };
}
export function updateAppModuleForModule(options: {
  name: string;
  modulePath?: string;
}): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const appModulePath = options.modulePath || 'src/app.module.ts';
    const fileBuffer = tree.read(appModulePath);
    if (!fileBuffer) {
      context.logger.error(`Module file (${appModulePath}) not found.`);
      return tree;
    }
    let sourceText = fileBuffer.toString('utf-8');
    const sourceFile = ts.createSourceFile(
      appModulePath,
      sourceText,
      ts.ScriptTarget.Latest,
      true,
    );

    const newModuleClass = `${strings.classify(options.name)}Module`;
    const moduleImportPath = `./${strings.dasherize(options.name)}/${strings.dasherize(options.name)}.module`;
    const importStatement = `import { ${newModuleClass} } from '${moduleImportPath}';`;

    // Check if the import already exists.
    if (!sourceText.includes(importStatement)) {
      const lastImport = findLastImportPosition(sourceFile);
      if (lastImport) {
        const insertionPos = lastImport.getEnd();
        sourceText =
          sourceText.slice(0, insertionPos) +
          '\n' +
          importStatement +
          '\n' +
          sourceText.slice(insertionPos);
      } else {
        sourceText = importStatement + '\n' + sourceText;
      }
      context.logger.info(`Added import for ${newModuleClass}.`);
    } else {
      context.logger.info(`${newModuleClass} import already exists.`);
    }

    // Locate the @Module decorator.
    const moduleDecoratorIndex = sourceText.indexOf('@Module(');
    if (moduleDecoratorIndex === -1) {
      context.logger.error(`@Module decorator not found in ${appModulePath}`);
      return tree;
    }

    // Look for an existing "imports" array.
    const importsKey = 'imports:';
    const importsIndex = sourceText.indexOf(importsKey, moduleDecoratorIndex);

    if (importsIndex === -1) {
      // No imports array exists; add one before the closing brace of the decorator.
      const decoratorClose = sourceText.indexOf('}', moduleDecoratorIndex);
      if (decoratorClose === -1) {
        context.logger.error(
          `Could not find the end of @Module decorator in ${appModulePath}`,
        );
        return tree;
      }
      const newImportsArray = `\n  imports: [${newModuleClass}],`;
      sourceText =
        sourceText.slice(0, decoratorClose) +
        newImportsArray +
        sourceText.slice(decoratorClose);
      context.logger.info(`Added new imports array with ${newModuleClass}.`);
    } else {
      // Find the array boundaries.
      const arrayStart = sourceText.indexOf('[', importsIndex);
      const arrayEnd = sourceText.indexOf(']', arrayStart);
      if (arrayStart === -1 || arrayEnd === -1) {
        context.logger.error(
          `Could not parse imports array in ${appModulePath}`,
        );
        return tree;
      }
      const currentImportsRaw = sourceText.substring(arrayStart + 1, arrayEnd);
      const currentImports = cleanArrayContent(currentImportsRaw);

      if (currentImports.includes(newModuleClass)) {
        context.logger.info(
          `${newModuleClass} is already listed in the imports array.`,
        );
      } else {
        const newImports = currentImports
          ? `${currentImports}, ${newModuleClass}`
          : newModuleClass;
        sourceText =
          sourceText.substring(0, arrayStart + 1) +
          ` ${newImports} ` +
          sourceText.substring(arrayEnd);
        context.logger.info(`Appended ${newModuleClass} to the imports array.`);
      }
    }

    // Use the project's Prettier configuration if available.
    const prettierConfig = (await prettier.resolveConfig(appModulePath)) || {};
    // Ensure we use the TypeScript parser.
    const formattedSource = await prettier.format(sourceText, {
      ...prettierConfig,
      parser: 'typescript',
    });
    tree.overwrite(appModulePath, formattedSource);
    return tree;
  };
}
