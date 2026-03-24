import * as vscode from 'vscode';
import * as path from 'path';
import {
  DocumentationService,
  ResolvedDocumentationCandidate
} from '../core/documentationService';
import { CommandTarget } from '../core/types';

export function registerCreateSymbolDocumentationCommand(
  documentationService: DocumentationService
): vscode.Disposable {
  return vscode.commands.registerCommand(
    'externalDocs.createSymbolDocumentation',
    async (target?: CommandTarget) => {
      const candidates = await documentationService.resolveCandidatesFromTarget(target, 3);
      if (candidates.length === 0) {
        void vscode.window.showInformationMessage('No supported symbol found at the current cursor.');
        return;
      }

      const selected = await pickCandidate(candidates);
      if (!selected) {
        return;
      }

      const resolved = selected.target;
      const docsUri = resolved.mapping.docsUri;
      let content = '';
      let exists = true;

      try {
        content = Buffer.from(await vscode.workspace.fs.readFile(docsUri)).toString('utf8');
      } catch {
        exists = false;
      }

      if (!exists) {
        await vscode.workspace.fs.createDirectory(vscode.Uri.file(path.dirname(docsUri.fsPath)));
        content = `# ${resolved.mapping.sourceRelativePath}\n\n${resolved.module.createStub(resolved.symbol)}`;
        await vscode.workspace.fs.writeFile(docsUri, Buffer.from(content, 'utf8'));
      } else {
        const existingEntry = await documentationService.findEntry(resolved);
        if (!existingEntry) {
          const prefix = content.trim().length > 0 ? '\n\n' : '';
          const header = content.trim().startsWith('# ')
            ? ''
            : `# ${resolved.mapping.sourceRelativePath}\n\n`;
          content = `${header}${content.trimEnd()}${prefix}${resolved.module.createStub(resolved.symbol)}`;
          await vscode.workspace.fs.writeFile(docsUri, Buffer.from(content, 'utf8'));
        }
      }

      documentationService.getDocIndex().invalidate(docsUri);
      const entry = await documentationService.findEntry(resolved);
      await documentationService.openDocumentation(
        docsUri,
        entry?.range,
        resolved.config.openMode
      );
    }
  );
}

async function pickCandidate(
  candidates: ResolvedDocumentationCandidate[]
): Promise<ResolvedDocumentationCandidate | undefined> {
  if (candidates.length === 1) {
    return candidates[0];
  }

  const items = candidates.slice(0, 3).map((candidate) => ({
    label: candidate.target.symbol.canonicalSignature,
    description: candidate.target.mapping.sourceRelativePath,
    candidate
  }));

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: 'Select the symbol to create documentation for'
  });
  return selected?.candidate;
}
