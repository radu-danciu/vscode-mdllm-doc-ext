import * as vscode from 'vscode';
import { DocEntry, ParsedDocFile } from './types';

export function parseMarkdownEntries(
  content: string,
  normalizeSignature: (signature: string) => string
): ParsedDocFile {
  const lines = content.split(/\r?\n/);
  const entries: DocEntry[] = [];
  let sourceRelativePath: string | undefined;
  let currentSignature: string | undefined;
  let currentStartLine = -1;
  let currentBodyLines: string[] = [];

  const flush = (endLine: number) => {
    if (!currentSignature) {
      return;
    }

    entries.push({
      signature: currentSignature,
      normalizedSignature: normalizeSignature(currentSignature),
      body: currentBodyLines.join('\n').trim(),
      range: new vscode.Range(
        new vscode.Position(currentStartLine, 0),
        new vscode.Position(Math.max(currentStartLine, endLine), 0)
      ),
      headingLine: currentStartLine
    });
  };

  lines.forEach((line, index) => {
    if (index === 0 && line.startsWith('# ')) {
      sourceRelativePath = line.slice(2).trim();
      return;
    }

    if (line.startsWith('## ')) {
      flush(index - 1);
      currentSignature = line.slice(3).trim();
      currentStartLine = index;
      currentBodyLines = [];
      return;
    }

    if (currentSignature) {
      currentBodyLines.push(line);
    }
  });

  flush(lines.length - 1);

  return {
    sourceRelativePath,
    entries
  };
}
