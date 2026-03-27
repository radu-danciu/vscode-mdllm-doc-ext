import * as assert from 'assert';
import * as vscode from 'vscode';
import {
  activateExtension,
  configureWorkspace,
  hoverText,
  openEditor,
  positionInSnippet,
  positionOf,
  removeRelativePath,
  writeRelativeFile
} from '../helpers';

suite('hover provider integration', () => {
  const tempRoot = 'test/.tmp/provider-fixtures';
  const targetsPath = `${tempRoot}/src/targets.ts`;
  const callsPath = `${tempRoot}/src/calls.ts`;
  const docsPath = `${tempRoot}/docs/api/ts/src/targets_ts.md`;
  const cppUndocumentedPath = `${tempRoot}/cpp/standalone.h`;
  let providerDisposables: vscode.Disposable[] = [];

  suiteSetup(async () => {
    await activateExtension();
    await writeRelativeFile(
      targetsPath,
      [
        'export function documentedTarget(value: number): number {',
        '  return value;',
        '}',
        '',
        'export function noDocsTarget(value: number): number {',
        '  return value;',
        '}',
        '',
        'export function ambiguousOne(value: number): number {',
        '  return value;',
        '}',
        '',
        'export function ambiguousTwo(value: string): string {',
        '  return value;',
        '}',
        '',
        'export function ambiguousThree(flag: boolean): boolean {',
        '  return flag;',
        '}',
        '',
        'export function ambiguousFour(input: object): object {',
        '  return input;',
        '}',
        '',
        'export function fallbackHoverOnly(): string {',
        '  return "fallback";',
        '}'
      ].join('\n')
    );
    await writeRelativeFile(
      callsPath,
      [
        'export function runCalls(): void {',
        '  documentedTarget(1);',
        '  ambiguousTarget(1);',
        '  noDocsTarget(1);',
        '}'
      ].join('\n')
    );
    await writeRelativeFile(
      docsPath,
      [
        '## src/targets.ts',
        '',
        '### `documentedTarget(value: number) -> number`',
        '',
        'Brief: Call-site documented target.',
        '',
        '---',
        '',
        '### `ambiguousOne(value: number) -> number`',
        '',
        'Brief: Ambiguous option one.',
        '',
        '---',
        '',
        '### `ambiguousTwo(value: string) -> string`',
        '',
        'Brief: Ambiguous option two.',
        '',
        '---',
        '',
        '### `ambiguousThree(flag: boolean) -> boolean`',
        '',
        'Brief: Ambiguous option three.',
        '',
        '---',
        '',
        '### `ambiguousFour(input: object) -> object`',
        '',
        'Brief: Ambiguous option four.',
        '',
        '---'
      ].join('\n')
    );
    await writeRelativeFile(
      cppUndocumentedPath,
      [
        'namespace sample {',
        'float plainUndocumented(float value);',
        '}'
      ].join('\n')
    );

    providerDisposables.push(
      vscode.languages.registerHoverProvider({ language: 'typescript', scheme: 'file' }, {
        provideHover(document, position) {
          if (!document.uri.fsPath.endsWith('targets.ts')) {
            return null;
          }
          const range = document.getWordRangeAtPosition(position);
          if (!range || document.getText(range) !== 'fallbackHoverOnly') {
            return null;
          }
          return new vscode.Hover('Fallback hover from test provider.', range);
        }
      }),
      vscode.languages.registerDefinitionProvider({ language: 'typescript', scheme: 'file' }, {
        provideDefinition(document, position) {
          if (!document.uri.fsPath.endsWith('calls.ts')) {
            return null;
          }

          const range = document.getWordRangeAtPosition(position);
          const token = range ? document.getText(range) : '';
          const targetDocument = vscode.workspace.textDocuments.find((entry) =>
            entry.uri.fsPath.replace(/\\/g, '/').endsWith(`/${targetsPath}`)
          );
          if (!targetDocument) {
            return null;
          }

          const toLocation = (name: string) =>
            new vscode.Location(targetDocument.uri, positionOf(targetDocument, name));

          if (token === 'documentedTarget') {
            return [toLocation('documentedTarget')];
          }
          if (token === 'ambiguousTarget') {
            return [
              toLocation('ambiguousOne'),
              toLocation('ambiguousTwo'),
              toLocation('ambiguousThree'),
              toLocation('ambiguousFour')
            ];
          }
          if (token === 'noDocsTarget') {
            return [toLocation('noDocsTarget')];
          }

          return null;
        }
      })
    );
  });

  suiteTeardown(async () => {
    vscode.Disposable.from(...providerDisposables).dispose();
    await removeRelativePath(tempRoot);
  });

  test('shows documented hover content for all supported language modules', async () => {
    const cases = [
      {
        relativePath: 'test/fixtures/cppWorkspace/include/math/vector.h',
        token: 'normalize',
        codeRoot: 'test/fixtures/cppWorkspace',
        docsRoot: 'test/fixtures/cppWorkspace/docs/api',
        expected: 'Example documented C++ free function'
      },
      {
        relativePath: 'test/fixtures/csharpWorkspace/src/Foo/Bar.cs',
        token: 'GetNameAsync',
        codeRoot: 'test/fixtures/csharpWorkspace',
        docsRoot: 'test/fixtures/csharpWorkspace/docs/api',
        expected: 'Example documented C# method'
      },
      {
        relativePath: 'test/fixtures/jsWorkspace/web/utils/math.js',
        token: 'normalize',
        codeRoot: 'test/fixtures/jsWorkspace',
        docsRoot: 'test/fixtures/jsWorkspace/docs/api',
        expected: 'Example documented JavaScript method'
      },
      {
        relativePath: 'test/fixtures/pythonWorkspace/pkg/math/vector.py',
        token: 'normalize',
        codeRoot: 'test/fixtures/pythonWorkspace',
        docsRoot: 'test/fixtures/pythonWorkspace/docs/api',
        expected: 'Example documented Python function'
      },
      {
        relativePath: 'showcase/ts/showcase.ts',
        token: 'normalizeShowcase',
        codeRoot: '.',
        docsRoot: 'docs/api',
        expected: 'Normalizes a numeric value in the TypeScript showcase'
      }
    ];

    for (const testCase of cases) {
      await configureWorkspace({
        codeRoot: testCase.codeRoot,
        docsRoot: testCase.docsRoot
      });
      const editor = await openEditor(testCase.relativePath);
      const hover = await hoverText(editor, positionOf(editor.document, testCase.token));
      assert.match(hover, new RegExp(testCase.expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
      assert.match(hover, /Open full documentation/);
    }
  });

  test('shows missing-doc hover state when no external docs and no other hover exist', async () => {
    await configureWorkspace({
      codeRoot: tempRoot,
      docsRoot: `${tempRoot}/docs/api`
    });
    const editor = await openEditor(cppUndocumentedPath);
    const hover = await hoverText(editor, positionOf(editor.document, 'plainUndocumented'));

    assert.match(hover, /No external documentation found/);
    assert.match(hover, /Create symbol documentation/);
  });

  test('preserves markdown section breaks in the hover preview', async () => {
    await configureWorkspace({ codeRoot: '.', docsRoot: 'docs/api' });
    const editor = await openEditor('src/core/config.ts');
    const hover = await hoverText(editor, positionOf(editor.document, 'getConfig'));

    assert.match(hover, /Brief: Reads the extension settings/);
    assert.match(hover, /\n\nDetails:\nKeeps the rest of the extension code away/);
  });

  test('resolves self-hosted docs from multiline declaration positions', async () => {
    await configureWorkspace({ codeRoot: '.', docsRoot: 'docs/api' });
    const editor = await openEditor('src/core/definitionProvider.ts');
    const positions = [
      positionOf(editor.document, 'provideDefinition'),
      positionOf(editor.document, 'TextDocument'),
      positionOf(editor.document, 'Promise')
    ];

    for (const position of positions) {
      const hover = await hoverText(editor, position);
      assert.match(hover, /Brief: Describes the repo-local method `provideDefinition`/);
      assert.match(hover, /Open full documentation/);
    }
  });

  test('resolves self-hosted DocumentationService docs from method, param, and return-type positions', async () => {
    await configureWorkspace({ codeRoot: '.', docsRoot: 'docs/api' });
    const editor = await openEditor('src/core/documentationService.ts');
    const cases = [
      {
        snippet: 'private async getDocumentPositionFromTarget(',
        probes: ['getDocumentPositionFromTarget', 'CommandTarget', 'Promise'],
        expected: /Brief: Describes the repo-local method `getDocumentPositionFromTarget`/
      },
      {
        snippet: 'private async resolveCandidatesFromDefinitions(',
        probes: ['resolveCandidatesFromDefinitions', 'TextDocument', 'Promise'],
        expected: /Brief: Describes the repo-local method `resolveCandidatesFromDefinitions`/
      },
      {
        snippet: 'private async documentPositionFromDefinition(',
        probes: ['documentPositionFromDefinition', 'Location', 'Promise'],
        expected: /Brief: Describes the repo-local method `documentPositionFromDefinition`/
      }
    ];

    for (const testCase of cases) {
      for (const probe of testCase.probes) {
        const hover = await hoverText(
          editor,
          positionInSnippet(editor.document, testCase.snippet, probe)
        );
        assert.match(hover, testCase.expected);
        assert.match(hover, /Open full documentation/);
      }
    }
  });

  test('does not block another hover provider when external docs are missing', async () => {
    await configureWorkspace({
      codeRoot: tempRoot,
      docsRoot: `${tempRoot}/docs/api`
    });
    const editor = await openEditor(targetsPath);
    const hover = await hoverText(editor, positionOf(editor.document, 'fallbackHoverOnly'));

    assert.match(hover, /Fallback hover from test provider/);
    assert.doesNotMatch(hover, /Create symbol documentation/);
  });

  test('does not show missing-doc hover when a source doc comment exists', async () => {
    await configureWorkspace({ codeRoot: '.', docsRoot: 'docs/api' });
    const editor = await openEditor('showcase/ts/showcase.ts');
    const hover = await hoverText(editor, positionOf(editor.document, 'builtinCommentShowcase'));

    assert.match(hover, /Source-comment-only sample used to verify fallback hover behavior/);
    assert.doesNotMatch(hover, /No external documentation found/);
    assert.doesNotMatch(hover, /Create symbol documentation/);
  });

  test('shows external docs at call sites via definition lookup', async () => {
    await configureWorkspace({
      codeRoot: tempRoot,
      docsRoot: `${tempRoot}/docs/api`
    });
    await openEditor(targetsPath);
    const editor = await openEditor(callsPath);
    const hover = await hoverText(editor, positionOf(editor.document, 'documentedTarget'));

    assert.match(hover, /Call-site documented target/);
    assert.match(hover, /Open full documentation/);
  });

  test('shows external docs at constructor call sites for js\/ts classes', async () => {
    const cases = [
      {
        relativePath: 'showcase/ts/showcase.ts',
        snippet: 'new ShowcaseVector(-4);',
        token: 'ShowcaseVector',
        expected: /Brief: Concrete TypeScript showcase class/
      },
      {
        relativePath: 'showcase/js/showcase.js',
        snippet: 'new ShowcaseCounter();',
        token: 'ShowcaseCounter',
        expected: /Brief: Small JavaScript showcase class used to demonstrate class-level markdown lookup/
      }
    ];

    await configureWorkspace({ codeRoot: '.', docsRoot: 'docs/api' });

    for (const testCase of cases) {
      const editor = await openEditor(testCase.relativePath);
      const hover = await hoverText(
        editor,
        positionInSnippet(editor.document, testCase.snippet, testCase.token)
      );
      assert.match(hover, testCase.expected);
      assert.match(hover, /Open full documentation/);
    }
  });

  test('shows a compact chooser for ambiguous call-site matches', async () => {
    await configureWorkspace({
      codeRoot: tempRoot,
      docsRoot: `${tempRoot}/docs/api`
    });
    await openEditor(targetsPath);
    const editor = await openEditor(callsPath);
    const hover = await hoverText(editor, positionOf(editor.document, 'ambiguousTarget'));

    assert.match(hover, /Multiple documentation matches/);
    const openLinkCount = (hover.match(/externalDocs\.openSymbolDocumentation/g) ?? []).length;
    assert.strictEqual(openLinkCount, 3);
    assert.doesNotMatch(hover, /Ambiguous option four/);
  });

  test('falls back to the normal call-site hover when no docs exist and another hover does', async () => {
    await configureWorkspace({
      codeRoot: tempRoot,
      docsRoot: `${tempRoot}/docs/api`
    });
    await openEditor(targetsPath);
    const editor = await openEditor(callsPath);
    const hover = await hoverText(editor, positionOf(editor.document, 'noDocsTarget'));

    assert.match(hover, /```typescript/);
    assert.doesNotMatch(hover, /Create symbol documentation/);
  });
});
