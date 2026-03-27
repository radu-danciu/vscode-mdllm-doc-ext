import * as path from 'path';
import * as vscode from 'vscode';
import { getConfig } from '../../src/core/config';
import { DocIndex, DocIndexMatchType } from '../../src/core/docIndex';
import { DocumentationService } from '../../src/core/documentationService';
import { LanguageRegistry } from '../../src/core/languageRegistry';
import { parseMarkdownEntries } from '../../src/core/markdownParser';
import { mapSourceToDocs } from '../../src/core/pathMapper';
import { DocEntry, LanguageModule, ResolvedSymbol } from '../../src/core/types';
import { normalizePosix } from '../../src/core/utils';
import { CppLanguageModule, CSharpLanguageModule, JsTsLanguageModule, PythonLanguageModule } from '../../src/languages';
import { getWorkspaceFolder, relativeFsPath, repoRoot } from '../helpers';

export type AuditDiagnosticCategory =
  | 'missing_docs'
  | 'lookup_failures'
  | 'high_confidence_partial_matches'
  | 'ambiguous_partial_matches'
  | 'unreferenced_docs'
  | 'doc_header_path_mismatches';

export interface RuntimeAuditCodeSymbol {
  symbol: ResolvedSymbol;
  module: LanguageModule;
  docsUri: vscode.Uri;
  docsRelativePath: string;
}

export interface RuntimeAuditDocumentedEntry {
  docsUri: vscode.Uri;
  docsRelativePath: string;
  sourceRelativePath?: string;
  signature: string;
  headingLine: number;
}

export interface RuntimeAuditMatch {
  codeSymbol: RuntimeAuditCodeSymbol;
  matchType: DocIndexMatchType;
  entry: DocEntry | null;
}

export interface RuntimeAuditDiagnostic {
  category: AuditDiagnosticCategory;
  sourceRelativePath?: string;
  docsRelativePath: string;
  codeSignature?: string;
  documentedSignature?: string;
  relatedSignatures?: string[];
  detail: string;
}

export interface RuntimeAuditResult {
  codeSymbols: RuntimeAuditCodeSymbol[];
  docsEntries: RuntimeAuditDocumentedEntry[];
  matches: RuntimeAuditMatch[];
  diagnostics: RuntimeAuditDiagnostic[];
}

const SOURCE_GLOBS = ['src/**/*', 'showcase/**/*'];
const AUDITED_PREFIXES = ['src/', 'showcase/'];

