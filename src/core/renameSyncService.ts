import * as vscode from 'vscode';
import { getConfig } from './config';
import { LanguageRegistry } from './languageRegistry';
import { mapSourceToDocs } from './pathMapper';
import { DocumentationService, ResolvedDocumentationTarget } from './documentationService';
import { appendMarkdownRenameEdits, buildSymbolRenamePlan, SymbolRenamePlan } from './renameEdits';
import { ResolvedSymbol } from './types';

export class RenameSyncService implements vscode.Disposable {
  private readonly documentCache = new Map<string, string>();
  private readonly disposables: vscode.Disposable[] = [];
  private applyingDocsSyncDepth = 0;

  constructor(
    private readonly documentationService: DocumentationService,
    private readonly registry: LanguageRegistry
  ) {
    for (const document of vscode.workspace.textDocuments) {
      this.documentCache.set(document.uri.toString(), document.getText());
    }

    this.disposables.push(
      vscode.workspace.onDidOpenTextDocument((document) => {
        this.documentCache.set(document.uri.toString(), document.getText());
      }),
      vscode.workspace.onDidCloseTextDocument((document) => {
        this.documentCache.delete(document.uri.toString());
      }),
      vscode.workspace.onDidChangeTextDocument((event) => {
        void this.handleDocumentChange(event);
      })
    );
  }

  public dispose(): void {
    vscode.Disposable.from(...this.disposables).dispose();
    this.documentCache.clear();
  }

  private async handleDocumentChange(event: vscode.TextDocumentChangeEvent): Promise<void> {
    const cacheKey = event.document.uri.toString();
    const previousText = this.documentCache.get(cacheKey);
    this.documentCache.set(cacheKey, event.document.getText());

    if (
      this.applyingDocsSyncDepth > 0 ||
      !previousText ||
      previousText === event.document.getText() ||
      event.document.uri.scheme !== 'file' ||
      event.document.uri.fsPath.endsWith('.md')
    ) {
      return;
    }

    const renameSync = await this.deriveRenameSyncPlan(event, previousText);
    if (!renameSync) {
      return;
    }

    const workspaceEdit = new vscode.WorkspaceEdit();
    await appendMarkdownRenameEdits(
      workspaceEdit,
      renameSync.target.workspaceFolder,
      renameSync.target.config.docsRoot,
      renameSync.plan
    );
    if (workspaceEdit.size === 0) {
      return;
    }

    this.applyingDocsSyncDepth += 1;
    try {
      await vscode.workspace.applyEdit(workspaceEdit);
    } finally {
      this.applyingDocsSyncDepth -= 1;
    }
  }

  private async deriveRenameSyncPlan(
    event: vscode.TextDocumentChangeEvent,
    previousText: string
  ): Promise<{ target: ResolvedDocumentationTarget; plan: SymbolRenamePlan } | null> {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(event.document.uri);
    if (!workspaceFolder) {
      return null;
    }

    const module = this.registry.getModuleForDocument(event.document);
    if (!module) {
      return null;
    }

    const config = getConfig(workspaceFolder);
    const mapping = mapSourceToDocs(
      workspaceFolder,
      event.document.uri,
      config,
      module.getLangBucket(event.document, config)
    );
    if (!mapping) {
      return null;
    }

    const previousDocument = await vscode.workspace.openTextDocument({
      language: event.document.languageId,
      content: previousText
    });
    const previousSymbols = await module.listSymbols({
      document: previousDocument,
      workspaceFolder,
      config
    });
    const currentSymbols = await module.listSymbols({
      document: event.document,
      workspaceFolder,
      config
    });

    const renamedPair = this.findRenamedSymbolPair(previousSymbols, currentSymbols);
    if (!renamedPair) {
      return null;
    }

    const target: ResolvedDocumentationTarget = {
      document: event.document,
      workspaceFolder,
      config,
      module,
      symbol: renamedPair.current,
      mapping
    };
    const previousTarget: ResolvedDocumentationTarget = {
      ...target,
      symbol: {
        ...renamedPair.previous,
        sourceFile: event.document.uri,
        sourceRelativePath: mapping.sourceRelativePath,
        symbolRange: renamedPair.current.symbolRange,
        declarationRange: renamedPair.current.declarationRange
      }
    };
    const plan = buildSymbolRenamePlan(previousTarget, renamedPair.current.displayName);
    if (!plan) {
      return null;
    }

    return { target, plan };
  }

  private findRenamedSymbolPair(
    previousSymbols: readonly ResolvedSymbol[],
    currentSymbols: readonly ResolvedSymbol[]
  ): { previous: ResolvedSymbol; current: ResolvedSymbol } | null {
    const candidates: Array<{ previous: ResolvedSymbol; current: ResolvedSymbol }> = [];

    for (const previous of previousSymbols) {
      for (const current of currentSymbols) {
        if (
          previous.kind !== current.kind ||
          previous.displayName === current.displayName ||
          previous.containerName !== current.containerName ||
          previous.arity !== current.arity ||
          previous.symbolRange.start.line !== current.symbolRange.start.line ||
          !this.equalTypeLists(
            previous.params?.map((param) => param.type ?? '') ?? [],
            current.params?.map((param) => param.type ?? '') ?? []
          ) ||
          this.normalizeType(previous.returnType) !== this.normalizeType(current.returnType)
        ) {
          continue;
        }

        candidates.push({ previous, current });
      }
    }

    return candidates.length === 1 ? candidates[0] : null;
  }

  private normalizeType(value?: string): string {
    return value?.replace(/\s+/g, ' ').trim() ?? '';
  }

  private equalTypeLists(left: readonly string[], right: readonly string[]): boolean {
    return (
      left.length === right.length &&
      left.every((value, index) => this.normalizeType(value) === this.normalizeType(right[index]))
    );
  }
}
