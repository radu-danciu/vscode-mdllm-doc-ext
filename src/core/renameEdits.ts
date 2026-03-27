import * as vscode from 'vscode';
import { ResolvedDocumentationTarget } from './documentationService';

export interface SymbolRenamePlan {
  oldCanonicalSignature: string;
  newCanonicalSignature: string;
  oldHead: string;
  newHead: string;
  isContainerRename: boolean;
}

export function buildSymbolRenamePlan(
  target: Pick<ResolvedDocumentationTarget, 'symbol'>,
  newName: string
): SymbolRenamePlan | null {
  const oldCanonicalSignature = target.symbol.canonicalSignature;
  const oldHead = canonicalHead(oldCanonicalSignature);
  const newHead = replaceTailIdentifier(oldHead, newName);
  if (!oldHead || !newHead || oldHead === newHead) {
    return null;
  }

  const newCanonicalSignature = replaceLastOccurrence(
    oldCanonicalSignature,
    oldHead,
    newHead
  );

  return {
    oldCanonicalSignature,
    newCanonicalSignature,
    oldHead,
    newHead,
    isContainerRename: target.symbol.kind === 'type' || target.symbol.kind === 'object'
  };
}

export function rewriteMarkdownCodeSpans(
  content: string,
  plan: SymbolRenamePlan
): string {
  return content.replace(/`([^`\n]+)`/g, (match, inner) => {
    const rewritten = rewriteCodeSpan(inner, plan);
    return rewritten === inner ? match : `\`${rewritten}\``;
  });
}

function rewriteCodeSpan(value: string, plan: SymbolRenamePlan): string {
  if (value === plan.oldCanonicalSignature) {
    return plan.newCanonicalSignature;
  }

  if (value === plan.oldHead) {
    return plan.newHead;
  }

  if (plan.isContainerRename && value.includes(plan.oldHead)) {
    return value.split(plan.oldHead).join(plan.newHead);
  }

  return value;
}

function canonicalHead(signature: string): string {
  const beforeArgs = signature.split('(')[0] ?? signature;
  const parts = beforeArgs.trim().split(/\s+/).filter(Boolean);
  return parts[parts.length - 1] ?? beforeArgs.trim();
}

function replaceTailIdentifier(value: string, newName: string): string {
  const separator = value.includes('::') ? '::' : value.includes('.') ? '.' : '';
  const lastSeparatorIndex = separator ? value.lastIndexOf(separator) : -1;
  const prefix =
    lastSeparatorIndex >= 0 ? value.slice(0, lastSeparatorIndex + separator.length) : '';
  const tail = lastSeparatorIndex >= 0 ? value.slice(lastSeparatorIndex + separator.length) : value;
  const genericStart = tail.indexOf('<');
  const suffix = genericStart === -1 ? '' : tail.slice(genericStart);
  return `${prefix}${newName}${suffix}`;
}

function replaceLastOccurrence(value: string, search: string, replacement: string): string {
  const lastIndex = value.lastIndexOf(search);
  if (lastIndex === -1) {
    return value;
  }

  return `${value.slice(0, lastIndex)}${replacement}${value.slice(lastIndex + search.length)}`;
}

export async function appendMarkdownRenameEdits(
  workspaceEdit: vscode.WorkspaceEdit,
  workspaceFolder: vscode.WorkspaceFolder,
  docsRoot: string,
  plan: SymbolRenamePlan
): Promise<void> {
  const docsFiles = await vscode.workspace.findFiles(
    new vscode.RelativePattern(workspaceFolder, `${docsRoot}/**/*.md`)
  );

  for (const file of docsFiles) {
    const document = await vscode.workspace.openTextDocument(file);
    const content = document.getText();
    const rewritten = rewriteMarkdownCodeSpans(content, plan);
    if (rewritten === content) {
      continue;
    }

    const lastLine = document.lineAt(document.lineCount - 1);
    workspaceEdit.replace(
      file,
      new vscode.Range(0, 0, document.lineCount - 1, lastLine.text.length),
      rewritten
    );
  }
}
