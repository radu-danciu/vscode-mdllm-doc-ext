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
  definitionsAt,
  openEditor,
  positionInSnippet,
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

  test('resolves self-hosted private multiline methods from declaration positions', async () => {
    await configureWorkspace({ codeRoot: '.', docsRoot: 'docs/api' });
    const editor = await openEditor('src/core/documentationService.ts');
    const cases = [
      {
        snippet: 'private async getDocumentPositionFromTarget(',
        expected:
          'DocumentationService.getDocumentPositionFromTarget(target?: CommandTarget) -> Promise<DocumentPosition | null>',
        probes: ['getDocumentPositionFromTarget', 'CommandTarget', 'Promise']
      },
      {
        snippet: 'private async resolveCandidatesFromDefinitions(',
        expected:
          'DocumentationService.resolveCandidatesFromDefinitions(document: vscode.TextDocument, position: vscode.Position, maxCandidates: number) -> Promise<ResolvedDocumentationCandidate[]>',
        probes: ['resolveCandidatesFromDefinitions', 'TextDocument', 'Promise']
      },
      {
        snippet: 'private async documentPositionFromDefinition(',
        expected:
          'DocumentationService.documentPositionFromDefinition(definition: vscode.Location | vscode.LocationLink) -> Promise<DocumentPosition | null>',
        probes: ['documentPositionFromDefinition', 'Location', 'Promise']
      }
    ];

    for (const testCase of cases) {
      for (const probe of testCase.probes) {
        const candidates = await service.resolveDocumentationCandidates(
          editor.document,
          positionInSnippet(editor.document, testCase.snippet, probe),
          3
        );

        assert.ok(candidates.length >= 1);
        assert.strictEqual(candidates[0].source, 'direct');
        assert.strictEqual(candidates[0].target.symbol.canonicalSignature, testCase.expected);
        assert.strictEqual(candidates[0].entry?.signature, testCase.expected);
      }
    }
  });

  test('falls back to js/ts usage resolution when definition providers return nothing', async () => {
    class NoDefinitionDocumentationService extends DocumentationService {
      public override async queryOtherDefinitionProviders(): Promise<Array<vscode.Location | vscode.LocationLink>> {
        return [];
      }
    }

    const usageOnlyService = new NoDefinitionDocumentationService(
      new LanguageRegistry([
        new CppLanguageModule(),
        new CSharpLanguageModule(),
        new JsTsLanguageModule(),
        new PythonLanguageModule()
      ]),
      new DocIndex()
    );

    await configureWorkspace({ codeRoot: '.', docsRoot: 'docs/api' });

    const tsEditor = await openEditor('showcase/ts/showcase.ts');
    const tsCandidates = await usageOnlyService.resolveDocumentationCandidates(
      tsEditor.document,
      positionInSnippet(tsEditor.document, 'new ShowcaseVector(-4);', 'ShowcaseVector'),
      3
    );
    assert.strictEqual(tsCandidates.length, 1);
    assert.strictEqual(tsCandidates[0].source, 'usage');
    assert.strictEqual(tsCandidates[0].target.symbol.canonicalSignature, 'ShowcaseVector');
    assert.match(tsCandidates[0].entry?.body ?? '', /Concrete TypeScript showcase class/);

    const jsEditor = await openEditor('showcase/js/showcase.js');
    const jsCandidates = await usageOnlyService.resolveDocumentationCandidates(
      jsEditor.document,
      positionInSnippet(jsEditor.document, 'new ShowcaseCounter();', 'ShowcaseCounter'),
      3
    );
    assert.strictEqual(jsCandidates.length, 1);
    assert.strictEqual(jsCandidates[0].source, 'usage');
    assert.strictEqual(jsCandidates[0].target.symbol.canonicalSignature, 'ShowcaseCounter');
    assert.match(jsCandidates[0].entry?.body ?? '', /Small JavaScript showcase class/);
  });

  test('showcase editor projects expose js/ts definitions when the built-in language service is available', async () => {
    await configureWorkspace({ codeRoot: '.', docsRoot: 'docs/api' });

    const tsEditor = await openEditor('showcase/ts/showcase.ts');
    const tsDefinitions = await definitionsAt(
      tsEditor,
      positionInSnippet(tsEditor.document, 'new ShowcaseVector(-4);', 'ShowcaseVector')
    );
    assert.ok(tsDefinitions.some((definition) => definition.uri.fsPath.endsWith('/showcase/ts/showcase.ts')));

    const jsEditor = await openEditor('showcase/js/showcase.js');
    const jsDefinitions = await definitionsAt(
      jsEditor,
      positionInSnippet(jsEditor.document, 'new ShowcaseCounter();', 'ShowcaseCounter')
    );
    assert.ok(jsDefinitions.some((definition) => definition.uri.fsPath.endsWith('/showcase/js/showcase.js')));
  });
});
