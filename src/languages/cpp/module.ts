import * as vscode from 'vscode';
import { ExternalDocsConfig, LanguageModule, ResolvedSymbol, SymbolContext } from '../../core/types';
import { normalizeWhitespace, sourceRelativePathForDocument } from '../../core/utils';
import {
  getWordRange,
  ParsedSymbolCandidate,
  rangeContains,
  signatureArity,
  signatureName,
  splitParams,
  splitTopLevel
} from '../common';
import { createDefaultStub } from '../stub';

export class CppLanguageModule implements LanguageModule {
  public readonly id = 'cpp';
  public readonly languageIds = ['c', 'cpp'];

  public canHandle(document: vscode.TextDocument): boolean {
    return this.languageIds.includes(document.languageId);
  }

  public getLangBucket(_document: vscode.TextDocument, config: ExternalDocsConfig): string {
    return config.languageBuckets.cpp;
  }

  public async resolveSymbol(context: SymbolContext): Promise<ResolvedSymbol | null> {
    const wordRange = getWordRange(context.document, context.position);
    if (!wordRange) {
      return null;
    }

    const candidate = parseCppDocument(context.document).find((entry) =>
      rangeContains(entry.range, context.position)
    );
    if (!candidate) {
      return null;
    }

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
      symbolRange: wordRange,
      containerName: candidate.container,
      params: candidate.params,
      returnType: candidate.returnType,
      inheritanceChain: candidate.inheritanceChain,
      frozenTypeArguments: candidate.frozenTypeArguments,
      lookupName: signatureName(candidate.signature),
      arity: signatureArity(candidate.signature)
    };
  }

  public createStub(symbol: ResolvedSymbol): string {
    return createDefaultStub(symbol);
  }

  public normalizeSignature(signature: string): string {
    return normalizeWhitespace(signature)
      .replace(/\s*::\s*/g, '::')
      .replace(/\s*,\s*/g, ', ')
      .replace(/\s+</g, '<')
      .replace(/>\s*/g, '>');
  }

  public matchesEntry(symbol: ResolvedSymbol, entry: { signature: string }): boolean {
    return (
      symbol.lookupName === signatureName(entry.signature) &&
      symbol.arity === signatureArity(entry.signature)
    );
  }
}

function parseCppDocument(document: vscode.TextDocument): ParsedSymbolCandidate[] {
  const lines = document.getText().split(/\r?\n/);
  const candidates: ParsedSymbolCandidate[] = [];
  const namespaceStack: Array<{ name: string; depth: number }> = [];
  const classStack: Array<{ name: string; depth: number }> = [];
  let braceDepth = 0;

  lines.forEach((line, lineIndex) => {
    const trimmed = line.trim();

    const namespaceMatch = trimmed.match(/^namespace\s+([A-Za-z_]\w*)\s*\{/);
    if (namespaceMatch) {
      namespaceStack.push({ name: namespaceMatch[1], depth: braceDepth + countOpenBraces(line) });
    }

    const typeMatch = trimmed.match(
      /^(?:template\s*<[^>]+>\s*)?(class|struct)\s+([A-Za-z_]\w*(?:<[^>]+>)?)(?:\s*:\s*([^{]+))?\s*\{?/
    );
    if (typeMatch) {
      const name = typeMatch[2].trim();
      const fullName = [...namespaceStack.map((entry) => entry.name), name].join('::');
      const inheritance = (typeMatch[3] ?? '')
        .split(',')
        .map((item) => item.replace(/\b(public|protected|private|virtual)\b/g, '').trim())
        .filter(Boolean);
      const start = line.indexOf(name);
      candidates.push({
        name,
        kind: 'type',
        signature: fullName,
        range: new vscode.Range(lineIndex, start, lineIndex, start + name.length),
        inheritanceChain: inheritance,
        frozenTypeArguments: extractTemplateValues(inheritance[0])
      });
      classStack.push({ name, depth: braceDepth + countOpenBraces(line) });
    }

    const outOfClassMethodMatch = trimmed.match(
      /^([\w:&*<>\s]+?)\s+((?:[A-Za-z_]\w*::)+)([A-Za-z_]\w*)\s*\(([^)]*)\)\s*(const)?\s*[\{;]/
    );
    if (outOfClassMethodMatch) {
      const returnType = normalizeWhitespace(outOfClassMethodMatch[1]);
      const container = outOfClassMethodMatch[2].replace(/::$/, '');
      const name = outOfClassMethodMatch[3];
      const params = splitParams(outOfClassMethodMatch[4]);
      const constSuffix = outOfClassMethodMatch[5] ? ' const' : '';
      const signature = `${returnType} ${container}::${name}(${renderCppParams(params)})${constSuffix}`;
      const start = line.lastIndexOf(name);
      candidates.push({
        name,
        kind: 'method',
        container,
        signature,
        range: new vscode.Range(lineIndex, start, lineIndex, start + name.length),
        params,
        returnType
      });
    } else {
      const methodMatch = trimmed.match(
        /^([\w:&*<>\s]+?)\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*(const)?\s*[\{;]/
      );
      if (methodMatch) {
        const returnType = normalizeWhitespace(methodMatch[1]);
        const name = methodMatch[2];
        const params = splitParams(methodMatch[3]);
        const constSuffix = methodMatch[4] ? ' const' : '';
        const container = classStack[classStack.length - 1]?.name;
        const namespacePrefix = namespaceStack.map((entry) => entry.name);
        const fullyQualifiedContainer = container
          ? [...namespacePrefix, container].join('::')
          : undefined;
        const signatureHead = fullyQualifiedContainer
          ? `${fullyQualifiedContainer}::${name}`
          : [...namespacePrefix, name].join('::');
        const signature = `${returnType} ${signatureHead}(${renderCppParams(params)})${constSuffix}`;
        const start = line.indexOf(name);
        candidates.push({
          name,
          kind: container ? 'method' : 'function',
          container: fullyQualifiedContainer,
          signature,
          range: new vscode.Range(lineIndex, start, lineIndex, start + name.length),
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

function renderCppParams(params: Array<{ name: string; type?: string }>): string {
  return params
    .map((param) => (param.type ? `${param.type} ${param.name}` : param.name))
    .join(', ');
}

function extractTemplateValues(value?: string): Array<{ name: string; value: string }> | undefined {
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
