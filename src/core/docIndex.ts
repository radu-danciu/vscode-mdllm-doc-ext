import * as vscode from 'vscode';
import { parseMarkdownEntries } from './markdownParser';
import { DocEntry, LanguageModule, ParsedDocFile, ResolvedSymbol } from './types';

export type DocIndexMatchType = 'exact' | 'normalized' | 'fallback' | 'none';

export interface DocIndexMatchResult {
  entry: DocEntry | null;
  matchType: DocIndexMatchType;
}

export class DocIndex {
  private readonly cache = new Map<string, ParsedDocFile | null>();

  public clear(): void {
    this.cache.clear();
  }

  public invalidate(uri: vscode.Uri): void {
    this.cache.delete(uri.toString());
  }

  public async getParsedDoc(
    uri: vscode.Uri,
    normalizeSignature: (signature: string) => string
  ): Promise<ParsedDocFile | null> {
    const key = uri.toString();
    if (this.cache.has(key)) {
      return this.cache.get(key) ?? null;
    }

    try {
      const content = Buffer.from(await vscode.workspace.fs.readFile(uri)).toString('utf8');
      const parsed = parseMarkdownEntries(content, normalizeSignature);
      this.cache.set(key, parsed);
      return parsed;
    } catch {
      this.cache.set(key, null);
      return null;
    }
  }

  public async findEntry(
    uri: vscode.Uri,
    symbol: ResolvedSymbol,
    module: LanguageModule
  ): Promise<DocEntry | null> {
    return (await this.findEntryDetailed(uri, symbol, module)).entry;
  }

  public async findEntryDetailed(
    uri: vscode.Uri,
    symbol: ResolvedSymbol,
    module: LanguageModule
  ): Promise<DocIndexMatchResult> {
    const parsed = await this.getParsedDoc(uri, module.normalizeSignature.bind(module));
    if (!parsed) {
      return { entry: null, matchType: 'none' };
    }

    const exact = parsed.entries.find(
      (entry) => entry.signature === symbol.canonicalSignature
    );
    if (exact) {
      return { entry: exact, matchType: 'exact' };
    }

    const normalizedTarget = module.normalizeSignature(symbol.canonicalSignature);
    const normalized = parsed.entries.find(
      (entry) => entry.normalizedSignature === normalizedTarget
    );
    if (normalized) {
      return { entry: normalized, matchType: 'normalized' };
    }

    if (module.matchesEntry) {
      const fallback = parsed.entries.find((entry) => module.matchesEntry?.(symbol, entry));
      if (fallback) {
        return { entry: fallback, matchType: 'fallback' };
      }
    }

    return { entry: null, matchType: 'none' };
  }
}
