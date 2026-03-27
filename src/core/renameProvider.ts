import * as vscode from 'vscode';
import { DocumentationService } from './documentationService';
import { appendMarkdownRenameEdits, buildSymbolRenamePlan } from './renameEdits';
import { rangeContains } from '../languages/common';

export class ExternalDocsRenameProvider implements vscode.RenameProvider {
  constructor(private readonly documentationService: DocumentationService) {}

  public async prepareRename(
    document: vscode.TextDocument,
    position: vscode.Position
  ): Promise<vscode.Range | { range: vscode.Range; placeholder: string } | null> {
    if (this.documentationService.isRenameSuppressed()) {
      return null;
    }

    const target = await this.documentationService.resolveDirectAt(document, position);
    if (!target || !rangeContains(target.symbol.symbolRange, position)) {
      return null;
    }

    return {
      range: target.symbol.symbolRange,
      placeholder: target.symbol.displayName
    };
  }

  public async provideRenameEdits(
    document: vscode.TextDocument,
    position: vscode.Position,
    newName: string
  ): Promise<vscode.WorkspaceEdit | null> {
    if (this.documentationService.isRenameSuppressed()) {
      return null;
    }

    const target = await this.documentationService.resolveDirectAt(document, position);
    if (!target || !rangeContains(target.symbol.symbolRange, position)) {
      return null;
    }

    const delegatedEdit = await this.documentationService.queryOtherRenameProviders(
      document,
      position,
      newName
    );
    if (!delegatedEdit) {
      return null;
    }

    const plan = buildSymbolRenamePlan(target, newName);
    if (!plan) {
      return delegatedEdit;
    }

    await appendMarkdownRenameEdits(
      delegatedEdit,
      target.workspaceFolder,
      target.config.docsRoot,
      plan
    );

    return delegatedEdit;
  }
}
