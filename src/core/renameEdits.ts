import * as vscode from 'vscode';
import { parseMarkdownEntries } from './markdownParser';
import { ResolvedDocumentationTarget } from './documentationService';

export interface SymbolRenamePlan {
  primaryDocsUri?: vscode.Uri;
  oldCanonicalSignature: string;
  newCanonicalSignature: string;
  oldHead: string;
  newHead: string;
  isContainerRename: boolean;
  arity?: number;
  containerPrefix?: string;
  paramTypes: string[];
  returnType?: string;
}

export interface PrimaryDocHeadingMatch {
  kind: 'exact' | 'stale';
  matchedCanonicalSignature: string;
  matchedHead: string;
}

export function buildSymbolRenamePlan(
  target: Pick<ResolvedDocumentationTarget, 'symbol' | 'mapping'>,
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
    primaryDocsUri: target.mapping?.docsUri,
    oldCanonicalSignature,
    newCanonicalSignature,
    oldHead,
    newHead,
    isContainerRename: target.symbol.kind === 'type' || target.symbol.kind === 'object',
    arity: target.symbol.arity,
    containerPrefix: containerPrefixForHead(oldHead),
    paramTypes:
      target.symbol.params
        ?.map((param) => normalizeTypeText(param.type))
        .filter((value): value is string => Boolean(value)) ?? [],
    returnType: normalizeTypeText(target.symbol.returnType)
  };
}

export function rewriteMarkdownCodeSpans(
  content: string,
  plan: SymbolRenamePlan,
  primaryMatch?: PrimaryDocHeadingMatch | null
): string {
  return content.replace(/`([^`\n]+)`/g, (match, inner) => {
    const rewritten = rewriteCodeSpan(inner, plan, primaryMatch ?? null);
    return rewritten === inner ? match : `\`${rewritten}\``;
  });
}

function rewriteCodeSpan(
  value: string,
  plan: SymbolRenamePlan,
  primaryMatch: PrimaryDocHeadingMatch | null
): string {
  const canonicalAliases = [...new Set([
    plan.oldCanonicalSignature,
    primaryMatch?.matchedCanonicalSignature
  ].filter(Boolean) as string[])];
  if (canonicalAliases.includes(value)) {
    return plan.newCanonicalSignature;
  }

  const headAliases = [...new Set([plan.oldHead, primaryMatch?.matchedHead].filter(Boolean) as string[])];
  if (headAliases.includes(value)) {
    return plan.newHead;
  }

  if (plan.isContainerRename) {
    let rewritten = value;
    for (const alias of [...headAliases].sort((left, right) => right.length - left.length)) {
      if (rewritten.includes(alias)) {
        rewritten = rewritten.split(alias).join(plan.newHead);
      }
    }
    return rewritten;
  }

  return value;
}

export function canonicalHead(signature: string): string {
  const beforeArgs = signature.split('(')[0] ?? signature;
  const parts = beforeArgs.trim().split(/\s+/).filter(Boolean);
  return parts[parts.length - 1] ?? beforeArgs.trim();
}

export function replaceTailIdentifier(value: string, newName: string): string {
  const separator = value.includes('::') ? '::' : value.includes('.') ? '.' : '';
  const lastSeparatorIndex = separator ? value.lastIndexOf(separator) : -1;
  const prefix =
    lastSeparatorIndex >= 0 ? value.slice(0, lastSeparatorIndex + separator.length) : '';
  const tail = lastSeparatorIndex >= 0 ? value.slice(lastSeparatorIndex + separator.length) : value;
  const genericStart = tail.indexOf('<');
  const suffix = genericStart === -1 ? '' : tail.slice(genericStart);
  return `${prefix}${newName}${suffix}`;
}

export function replaceLastOccurrence(value: string, search: string, replacement: string): string {
  const lastIndex = value.lastIndexOf(search);
  if (lastIndex === -1) {
    return value;
  }

  return `${value.slice(0, lastIndex)}${replacement}${value.slice(lastIndex + search.length)}`;
}

export function selectPrimaryDocHeadingMatch(
  signatures: readonly string[],
  plan: SymbolRenamePlan
): PrimaryDocHeadingMatch | null {
  if (signatures.includes(plan.oldCanonicalSignature)) {
    return {
      kind: 'exact',
      matchedCanonicalSignature: plan.oldCanonicalSignature,
      matchedHead: plan.oldHead
    };
  }

  const staleMatches = signatures.filter((signature) => isHighConfidenceStaleMatch(signature, plan));
  if (staleMatches.length !== 1) {
    return null;
  }

  return {
    kind: 'stale',
    matchedCanonicalSignature: staleMatches[0],
    matchedHead: canonicalHead(staleMatches[0])
  };
}

