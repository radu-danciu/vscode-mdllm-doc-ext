import * as assert from 'assert';
import * as vscode from 'vscode';
import {
  activateExtension,
  configureWorkspace,
  definitionsAt,
  openEditor,
  positionInSnippet,
  positionOf,
  relativeFsPath,
  removeRelativePath,
  writeRelativeFile
} from '../helpers';

suite('definition provider integration', () => {
  const tempRoot = 'test/.tmp/provider-definitions';
  const targetsPath = `${tempRoot}/src/targets.ts`;
  const callsPath = `${tempRoot}/src/calls.ts`;
  const docsPath = `${tempRoot}/docs/api/ts/src/targets_ts.md`;
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
        '}'
      ].join('\n')
    );
    await writeRelativeFile(
      callsPath,
      [
        'export function runCalls(): void {',
        '  documentedTarget(1);',
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
        'Brief: Definition call-site documented target.',
        '',
        '---'
      ].join('\n')
    );

    providerDisposables.push(
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

  test('navigates documented symbols to their Markdown entry', async () => {
    const cases = [
      {
        relativePath: 'test/fixtures/tsWorkspace/web/utils/math.ts',
        token: 'normalize',
        codeRoot: 'test/fixtures/tsWorkspace',
        docsRoot: 'test/fixtures/tsWorkspace/docs/api',
        expectedDoc: 'test/fixtures/tsWorkspace/docs/api/ts/web/utils/math_ts.md'
      },
      {
        relativePath: 'test/fixtures/pythonWorkspace/pkg/math/vector.py',
        token: 'normalize',
        codeRoot: 'test/fixtures/pythonWorkspace',
        docsRoot: 'test/fixtures/pythonWorkspace/docs/api',
        expectedDoc: 'test/fixtures/pythonWorkspace/docs/api/python/pkg/math/vector_py.md'
      },
      {
        relativePath: 'showcase/ts/showcase.ts',
        token: 'normalizeShowcase',
        codeRoot: '.',
        docsRoot: 'docs/api',
        expectedDoc: 'docs/api/ts/showcase/ts/showcase_ts.md'
      }
    ];

    for (const testCase of cases) {
      await configureWorkspace({
        codeRoot: testCase.codeRoot,
        docsRoot: testCase.docsRoot
      });
      const editor = await openEditor(testCase.relativePath);
      const definitions = await definitionsAt(editor, positionOf(editor.document, testCase.token));
      assert.ok(definitions.length > 0);
      const markdownDefinition = definitions.find(
        (definition) => relativeFsPath(definition.uri) === testCase.expectedDoc
      );
      assert.ok(markdownDefinition);
      assert.ok(markdownDefinition!.range.start.line >= 0);
    }
  });

  test('does not hijack normal definitions when no external entry exists', async () => {
    await configureWorkspace({
      codeRoot: tempRoot,
      docsRoot: `${tempRoot}/docs/api`
    });
    await openEditor(targetsPath);
    const editor = await openEditor(callsPath);
    const definitions = await definitionsAt(editor, positionOf(editor.document, 'noDocsTarget'));

    assert.ok(definitions.length > 0);
    assert.ok(definitions.some((definition) => relativeFsPath(definition.uri) === targetsPath));
    assert.ok(
      definitions.every(
        (definition) => relativeFsPath(definition.uri) !== `${tempRoot}/docs/api/ts/src/targets_ts.md`
      )
    );
  });

  test('routes call-site definition requests to markdown docs when an entry exists', async () => {
    await configureWorkspace({
      codeRoot: tempRoot,
      docsRoot: `${tempRoot}/docs/api`
    });
    await openEditor(targetsPath);
    const editor = await openEditor(callsPath);
    const definitions = await definitionsAt(editor, positionOf(editor.document, 'documentedTarget'));

    assert.ok(definitions.some((definition) => relativeFsPath(definition.uri) === `${tempRoot}/docs/api/ts/src/targets_ts.md`));
  });

  test('routes multiline self-hosted declaration positions to markdown docs', async () => {
    await configureWorkspace({ codeRoot: '.', docsRoot: 'docs/api' });
    const editor = await openEditor('src/core/definitionProvider.ts');
    const expectedDoc = 'docs/api/ts/src/core/definitionProvider_ts.md';
    const positions = [
      positionOf(editor.document, 'provideDefinition'),
      positionOf(editor.document, 'TextDocument'),
      positionOf(editor.document, 'Promise')
    ];

    for (const position of positions) {
      const definitions = await definitionsAt(editor, position);
      assert.ok(definitions.some((definition) => relativeFsPath(definition.uri) === expectedDoc));
    }
  });

  test('routes DocumentationService declaration positions to their markdown entries', async () => {
    await configureWorkspace({ codeRoot: '.', docsRoot: 'docs/api' });
    const editor = await openEditor('src/core/documentationService.ts');
    const expectedDoc = 'docs/api/ts/src/core/documentationService_ts.md';
    const cases = [
      {
        snippet: 'private async getDocumentPositionFromTarget(',
        probes: ['getDocumentPositionFromTarget', 'CommandTarget', 'Promise']
      },
      {
        snippet: 'private async resolveCandidatesFromDefinitions(',
        probes: ['resolveCandidatesFromDefinitions', 'TextDocument', 'Promise']
      },
      {
        snippet: 'private async documentPositionFromDefinition(',
        probes: ['documentPositionFromDefinition', 'Location', 'Promise']
      }
    ];

    for (const testCase of cases) {
      for (const probe of testCase.probes) {
        const definitions = await definitionsAt(
          editor,
          positionInSnippet(editor.document, testCase.snippet, probe)
        );
        assert.ok(definitions.some((definition) => relativeFsPath(definition.uri) === expectedDoc));
      }
    }
  });
});
