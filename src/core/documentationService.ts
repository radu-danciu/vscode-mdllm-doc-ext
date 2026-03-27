import * as vscode from 'vscode';
import { getConfig } from './config';
import { DocIndex } from './docIndex';
import { LanguageRegistry } from './languageRegistry';
import { mapSourceToDocs, PathMappingResult } from './pathMapper';
import { CommandTarget, DocEntry, ExternalDocsConfig, LanguageModule, ResolvedSymbol } from './types';
import { positionAtStartOfRange, viewColumnForMode } from './utils';

export interface ResolvedDocumentationTarget {
  document: vscode.TextDocument;
  workspaceFolder: vscode.WorkspaceFolder;
  config: ExternalDocsConfig;
  module: LanguageModule;
  symbol: ResolvedSymbol;
  mapping: PathMappingResult;
}

export interface ResolvedDocumentationCandidate {
  target: ResolvedDocumentationTarget;
  entry: DocEntry | null;
  source: 'direct' | 'definition';
}

interface DocumentPosition {
  document: vscode.TextDocument;
  position: vscode.Position;
}

export class DocumentationService {
  private hoverSuppressionDepth = 0;
  private definitionSuppressionDepth = 0;
  private renameSuppressionDepth = 0;

  constructor(
    private readonly registry: LanguageRegistry,
    private readonly docIndex: DocIndex
  ) {}

  public getDocIndex(): DocIndex {
    return this.docIndex;
  }

  public isHoverSuppressed(): boolean {
    return this.hoverSuppressionDepth > 0;
  }

  public isDefinitionSuppressed(): boolean {
    return this.definitionSuppressionDepth > 0;
  }

  public isRenameSuppressed(): boolean {
    return this.renameSuppressionDepth > 0;
  }

  public async withSuppressedHover<T>(callback: () => Promise<T>): Promise<T> {
    this.hoverSuppressionDepth += 1;
    try {
      return await callback();
    } finally {
      this.hoverSuppressionDepth -= 1;
    }
  }

  public async withSuppressedDefinition<T>(callback: () => Promise<T>): Promise<T> {
    this.definitionSuppressionDepth += 1;
    try {
      return await callback();
    } finally {
      this.definitionSuppressionDepth -= 1;
    }
  }

  public async withSuppressedRename<T>(callback: () => Promise<T>): Promise<T> {
    this.renameSuppressionDepth += 1;
    try {
      return await callback();
    } finally {
      this.renameSuppressionDepth -= 1;
    }
  }

  public async resolveDirectAt(
    document: vscode.TextDocument,
    position: vscode.Position
  ): Promise<ResolvedDocumentationTarget | null> {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
    if (!workspaceFolder) {
      return null;
    }

    const config = getConfig(workspaceFolder);
    const module = this.registry.getModuleForDocument(document);
    if (!module) {
      return null;
    }

    const symbol = await module.resolveSymbol({
      document,
      position,
      workspaceFolder,
      config
    });
    if (!symbol) {
      return null;
    }

    const mapping = mapSourceToDocs(
      workspaceFolder,
      document.uri,
      config,
      module.getLangBucket(document, config)
    );
    if (!mapping) {
      return null;
    }

    symbol.sourceRelativePath = mapping.sourceRelativePath;

    return {
      document,
      workspaceFolder,
      config,
      module,
      symbol,
      mapping
    };
  }

  public async resolveFromTarget(
    target?: CommandTarget
  ): Promise<ResolvedDocumentationTarget | null> {
    const location = await this.getDocumentPositionFromTarget(target);
    if (!location) {
      return null;
    }

    return this.resolveDirectAt(location.document, location.position);
  }

  public async findEntry(target: ResolvedDocumentationTarget): Promise<DocEntry | null> {
    return this.docIndex.findEntry(target.mapping.docsUri, target.symbol, target.module);
  }

  public async resolveCandidatesFromTarget(
    target?: CommandTarget,
    maxCandidates = 3
  ): Promise<ResolvedDocumentationCandidate[]> {
    const location = await this.getDocumentPositionFromTarget(target);
    if (!location) {
      return [];
    }

    return this.resolveDocumentationCandidates(location.document, location.position, maxCandidates);
  }

  public async resolveDocumentationCandidates(
    document: vscode.TextDocument,
    position: vscode.Position,
    maxCandidates = 3
  ): Promise<ResolvedDocumentationCandidate[]> {
    const directTarget = await this.resolveDirectAt(document, position);
    if (directTarget) {
      return [
        {
          target: directTarget,
          entry: await this.findEntry(directTarget),
          source: 'direct'
        }
      ];
    }

    return this.resolveCandidatesFromDefinitions(document, position, maxCandidates);
  }

