import * as path from 'path';
import * as vscode from 'vscode';
import { ExternalDocsConfig, LanguageModule, ResolvedSymbol, SymbolContext } from '../../core/types';
import { normalizeWhitespace, sourceRelativePathForDocument } from '../../core/utils';
import {
  getWordRange,
  ParsedSymbolCandidate,
  rangeContains,
  signatureArity,
  signatureName,
  splitParams
} from '../common';
import { createDefaultStub } from '../stub';

const LANGUAGE_IDS = ['javascript', 'javascriptreact', 'typescript', 'typescriptreact'];

export class JsTsLanguageModule implements LanguageModule {
  public readonly id = 'jsTs';
  public readonly languageIds = LANGUAGE_IDS;

  public canHandle(document: vscode.TextDocument): boolean {
    return this.languageIds.includes(document.languageId);
  }

  public getLangBucket(document: vscode.TextDocument, config: ExternalDocsConfig): string {
    return document.languageId.startsWith('javascript')
      ? config.languageBuckets.javascript
      : config.languageBuckets.typescript;
  }

  public async resolveSymbol(context: SymbolContext): Promise<ResolvedSymbol | null> {
    const wordRange = getWordRange(context.document, context.position);
    if (!wordRange) {
      return null;
    }

    const candidates = parseJsTsDocument(context.document);
    const candidate = candidates.find((entry) => rangeContains(entry.range, context.position));
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
      .replace(/\s*->\s*/g, ' -> ')
      .replace(/\s*\.\s*/g, '.');
  }

  public matchesEntry(symbol: ResolvedSymbol, entry: { signature: string }): boolean {
    return (
      symbol.lookupName === signatureName(entry.signature) &&
      symbol.arity === signatureArity(entry.signature)
    );
  }
}

function parseJsTsDocument(document: vscode.TextDocument): ParsedSymbolCandidate[] {
  const lines = document.getText().split(/\r?\n/);
  const candidates: ParsedSymbolCandidate[] = [];
  const classStack: Array<{ name: string; depth: number; inheritance: string[] }> = [];
  const interfaceStack: Array<{ name: string; depth: number; inheritance: string[] }> = [];
  const objectStack: Array<{ name: string; depth: number }> = [];
  let braceDepth = 0;

  lines.forEach((line, lineIndex) => {
    const trimmed = line.trim();
    const classMatch = trimmed.match(
      /^(?:export\s+)?class\s+([A-Za-z_]\w*)(?:\s+extends\s+([A-Za-z0-9_$.<>]+))?(?:\s+implements\s+([A-Za-z0-9_$.<>,\s]+))?\s*\{?/
    );
    if (classMatch) {
      const name = classMatch[1];
      const inheritance = [classMatch[2], classMatch[3]]
        .flatMap((value) => (value ? value.split(',').map((item) => item.trim()) : []))
        .filter(Boolean);
      const start = line.indexOf(name);
      candidates.push({
        name,
        kind: 'type',
        signature: name,
        range: new vscode.Range(lineIndex, start, lineIndex, start + name.length),
        inheritanceChain: inheritance
      });
      classStack.push({ name, depth: braceDepth + countOpenBraces(line), inheritance });
    }

    const interfaceMatch = trimmed.match(
      /^(?:export\s+)?interface\s+([A-Za-z_]\w*)(?:\s+extends\s+([A-Za-z0-9_$.<>,\s]+))?\s*\{?/
    );
    if (interfaceMatch) {
      const name = interfaceMatch[1];
      const inheritance = (interfaceMatch[2] ?? '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      const start = line.indexOf(name);
      candidates.push({
        name,
        kind: 'type',
        signature: name,
        range: new vscode.Range(lineIndex, start, lineIndex, start + name.length),
        inheritanceChain: inheritance
      });
      interfaceStack.push({ name, depth: braceDepth + countOpenBraces(line), inheritance });
    }

    const typeAliasMatch = trimmed.match(/^(?:export\s+)?type\s+([A-Za-z_]\w*)\s*=/);
    if (typeAliasMatch) {
      const name = typeAliasMatch[1];
      const start = line.indexOf(name);
      candidates.push({
        name,
        kind: 'type',
        signature: name,
        range: new vscode.Range(lineIndex, start, lineIndex, start + name.length)
      });
    }

    const objectMatch = trimmed.match(
      /^(?:export\s+)?(?:const|let)\s+([A-Za-z_]\w*)\s*=\s*\{\s*$/
    );
    if (objectMatch) {
      const name = objectMatch[1];
      const start = line.indexOf(name);
      candidates.push({
        name,
        kind: 'object',
        signature: name,
        range: new vscode.Range(lineIndex, start, lineIndex, start + name.length)
      });
      objectStack.push({ name, depth: braceDepth + countOpenBraces(line) });
    }

    const functionMatch = trimmed.match(
      /^(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*(?::\s*([^{]+))?\s*\{?/
    );
    if (functionMatch) {
      const name = functionMatch[1];
      const params = splitParams(functionMatch[2]);
      const returnType = functionMatch[3]?.trim();
      const start = line.indexOf(name);
      candidates.push({
        name,
        kind: 'function',
        signature: buildCallableSignature(name, undefined, params, returnType),
        range: new vscode.Range(lineIndex, start, lineIndex, start + name.length),
        params,
        returnType
      });
    }

    const currentClass = classStack[classStack.length - 1];
    const currentInterface = interfaceStack[interfaceStack.length - 1];
    const currentObject = objectStack[objectStack.length - 1];
    if (currentClass || currentInterface || currentObject) {
      const methodMatch = trimmed.match(
        /^(?:public\s+|private\s+|protected\s+|static\s+|readonly\s+|async\s+)*([A-Za-z_]\w*)\??\s*\(([^)]*)\)\s*(?::\s*([^;{]+))?\s*[;{]?/
      );
      if (methodMatch && methodMatch[1] !== 'constructor') {
        const name = methodMatch[1];
        const params = splitParams(methodMatch[2]);
        const returnType = methodMatch[3]?.trim();
        const container = currentClass?.name ?? currentInterface?.name ?? currentObject?.name;
        const start = line.indexOf(name);
        candidates.push({
          name,
          kind: currentObject ? 'function' : 'method',
          container,
          signature: buildCallableSignature(name, container, params, returnType),
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
      interfaceStack.length > 0 &&
      braceDepth < interfaceStack[interfaceStack.length - 1].depth
    ) {
      interfaceStack.pop();
    }
    while (objectStack.length > 0 && braceDepth < objectStack[objectStack.length - 1].depth) {
      objectStack.pop();
    }
  });

  return candidates;
}

function buildCallableSignature(
  name: string,
  container: string | undefined,
  params: Array<{ name: string; type?: string }>,
  returnType?: string
): string {
  const renderedParams = params
    .map((param) => (param.type ? `${param.name}: ${param.type}` : param.name))
    .join(', ');
  const head = container ? `${container}.${name}` : name;
  return returnType ? `${head}(${renderedParams}) -> ${returnType}` : `${head}(${renderedParams})`;
}

function countOpenBraces(value: string): number {
  return (value.match(/\{/g) ?? []).length;
}

function countCloseBraces(value: string): number {
  return (value.match(/\}/g) ?? []).length;
}
