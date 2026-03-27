import * as assert from 'assert';
import * as vscode from 'vscode';
import { JsTsLanguageModule } from '../../src/languages/jsTs/module';
import { getWorkspaceFolder, openEditor, positionInSnippet, positionOf } from '../helpers';

suite('js/ts language module', () => {
  const module = new JsTsLanguageModule();

  test('resolves TypeScript functions, methods, and classes', async () => {
    const editor = await openEditor('test/fixtures/tsWorkspace/web/utils/math.ts');
    const workspaceFolder = getWorkspaceFolder();
    const config = {
      codeRoot: 'test/fixtures/tsWorkspace',
      docsRoot: 'test/fixtures/tsWorkspace/docs/api',
      openMode: 'split' as const,
      languageBuckets: {
        cpp: 'cpp',
        csharp: 'csharp',
        typescript: 'ts',
        javascript: 'js',
        python: 'python'
      }
    };

    const classSymbol = await module.resolveSymbol({
      document: editor.document,
      position: positionOf(editor.document, 'Vector', 2),
      workspaceFolder,
      config
    });
    assert.strictEqual(classSymbol?.canonicalSignature, 'Vector');
    assert.deepStrictEqual(classSymbol?.inheritanceChain, ['BaseVector']);

    const methodSymbol = await module.resolveSymbol({
      document: editor.document,
      position: positionOf(editor.document, 'length'),
      workspaceFolder,
      config
    });
    assert.strictEqual(methodSymbol?.canonicalSignature, 'Vector.length() -> number');

    const functionSymbol = await module.resolveSymbol({
      document: editor.document,
      position: positionOf(editor.document, 'normalize'),
      workspaceFolder,
      config
    });
    assert.strictEqual(functionSymbol?.canonicalSignature, 'normalize(value: number) -> number');
  });

  test('resolves JavaScript object-like containers', async () => {
    const editor = await openEditor('test/fixtures/jsWorkspace/web/utils/math.js');
    const workspaceFolder = getWorkspaceFolder();
    const config = {
      codeRoot: 'test/fixtures/jsWorkspace',
      docsRoot: 'test/fixtures/jsWorkspace/docs/api',
      openMode: 'split' as const,
      languageBuckets: {
        cpp: 'cpp',
        csharp: 'csharp',
        typescript: 'ts',
        javascript: 'js',
        python: 'python'
      }
    };

    const objectSymbol = await module.resolveSymbol({
      document: editor.document,
      position: positionOf(editor.document, 'MathUtils'),
      workspaceFolder,
      config
    });
    assert.strictEqual(objectSymbol?.canonicalSignature, 'MathUtils');

    const methodSymbol = await module.resolveSymbol({
      document: editor.document,
      position: positionOf(editor.document, 'normalize'),
      workspaceFolder,
      config
    });
    assert.strictEqual(methodSymbol?.canonicalSignature, 'MathUtils.normalize(value)');
  });

  test('resolves TypeScript interfaces, type aliases, and interface methods', async () => {
    const editor = await openEditor('src/core/types.ts');
    const workspaceFolder = getWorkspaceFolder();
    const config = {
      codeRoot: '.',
      docsRoot: 'docs/api',
      openMode: 'split' as const,
      languageBuckets: {
        cpp: 'cpp',
        csharp: 'csharp',
        typescript: 'ts',
        javascript: 'js',
        python: 'python'
      }
    };

    const typeAliasSymbol = await module.resolveSymbol({
      document: editor.document,
      position: positionOf(editor.document, 'SymbolKind'),
      workspaceFolder,
      config
    });
    assert.strictEqual(typeAliasSymbol?.canonicalSignature, 'SymbolKind');

    const interfaceSymbol = await module.resolveSymbol({
      document: editor.document,
      position: positionOf(editor.document, 'LanguageModule'),
      workspaceFolder,
      config
    });
    assert.strictEqual(interfaceSymbol?.canonicalSignature, 'LanguageModule');

    const interfaceMethodSymbol = await module.resolveSymbol({
      document: editor.document,
      position: positionOf(editor.document, 'matchesEntry'),
      workspaceFolder,
      config
    });
    assert.strictEqual(
      interfaceMethodSymbol?.canonicalSignature,
      'LanguageModule.matchesEntry(symbol: ResolvedSymbol, entry: DocEntry) -> boolean'
    );
  });

  test('creates method stubs with params and returns', () => {
    const stub = module.createStub({
      kind: 'method',
      displayName: 'render',
      canonicalSignature: 'ShowcaseVector.render(title: string) -> string',
      sourceFile: vscode.Uri.file('/tmp/showcase.ts'),
      sourceRelativePath: 'showcase.ts',
      symbolRange: new vscode.Range(0, 0, 0, 0),
      params: [{ name: 'title', type: 'string' }],
      returnType: 'string'
    });

    assert.match(stub, /Params:/);
    assert.match(stub, /Returns:/);
  });

  test('resolves multiline declaration positions to the same method signature', async () => {
    const editor = await openEditor('src/core/definitionProvider.ts');
    const workspaceFolder = getWorkspaceFolder();
    const config = {
      codeRoot: '.',
      docsRoot: 'docs/api',
      openMode: 'split' as const,
      languageBuckets: {
        cpp: 'cpp',
        csharp: 'csharp',
        typescript: 'ts',
        javascript: 'js',
        python: 'python'
      }
    };

    const positions = [
      positionOf(editor.document, 'provideDefinition'),
      positionOf(editor.document, 'TextDocument'),
      positionOf(editor.document, 'Promise')
    ];

    for (const position of positions) {
      const symbol = await module.resolveSymbol({
        document: editor.document,
        position,
        workspaceFolder,
        config
      });
      assert.strictEqual(
        symbol?.canonicalSignature,
        'ExternalDocsDefinitionProvider.provideDefinition(document: vscode.TextDocument, position: vscode.Position) -> Promise<vscode.Definition | null>'
      );
    }
  });

  test('resolves private multiline methods with function-type params and complex return types', async () => {
    const editor = await openEditor('src/core/documentationService.ts');
    const workspaceFolder = getWorkspaceFolder();
    const config = {
      codeRoot: '.',
      docsRoot: 'docs/api',
      openMode: 'split' as const,
      languageBuckets: {
        cpp: 'cpp',
        csharp: 'csharp',
        typescript: 'ts',
        javascript: 'js',
        python: 'python'
      }
    };

    const cases = [
      {
        snippet: 'public async withSuppressedHover<T>(',
        probes: ['withSuppressedHover', 'callback', 'Promise'],
        expected:
          'DocumentationService.withSuppressedHover<T>(callback: () => Promise<T>) -> Promise<T>'
      },
      {
        snippet: 'private async getDocumentPositionFromTarget(',
        probes: ['getDocumentPositionFromTarget', 'CommandTarget', 'Promise'],
        expected:
          'DocumentationService.getDocumentPositionFromTarget(target?: CommandTarget) -> Promise<DocumentPosition | null>'
      },
      {
        snippet: 'private async resolveCandidatesFromDefinitions(',
        probes: ['resolveCandidatesFromDefinitions', 'TextDocument', 'Promise'],
        expected:
          'DocumentationService.resolveCandidatesFromDefinitions(document: vscode.TextDocument, position: vscode.Position, maxCandidates: number) -> Promise<ResolvedDocumentationCandidate[]>'
      }
    ];

    for (const testCase of cases) {
      for (const probe of testCase.probes) {
        const symbol = await module.resolveSymbol({
          document: editor.document,
          position: positionInSnippet(editor.document, testCase.snippet, probe),
          workspaceFolder,
          config
        });
        assert.strictEqual(symbol?.canonicalSignature, testCase.expected);
      }
    }
  });

  test('resolves constructor usage sites in the same file', async () => {
    const workspaceFolder = getWorkspaceFolder();
    const tsConfig = {
      codeRoot: '.',
      docsRoot: 'docs/api',
      openMode: 'split' as const,
      languageBuckets: {
        cpp: 'cpp',
        csharp: 'csharp',
        typescript: 'ts',
        javascript: 'js',
        python: 'python'
      }
    };

    const tsEditor = await openEditor('showcase/ts/showcase.ts');
    const tsUsage = await module.resolveUsageSymbol?.({
      document: tsEditor.document,
      position: positionInSnippet(tsEditor.document, 'new ShowcaseVector(-4);', 'ShowcaseVector'),
      workspaceFolder,
      config: tsConfig
    });
    assert.strictEqual(tsUsage?.canonicalSignature, 'ShowcaseVector');

    const jsEditor = await openEditor('showcase/js/showcase.js');
    const jsConfig = {
      ...tsConfig,
      languageBuckets: {
        ...tsConfig.languageBuckets
      }
    };
    const jsUsage = await module.resolveUsageSymbol?.({
      document: jsEditor.document,
      position: positionInSnippet(jsEditor.document, 'new ShowcaseCounter();', 'ShowcaseCounter'),
      workspaceFolder,
      config: jsConfig
    });
    assert.strictEqual(jsUsage?.canonicalSignature, 'ShowcaseCounter');
  });
});
