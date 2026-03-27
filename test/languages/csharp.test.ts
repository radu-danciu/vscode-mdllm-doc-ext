import * as assert from 'assert';
import * as vscode from 'vscode';
import { CSharpLanguageModule } from '../../src/languages/csharp/module';
import { getWorkspaceFolder, openEditor, positionOf, removeRelativePath, writeRelativeFile } from '../helpers';

suite('csharp language module', () => {
  const module = new CSharpLanguageModule();
  const config = {
    codeRoot: 'test/fixtures/csharpWorkspace',
    docsRoot: 'test/fixtures/csharpWorkspace/docs/api',
    openMode: 'split' as const,
    languageBuckets: {
      cpp: 'cpp',
      csharp: 'csharp',
      typescript: 'ts',
      javascript: 'js',
      python: 'python'
    }
  };

  test('resolves C# types and methods', async () => {
    const editor = await openEditor('test/fixtures/csharpWorkspace/src/Foo/Bar.cs');
    const workspaceFolder = getWorkspaceFolder();

    const typeSymbol = await module.resolveSymbol({
      document: editor.document,
      position: positionOf(editor.document, 'UserService'),
      workspaceFolder,
      config
    });
    assert.strictEqual(typeSymbol?.canonicalSignature, 'Project.Services.UserService');
    assert.deepStrictEqual(typeSymbol?.inheritanceChain, ['BaseService', 'IDisposable']);

    const methodSymbol = await module.resolveSymbol({
      document: editor.document,
      position: positionOf(editor.document, 'GetNameAsync'),
      workspaceFolder,
      config
    });
    assert.strictEqual(
      methodSymbol?.canonicalSignature,
      'Task<string> Project.Services.UserService.GetNameAsync(Guid id)'
    );
  });

  test('creates type stubs with inheritance and template arguments', () => {
    const stub = module.createStub({
      kind: 'type',
      displayName: 'StringBox',
      canonicalSignature: 'StringBox',
      sourceFile: vscode.Uri.file('/tmp/StringBox.cs'),
      sourceRelativePath: 'StringBox.cs',
      symbolRange: new vscode.Range(0, 0, 0, 0),
      inheritanceChain: ['Box<string>', 'IDisposable'],
      frozenTypeArguments: [{ name: 'T1', value: 'string' }]
    });

    assert.match(stub, /Box<string>/);
    assert.match(stub, /T1 = string/);
  });

  teardown(async () => {
    await removeRelativePath('test/.tmp/csharp-language');
  });

  test('resolves multiline method declaration positions to the same signature', async () => {
    const relativePath = 'test/.tmp/csharp-language/src/Foo/Multiline.cs';
    await writeRelativeFile(
      relativePath,
      [
        'namespace Project.Services {',
        '  public class UserService {',
        '    public async Task<string> GetNameAsync(',
        '      Guid id,',
        '      CancellationToken token',
        '    ) {',
        '      return id.ToString();',
        '    }',
        '  }',
        '}'
      ].join('\n')
    );

    const editor = await openEditor(relativePath);
    const workspaceFolder = getWorkspaceFolder();
    const tempConfig = {
      ...config,
      codeRoot: 'test/.tmp/csharp-language',
      docsRoot: 'test/.tmp/csharp-language/docs/api'
    };

    const positions = [
      positionOf(editor.document, 'GetNameAsync'),
      positionOf(editor.document, 'Guid'),
      positionOf(editor.document, 'Task')
    ];

    for (const position of positions) {
      const symbol = await module.resolveSymbol({
        document: editor.document,
        position,
        workspaceFolder,
        config: tempConfig
      });
      assert.strictEqual(
        symbol?.canonicalSignature,
        'Task<string> Project.Services.UserService.GetNameAsync(Guid id, CancellationToken token)'
      );
    }
  });
});
