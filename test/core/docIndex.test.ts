import * as assert from 'assert';
import * as vscode from 'vscode';
import { DocIndex } from '../../src/core/docIndex';
import { JsTsLanguageModule } from '../../src/languages/jsTs/module';
import { readRelativeFile, repoUri, writeRelativeFile } from '../helpers';

suite('docIndex', () => {
  const tempRelativePath = 'test/.tmp/doc-index/docs/api/ts/example_ts.md';
  const docsUri = repoUri(tempRelativePath);

  teardown(async () => {
    await vscode.workspace.fs.delete(repoUri('test/.tmp/doc-index'), { recursive: true, useTrash: false });
  });

  test('caches parsed docs and refreshes after invalidation', async () => {
    const index = new DocIndex();
    const module = new JsTsLanguageModule();
    await writeRelativeFile(
      tempRelativePath,
      '# example.ts\n\n## example(value: number) -> number\n\nBrief: One\n'
    );

    const symbol = {
      kind: 'function' as const,
      displayName: 'example',
      canonicalSignature: 'example(value: number) -> number',
      sourceFile: docsUri,
      sourceRelativePath: 'example.ts',
      symbolRange: new vscode.Range(0, 0, 0, 0)
    };

    const first = await index.findEntry(docsUri, symbol, module);
    assert.ok(first);
    assert.match(first?.body ?? '', /One/);

    await writeRelativeFile(
      tempRelativePath,
      '# example.ts\n\n## example(value: number) -> number\n\nBrief: Two\n'
    );

    const cached = await index.findEntry(docsUri, symbol, module);
    assert.match(cached?.body ?? '', /One/);

    index.invalidate(docsUri);
    const refreshed = await index.findEntry(docsUri, symbol, module);
    assert.match(refreshed?.body ?? '', /Two/);
    assert.match(await readRelativeFile(tempRelativePath), /Two/);
  });
});
