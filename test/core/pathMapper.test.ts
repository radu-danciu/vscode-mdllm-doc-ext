import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';
import { mapSourceToDocs } from '../../src/core/pathMapper';
import { ExternalDocsConfig } from '../../src/core/types';
import { normalizePosix, replaceFinalDot } from '../../src/core/utils';

suite('pathMapper', () => {
  const workspaceFolder: vscode.WorkspaceFolder = {
    uri: vscode.Uri.file('/tmp/workspace'),
    index: 0,
    name: 'workspace'
  };

  const config: ExternalDocsConfig = {
    codeRoot: '.',
    docsRoot: 'docs/api',
    openMode: 'split',
    languageBuckets: {
      cpp: 'cpp',
      csharp: 'csharp',
      typescript: 'ts',
      javascript: 'js',
      python: 'python'
    }
  };

  test('maps a workspace-root source file to mirrored docs path', () => {
    const mapping = mapSourceToDocs(
      workspaceFolder,
      vscode.Uri.file('/tmp/workspace/src/core/config.ts'),
      config,
      'ts'
    );

    assert.ok(mapping);
    assert.strictEqual(mapping?.sourceRelativePath, 'src/core/config.ts');
    assert.strictEqual(
      normalizePosix(path.relative('/tmp/workspace', mapping!.docsUri.fsPath)),
      'docs/api/ts/src/core/config_ts.md'
    );
  });

  test('respects custom codeRoot and docsRoot', () => {
    const mapping = mapSourceToDocs(
      workspaceFolder,
      vscode.Uri.file('/tmp/workspace/libs/math/vector.cpp'),
      { ...config, codeRoot: 'libs', docsRoot: 'reference/docs' },
      'cpp'
    );

    assert.ok(mapping);
    assert.strictEqual(mapping?.sourceRelativePath, 'math/vector.cpp');
    assert.strictEqual(
      normalizePosix(path.relative('/tmp/workspace', mapping!.docsUri.fsPath)),
      'reference/docs/cpp/math/vector_cpp.md'
    );
  });

  test('normalizes separators and replaces the final dot in filenames', () => {
    assert.strictEqual(normalizePosix('src\\math\\vector.cpp'), 'src/math/vector.cpp');
    assert.strictEqual(replaceFinalDot('vector.cpp'), 'vector_cpp');
    assert.strictEqual(replaceFinalDot('Bar.cs'), 'Bar_cs');
  });
});
