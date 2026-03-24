import * as vscode from 'vscode';
import { DocumentationService } from './documentationService';

export class ExternalDocsDefinitionProvider implements vscode.DefinitionProvider {
  constructor(private readonly documentationService: DocumentationService) {}

  public async provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position
  ): Promise<vscode.Definition | null> {
    if (this.documentationService.isDefinitionSuppressed()) {
      return null;
    }

    const candidates = await this.documentationService.resolveDocumentationCandidates(
      document,
      position,
      3
    );
    const documented = candidates.filter((candidate) => candidate.entry !== null);
    if (documented.length === 0) {
      return null;
    }

    return documented.map(
      (candidate) =>
        new vscode.Location(candidate.target.mapping.docsUri, candidate.entry!.range)
    );
  }
}
