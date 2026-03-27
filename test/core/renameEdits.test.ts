import * as assert from 'assert';
import {
  buildSymbolRenamePlan,
  rewriteMarkdownCodeSpans,
  selectPrimaryDocHeadingMatch
} from '../../src/core/renameEdits';

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

  test('selects an exact primary doc heading match before stale candidates', () => {
    const plan = buildSymbolRenamePlan(
      {
        symbol: {
          canonicalSignature: 'Task<string> Demo.Services.Calculator.DescribeTaskAsync(Guid id)',
          kind: 'method',
          arity: 1,
          containerName: 'Demo.Services.Calculator',
          params: [{ name: 'id', type: 'Guid' }],
          returnType: 'Task<string>'
        },
        mapping: {
          docsUri: undefined as never
        }
      } as never,
      'DescribeMarkdownAsync'
    );
    assert.ok(plan);

    const match = selectPrimaryDocHeadingMatch(
      [
        'Task<string> Demo.Services.Calculator.DescribeTaskAsync(Guid id)',
        'Task<string> Demo.Services.Calculator.DescribeAsync(Guid id)'
      ],
      plan!
    );

    assert.deepStrictEqual(match, {
      kind: 'exact',
      matchedCanonicalSignature: 'Task<string> Demo.Services.Calculator.DescribeTaskAsync(Guid id)',
      matchedHead: 'Demo.Services.Calculator.DescribeTaskAsync'
    });
  });

  test('accepts a unique high-confidence stale primary doc heading match', () => {
    const plan = buildSymbolRenamePlan(
      {
        symbol: {
          canonicalSignature: 'Task<string> Demo.Services.Calculator.DescribeTaskAsync(Guid id)',
          kind: 'method',
          arity: 1,
          containerName: 'Demo.Services.Calculator',
          params: [{ name: 'id', type: 'Guid' }],
          returnType: 'Task<string>'
        },
        mapping: {
          docsUri: undefined as never
        }
      } as never,
      'DescribeMarkdownAsync'
    );
    assert.ok(plan);

    const match = selectPrimaryDocHeadingMatch(
      ['Task<string> Demo.Services.Calculator.DescribeAsync(Guid id)'],
      plan!
    );

    assert.deepStrictEqual(match, {
      kind: 'stale',
      matchedCanonicalSignature: 'Task<string> Demo.Services.Calculator.DescribeAsync(Guid id)',
      matchedHead: 'Demo.Services.Calculator.DescribeAsync'
    });
  });

  test('treats multiple plausible stale heading matches as ambiguous', () => {
    const plan = buildSymbolRenamePlan(
      {
        symbol: {
          canonicalSignature: 'Task<string> Demo.Services.Calculator.DescribeTaskAsync(Guid id)',
          kind: 'method',
          arity: 1,
          containerName: 'Demo.Services.Calculator',
          params: [{ name: 'id', type: 'Guid' }],
          returnType: 'Task<string>'
        },
        mapping: {
          docsUri: undefined as never
        }
      } as never,
      'DescribeMarkdownAsync'
    );
    assert.ok(plan);

    const match = selectPrimaryDocHeadingMatch(
      [
        'Task<string> Demo.Services.Calculator.DescribeAsync(Guid id)',
        'Task<string> Demo.Services.Calculator.DescribeLegacyAsync(Guid id)'
      ],
      plan!
    );

    assert.strictEqual(match, null);
  });

  test('rewrites stale primary signatures and qualified heads in code spans', () => {
    const plan = buildSymbolRenamePlan(
      {
        symbol: {
          canonicalSignature: 'Task<string> Demo.Services.Calculator.DescribeTaskAsync(Guid id)',
          kind: 'method',
          arity: 1,
          containerName: 'Demo.Services.Calculator',
          params: [{ name: 'id', type: 'Guid' }],
          returnType: 'Task<string>'
        },
        mapping: {
          docsUri: undefined as never
        }
      } as never,
      'DescribeMarkdownAsync'
    );
    assert.ok(plan);

    const content = [
      '### `Task<string> Demo.Services.Calculator.DescribeAsync(Guid id)`',
      '',
      'See `Demo.Services.Calculator.DescribeAsync`.',
      '',
      'Do not touch plain prose: Demo.Services.Calculator.DescribeAsync'
    ].join('\n');

    const match = selectPrimaryDocHeadingMatch(
      ['Task<string> Demo.Services.Calculator.DescribeAsync(Guid id)'],
      plan!
    );
    const rewritten = rewriteMarkdownCodeSpans(content, plan!, match);

    assert.match(rewritten, /DescribeMarkdownAsync\(Guid id\)/);
    assert.match(rewritten, /`Demo\.Services\.Calculator\.DescribeMarkdownAsync`/);
    assert.match(rewritten, /plain prose: Demo\.Services\.Calculator\.DescribeAsync/);
  });
});
