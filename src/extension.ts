import * as vscode from 'vscode';
import { registerCreateSymbolDocumentationCommand } from './commands/createSymbolDocumentation';
import { registerOpenSymbolDocumentationCommand } from './commands/openSymbolDocumentation';
import { registerRebuildIndexCommand } from './commands/rebuildIndex';
import { DocIndex } from './core/docIndex';
import { DocumentationService } from './core/documentationService';
import { ExternalDocsDefinitionProvider } from './core/definitionProvider';
import { ExternalDocsHoverProvider } from './core/hoverProvider';
import { LanguageRegistry } from './core/languageRegistry';
import { ExternalDocsRenameProvider } from './core/renameProvider';
import { CppLanguageModule, CSharpLanguageModule, JsTsLanguageModule, PythonLanguageModule } from './languages';

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const registry = new LanguageRegistry([
    new CppLanguageModule(),
    new CSharpLanguageModule(),
    new JsTsLanguageModule(),
    new PythonLanguageModule()
  ]);
  const docIndex = new DocIndex();
  const documentationService = new DocumentationService(registry, docIndex);
  const selector = registry.getModules().flatMap((module) =>
    module.languageIds.map((language) => ({ language, scheme: 'file' as const }))
  );

  context.subscriptions.push(
    vscode.languages.registerHoverProvider(selector, new ExternalDocsHoverProvider(documentationService)),
    vscode.languages.registerDefinitionProvider(
      selector,
      new ExternalDocsDefinitionProvider(documentationService)
    ),
    vscode.languages.registerRenameProvider(selector, new ExternalDocsRenameProvider(documentationService)),
    registerCreateSymbolDocumentationCommand(documentationService),
    registerOpenSymbolDocumentationCommand(documentationService),
    registerRebuildIndexCommand(documentationService),
    vscode.workspace.onDidSaveTextDocument((document) => {
      if (document.uri.fsPath.endsWith('.md')) {
        docIndex.invalidate(document.uri);
      }
    }),
    vscode.workspace.onDidChangeTextDocument((event) => {
      if (event.document.uri.fsPath.endsWith('.md')) {
        docIndex.invalidate(event.document.uri);
      }
    }),
    vscode.workspace.onDidDeleteFiles((event) => {
      for (const file of event.files) {
        docIndex.invalidate(file);
      }
    })
  );
}

export function deactivate(): void {}
