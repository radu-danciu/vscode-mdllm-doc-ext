import * as assert from 'assert';
import { buildSymbolRenamePlan, rewriteMarkdownCodeSpans } from '../../src/core/renameEdits';

suite('renameEdits', () => {
  test('rewrites exact canonical signatures and qualified heads in code spans', () => {
    const plan = buildSymbolRenamePlan(
      {
        symbol: {
          canonicalSignature:
            'ExternalDocsDefinitionProvider.provideDefinition(document: vscode.TextDocument, position: vscode.Position) -> Promise<vscode.Definition | null>',
          kind: 'method'
        }
      } as never,
      'provideMarkdownDefinition'
    );
    assert.ok(plan);

    const content = [
      '### `ExternalDocsDefinitionProvider.provideDefinition(document: vscode.TextDocument, position: vscode.Position) -> Promise<vscode.Definition | null>`',
      '',
      'See `ExternalDocsDefinitionProvider.provideDefinition`.',
      '',
      'Do not touch plain prose: ExternalDocsDefinitionProvider.provideDefinition'
    ].join('\n');

    const rewritten = rewriteMarkdownCodeSpans(content, plan!);
    assert.match(rewritten, /provideMarkdownDefinition\(document: vscode\.TextDocument/);
    assert.match(rewritten, /`ExternalDocsDefinitionProvider\.provideMarkdownDefinition`/);
    assert.match(rewritten, /plain prose: ExternalDocsDefinitionProvider\.provideDefinition/);
  });

  test('rewrites container-prefixed child references for type renames', () => {
    const plan = buildSymbolRenamePlan(
      {
        symbol: {
          canonicalSignature: 'RenameTarget',
          kind: 'type'
        }
      } as never,
      'MarkdownRenameTarget'
    );
    assert.ok(plan);

    const content = [
      '### `RenameTarget`',
      '',
      '### `RenameTarget.provideThing(document: string, position: number) -> Promise<number>`',
      '',
      'See `RenameTarget.provideThing` and `RenameTarget`.',
      '',
      'Plain prose RenameTarget should stay as-is.'
    ].join('\n');

    const rewritten = rewriteMarkdownCodeSpans(content, plan!);
    assert.match(rewritten, /### `MarkdownRenameTarget`/);
    assert.match(rewritten, /MarkdownRenameTarget\.provideThing\(document: string, position: number\) -> Promise<number>/);
    assert.match(rewritten, /`MarkdownRenameTarget\.provideThing` and `MarkdownRenameTarget`/);
    assert.match(rewritten, /Plain prose RenameTarget should stay as-is/);
  });
});
