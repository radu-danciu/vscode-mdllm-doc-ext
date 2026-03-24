import * as path from 'path';
import * as vscode from 'vscode';
import { CommandTarget, ExternalDocsConfig, OpenMode } from './types';

export function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export function normalizePosix(value: string): string {
  return value.replace(/\\/g, '/');
}

export function replaceFinalDot(value: string): string {
  const lastDot = value.lastIndexOf('.');
  if (lastDot === -1) {
    return value;
  }

  return `${value.slice(0, lastDot)}_${value.slice(lastDot + 1)}`;
}

export function encodeCommandUri(command: string, target: CommandTarget): vscode.Uri {
  return vscode.Uri.parse(
    `command:${command}?${encodeURIComponent(JSON.stringify([target]))}`
  );
}

export function firstLine(value: string): string {
  return value.split(/\r?\n/, 1)[0] ?? '';
}

export function truncateMarkdown(value: string, maxLines = 8): string {
  const lines = value
    .trim()
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+$/g, ''));
  return lines.slice(0, maxLines).join('\n').trimEnd();
}

export function viewColumnForMode(mode: OpenMode): vscode.ViewColumn | undefined {
  if (mode === 'main') {
    return vscode.window.activeTextEditor?.viewColumn;
  }

  return vscode.ViewColumn.Beside;
}

export function positionAtStartOfRange(range: vscode.Range): vscode.Selection {
  return new vscode.Selection(range.start, range.start);
}

export function joinWorkspacePath(basePath: string, relativePath: string): string {
  return path.join(basePath, ...normalizePosix(relativePath).split('/'));
}

export function sourceRelativePathForDocument(
  workspaceFolder: vscode.WorkspaceFolder,
  document: vscode.TextDocument,
  config: ExternalDocsConfig
): string {
  const basePath = path.resolve(workspaceFolder.uri.fsPath, config.codeRoot);
  return normalizePosix(path.relative(basePath, document.uri.fsPath));
}
