import * as vscode from 'vscode';
import { normalizeWhitespace } from '../core/utils';

export interface ParsedSymbolCandidate {
  name: string;
  range: vscode.Range;
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
