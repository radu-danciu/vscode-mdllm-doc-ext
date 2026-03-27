import * as assert from 'assert';
import * as vscode from 'vscode';
import {
  activateExtension,
  configureWorkspace,
  openEditor,
  positionOf,
  removeRelativePath,
  repoUri,
  renameEditsAt,
  writeRelativeFile
} from '../helpers';

suite('rename provider integration', () => {
  function fixturePaths(tempRoot: string): {
    sourcePath: string;
    primaryDocsPath: string;
    referencesDocsPath: string;
  } {
    return {
      sourcePath: `${tempRoot}/src/renameTarget.ts`,
      primaryDocsPath: `${tempRoot}/docs/api/ts/src/renameTarget_ts.md`,
      referencesDocsPath: `${tempRoot}/docs/api/ts/shared/references.md`
    };
  }

  async function seedWorkspace(tempRoot: string): Promise<void> {
    const { sourcePath, primaryDocsPath, referencesDocsPath } = fixturePaths(tempRoot);
    await writeRelativeFile(
      sourcePath,
      [
        'export class RenameTarget {',
        '  public async provideThing(',
        '    document: string,',
        '    position: number',
        '  ): Promise<number> {',
        '    return position;',
        '  }',
        '}',
        '',
        'export async function useRenameTarget(target: RenameTarget): Promise<number> {',
        '  return target.provideThing("x", 1);',
        '}'
      ].join('\n')
    );
    await writeRelativeFile(
      primaryDocsPath,
      [
        '## src/renameTarget.ts',
        '',
        '### `RenameTarget`',
        '',
        'Brief: Primary rename target type.',
        '',
        'Details:',
        'See `RenameTarget.provideThing` here too.',
        '',
        '---',
        '',
        '### `RenameTarget.provideThing(document: string, position: number) -> Promise<number>`',
        '',
        'Brief: Primary rename target method.',
        '',
        'Details:',
        'See `RenameTarget.provideThing` and `RenameTarget`.',
        '',
        '---'
      ].join('\n')
    );
    await writeRelativeFile(
      referencesDocsPath,
      [
        '## shared/references.ts',
        '',
        '### `ReferenceNotes`',
        '',
        'Brief: External reference holder.',
        '',
        'Details:',
        'Use `RenameTarget` and `RenameTarget.provideThing` during refactors.',
        '',
        '---'
      ].join('\n')
    );
  }

  suiteSetup(async () => {
    await activateExtension();
  });

  test('renames documented methods in source and mirrored markdown docs', async () => {
    const tempRoot = 'test/.tmp/rename-provider-method';
    const { sourcePath, primaryDocsPath, referencesDocsPath } = fixturePaths(tempRoot);
    await removeRelativePath(tempRoot);
    await seedWorkspace(tempRoot);
    await configureWorkspace({
      codeRoot: tempRoot,
      docsRoot: `${tempRoot}/docs/api`
    });

    const editor = await openEditor(sourcePath);
    const edit = await renameEditsAt(
      editor,
      positionOf(editor.document, 'provideThing'),
      'provideMarkdownThing'
    );

    assert.ok(edit);
    assert.ok(edit!.size > 0);
    const applied = await vscode.workspace.applyEdit(edit!);
    assert.strictEqual(applied, true);
    await vscode.workspace.saveAll(false);

    const source = (await vscode.workspace.openTextDocument(repoUri(sourcePath))).getText();
    const primaryDocs = (await vscode.workspace.openTextDocument(repoUri(primaryDocsPath))).getText();
    const referencesDocs = (
      await vscode.workspace.openTextDocument(repoUri(referencesDocsPath))
    ).getText();

    assert.match(source, /provideMarkdownThing/);
    assert.match(
      primaryDocs,
      /### `RenameTarget\.provideMarkdownThing\(document: string, position: number\) -> Promise<number>`/
    );
    assert.match(primaryDocs, /`RenameTarget\.provideMarkdownThing`/);
    assert.match(referencesDocs, /`RenameTarget\.provideMarkdownThing`/);
    assert.doesNotMatch(primaryDocs, /### `RenameTarget`[\s\S]*MarkdownRenameTarget/);

    await removeRelativePath(tempRoot);
  });

  test('renames documented container symbols and repo-wide code references', async () => {
    const tempRoot = 'test/.tmp/rename-provider-container';
    const { sourcePath, primaryDocsPath, referencesDocsPath } = fixturePaths(tempRoot);
    await removeRelativePath(tempRoot);
    await seedWorkspace(tempRoot);
    await configureWorkspace({
      codeRoot: tempRoot,
      docsRoot: `${tempRoot}/docs/api`
    });

    const editor = await openEditor(sourcePath);
    const edit = await renameEditsAt(
      editor,
      positionOf(editor.document, 'RenameTarget'),
      'MarkdownRenameTarget'
    );

    assert.ok(edit);
    assert.ok(edit!.size > 0);
    const applied = await vscode.workspace.applyEdit(edit!);
    assert.strictEqual(applied, true);
    await vscode.workspace.saveAll(false);

    const source = (await vscode.workspace.openTextDocument(repoUri(sourcePath))).getText();
    const primaryDocs = (await vscode.workspace.openTextDocument(repoUri(primaryDocsPath))).getText();
    const referencesDocs = (
      await vscode.workspace.openTextDocument(repoUri(referencesDocsPath))
    ).getText();

    assert.match(source, /class MarkdownRenameTarget/);
    assert.match(primaryDocs, /### `MarkdownRenameTarget`/);
    assert.match(
      primaryDocs,
      /### `MarkdownRenameTarget\.provideThing\(document: string, position: number\) -> Promise<number>`/
    );
    assert.match(referencesDocs, /`MarkdownRenameTarget` and `MarkdownRenameTarget\.provideThing`/);
    assert.doesNotMatch(referencesDocs, /Use MarkdownRenameTarget and RenameTarget\.provideThing/);

    await removeRelativePath(tempRoot);
  });
});
