import * as vscode from 'vscode';
import { DocumentationService } from '../core/documentationService';

export function registerRebuildIndexCommand(
  documentationService: DocumentationService
): vscode.Disposable {
  return vscode.commands.registerCommand('externalDocs.rebuildIndex', async () => {
    documentationService.getDocIndex().clear();
    void vscode.window.showInformationMessage('External documentation index rebuilt.');
  });
}