export async function appendMarkdownRenameEdits(
  workspaceEdit: vscode.WorkspaceEdit,
  workspaceFolder: vscode.WorkspaceFolder,
  docsRoot: string,
  plan: SymbolRenamePlan
): Promise<void> {
  const primaryMatch = await loadPrimaryDocHeadingMatch(plan);
  const docsFiles = await vscode.workspace.findFiles(
    new vscode.RelativePattern(workspaceFolder, `${docsRoot}/**/*.md`)
  );

  for (const file of docsFiles) {
    const document = await vscode.workspace.openTextDocument(file);
    const content = document.getText();
    const rewritten = rewriteMarkdownCodeSpans(content, plan, primaryMatch);
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

async function loadPrimaryDocHeadingMatch(
  plan: SymbolRenamePlan
): Promise<PrimaryDocHeadingMatch | null> {
  if (!plan.primaryDocsUri) {
    return null;
  }

  const document = await vscode.workspace.openTextDocument(plan.primaryDocsUri);
  const signatures = parseMarkdownEntries(document.getText(), (signature) => signature).entries.map(
    (entry) => entry.signature
  );
  return selectPrimaryDocHeadingMatch(signatures, plan);
}

function isHighConfidenceStaleMatch(signature: string, plan: SymbolRenamePlan): boolean {
  if (signature === plan.oldCanonicalSignature) {
    return false;
  }

  const details = signatureDetails(signature);
  return (
    details.head.length > 0 &&
    details.head !== plan.oldHead &&
    containerPrefixForHead(details.head) === plan.containerPrefix &&
    details.arity === plan.arity &&
    equalTypeLists(details.paramTypes, plan.paramTypes) &&
    normalizeTypeText(details.returnType) === normalizeTypeText(plan.returnType)
  );
}

function signatureDetails(signature: string): {
  head: string;
  arity?: number;
  paramTypes: string[];
  returnType?: string;
} {
  const head = canonicalHead(signature);
  const argsMatch = signature.match(/\((.*)\)/);
  const paramTypes =
    argsMatch && argsMatch[1].trim()
      ? splitTopLevel(argsMatch[1])
          .map((part) => normalizeTypeText(typeFromParam(part)))
          .filter((value): value is string => Boolean(value))
      : [];

  return {
    head,
    arity: argsMatch ? paramTypes.length : undefined,
    paramTypes,
    returnType: normalizeTypeText(returnTypeFromSignature(signature))
  };
}

function typeFromParam(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const colonIndex = trimmed.lastIndexOf(':');
  if (colonIndex !== -1) {
    return trimmed.slice(colonIndex + 1).trim();
  }

  const pieces = trimmed.split(/\s+/).filter(Boolean);
  if (pieces.length <= 1) {
    return undefined;
  }

  return pieces.slice(0, -1).join(' ');
}

function returnTypeFromSignature(signature: string): string | undefined {
  const arrowIndex = signature.indexOf(' -> ');
  if (arrowIndex !== -1) {
    return signature.slice(arrowIndex + 4).trim();
  }

  const beforeArgs = signature.split('(')[0] ?? signature;
  const parts = beforeArgs.trim().split(/\s+/).filter(Boolean);
  return parts.length > 1 ? parts[0] : undefined;
}

function containerPrefixForHead(head: string): string {
  const separator = head.includes('::') ? '::' : head.includes('.') ? '.' : '';
  if (!separator) {
    return '';
  }

  const lastSeparatorIndex = head.lastIndexOf(separator);
  return lastSeparatorIndex === -1 ? '' : head.slice(0, lastSeparatorIndex);
}

function splitTopLevel(value: string): string[] {
  const result: string[] = [];
  let depthAngle = 0;
  let depthParen = 0;
  let depthBracket = 0;
  let current = '';

  for (const char of value) {
    if (char === '<') {
      depthAngle += 1;
    } else if (char === '>') {
      depthAngle = Math.max(0, depthAngle - 1);
    } else if (char === '(') {
      depthParen += 1;
    } else if (char === ')') {
      depthParen = Math.max(0, depthParen - 1);
    } else if (char === '[') {
      depthBracket += 1;
    } else if (char === ']') {
      depthBracket = Math.max(0, depthBracket - 1);
    }

    if (char === ',' && depthAngle === 0 && depthParen === 0 && depthBracket === 0) {
      result.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  if (current.trim()) {
    result.push(current.trim());
  }

  return result;
}

function normalizeTypeText(value?: string): string | undefined {
  return value?.replace(/\s+/g, ' ').trim();
}

function equalTypeLists(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}
