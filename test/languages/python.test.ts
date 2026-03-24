import * as assert from 'assert';
import * as vscode from 'vscode';
import { PythonLanguageModule } from '../../src/languages/python/module';
import { getWorkspaceFolder, openEditor, positionOf } from '../helpers';

suite('python language module', () => {
  const module = new PythonLanguageModule();
  const config = {
    codeRoot: 'test/fixtures/pythonWorkspace',
    docsRoot: 'test/fixtures/pythonWorkspace/docs/api',
    openMode: 'split' as const,
    languageBuckets: {
      cpp: 'cpp',
      csharp: 'csharp',
      typescript: 'ts',
      javascript: 'js',
      python: 'python'
    }
  };

  test('resolves Python classes and functions', async () => {
    const editor = await openEditor('test/fixtures/pythonWorkspace/pkg/math/vector.py');
    const workspaceFolder = getWorkspaceFolder();

    const typeSymbol = await module.resolveSymbol({
      document: editor.document,
      position: positionOf(editor.document, 'Vector'),
      workspaceFolder,
      config
    });
    assert.strictEqual(typeSymbol?.canonicalSignature, 'pkg.math.vector.Vector');
    assert.deepStrictEqual(typeSymbol?.inheritanceChain, ['BaseVector']);

    const methodSymbol = await module.resolveSymbol({
      document: editor.document,
      position: positionOf(editor.document, 'length'),
      workspaceFolder,
      config
    });
    assert.strictEqual(methodSymbol?.canonicalSignature, 'pkg.math.vector.Vector.length(self) -> float');

    const functionSymbol = await module.resolveSymbol({
      document: editor.document,
      position: positionOf(editor.document, 'normalize'),
      workspaceFolder,
      config
    });
    assert.strictEqual(
      functionSymbol?.canonicalSignature,
      'pkg.math.vector.normalize(value: float) -> float'
    );
  });

  test('creates type stubs with inheritance and template arguments', () => {
    const stub = module.createStub({
      kind: 'type',
      displayName: 'FancyVector',
      canonicalSignature: 'pkg.math.FancyVector',
      sourceFile: vscode.Uri.file('/tmp/vector.py'),
      sourceRelativePath: 'vector.py',
      symbolRange: new vscode.Range(0, 0, 0, 0),
      inheritanceChain: ['BaseVector[int]'],
      frozenTypeArguments: [{ name: 'T1', value: 'int' }]
    });

    assert.match(stub, /BaseVector\[int\]/);
    assert.match(stub, /T1 = int/);
  });
});
