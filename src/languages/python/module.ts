import * as path from 'path';
import * as vscode from 'vscode';
import {
  ExternalDocsConfig,
  LanguageModule,
  ResolvedSymbol,
  SymbolContext,
  SymbolEnumerationContext
} from '../../core/types';
import { normalizeWhitespace, sourceRelativePathForDocument } from '../../core/utils';
import {
  declarationLineRange,
  ParsedSymbolCandidate,
  selectBestCandidate,
  signatureArity,
  signatureName,
  splitParams,
  splitTopLevel
} from '../common';
import { createDefaultStub } from '../stub';

export class PythonLanguageModule implements LanguageModule {
  public readonly id = 'python';
  public readonly languageIds = ['python'];

  public canHandle(document: vscode.TextDocument): boolean {
    return document.languageId === 'python';
  }

  public getLangBucket(_document: vscode.TextDocument, config: ExternalDocsConfig): string {
    return config.languageBuckets.python;
  }

  public async resolveSymbol(context: SymbolContext): Promise<ResolvedSymbol | null> {
    const candidate = selectBestCandidate(
      parsePythonDocument(context.document, context),
      context.position
    );
    if (!candidate) {
      return null;
    }

    return toResolvedSymbol(context, candidate);
  }

  public async listSymbols(context: SymbolEnumerationContext): Promise<ResolvedSymbol[]> {
    return parsePythonDocument(context.document, context).map((candidate) =>
      toResolvedSymbol(context, candidate)
    );
  }

  public createStub(symbol: ResolvedSymbol): string {
    return createDefaultStub(symbol);
  }

  public normalizeSignature(signature: string): string {
    return normalizeWhitespace(signature)
      .replace(/\s*\.\s*/g, '.')
      .replace(/\s*->\s*/g, ' -> ')
      .replace(/\s*,\s*/g, ', ');
  }

  public matchesEntry(symbol: ResolvedSymbol, entry: { signature: string }): boolean {
    return (
      symbol.lookupName === signatureName(entry.signature) &&
      symbol.arity === signatureArity(entry.signature)
    );
  }
}

function parsePythonDocument(
  document: vscode.TextDocument,
  context: SymbolEnumerationContext
): ParsedSymbolCandidate[] {
  const lines = document.getText().split(/\r?\n/);
  const candidates: ParsedSymbolCandidate[] = [];
  const classStack: Array<{ name: string; indent: number }> = [];
  const modulePath = sourceRelativePathForDocument(
    context.workspaceFolder,
    document,
    context.config
  )
    .replace(/\.py$/, '')
    .split('/')
    .filter(Boolean)
    .join('.');

  lines.forEach((line, lineIndex) => {
    const indent = line.match(/^\s*/)?.[0].length ?? 0;
    while (classStack.length > 0 && indent <= classStack[classStack.length - 1].indent && line.trim()) {
      classStack.pop();
    }

    const trimmed = line.trim();
    const classMatch = trimmed.match(/^class\s+([A-Za-z_]\w*)(?:\(([^)]*)\))?\s*:/);
    if (classMatch) {
      const name = classMatch[1];
      const inheritance = splitTopLevel(classMatch[2] ?? '', ',')
        .map((item) => item.trim())
        .filter(Boolean);
      const fullName = [modulePath, ...classStack.map((entry) => entry.name), name]
        .filter(Boolean)
        .join('.');
      const start = line.indexOf(name);
      candidates.push({
        name,
        kind: 'type',
        signature: fullName,
        range: new vscode.Range(lineIndex, start, lineIndex, start + name.length),
        declarationRange: declarationLineRange(document, lineIndex),
        inheritanceChain: inheritance,
        frozenTypeArguments: extractTemplateValues(inheritance[0])
      });
      classStack.push({ name, indent });
      return;
    }

    const functionMatch = trimmed.match(
      /^def\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*(?:->\s*([^:]+))?\s*:/
    );
    if (functionMatch) {
      const name = functionMatch[1];
      const params = splitParams(functionMatch[2]);
      const returnType = functionMatch[3]?.trim();
      const containerPath = [modulePath, ...classStack.map((entry) => entry.name)]
        .filter(Boolean)
        .join('.');
      const signatureHead = containerPath ? `${containerPath}.${name}` : `${modulePath}.${name}`;
      const renderedParams = params
        .map((param) => (param.type ? `${param.name}: ${param.type}` : param.name))
        .join(', ');
      const signature = returnType
        ? `${signatureHead}(${renderedParams}) -> ${returnType}`
        : `${signatureHead}(${renderedParams})`;
      const start = line.indexOf(name);
      candidates.push({
        name,
        kind: classStack.length > 0 ? 'method' : 'function',
        signature,
        container: containerPath || modulePath,
        range: new vscode.Range(lineIndex, start, lineIndex, start + name.length),
        declarationRange: declarationLineRange(document, lineIndex),
        params,
        returnType
      });
    }
  });

  return candidates;
}

function extractTemplateValues(value?: string): Array<{ name: string; value: string }> | undefined {
  if (!value) {
    return undefined;
  }

  const match = value.match(/\[(.+)\]/) ?? value.match(/<(.+)>/);
  if (!match) {
    return undefined;
  }

  return splitTopLevel(match[1], ',').map((entry, index) => ({
    name: `T${index + 1}`,
    value: entry.trim()
  }));
}

function toResolvedSymbol(
  context: SymbolEnumerationContext,
  candidate: ParsedSymbolCandidate
): ResolvedSymbol {
  return {
    kind: candidate.kind,
    displayName: candidate.name,
    canonicalSignature: candidate.signature,
    sourceFile: context.document.uri,
    sourceRelativePath: sourceRelativePathForDocument(
      context.workspaceFolder,
      context.document,
      context.config
    ),
    symbolRange: candidate.range,
    declarationRange: candidate.declarationRange ?? candidate.range,
    containerName: candidate.container,
    params: candidate.params,
    returnType: candidate.returnType,
    inheritanceChain: candidate.inheritanceChain,
    frozenTypeArguments: candidate.frozenTypeArguments,
    lookupName: signatureName(candidate.signature),
    arity: signatureArity(candidate.signature)
  };
}
