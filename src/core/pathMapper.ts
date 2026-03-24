import * as path from 'path';
import * as vscode from 'vscode';
import { ExternalDocsConfig } from './types';
import { normalizePosix, replaceFinalDot } from './utils';

export interface PathMappingResult {
  sourceRelativePath: string;
  docsUri: vscode.Uri;
}

export function mapSourceToDocs(
  workspaceFolder: vscode.WorkspaceFolder,
  sourceUri: vscode.Uri,
  config: ExternalDocsConfig,
  langBucket: string
): PathMappingResult | null {
  const workspaceRoot = workspaceFolder.uri.fsPath;
  const codeRoot = path.resolve(workspaceRoot, config.codeRoot);
  const sourcePath = sourceUri.fsPath;
  const relativePath = path.relative(codeRoot, sourcePath);

  if (!relativePath || relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    return null;
  }

  const posixRelativePath = normalizePosix(relativePath);
  const parsed = path.posix.parse(posixRelativePath);
  const fileName = `${replaceFinalDot(parsed.base)}.md`;
  const docsRelativePath = path.posix.join(config.docsRoot, langBucket, parsed.dir, fileName);

  return {
    sourceRelativePath: posixRelativePath,
    docsUri: vscode.Uri.file(path.join(workspaceRoot, ...docsRelativePath.split('/')))
  };
}
