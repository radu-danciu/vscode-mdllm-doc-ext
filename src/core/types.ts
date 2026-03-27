import * as vscode from 'vscode';

export type SymbolKind = 'function' | 'method' | 'type' | 'object';
export type OpenMode = 'split' | 'main';

export interface ExternalDocsConfig {
  codeRoot: string;
  docsRoot: string;
  openMode: OpenMode;
  languageBuckets: {
    cpp: string;
    csharp: string;
    typescript: string;
    javascript: string;
    python: string;
  };
}

export interface SymbolParam {
  name: string;
  type?: string;
}

export interface FrozenTypeArgument {
  name: string;
  value: string;
}

export interface ResolvedSymbol {
  kind: SymbolKind;
  displayName: string;
  canonicalSignature: string;
  sourceFile: vscode.Uri;
  sourceRelativePath: string;
  symbolRange: vscode.Range;
  declarationRange?: vscode.Range;
  containerName?: string;
  params?: SymbolParam[];
  returnType?: string;
  inheritanceChain?: string[];
  frozenTypeArguments?: FrozenTypeArgument[];
  lookupName?: string;
  arity?: number;
}

export interface SymbolContext {
  document: vscode.TextDocument;
  position: vscode.Position;
  workspaceFolder: vscode.WorkspaceFolder;
  config: ExternalDocsConfig;
}

export interface SymbolEnumerationContext {
  document: vscode.TextDocument;
  workspaceFolder: vscode.WorkspaceFolder;
  config: ExternalDocsConfig;
}

export interface DocEntry {
  signature: string;
  normalizedSignature: string;
  body: string;
  range: vscode.Range;
  headingLine: number;
}

export interface ParsedDocFile {
  sourceRelativePath?: string;
  entries: DocEntry[];
}

export interface LanguageModule {
  id: string;
  languageIds: string[];
  canHandle(document: vscode.TextDocument): boolean;
  getLangBucket(document: vscode.TextDocument, config: ExternalDocsConfig): string;
  resolveSymbol(context: SymbolContext): Promise<ResolvedSymbol | null>;
  listSymbols(context: SymbolEnumerationContext): Promise<ResolvedSymbol[]>;
  createStub(symbol: ResolvedSymbol): string;
  normalizeSignature(signature: string): string;
  matchesEntry?(symbol: ResolvedSymbol, entry: DocEntry): boolean;
}

export interface CommandTarget {
  uri?: string;
  position?: { line: number; character: number };
}