export async function runRuntimeAudit(): Promise<RuntimeAuditResult> {
  const workspaceFolder = getWorkspaceFolder();
  const config = getConfig(workspaceFolder);
  const registry = new LanguageRegistry([
    new CppLanguageModule(),
    new CSharpLanguageModule(),
    new JsTsLanguageModule(),
    new PythonLanguageModule()
  ]);
  const docIndex = new DocIndex();
  const documentationService = new DocumentationService(registry, docIndex);

  const codeSymbols = await collectCodeSymbols(workspaceFolder, registry);
  const docsEntries = await collectDocsEntries(workspaceFolder, config.docsRoot);
  const matches: RuntimeAuditMatch[] = [];
  const diagnostics: RuntimeAuditDiagnostic[] = [];
  const matchedDocKeys = new Set<string>();

  for (const codeSymbol of codeSymbols) {
    const match = await docIndex.findEntryDetailed(
      codeSymbol.docsUri,
      codeSymbol.symbol,
      codeSymbol.module
    );
    matches.push({
      codeSymbol,
      matchType: match.matchType,
      entry: match.entry
    });

    if (match.entry) {
      matchedDocKeys.add(docEntryKey(codeSymbol.docsUri, match.entry));
      continue;
    }

    const parsed = await docIndex.getParsedDoc(
      codeSymbol.docsUri,
      codeSymbol.module.normalizeSignature.bind(codeSymbol.module)
    );
    const closeMatches = classifyCloseMatches(codeSymbol.symbol, parsed?.entries ?? []);

    if (closeMatches.highConfidence.length === 1) {
      diagnostics.push({
        category: 'high_confidence_partial_matches',
        sourceRelativePath: codeSymbol.symbol.sourceRelativePath,
        docsRelativePath: codeSymbol.docsRelativePath,
        codeSignature: codeSymbol.symbol.canonicalSignature,
        documentedSignature: closeMatches.highConfidence[0].signature,
        relatedSignatures: closeMatches.highConfidence.map((entry) => entry.signature),
        detail: 'Runtime lookup did not resolve a close documentation entry in the mirrored file.'
      });
      continue;
    }

    if (closeMatches.highConfidence.length > 1 || closeMatches.ambiguous.length > 0) {
      diagnostics.push({
        category: 'ambiguous_partial_matches',
        sourceRelativePath: codeSymbol.symbol.sourceRelativePath,
        docsRelativePath: codeSymbol.docsRelativePath,
        codeSignature: codeSymbol.symbol.canonicalSignature,
        relatedSignatures: [...closeMatches.highConfidence, ...closeMatches.ambiguous].map(
          (entry) => entry.signature
        ),
        detail: 'Multiple plausible documentation entries exist, but runtime lookup did not resolve one deterministically.'
      });
      continue;
    }

    diagnostics.push({
      category: 'missing_docs',
      sourceRelativePath: codeSymbol.symbol.sourceRelativePath,
      docsRelativePath: codeSymbol.docsRelativePath,
      codeSignature: codeSymbol.symbol.canonicalSignature,
      detail: 'No mirrored documentation entry matched this runtime symbol.'
    });
  }

  const codeSymbolsBySource = groupBySourcePath(codeSymbols);
  const exactCodeKeys = new Set(
    codeSymbols.map((entry) => `${entry.symbol.sourceRelativePath}::${entry.symbol.canonicalSignature}`)
  );

  for (const docsEntry of docsEntries) {
    if (!isAuditedSourceRelativePath(docsEntry.sourceRelativePath)) {
      continue;
    }

    const sourceRelativePath = docsEntry.sourceRelativePath!;
    const sourceFilePath = path.join(
      workspaceFolder.uri.fsPath,
      ...config.codeRoot.split('/'),
      ...sourceRelativePath.split('/')
    );
    const sourceExists = await fileExists(vscode.Uri.file(sourceFilePath));
    if (!sourceExists) {
      diagnostics.push({
        category: 'doc_header_path_mismatches',
        sourceRelativePath,
        docsRelativePath: docsEntry.docsRelativePath,
        documentedSignature: docsEntry.signature,
        detail: 'The mirrored doc header points to a source file that does not exist inside the audited surface.'
      });
      continue;
    }

    const sourceDocument = await vscode.workspace.openTextDocument(vscode.Uri.file(sourceFilePath));
    const module = registry.getModuleForDocument(sourceDocument);
    if (!module) {
      diagnostics.push({
        category: 'doc_header_path_mismatches',
        sourceRelativePath,
        docsRelativePath: docsEntry.docsRelativePath,
        documentedSignature: docsEntry.signature,
        detail: 'The mirrored doc header points to a file that is not handled by a supported language module.'
      });
      continue;
    }

    const expectedMapping = mapSourceToDocs(
      workspaceFolder,
      sourceDocument.uri,
      config,
      module.getLangBucket(sourceDocument, config)
    );
    if (!expectedMapping || expectedMapping.docsUri.toString() !== docsEntry.docsUri.toString()) {
      diagnostics.push({
        category: 'doc_header_path_mismatches',
        sourceRelativePath,
        docsRelativePath: docsEntry.docsRelativePath,
        documentedSignature: docsEntry.signature,
        detail: 'The mirrored doc file path does not align with the source file declared in the header.'
      });
      continue;
    }

    if (matchedDocKeys.has(docEntryInventoryKey(docsEntry))) {
      continue;
    }

    const probeResult = await probeDocumentedEntry(
      documentationService,
      sourceDocument,
      docsEntry.signature
    );
    if (probeResult.matched) {
      matchedDocKeys.add(docEntryInventoryKey(docsEntry));
      continue;
    }

    if (probeResult.probesTried > 0) {
      diagnostics.push({
        category: 'lookup_failures',
        sourceRelativePath,
        docsRelativePath: docsEntry.docsRelativePath,
        documentedSignature: docsEntry.signature,
        relatedSignatures: probeResult.relatedSignatures,
        detail:
          'The documented symbol was found in source text, but runtime lookup did not resolve this entry from declaration probe positions.'
      });
      continue;
    }

    const matchingCodeSymbols = codeSymbolsBySource.get(sourceRelativePath) ?? [];
    const partialMatches = classifyCloseMatchesFromInventory(docsEntry.signature, matchingCodeSymbols);

    diagnostics.push({
      category: 'unreferenced_docs',
      sourceRelativePath,
      docsRelativePath: docsEntry.docsRelativePath,
      documentedSignature: docsEntry.signature,
      relatedSignatures: partialMatches.map((entry) => entry.symbol.canonicalSignature),
      detail:
        exactCodeKeys.has(`${sourceRelativePath}::${docsEntry.signature}`)
          ? 'The doc entry was not paired by the runtime audit even though an exact code signature exists.'
          : 'No code symbol in the audited surface references this mirrored documentation entry.'
    });
  }

  return {
    codeSymbols,
    docsEntries,
    matches,
    diagnostics: sortDiagnostics(diagnostics)
  };
}

