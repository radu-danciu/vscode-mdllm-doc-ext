import * as vscode from 'vscode';
import { DocumentationService, ResolvedDocumentationCandidate } from './documentationService';
import { encodeCommandUri, firstLine, truncateMarkdown } from './utils';

export class ExternalDocsHoverProvider implements vscode.HoverProvider {
  constructor(private readonly documentationService: DocumentationService) {}

  public async provideHover(
    document: vscode.TextDocument,
    position: vscode.Position
  ): Promise<vscode.Hover | null> {
    if (this.documentationService.isHoverSuppressed()) {
      return null;
    }

    const candidates = await this.documentationService.resolveDocumentationCandidates(
      document,
      position,
      3
    );
    if (candidates.length === 0) {
      return null;
    }

    const documented = candidates.filter(
      (candidate): candidate is ResolvedDocumentationCandidate & { entry: NonNullable<ResolvedDocumentationCandidate['entry']> } =>
        candidate.entry !== null
    );
    const hoverRange =
      document.getWordRangeAtPosition(position, /[\w$.:<>]+/) ??
      new vscode.Range(position, position);

    if (documented.length === 1) {
      return this.renderSingleDocumentationHover(document, position, documented[0], hoverRange);
    }

    if (documented.length > 1) {
      return this.renderDocumentationChooserHover(documented, hoverRange);
    }

    const fallbackHovers = await this.documentationService.queryOtherHoverProviders(
      document,
      position
    );
    if (fallbackHovers.length > 0) {
      return null;
    }

    const sourceDocumented = candidates.filter((candidate) =>
      this.documentationService.getSourceDocumentationMarkdown(candidate)
    );
    if (sourceDocumented.length === 1) {
      return this.renderSingleSourceDocumentationHover(sourceDocumented[0], hoverRange);
    }

    if (sourceDocumented.length > 1) {
      return this.renderSourceDocumentationChooserHover(sourceDocumented, hoverRange);
    }

    if (candidates.length === 1) {
      return this.renderSingleCreateHover(candidates[0], hoverRange);
    }

    return this.renderCreateChooserHover(candidates, hoverRange);
  }

  private renderSingleDocumentationHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    candidate: ResolvedDocumentationCandidate & { entry: NonNullable<ResolvedDocumentationCandidate['entry']> },
    hoverRange: vscode.Range
  ): vscode.Hover {
    const contents = new vscode.MarkdownString();
    contents.isTrusted = true;
    contents.appendMarkdown(`**${candidate.target.symbol.canonicalSignature}**\n\n`);
    const preview = truncateMarkdown(candidate.entry.body);
    if (preview) {
      contents.appendMarkdown(`${preview}\n\n`);
    }
    contents.appendMarkdown(
      `[Open full documentation](${encodeCommandUri('externalDocs.openSymbolDocumentation', {
        uri: document.uri.toString(),
        position: { line: position.line, character: position.character }
      })})`
    );
    return new vscode.Hover(contents, hoverRange);
  }

  private renderDocumentationChooserHover(
    candidates: Array<ResolvedDocumentationCandidate & { entry: NonNullable<ResolvedDocumentationCandidate['entry']> }>,
    hoverRange: vscode.Range
  ): vscode.Hover {
    const contents = new vscode.MarkdownString();
    contents.isTrusted = true;
    contents.appendMarkdown('**Multiple documentation matches**\n\n');

    for (const candidate of candidates.slice(0, 3)) {
      const brief = firstLine(candidate.entry.body) || 'Open documentation';
      contents.appendMarkdown(
        `- [\`${candidate.target.symbol.canonicalSignature}\`](${encodeCommandUri(
          'externalDocs.openSymbolDocumentation',
          {
            uri: candidate.target.document.uri.toString(),
            position: {
              line: candidate.target.symbol.symbolRange.start.line,
              character: candidate.target.symbol.symbolRange.start.character
            }
          }
        )})`
      );
      if (brief) {
        contents.appendMarkdown(`\n  ${brief}\n`);
      }
    }

    return new vscode.Hover(contents, hoverRange);
  }

  private renderSingleCreateHover(
    candidate: ResolvedDocumentationCandidate,
    hoverRange: vscode.Range
  ): vscode.Hover {
    const contents = new vscode.MarkdownString();
    contents.isTrusted = true;
    contents.appendMarkdown('No external documentation found.\n\n');
    contents.appendMarkdown(
      `[Create symbol documentation](${encodeCommandUri('externalDocs.createSymbolDocumentation', {
        uri: candidate.target.document.uri.toString(),
        position: {
          line: candidate.target.symbol.symbolRange.start.line,
          character: candidate.target.symbol.symbolRange.start.character
        }
      })})`
    );
    contents.appendMarkdown(`\n\n\`${candidate.target.mapping.docsUri.fsPath}\``);
    return new vscode.Hover(contents, hoverRange);
  }

  private renderCreateChooserHover(
    candidates: ResolvedDocumentationCandidate[],
    hoverRange: vscode.Range
  ): vscode.Hover {
    const contents = new vscode.MarkdownString();
    contents.isTrusted = true;
    contents.appendMarkdown('No external documentation found.\n\n');
    contents.appendMarkdown('**Create documentation for:**\n');

    for (const candidate of candidates.slice(0, 3)) {
      contents.appendMarkdown(
        `- [\`${candidate.target.symbol.canonicalSignature}\`](${encodeCommandUri(
          'externalDocs.createSymbolDocumentation',
          {
            uri: candidate.target.document.uri.toString(),
            position: {
              line: candidate.target.symbol.symbolRange.start.line,
              character: candidate.target.symbol.symbolRange.start.character
            }
          }
        )})\n`
      );
    }

    return new vscode.Hover(contents, hoverRange);
  }

  private renderSingleSourceDocumentationHover(
    candidate: ResolvedDocumentationCandidate,
    hoverRange: vscode.Range
  ): vscode.Hover {
    const sourceMarkdown = this.documentationService.getSourceDocumentationMarkdown(candidate) ?? '';
    const contents = new vscode.MarkdownString();
    contents.isTrusted = true;
    contents.appendMarkdown(`**${candidate.target.symbol.canonicalSignature}**\n\n`);
    contents.appendMarkdown(`${truncateMarkdown(sourceMarkdown)}\n`);
    return new vscode.Hover(contents, hoverRange);
  }

  private renderSourceDocumentationChooserHover(
    candidates: ResolvedDocumentationCandidate[],
    hoverRange: vscode.Range
  ): vscode.Hover {
    const contents = new vscode.MarkdownString();
    contents.isTrusted = true;
    contents.appendMarkdown('**Multiple source documentation matches**\n\n');

    for (const candidate of candidates.slice(0, 3)) {
      const sourceMarkdown = this.documentationService.getSourceDocumentationMarkdown(candidate) ?? '';
      const brief = firstLine(sourceMarkdown) || 'Source documentation';
      contents.appendMarkdown(`- \`${candidate.target.symbol.canonicalSignature}\`\n`);
      contents.appendMarkdown(`  ${brief}\n`);
    }

    return new vscode.Hover(contents, hoverRange);
  }
}
