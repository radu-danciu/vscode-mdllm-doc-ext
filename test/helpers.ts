import * as assert from 'assert';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as vscode from 'vscode';

export interface FixtureConfig {
  codeRoot: string;
  docsRoot: string;
  openMode?: 'split' | 'main';
}

interface StoredWorkspaceConfig {
  codeRoot?: string;
  docsRoot?: string;
  openMode?: 'split' | 'main';
}

let originalWorkspaceConfig: StoredWorkspaceConfig | null = null;

export function getWorkspaceFolder(): vscode.WorkspaceFolder {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  assert.ok(workspaceFolder, 'Expected the repository root to be opened as the test workspace.');
  return workspaceFolder;
}

export function repoRoot(): string {
  return getWorkspaceFolder().uri.fsPath;
}

export function repoUri(relativePath: string): vscode.Uri {
  return vscode.Uri.file(path.join(repoRoot(), ...relativePath.split('/')));
}

export async function openEditor(relativePath: string): Promise<vscode.TextEditor> {
  const document = await vscode.workspace.openTextDocument(repoUri(relativePath));
  return vscode.window.showTextDocument(document, { preview: false });
}

export async function activateExtension(): Promise<void> {
  const extension = vscode.extensions.all.find(
    (candidate) => candidate.packageJSON?.name === 'vscode-mdllm-doc-ext'
  );
  assert.ok(extension, 'Expected the extension under test to be available.');
  await extension.activate();
}

export async function captureWorkspaceConfiguration(): Promise<void> {
  if (originalWorkspaceConfig) {
    return;
  }

  const workspaceConfig = vscode.workspace.getConfiguration('externalDocs');
  originalWorkspaceConfig = {
    codeRoot: workspaceConfig.inspect<string>('codeRoot')?.workspaceValue,
    docsRoot: workspaceConfig.inspect<string>('docsRoot')?.workspaceValue,
    openMode: workspaceConfig.inspect<'split' | 'main'>('openMode')?.workspaceValue
  };
}

export async function configureWorkspace(config: FixtureConfig): Promise<void> {
  await captureWorkspaceConfiguration();
  const workspaceConfig = vscode.workspace.getConfiguration('externalDocs');
  await workspaceConfig.update('codeRoot', config.codeRoot, vscode.ConfigurationTarget.Workspace);
  await workspaceConfig.update('docsRoot', config.docsRoot, vscode.ConfigurationTarget.Workspace);
  await workspaceConfig.update(
    'openMode',
    config.openMode ?? 'split',
    vscode.ConfigurationTarget.Workspace
  );
}

export async function restoreWorkspaceConfiguration(): Promise<void> {
  if (!originalWorkspaceConfig) {
    await captureWorkspaceConfiguration();
  }

  const workspaceConfig = vscode.workspace.getConfiguration('externalDocs');
  await workspaceConfig.update(
    'codeRoot',
    originalWorkspaceConfig?.codeRoot,
    vscode.ConfigurationTarget.Workspace
  );
  await workspaceConfig.update(
    'docsRoot',
    originalWorkspaceConfig?.docsRoot,
    vscode.ConfigurationTarget.Workspace
  );
  await workspaceConfig.update(
    'openMode',
    originalWorkspaceConfig?.openMode,
    vscode.ConfigurationTarget.Workspace
  );
}

export function positionOf(document: vscode.TextDocument, token: string, occurrence = 1): vscode.Position {
  let fromIndex = 0;
  for (let index = 0; index < occurrence; index += 1) {
    const found = document.getText().indexOf(token, fromIndex);
    assert.notStrictEqual(found, -1, `Token "${token}" not found.`);
    if (index === occurrence - 1) {
      return document.positionAt(found);
    }
    fromIndex = found + token.length;
  }

  return new vscode.Position(0, 0);
}

export function positionInSnippet(
  document: vscode.TextDocument,
  snippet: string,
  token: string,
  occurrence = 1
): vscode.Position {
  const snippetOffset = document.getText().indexOf(snippet);
  assert.notStrictEqual(snippetOffset, -1, `Snippet not found: ${snippet}`);

  let fromIndex = snippetOffset;
  for (let index = 0; index < occurrence; index += 1) {
    const found = document.getText().indexOf(token, fromIndex);
    assert.notStrictEqual(
      found,
      -1,
      `Token "${token}" not found inside snippet "${snippet}".`
    );
    if (index === occurrence - 1) {
      return document.positionAt(found);
    }
    fromIndex = found + token.length;
  }

  return new vscode.Position(0, 0);
}

export async function hoverText(
  editor: vscode.TextEditor,
  position: vscode.Position
): Promise<string> {
  const hovers =
    (await vscode.commands.executeCommand<vscode.Hover[]>(
      'vscode.executeHoverProvider',
      editor.document.uri,
      position
    )) ?? [];

  return hovers
    .flatMap((hover) => hover.contents)
    .map((content) => {
      if (content instanceof vscode.MarkdownString) {
        return content.value;
      }
      if (typeof content === 'string') {
        return content;
      }
      return 'value' in content ? String(content.value) : '';
    })
    .join('\n');
}

export async function definitionsAt(
  editor: vscode.TextEditor,
  position: vscode.Position
): Promise<vscode.Location[]> {
  const definitions =
    (await vscode.commands.executeCommand<Array<vscode.Location | vscode.LocationLink>>(
      'vscode.executeDefinitionProvider',
      editor.document.uri,
      position
    )) ?? [];

  return definitions.map((definition) =>
    'targetUri' in definition
      ? new vscode.Location(definition.targetUri, definition.targetSelectionRange ?? definition.targetRange)
      : definition
  );
}

export async function renameEditsAt(
  editor: vscode.TextEditor,
  position: vscode.Position,
  newName: string
): Promise<vscode.WorkspaceEdit | null> {
  return (
    (await vscode.commands.executeCommand<vscode.WorkspaceEdit | null>(
      'vscode.executeDocumentRenameProvider',
      editor.document.uri,
      position,
      newName
    )) ?? null
  );
}

export async function removeRelativePath(relativePath: string): Promise<void> {
  await fs.rm(path.join(repoRoot(), relativePath), { force: true, recursive: true });
}

export async function writeRelativeFile(relativePath: string, content: string): Promise<void> {
  const filePath = path.join(repoRoot(), relativePath);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, 'utf8');
}

export async function readRelativeFile(relativePath: string): Promise<string> {
  return fs.readFile(path.join(repoRoot(), relativePath), 'utf8');
}

export function relativeFsPath(uri: vscode.Uri): string {
  return path.relative(repoRoot(), uri.fsPath).replace(/\\/g, '/');
}