  public async queryOtherHoverProviders(
    document: vscode.TextDocument,
    position: vscode.Position
  ): Promise<vscode.Hover[]> {
    return this.withSuppressedHover(async () => {
      return (
        (await vscode.commands.executeCommand<vscode.Hover[]>(
          'vscode.executeHoverProvider',
          document.uri,
          position
        )) ?? []
      );
    });
  }

  public async queryOtherDefinitionProviders(
    document: vscode.TextDocument,
    position: vscode.Position
  ): Promise<Array<vscode.Location | vscode.LocationLink>> {
    return this.withSuppressedDefinition(async () => {
      const results =
        (await vscode.commands.executeCommand<Array<vscode.Location | vscode.LocationLink>>(
          'vscode.executeDefinitionProvider',
          document.uri,
          position
        )) ?? [];
      return results;
    });
  }

  public async queryOtherRenameProviders(
    document: vscode.TextDocument,
    position: vscode.Position,
    newName: string
  ): Promise<vscode.WorkspaceEdit | null> {
    return this.withSuppressedRename(async () => {
      return (
        (await vscode.commands.executeCommand<vscode.WorkspaceEdit | null>(
          'vscode.executeDocumentRenameProvider',
          document.uri,
          position,
          newName
        )) ?? null
      );
    });
  }

  public hasLikelySourceDocumentation(
    candidates: readonly ResolvedDocumentationCandidate[]
  ): boolean {
    return candidates.some((candidate) => this.targetHasLikelySourceDocumentation(candidate.target));
  }

  public getSourceDocumentationMarkdown(
    candidate: ResolvedDocumentationCandidate
  ): string | null {
    return this.extractSourceDocumentation(candidate.target);
  }

  public async openDocumentation(
    docsUri: vscode.Uri,
    range: vscode.Range | undefined,
    openMode: ExternalDocsConfig['openMode']
  ): Promise<vscode.TextEditor> {
    const document = await vscode.workspace.openTextDocument(docsUri);
    return vscode.window.showTextDocument(document, {
      preview: false,
      preserveFocus: false,
      viewColumn: viewColumnForMode(openMode),
      selection: range ? positionAtStartOfRange(range) : undefined
    });
  }

  private async getDocumentPositionFromTarget(
    target?: CommandTarget
  ): Promise<DocumentPosition | null> {
    if (target?.uri && target.position) {
      const document = await vscode.workspace.openTextDocument(vscode.Uri.parse(target.uri));
      return {
        document,
        position: new vscode.Position(target.position.line, target.position.character)
      };
    }

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return null;
    }

