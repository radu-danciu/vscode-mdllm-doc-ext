import * as assert from 'assert';
import * as vscode from 'vscode';
import { CppLanguageModule } from '../../src/languages/cpp/module';
import { configureWorkspace, getWorkspaceFolder, openEditor, positionOf } from '../helpers';

suite('cpp language module', () => {
  const module = new CppLanguageModule();

  test('resolves C++ functions, methods, and types', async () => {
    await configureWorkspace({
      codeRoot: 'test/fixtures/cppWorkspace',
      docsRoot: 'test/fixtures/cppWorkspace/docs/api'
    });

    const editor = await openEditor('test/fixtures/cppWorkspace/include/math/vector.h');
    const workspaceFolder = getWorkspaceFolder();

    const typeSymbol = await module.resolveSymbol({
      document: editor.document,
      position: positionOf(editor.document, 'Vector'),
      workspaceFolder,
      config: {
        codeRoot: 'test/fixtures/cppWorkspace',
        docsRoot: 'test/fixtures/cppWorkspace/docs/api',
        openMode: 'split',
        languageBuckets: {
          cpp: 'cpp',
          csharp: 'csharp',
          typescript: 'ts',
          javascript: 'js',
          python: 'python'
        }
      }
    });
    assert.strictEqual(typeSymbol?.canonicalSignature, 'math::Vector');
    assert.deepStrictEqual(typeSymbol?.inheritanceChain, ['MagnitudeBase<T>']);

    const methodSymbol = await module.resolveSymbol({
      document: editor.document,
      position: positionOf(editor.document, 'length'),
      workspaceFolder,
      config: {
        codeRoot: 'test/fixtures/cppWorkspace',
        docsRoot: 'test/fixtures/cppWorkspace/docs/api',
        openMode: 'split',
        languageBuckets: {
          cpp: 'cpp',
          csharp: 'csharp',
          typescript: 'ts',
          javascript: 'js',
          python: 'python'
        }
      }
    });
    assert.strictEqual(methodSymbol?.canonicalSignature, 'float math::Vector::length() const');
  });

  test('creates type stubs with inheritance and template arguments', () => {
    const stub = module.createStub({
      kind: 'type',
      displayName: 'StringBox',
      canonicalSignature: 'StringBox',
      sourceFile: vscode.Uri.file('/tmp/StringBox.hpp'),
      sourceRelativePath: 'StringBox.hpp',
      symbolRange: new vscode.Range(0, 0, 0, 0),
      inheritanceChain: ['Box<int>'],
      frozenTypeArguments: [{ name: 'T1', value: 'int' }]
    });

    assert.match(stub, /Inheritance:/);
    assert.match(stub, /Template Arguments:/);
  });
});