export function formatRuntimeAuditDiagnostics(result: RuntimeAuditResult): string {
  if (result.diagnostics.length === 0) {
    return 'Runtime audit found no symbol-vs-doc mismatches.';
  }

  const byCategory = new Map<AuditDiagnosticCategory, RuntimeAuditDiagnostic[]>();
  for (const diagnostic of result.diagnostics) {
    const bucket = byCategory.get(diagnostic.category) ?? [];
    bucket.push(diagnostic);
    byCategory.set(diagnostic.category, bucket);
  }

  const sections: string[] = [];
  for (const category of [
    'missing_docs',
    'lookup_failures',
    'high_confidence_partial_matches',
    'ambiguous_partial_matches',
    'unreferenced_docs',
    'doc_header_path_mismatches'
  ] as AuditDiagnosticCategory[]) {
    const diagnostics = byCategory.get(category);
    if (!diagnostics || diagnostics.length === 0) {
      continue;
    }

    sections.push(`${category}:`);
    for (const diagnostic of diagnostics) {
      const identity = diagnostic.codeSignature ?? diagnostic.documentedSignature ?? '(unknown symbol)';
      sections.push(
        `- ${diagnostic.sourceRelativePath ?? '(no source header)'} :: ${identity} -> ${diagnostic.docsRelativePath}`
      );
      sections.push(`  ${diagnostic.detail}`);
      if (diagnostic.relatedSignatures && diagnostic.relatedSignatures.length > 0) {
        sections.push(`  related: ${diagnostic.relatedSignatures.join(' | ')}`);
      }
    }
  }

  return sections.join('\n');
}

function sortDiagnostics(diagnostics: RuntimeAuditDiagnostic[]): RuntimeAuditDiagnostic[] {
  return [...diagnostics].sort((left, right) => {
    const leftKey = `${left.category}:${left.sourceRelativePath ?? ''}:${left.codeSignature ?? left.documentedSignature ?? ''}`;
    const rightKey = `${right.category}:${right.sourceRelativePath ?? ''}:${right.codeSignature ?? right.documentedSignature ?? ''}`;
    return leftKey.localeCompare(rightKey);
  });
}

