import * as assert from 'assert';
import * as vscode from 'vscode';
import { activateExtension, configureWorkspace, openEditor, positionOf, readRelativeFile, removeRelativePath, writeRelativeFile } from '../helpers';

suite('create documentation integration', () => {
  suiteSetup(async () => {
    await activateExtension();
  });

  teardown(async () => {
    await removeRelativePath('test/.tmp/create-docs');
  });

  test('creates stubs for undocumented symbols across supported language modules', async () => {
    const cases = [
      {
        codeRoot: 'test/.tmp/create-docs/cppWorkspace',
        docsRoot: 'test/.tmp/create-docs/cppWorkspace/docs/api',
        sourceRelativePath: 'test/.tmp/create-docs/cppWorkspace/include/math/vector.h',
        symbol: 'undocumented',
        expectedDoc: 'test/.tmp/create-docs/cppWorkspace/docs/api/cpp/include/math/vector_h.md',
        expectedSignature: 'float math::undocumented(float value)'
      },
      {
        codeRoot: 'test/.tmp/create-docs/csharpWorkspace',
        docsRoot: 'test/.tmp/create-docs/csharpWorkspace/docs/api',
        sourceRelativePath: 'test/.tmp/create-docs/csharpWorkspace/src/Foo/Bar.cs',
        symbol: 'Undocumented',
        expectedDoc: 'test/.tmp/create-docs/csharpWorkspace/docs/api/csharp/src/Foo/Bar_cs.md',
        expectedSignature: 'string Project.Services.UserService.Undocumented(Guid id)'
      },
      {
        codeRoot: 'test/.tmp/create-docs/tsWorkspace',
        docsRoot: 'test/.tmp/create-docs/tsWorkspace/docs/api',
        sourceRelativePath: 'test/.tmp/create-docs/tsWorkspace/web/utils/math.ts',
        symbol: 'undocumented',
        expectedDoc: 'test/.tmp/create-docs/tsWorkspace/docs/api/ts/web/utils/math_ts.md',
        expectedSignature: 'undocumented(value: number) -> number'
      },
      {
        codeRoot: 'test/.tmp/create-docs/pythonWorkspace',
        docsRoot: 'test/.tmp/create-docs/pythonWorkspace/docs/api',
        sourceRelativePath: 'test/.tmp/create-docs/pythonWorkspace/pkg/math/vector.py',
        symbol: 'undocumented',
        expectedDoc: 'test/.tmp/create-docs/pythonWorkspace/docs/api/python/pkg/math/vector_py.md',
        expectedSignature: 'pkg.math.vector.undocumented(value: float) -> float'
      }
    ];

    await writeRelativeFile(
      'test/.tmp/create-docs/cppWorkspace/include/math/vector.h',
      'namespace math {\nfloat undocumented(float value);\n}\n'
    );
    await writeRelativeFile(
      'test/.tmp/create-docs/csharpWorkspace/src/Foo/Bar.cs',
      'namespace Project.Services {\npublic class UserService {\n    public string Undocumented(Guid id) {\n        return id.ToString();\n    }\n}\n}\n'
    );
    await writeRelativeFile(
      'test/.tmp/create-docs/tsWorkspace/web/utils/math.ts',
      'export function undocumented(value: number): number {\n  return value * 2;\n}\n'
    );
    await writeRelativeFile(
      'test/.tmp/create-docs/pythonWorkspace/pkg/math/vector.py',
      'def undocumented(value: float) -> float:\n    return value * 2\n'
    );

    for (const testCase of cases) {
      await configureWorkspace({
        codeRoot: testCase.codeRoot,
        docsRoot: testCase.docsRoot
      });
      const editor = await openEditor(testCase.sourceRelativePath);
      editor.selection = new vscode.Selection(
        positionOf(editor.document, testCase.symbol),
        positionOf(editor.document, testCase.symbol)
      );
      await vscode.commands.executeCommand('externalDocs.createSymbolDocumentation');
      const created = await readRelativeFile(testCase.expectedDoc);
      assert.match(
        created,
        new RegExp(
          `### \`${testCase.expectedSignature.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\``
        )
      );
      assert.match(created, /Brief: TODO/);
    }
  });

  test('pre-populates type stubs with inheritance when recoverable', async () => {
    await writeRelativeFile(
      'test/.tmp/create-docs/typeWorkspace/web/models/fancy.ts',
      'export class BaseVector {}\nexport class FancyVector extends BaseVector {}\n'
    );

    await configureWorkspace({
      codeRoot: 'test/.tmp/create-docs/typeWorkspace',
      docsRoot: 'test/.tmp/create-docs/typeWorkspace/docs/api'
    });
    const editor = await openEditor('test/.tmp/create-docs/typeWorkspace/web/models/fancy.ts');
    await vscode.commands.executeCommand('externalDocs.createSymbolDocumentation', {
      uri: editor.document.uri.toString(),
      position: positionOf(editor.document, 'FancyVector')
    });

    const created = await readRelativeFile(
      'test/.tmp/create-docs/typeWorkspace/docs/api/ts/web/models/fancy_ts.md'
    );
    assert.match(created, /### `FancyVector`/);
    assert.match(created, /Inheritance:\n\n- `BaseVector`/);
  });
});
