import * as vscode from 'vscode';
import {
  DocumentationService,
  ResolvedDocumentationCandidate
} from '../core/documentationService';
import { CommandTarget } from '../core/types';

export function registerOpenSymbolDocumentationCommand(
  documentationService: DocumentationService
): vscode.Disposable {
  return vscode.commands.registerCommand(
    'externalDocs.openSymbolDocumentation',
    async (target?: CommandTarget) => {
      const candidates = await documentationService.resolveCandidatesFromTarget(target, 3);
      const documented = candidates.filter((candidate) => candidate.entry !== null);
      if (documented.length === 0) {
        void vscode.window.showInformationMessage(
          'No external documentation found for the current symbol.'
        );
        return;
      }

      const selected = await pickDocumentedCandidate(
        documented as Array<ResolvedDocumentationCandidate & { entry: NonNullable<ResolvedDocumentationCandidate['entry']> }>
      );
      if (!selected) {
        return;
      }

      await documentationService.openDocumentation(
        selected.target.mapping.docsUri,
        selected.entry.range,
        selected.target.config.openMode
      );
    }
  );
}

async function pickDocumentedCandidate(
  candidates: Array<ResolvedDocumentationCandidate & { entry: NonNullable<ResolvedDocumentationCandidate['entry']> }>
): Promise<(ResolvedDocumentationCandidate & { entry: NonNullable<ResolvedDocumentationCandidate['entry']> }) | undefined> {
  if (candidates.length === 1) {
    return candidates[0];
  }

  const items = candidates.slice(0, 3).map((candidate) => ({
    label: candidate.target.symbol.canonicalSignature,
    description: candidate.target.mapping.sourceRelativePath,
    candidate
  }));

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: 'Select the documentation entry to open'
  });
  return selected?.candidate;
}