async function collectCodeSymbols(
  workspaceFolder: vscode.WorkspaceFolder,
  registry: LanguageRegistry
): Promise<RuntimeAuditCodeSymbol[]> {
  const config = getConfig(workspaceFolder);
  const results: RuntimeAuditCodeSymbol[] = [];

  for (const pattern of SOURCE_GLOBS) {
    const files = await vscode.workspace.findFiles(new vscode.RelativePattern(workspaceFolder, pattern));
    for (const file of files) {
      if (path.basename(file.fsPath).startsWith('.')) {
        continue;
      }

      const document = await vscode.workspace.openTextDocument(file);
      const module = registry.getModuleForDocument(document);
      if (!module) {
        continue;
      }

      const mapping = mapSourceToDocs(
        workspaceFolder,
        file,
        config,
        module.getLangBucket(document, config)
      );
      if (!mapping || !isAuditedSourceRelativePath(mapping.sourceRelativePath)) {
        continue;
      }

      const symbols = await module.listSymbols({
        document,
        workspaceFolder,
        config
      });

      for (const symbol of symbols) {
        results.push({
          symbol,
          module,
          docsUri: mapping.docsUri,
          docsRelativePath: relativeFsPath(mapping.docsUri)
        });
      }
    }
  }

  return results.sort((left, right) =>
    `${left.symbol.sourceRelativePath}:${left.symbol.canonicalSignature}`.localeCompare(
      `${right.symbol.sourceRelativePath}:${right.symbol.canonicalSignature}`
    )
  );
}

async function collectDocsEntries(
  workspaceFolder: vscode.WorkspaceFolder,
  docsRoot: string
): Promise<RuntimeAuditDocumentedEntry[]> {
  const files = await vscode.workspace.findFiles(
    new vscode.RelativePattern(workspaceFolder, `${docsRoot}/**/*.md`)
  );
  const results: RuntimeAuditDocumentedEntry[] = [];

  for (const file of files) {
    const content = Buffer.from(await vscode.workspace.fs.readFile(file)).toString('utf8');
    const parsed = parseMarkdownEntries(content, (signature) => signature);
    for (const entry of parsed.entries) {
      results.push({
        docsUri: file,
        docsRelativePath: relativeFsPath(file),
        sourceRelativePath: parsed.sourceRelativePath,
        signature: entry.signature,
        headingLine: entry.headingLine
      });
    }
  }

  return results.sort((left, right) =>
    `${left.sourceRelativePath ?? ''}:${left.signature}`.localeCompare(
      `${right.sourceRelativePath ?? ''}:${right.signature}`
    )
  );
}

function groupBySourcePath(
  codeSymbols: RuntimeAuditCodeSymbol[]
): Map<string, RuntimeAuditCodeSymbol[]> {
  const grouped = new Map<string, RuntimeAuditCodeSymbol[]>();
  for (const entry of codeSymbols) {
    const bucket = grouped.get(entry.symbol.sourceRelativePath) ?? [];
    bucket.push(entry);
    grouped.set(entry.symbol.sourceRelativePath, bucket);
  }
  return grouped;
}

function isAuditedSourceRelativePath(sourceRelativePath?: string): boolean {
  if (!sourceRelativePath) {
    return false;
  }

  return AUDITED_PREFIXES.some((prefix) => normalizePosix(sourceRelativePath).startsWith(prefix));
}

function docEntryKey(docsUri: vscode.Uri, entry: DocEntry): string {
  return `${docsUri.toString()}::${entry.headingLine}::${entry.signature}`;
}

function docEntryInventoryKey(entry: RuntimeAuditDocumentedEntry): string {
  return `${entry.docsUri.toString()}::${entry.headingLine}::${entry.signature}`;
}

