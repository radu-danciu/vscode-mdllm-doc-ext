import * as assert from 'assert';
import * as vscode from 'vscode';
import { CSharpLanguageModule } from '../../src/languages/csharp/module';
import { getWorkspaceFolder, openEditor, positionOf } from '../helpers';

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
});
