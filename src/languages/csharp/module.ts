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
  captureBalancedDeclarationRange,
  declarationLineRange,
  declarationText,
  identifierRangeOnLine,
  ParsedSymbolCandidate,
  selectBestCandidate,
  signatureArity,
  signatureName,
  splitParams,
  splitTopLevel
} from '../common';
import { createDefaultStub } from '../stub';

const NON_DECLARATION_KEYWORDS = new Set(['if', 'for', 'while', 'switch', 'catch', 'return']);

export class CSharpLanguageModule implements LanguageModule {
  public readonly id = 'csharp';
  public readonly languageIds = ['csharp'];

  public canHandle(document: vscode.TextDocument): boolean {
    return document.languageId === 'csharp';
  }

  public getLangBucket(_document: vscode.TextDocument, config: ExternalDocsConfig): string {
    return config.languageBuckets.csharp;
  }

  public async resolveSymbol(context: SymbolContext): Promise<ResolvedSymbol | null> {
    const candidate = selectBestCandidate(parseCSharpDocument(context.document), context.position);
    if (!candidate) {
      return null;
    }

    return toResolvedSymbol(context, candidate);
  }

  public async listSymbols(context: SymbolEnumerationContext): Promise<ResolvedSymbol[]> {
    return parseCSharpDocument(context.document).map((candidate) => toResolvedSymbol(context, candidate));
  }

  public createStub(symbol: ResolvedSymbol): string {
    return createDefaultStub(symbol);
  }

  public normalizeSignature(signature: string): string {
    return normalizeWhitespace(signature)
      .replace(/\s*\.\s*/g, '.')
      .replace(/\s*,\s*/g, ', ')
      .replace(/\s*</g, '<')
      .replace(/>\s*/g, '>');
  }

  public matchesEntry(symbol: ResolvedSymbol, entry: { signature: string }): boolean {
    return (
      symbol.lookupName === signatureName(entry.signature) &&
      symbol.arity === signatureArity(entry.signature)
    );
  }
}

function parseCSharpDocument(document: vscode.TextDocument): ParsedSymbolCandidate[] {
  const lines = document.getText().split(/\r?\n/);
  const candidates: ParsedSymbolCandidate[] = [];
  const namespaceStack: Array<{ name: string; depth: number }> = [];
  const classStack: Array<{ name: string; depth: number }> = [];
  let braceDepth = 0;

  lines.forEach((line, lineIndex) => {
    const trimmed = line.trim();
    const typeDeclaration = declarationText(document, lineIndex, /[{]/);
    const callableDeclaration = declarationText(document, lineIndex, /[;{]/);

    const namespaceMatch = trimmed.match(/^namespace\s+([A-Za-z_][\w.]*)\s*\{/);
    if (namespaceMatch) {
      namespaceStack.push({ name: namespaceMatch[1], depth: braceDepth + countOpenBraces(line) });
    }

    const classMatch = typeDeclaration.match(
      /^(?:\[[^\]]+\]\s*)*(?:public|private|internal|protected|sealed|abstract|partial|static|\s)*\s*(class|interface|record)\s+([A-Za-z_]\w*(?:<[^>]+>)?)(?:\s*:\s*([^{]+))?\s*\{?/
    );
    if (classMatch) {
      const name = classMatch[2].trim();
      const fullName = [namespaceStack.map((entry) => entry.name).join('.'), name]
        .filter(Boolean)
        .join('.');
      const inheritance = (classMatch[3] ?? '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      const declarationRange = captureBalancedDeclarationRange(document, lineIndex, /[{]/);
      const range = identifierRangeOnLine(line, lineIndex, name);
      if (range) {
        candidates.push({
          name,
          kind: 'type',
          signature: fullName,
          range,
          declarationRange,
          inheritanceChain: inheritance,
          frozenTypeArguments: extractGenericValues(inheritance[0])
        });
      }
      classStack.push({ name, depth: braceDepth + countOpenBraces(line) });
    }

    const methodMatch = callableDeclaration.match(
      /^(?:\[[^\]]+\]\s*)*(?:public|private|internal|protected|sealed|abstract|partial|static|virtual|override|async|new|\s)+([\w.<>\[\],?]+)\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*\{?/
    );
    if (methodMatch && classStack.length > 0) {
      const returnType = methodMatch[1].trim();
      const name = methodMatch[2];
      if (NON_DECLARATION_KEYWORDS.has(name)) {
        return;
      }
      const params = splitParams(methodMatch[3]);
      if (params.some((param) => !param.type)) {
        return;
      }
      const namespacePrefix = namespaceStack.map((entry) => entry.name).join('.');
      const className = classStack[classStack.length - 1].name;
      const container = [namespacePrefix, className].filter(Boolean).join('.');
      const signature = `${returnType} ${container}.${name}(${renderCSharpParams(params)})`;
      const declarationRange = captureBalancedDeclarationRange(document, lineIndex, /[;{]/);
      const range = identifierRangeOnLine(line, lineIndex, name);
      if (range) {
        candidates.push({
          name,
          kind: 'method',
          signature,
          container,
          range,
          declarationRange,
          params,
          returnType
        });
      }
    }

    braceDepth += countOpenBraces(line);
    braceDepth -= countCloseBraces(line);

    while (classStack.length > 0 && braceDepth < classStack[classStack.length - 1].depth) {
      classStack.pop();
    }
    while (
      namespaceStack.length > 0 &&
      braceDepth < namespaceStack[namespaceStack.length - 1].depth
    ) {
      namespaceStack.pop();
    }
  });

  return candidates;
}

function renderCSharpParams(params: Array<{ name: string; type?: string }>): string {
  return params
    .map((param) => (param.type ? `${param.type} ${param.name}` : param.name))
    .join(', ');
}

function extractGenericValues(value?: string): Array<{ name: string; value: string }> | undefined {
  if (!value) {
    return undefined;
  }

  const match = value.match(/<(.+)>/);
  if (!match) {
    return undefined;
  }

  return splitTopLevel(match[1], ',').map((entry, index) => ({
    name: `T${index + 1}`,
    value: entry.trim()
  }));
}

function countOpenBraces(value: string): number {
  return (value.match(/\{/g) ?? []).length;
}

function countCloseBraces(value: string): number {
  return (value.match(/\}/g) ?? []).length;
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