function classifyCloseMatches(
  symbol: ResolvedSymbol,
  entries: readonly DocEntry[]
): { highConfidence: DocEntry[]; ambiguous: DocEntry[] } {
  const highConfidence = entries.filter(
    (entry) =>
      canonicalHead(entry.signature) === canonicalHead(symbol.canonicalSignature) &&
      signatureArity(entry.signature) === symbol.arity
  );
  if (highConfidence.length > 0) {
    return { highConfidence, ambiguous: [] };
  }

  const ambiguous = entries.filter(
    (entry) =>
      signatureName(entry.signature) === symbol.lookupName ||
      canonicalHead(entry.signature) === canonicalHead(symbol.canonicalSignature)
  );

  return { highConfidence: [], ambiguous };
}

function classifyCloseMatchesFromInventory(
  documentedSignature: string,
  symbols: readonly RuntimeAuditCodeSymbol[]
): RuntimeAuditCodeSymbol[] {
  const highConfidence = symbols.filter(
    (entry) =>
      canonicalHead(entry.symbol.canonicalSignature) === canonicalHead(documentedSignature) &&
      entry.symbol.arity === signatureArity(documentedSignature)
  );
  if (highConfidence.length > 0) {
    return highConfidence;
  }

  return symbols.filter(
    (entry) =>
      signatureName(entry.symbol.canonicalSignature) === signatureName(documentedSignature) ||
      canonicalHead(entry.symbol.canonicalSignature) === canonicalHead(documentedSignature)
  );
}

function canonicalHead(signature: string): string {
  const beforeArgs = signature.split('(')[0] ?? signature;
  const parts = beforeArgs.trim().split(/\s+/).filter(Boolean);
  return parts[parts.length - 1] ?? beforeArgs.trim();
}

function signatureName(signature: string): string {
  const beforeArgs = signature.split('(')[0] ?? signature;
  const parts = beforeArgs.split(/[\s.:]+/).filter(Boolean);
  return parts[parts.length - 1] ?? beforeArgs.trim();
}

function signatureArity(signature: string): number | undefined {
  const match = signature.match(/\((.*)\)/);
  if (!match) {
    return undefined;
  }

  const inside = match[1].trim();
  if (!inside) {
    return 0;
  }

  return splitTopLevel(inside).length;
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

async function fileExists(uri: vscode.Uri): Promise<boolean> {
  try {
    await vscode.workspace.fs.stat(uri);
    return true;
  } catch {
    return false;
  }
}

export async function writeRuntimeAuditReport(): Promise<void> {
  const result = await runRuntimeAudit();
  const report = formatRuntimeAuditDiagnostics(result);
  process.stdout.write(`${report}\n`);
  process.stdout.write(`Audited workspace: ${repoRoot()}\n`);
}

interface ParsedSignatureForProbe {
  head: string;
  symbolName: string;
  params: Array<{ name: string; type?: string }>;
  returnType?: string;
}

interface ProbeOutcome {
  matched: boolean;
  probesTried: number;
  relatedSignatures: string[];
}

async function probeDocumentedEntry(
  documentationService: DocumentationService,
  document: vscode.TextDocument,
  documentedSignature: string
): Promise<ProbeOutcome> {
  const parsed = parseDocumentedSignature(documentedSignature);
  const namePositions = findWordPositions(document, parsed.symbolName);
  const relatedSignatures = new Set<string>();
  let probesTried = 0;

  for (const position of namePositions) {
    probesTried += 1;
    const candidates = await documentationService.resolveDocumentationCandidates(
      document,
      position,
      3
    );
    const directMatch = candidates.find(
      (candidate) =>
        candidate.source === 'direct' && candidate.entry?.signature === documentedSignature
    );
    if (!directMatch) {
      collectRelatedSignatures(relatedSignatures, candidates);
      continue;
    }

    const extraProbePositions = collectExtraProbePositions(
      document,
      directMatch.target.symbol.declarationRange ?? directMatch.target.symbol.symbolRange,
      parsed
    );
    let extraProbeFailed = false;

    for (const extraPosition of extraProbePositions) {
      probesTried += 1;
      const extraCandidates = await documentationService.resolveDocumentationCandidates(
        document,
        extraPosition,
        3
      );
      const extraMatch = extraCandidates.find(
        (candidate) =>
          candidate.source === 'direct' && candidate.entry?.signature === documentedSignature
      );
      if (!extraMatch) {
        collectRelatedSignatures(relatedSignatures, extraCandidates);
        extraProbeFailed = true;
      }
    }

    if (!extraProbeFailed) {
      return {
        matched: true,
        probesTried,
        relatedSignatures: [...relatedSignatures]
      };
    }
  }

  return {
    matched: false,
    probesTried,
    relatedSignatures: [...relatedSignatures]
  };
}

function parseDocumentedSignature(signature: string): ParsedSignatureForProbe {
  const beforeReturn = signature.split(' -> ')[0] ?? signature;
  const [headPart, paramsPart] = beforeReturn.split('(');
  const symbolName = signatureName(signature);
  const params =
    headPart && paramsPart !== undefined
      ? splitTopLevel(paramsPart.replace(/\)\s*$/, ''))
          .filter(Boolean)
          .map((part) => {
            const [name, type] = part.split(':');
            return {
              name: (name ?? '').trim(),
              type: type?.trim()
            };
          })
      : [];

  return {
    head: (headPart ?? signature).trim(),
    symbolName,
    params,
    returnType: signature.includes(' -> ') ? signature.split(' -> ').slice(1).join(' -> ').trim() : undefined
  };
}

