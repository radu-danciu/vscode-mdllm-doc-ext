import * as vscode from 'vscode';
import { ExternalDocsConfig, OpenMode } from './types';

const SECTION = 'externalDocs';

export function getConfig(workspaceFolder: vscode.WorkspaceFolder): ExternalDocsConfig {
  const config = vscode.workspace.getConfiguration(SECTION, workspaceFolder.uri);

  return {
    codeRoot: config.get<string>('codeRoot', '.'),
    docsRoot: config.get<string>('docsRoot', 'docs/api'),
    openMode: config.get<OpenMode>('openMode', 'split'),
    languageBuckets: {
      cpp: config.get<string>('languageBuckets.cpp', 'cpp'),
      csharp: config.get<string>('languageBuckets.csharp', 'csharp'),
      typescript: config.get<string>('languageBuckets.typescript', 'ts'),
      javascript: config.get<string>('languageBuckets.javascript', 'js'),
      python: config.get<string>('languageBuckets.python', 'python')
    }
  };
}
