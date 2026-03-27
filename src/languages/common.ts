import * as vscode from 'vscode';
import { normalizeWhitespace } from '../core/utils';

export interface ParsedSymbolCandidate {
  name: string;
  range: vscode.Range;
  declarationRange?: vscode.Range;
  container?: string;
  signature: string;
  kind: 'function' | 'method' | 'type' | 'object';
  returnType?: string;
  params?: Array<{ name: string; type?: string }>;
  inheritanceChain?: string[];
  frozenTypeArguments?: Array<{ name: string; value: string }>;
}

export function getWordRange(
  document: vscode.TextDocument,
  position: vscode.Position
): vscode.Range | undefined {
  return document.getWordRangeAtPosition(position, /[\w$.:<>]+/);
}

export function rangeContains(range: vscode.Range, position: vscode.Position): boolean {
  return !position.isBefore(range.start) && !position.isAfter(range.end);
}

export function declarationLineRange(
  document: vscode.TextDocument,
  lineIndex: number
): vscode.Range {
  const line = document.lineAt(lineIndex);
  const firstCharacter = line.firstNonWhitespaceCharacterIndex;
  return new vscode.Range(lineIndex, firstCharacter, lineIndex, line.text.length);
}

export function captureBalancedDeclarationRange(
  document: vscode.TextDocument,
  startLine: number,
  endPattern: RegExp
): vscode.Range {
  let depthParen = 0;
  let depthAngle = 0;
  let depthBracket = 0;
  let depthBrace = 0;
  let endLine = startLine;

  for (let lineIndex = startLine; lineIndex < document.lineCount; lineIndex += 1) {
    const text = document.lineAt(lineIndex).text;
    const trimmed = text.trim();

    endLine = lineIndex;

    for (let index = 0; index < text.length; index += 1) {
      const char = text[index];
      const next = text[index + 1];
      const atTopLevel =
        depthParen === 0 && depthAngle === 0 && depthBracket === 0 && depthBrace === 0;

      if (
        atTopLevel &&
        terminatesDeclaration(endPattern, char, next)
      ) {
        return new vscode.Range(
          startLine,
          document.lineAt(startLine).firstNonWhitespaceCharacterIndex,
          endLine,
          document.lineAt(endLine).text.length
        );
      }

      if (char === '(') {
        depthParen += 1;
      } else if (char === ')') {
        depthParen = Math.max(0, depthParen - 1);
      } else if (char === '<') {
        depthAngle += 1;
      } else if (char === '>') {
        depthAngle = Math.max(0, depthAngle - 1);
      } else if (char === '[') {
        depthBracket += 1;
      } else if (char === ']') {
        depthBracket = Math.max(0, depthBracket - 1);
      } else if (char === '{') {
        depthBrace += 1;
      } else if (char === '}') {
        depthBrace = Math.max(0, depthBrace - 1);
      }
    }

    if (
      trimmed.length > 0 &&
      depthParen === 0 &&
      depthAngle === 0 &&
      depthBracket === 0 &&
      depthBrace === 0 &&
      endPattern.test(trimmed)
    ) {
      break;
    }
  }

  const startCharacter = document.lineAt(startLine).firstNonWhitespaceCharacterIndex;
  return new vscode.Range(startLine, startCharacter, endLine, document.lineAt(endLine).text.length);
}

function terminatesDeclaration(endPattern: RegExp, char: string, next?: string): boolean {
  const source = endPattern.source;
  if (source.includes(';') && char === ';') {
    return true;
  }
  if (source.includes('{') && char === '{') {
    return true;
  }
  if (source.includes('=>') && char === '=' && next === '>') {
    return true;
  }

  return false;
}

export function declarationText(
  document: vscode.TextDocument,
  startLine: number,
  endPattern: RegExp
): string {
  const range = captureBalancedDeclarationRange(document, startLine, endPattern);
  const parts: string[] = [];

  for (let lineIndex = range.start.line; lineIndex <= range.end.line; lineIndex += 1) {
    parts.push(document.lineAt(lineIndex).text.trim());
  }

  return normalizeWhitespace(parts.join(' '));
}

export function identifierRangeOnLine(
  line: string,
  lineIndex: number,
  name: string
): vscode.Range | undefined {
  const exactWord = new RegExp(`(^|[^\\w$])(${escapeRegex(name)})(?![\\w$])`);
  const match = exactWord.exec(line);
  if (match?.index !== undefined) {
    const start = match.index + match[1].length;
    return new vscode.Range(lineIndex, start, lineIndex, start + name.length);
  }

  const fallback = line.indexOf(name);
  if (fallback === -1) {
    return undefined;
  }

  return new vscode.Range(lineIndex, fallback, lineIndex, fallback + name.length);
}

export function selectBestCandidate(
  candidates: ParsedSymbolCandidate[],
  position: vscode.Position
): ParsedSymbolCandidate | undefined {
  const matching = candidates.filter((entry) =>
    rangeContains(entry.declarationRange ?? entry.range, position)
  );
  if (matching.length === 0) {
    return undefined;
  }

  const exact = matching.find((entry) => rangeContains(entry.range, position));
  if (exact) {
    return exact;
  }

  return matching.sort((left, right) => {
    const leftRange = left.declarationRange ?? left.range;
    const rightRange = right.declarationRange ?? right.range;
    const leftSpan =
      (leftRange.end.line - leftRange.start.line) * 1000 +
      (leftRange.end.character - leftRange.start.character);
    const rightSpan =
      (rightRange.end.line - rightRange.start.line) * 1000 +
      (rightRange.end.character - rightRange.start.character);
    return leftSpan - rightSpan;
  })[0];
}

export function splitParams(paramText: string): Array<{ name: string; type?: string }> {
  if (!paramText.trim()) {
    return [];
  }

  return splitTopLevel(paramText, ',')
    .map((part) => normalizeWhitespace(part))
    .filter(Boolean)
    .map((part) => {
      const cleaned = part.replace(/=[^,]+$/, '').trim();
      const colonIndex = cleaned.lastIndexOf(':');
      if (colonIndex !== -1) {
        return {
          name: cleaned.slice(0, colonIndex).trim(),
          type: cleaned.slice(colonIndex + 1).trim()
        };
      }

      const pieces = cleaned.split(/\s+/);
      if (pieces.length === 1) {
        return { name: pieces[0] };
      }

      return {
        name: pieces[pieces.length - 1],
        type: pieces.slice(0, -1).join(' ')
      };
    });
}

export function splitTopLevel(value: string, separator: string): string[] {
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

    if (
      char === separator &&
      depthAngle === 0 &&
      depthParen === 0 &&
      depthBracket === 0
    ) {
      result.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  if (current) {
    result.push(current);
  }

  return result;
}

export function signatureName(signature: string): string {
  const beforeArgs = signature.split('(')[0] ?? signature;
  const parts = beforeArgs.split(/[\s.:]+/).filter(Boolean);
  return parts[parts.length - 1] ?? beforeArgs.trim();
}

export function signatureArity(signature: string): number | undefined {
  const match = signature.match(/\((.*)\)/);
  if (!match) {
    return undefined;
  }

  const inside = match[1].trim();
  if (!inside) {
    return 0;
  }

  return splitTopLevel(inside, ',').filter((part) => part.trim().length > 0).length;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