    return {
      document: editor.document,
      position: editor.selection.active
    };
  }

  private async resolveCandidatesFromDefinitions(
    document: vscode.TextDocument,
    position: vscode.Position,
    maxCandidates: number
  ): Promise<ResolvedDocumentationCandidate[]> {
    const locations = await this.queryOtherDefinitionProviders(document, position);
    const candidates: ResolvedDocumentationCandidate[] = [];
    const seen = new Set<string>();

    for (const location of locations) {
      const documentPosition = await this.documentPositionFromDefinition(location);
      if (!documentPosition) {
        continue;
      }

      const resolved = await this.resolveDirectAt(
        documentPosition.document,
        documentPosition.position
      );
      if (!resolved) {
        continue;
      }

      const key = `${resolved.mapping.docsUri.toString()}::${resolved.symbol.canonicalSignature}`;
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      candidates.push({
        target: resolved,
        entry: await this.findEntry(resolved),
        source: 'definition'
      });

      if (candidates.length >= maxCandidates) {
        break;
      }
    }

    return candidates;
  }

  private async documentPositionFromDefinition(
    definition: vscode.Location | vscode.LocationLink
  ): Promise<DocumentPosition | null> {
    const uri = 'targetUri' in definition ? definition.targetUri : definition.uri;
    if (uri.scheme !== 'file') {
      return null;
    }

    const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
    if (!workspaceFolder) {
      return null;
    }

    const range =
      'targetUri' in definition
        ? definition.targetSelectionRange ?? definition.targetRange
        : definition.range;

    return {
      document: await vscode.workspace.openTextDocument(uri),
      position: range.start
    };
  }

  private targetHasLikelySourceDocumentation(target: ResolvedDocumentationTarget): boolean {
    return this.extractSourceDocumentation(target) !== null;
  }

  private extractSourceDocumentation(target: ResolvedDocumentationTarget): string | null {
    const { document, symbol } = target;
    const symbolLine = symbol.symbolRange.start.line;
    const languageId = document.languageId;

    const leadingComment = this.extractLeadingDocComment(document, symbolLine);
    if (leadingComment) {
      return leadingComment;
    }

    if (languageId === 'python') {
      return this.extractPythonDocstring(document, symbolLine);
    }

    return null;
  }

  private extractLeadingDocComment(document: vscode.TextDocument, symbolLine: number): string | null {
    let line = symbolLine - 1;
    while (line >= 0 && document.lineAt(line).text.trim() === '') {
      line -= 1;
    }

    if (line < 0) {
      return null;
    }

    const trimmed = document.lineAt(line).text.trim();
    if (/^(?:\/\/\/|\/\/!)/.test(trimmed)) {
      const lines: string[] = [];
      for (let current = line; current >= 0; current -= 1) {
        const currentTrimmed = document.lineAt(current).text.trim();
        if (!/^(?:\/\/\/|\/\/!)/.test(currentTrimmed)) {
          break;
        }
        lines.unshift(currentTrimmed.replace(/^(?:\/\/\/|\/\/!)\s?/, ''));
      }
      return this.normalizeExtractedDocumentation(lines.join('\n'));
    }

    if (!(trimmed.startsWith('/**') || trimmed.startsWith('/*!') || trimmed.endsWith('*/'))) {
      return null;
    }

    let startLine = -1;
    for (let current = line; current >= Math.max(0, line - 20); current -= 1) {
      const currentTrimmed = document.lineAt(current).text.trim();
      if (currentTrimmed.startsWith('/**') || currentTrimmed.startsWith('/*!')) {
        startLine = current;
        break;
      }
      if (
        currentTrimmed !== '' &&
        !currentTrimmed.startsWith('*') &&
        !currentTrimmed.endsWith('*/')
      ) {
        return null;
      }
    }

    if (startLine === -1) {
      return null;
    }

    const rawLines: string[] = [];
    for (let current = startLine; current <= line; current += 1) {
      rawLines.push(document.lineAt(current).text);
    }

    const cleaned = rawLines
      .map((value, index) => {
        let normalized = value.trim();
        if (index === 0) {
          normalized = normalized.replace(/^\/\*\*+\s?/, '');
        }
        if (index === rawLines.length - 1) {
          normalized = normalized.replace(/\*\/$/, '').trimEnd();
        }
        normalized = normalized.replace(/^\*\s?/, '');
        return normalized;
      })
      .join('\n');
    return this.normalizeExtractedDocumentation(cleaned);
  }

  private extractPythonDocstring(document: vscode.TextDocument, symbolLine: number): string | null {
    const declarationLine = document.lineAt(symbolLine).text;
    const declarationIndent = declarationLine.match(/^\s*/)?.[0].length ?? 0;

    for (let line = symbolLine + 1; line < Math.min(document.lineCount, symbolLine + 8); line += 1) {
      const text = document.lineAt(line).text;
      const trimmed = text.trim();
      if (trimmed === '') {
        continue;
      }

      const indent = text.match(/^\s*/)?.[0].length ?? 0;
      if (indent <= declarationIndent) {
        return null;
      }

      if (!(trimmed.startsWith('"""') || trimmed.startsWith("'''"))) {
        return null;
      }

      const quote = trimmed.startsWith('"""') ? '"""' : "'''";
      const lines: string[] = [];
      let currentLine = line;
      while (currentLine < document.lineCount) {
        const currentText = document.lineAt(currentLine).text.trim();
        lines.push(currentText);
        if (currentLine !== line && currentText.endsWith(quote)) {
          break;
        }
        if (currentLine === line && currentText.slice(quote.length).includes(quote)) {
          break;
        }
        currentLine += 1;
      }

      const cleaned = lines
        .map((entry, index) => {
          let normalized = entry;
          if (index === 0) {
            normalized = normalized.slice(quote.length);
          }
          if (index === lines.length - 1 && normalized.endsWith(quote)) {
            normalized = normalized.slice(0, -quote.length);
          }
          return normalized;
        })
        .join('\n');
      return this.normalizeExtractedDocumentation(cleaned);
    }

    return null;
  }

  private normalizeExtractedDocumentation(value: string): string | null {
    const normalized = value
      .split(/\r?\n/)
      .map((line) => line.replace(/\s+$/g, ''))
      .join('\n')
      .trim();
    return normalized.length > 0 ? normalized : null;
  }
}
