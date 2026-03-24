import * as assert from 'assert';
import * as vscode from 'vscode';
import { DocIndex } from '../../src/core/docIndex';
import {
  DocumentationService,
  ResolvedDocumentationCandidate
} from '../../src/core/documentationService';
import { LanguageRegistry } from '../../src/core/languageRegistry';
import { CppLanguageModule, CSharpLanguageModule, JsTsLanguageModule, PythonLanguageModule } from '../../src/languages';
import {
  configureWorkspace,
  openEditor,
  positionOf,
  removeRelativePath,
  writeRelativeFile
} from '../helpers';

suite('documentationService', () => {
  const tempRoot = 'test/.tmp/documentation-service';
  const targetsPath = `${tempRoot}/src/targets.ts`;
  const callsPath = `${tempRoot}/src/calls.ts`;
  const docsPath = `${tempRoot}/docs/api/ts/src/targets_ts.md`;
  const service = new DocumentationService(
    new LanguageRegistry([
      new CppLanguageModule(),
      new CSharpLanguageModule(),
      new JsTsLanguageModule(),
      new PythonLanguageModule()
    ]),
    new DocIndex()
  );
  let providerDisposables: vscode.Disposable[] = [];

  suiteSetup(async () => {
    await configureWorkspace({
      codeRoot: tempRoot,
      docsRoot: `${tempRoot}/docs/api`
    });
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
        'Brief: Documented target from docs.',
        '',
        '---',
        '',
        '### `ambiguousOne(value: number) -> number`',
        '',
        'Brief: Ambiguous candidate one.',
        '',
        '---',
        '',
        '### `ambiguousTwo(value: string) -> string`',
        '',
        'Brief: Ambiguous candidate two.',
        '',
        '---',
        '',
        '### `ambiguousThree(flag: boolean) -> boolean`',
        '',
        'Brief: Ambiguous candidate three.',
        '',
        '---',
        '',
        '### `ambiguousFour(input: object) -> object`',
        '',
        'Brief: Ambiguous candidate four.',
        '',
        '---'
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
          return new vscode.Hover('Fallback hover from another provider.', range);
        }
      }),
      vscode.languages.registerDefinitionProvider({ language: 'typescript', scheme: 'file' }, {
        provideDefinition(document, position) {
          if (!document.uri.fsPath.endsWith('calls.ts')) {
            return null;
          }

          const range = document.getWordRangeAtPosition(position);
          const token = range ? document.getText(range) : '';
          const locationFor = (name: string): vscode.Location => {
          const targetDocument = vscode.workspace.textDocuments.find((entry) =>
            entry.uri.fsPath.replace(/\\/g, '/').endsWith(`/${targetsPath}`)
          );
            if (!targetDocument) {
              throw new Error('targets.ts should be open before definition tests run.');
            }
            const targetPosition = positionOf(targetDocument, name);
            return new vscode.Location(targetDocument.uri, targetPosition);
          };

          if (token === 'documentedTarget') {
            return [locationFor('documentedTarget')];
          }
          if (token === 'ambiguousTarget') {
            return [
              locationFor('ambiguousOne'),
              locationFor('ambiguousTwo'),
              locationFor('ambiguousThree'),
              locationFor('ambiguousFour')
            ];
          }
          if (token === 'noDocsTarget') {
            return [locationFor('noDocsTarget')];
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

  test('returns a direct candidate with an entry when external docs exist', async () => {
    const editor = await openEditor(targetsPath);
    const candidates = await service.resolveDocumentationCandidates(
      editor.document,
      positionOf(editor.document, 'documentedTarget'),
      3
    );

    assert.strictEqual(candidates.length, 1);
    assert.strictEqual(candidates[0].source, 'direct');
    assert.match(candidates[0].entry?.body ?? '', /Documented target from docs/);
  });

  test('queries other hover providers without recursion', async () => {
    const editor = await openEditor(targetsPath);
    const hovers = await service.queryOtherHoverProviders(
      editor.document,
      positionOf(editor.document, 'fallbackHoverOnly')
    );

    assert.ok(hovers.length >= 1);
    const texts = hovers
      .flatMap((hover) => hover.contents)
      .map((content) =>
        content instanceof vscode.MarkdownString
          ? content.value
          : typeof content === 'string'
            ? content
            : String(content.value)
      )
      .join('\n');
    assert.match(texts, /Fallback hover/);
  });

  test('resolves a single call-site candidate through definition lookup', async () => {
    await openEditor(targetsPath);
    const editor = await openEditor(callsPath);
    const candidates = await service.resolveDocumentationCandidates(
      editor.document,
      positionOf(editor.document, 'documentedTarget'),
      3
    );

    assert.strictEqual(candidates.length, 1);
    assert.strictEqual(candidates[0].source, 'definition');
    assert.match(candidates[0].entry?.body ?? '', /Documented target from docs/);
  });

  test('limits ambiguous call-site candidates to at most three', async () => {
    await openEditor(targetsPath);
    const editor = await openEditor(callsPath);
    const candidates = await service.resolveDocumentationCandidates(
      editor.document,
      positionOf(editor.document, 'ambiguousTarget'),
      3
    );

    assert.strictEqual(candidates.length, 3);
    assert.ok(
      candidates.every(
        (candidate: ResolvedDocumentationCandidate) => candidate.source === 'definition'
      )
    );
  });
});