function findWordPositions(document: vscode.TextDocument, token: string): vscode.Position[] {
  if (!token) {
    return [];
  }

  const positions: vscode.Position[] = [];
  const pattern = new RegExp(`\\b${escapeRegex(token)}\\b`, 'g');
  const text = document.getText();
  let match: RegExpExecArray | null = null;

  while ((match = pattern.exec(text)) !== null) {
    positions.push(document.positionAt(match.index));
  }

  return positions;
}

function collectExtraProbePositions(
  document: vscode.TextDocument,
  range: vscode.Range,
  parsed: ParsedSignatureForProbe
): vscode.Position[] {
  const positions: vscode.Position[] = [];
  const seen = new Set<string>();

  const firstParam = parsed.params[0];
  if (firstParam) {
    const paramToken = selectProbeToken(firstParam.type) ?? firstParam.name.replace(/\?$/, '');
    addProbePosition(document, range, paramToken, seen, positions);
  }

  const returnToken = selectProbeToken(parsed.returnType);
  addProbePosition(document, range, returnToken, seen, positions);

  return positions;
}

function addProbePosition(
  document: vscode.TextDocument,
  range: vscode.Range,
  token: string | undefined,
  seen: Set<string>,
  positions: vscode.Position[]
): void {
  if (!token) {
    return;
  }

  const position = findTokenInRange(document, range, token);
  if (!position) {
    return;
  }

  const key = `${position.line}:${position.character}`;
  if (seen.has(key)) {
    return;
  }

  seen.add(key);
  positions.push(position);
}

function findTokenInRange(
  document: vscode.TextDocument,
  range: vscode.Range,
  token: string
): vscode.Position | null {
  if (!token) {
    return null;
  }

  const startOffset = document.offsetAt(range.start);
  const endOffset = document.offsetAt(range.end);
  const text = document.getText().slice(startOffset, endOffset);
  const pattern = new RegExp(`\\b${escapeRegex(token)}\\b`);
  const match = pattern.exec(text);
  if (!match) {
    return null;
  }

  return document.positionAt(startOffset + match.index);
}

function selectProbeToken(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  const identifiers = value.match(/[A-Za-z_]\w*/g) ?? [];
  return identifiers[0];
}

function collectRelatedSignatures(
  bucket: Set<string>,
  candidates: readonly {
    target: { symbol: { canonicalSignature: string } };
    entry: DocEntry | null;
  }[]
): void {
  for (const candidate of candidates) {
    if (candidate.entry?.signature) {
      bucket.add(candidate.entry.signature);
      continue;
    }

    bucket.add(candidate.target.symbol.canonicalSignature);
  }
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
