import * as ts from 'typescript';
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
  ParsedSymbolCandidate,
  rangeContains,
  selectBestCandidate,
  signatureArity,
  signatureName
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
    const candidates = parseJsTsDocument(context.document);
    const candidate = selectBestCandidate(candidates, context.position);
    if (!candidate) {
      return null;
    }

    return toResolvedSymbol(context, candidate);
  }

  public async listSymbols(context: SymbolEnumerationContext): Promise<ResolvedSymbol[]> {
    return parseJsTsDocument(context.document).map((candidate) => toResolvedSymbol(context, candidate));
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
  const sourceFile = ts.createSourceFile(
    document.fileName,
    document.getText(),
    ts.ScriptTarget.Latest,
    true,
    scriptKindFor(document.languageId)
  );
  const candidates: ParsedSymbolCandidate[] = [];

  for (const statement of sourceFile.statements) {
    collectStatementCandidates(document, sourceFile, statement, candidates);
  }

  return candidates;
}

function collectStatementCandidates(
  document: vscode.TextDocument,
  sourceFile: ts.SourceFile,
  statement: ts.Statement,
  candidates: ParsedSymbolCandidate[]
): void {
  if (ts.isFunctionDeclaration(statement) && statement.name) {
    candidates.push(
      createCallableCandidate(document, sourceFile, statement.name, statement, undefined, 'function')
    );
    return;
  }

  if (ts.isClassDeclaration(statement) && statement.name) {
    const className = statement.name.text;
    candidates.push(
      createTypeCandidate(
        document,
        sourceFile,
        statement.name,
        renderTypeName(className, statement.typeParameters),
        collectHeritage(statement.heritageClauses)
      )
    );
    for (const member of statement.members) {
      collectClassMemberCandidates(document, sourceFile, className, member, candidates);
    }
    return;
  }

  if (ts.isInterfaceDeclaration(statement)) {
    const interfaceName = statement.name.text;
    candidates.push(
      createTypeCandidate(
        document,
        sourceFile,
        statement.name,
        renderTypeName(interfaceName, statement.typeParameters),
        collectHeritage(statement.heritageClauses)
      )
    );
    for (const member of statement.members) {
      collectInterfaceMemberCandidates(document, sourceFile, interfaceName, member, candidates);
    }
    return;
  }

  if (ts.isTypeAliasDeclaration(statement)) {
    candidates.push(
      createTypeCandidate(
        document,
        sourceFile,
        statement.name,
        renderTypeName(statement.name.text, statement.typeParameters)
      )
    );
    return;
  }

  if (ts.isVariableStatement(statement)) {
    for (const declaration of statement.declarationList.declarations) {
      collectVariableCandidates(document, sourceFile, declaration, candidates);
    }
  }
}

function collectVariableCandidates(
  document: vscode.TextDocument,
  sourceFile: ts.SourceFile,
  declaration: ts.VariableDeclaration,
  candidates: ParsedSymbolCandidate[]
): void {
  if (!ts.isIdentifier(declaration.name)) {
    return;
  }

  if (!declaration.initializer || !ts.isObjectLiteralExpression(declaration.initializer)) {
    return;
  }

  const objectName = declaration.name.text;
  candidates.push(
    createObjectCandidate(document, sourceFile, declaration.name)
  );

  for (const property of declaration.initializer.properties) {
    if (ts.isMethodDeclaration(property) && property.name && isNamedDeclarationName(property.name)) {
      candidates.push(
        createCallableCandidate(
          document,
          sourceFile,
          property.name,
          property,
          objectName,
          'function'
        )
      );
      continue;
    }

    if (
      ts.isPropertyAssignment(property) &&
      isNamedDeclarationName(property.name) &&
      (ts.isFunctionExpression(property.initializer) || ts.isArrowFunction(property.initializer))
    ) {
      candidates.push(
        createCallableCandidate(
          document,
          sourceFile,
          property.name,
          property.initializer,
          objectName,
          'function'
        )
      );
    }
  }
}

function collectClassMemberCandidates(
  document: vscode.TextDocument,
  sourceFile: ts.SourceFile,
  className: string,
  member: ts.ClassElement,
  candidates: ParsedSymbolCandidate[]
): void {
  if (ts.isConstructorDeclaration(member) || !('name' in member) || !member.name) {
    return;
  }

  if (!isNamedDeclarationName(member.name)) {
    return;
  }

  if (
    ts.isMethodDeclaration(member) ||
    ts.isGetAccessorDeclaration(member) ||
    ts.isSetAccessorDeclaration(member)
  ) {
    candidates.push(
      createCallableCandidate(document, sourceFile, member.name, member, className, 'method')
    );
  }
}

function collectInterfaceMemberCandidates(
  document: vscode.TextDocument,
  sourceFile: ts.SourceFile,
  interfaceName: string,
  member: ts.TypeElement,
  candidates: ParsedSymbolCandidate[]
): void {
  if (!('name' in member) || !member.name || !isNamedDeclarationName(member.name)) {
    return;
  }

  if (ts.isMethodSignature(member)) {
    candidates.push(
      createCallableCandidate(document, sourceFile, member.name, member, interfaceName, 'method')
    );
  }
}

function createCallableCandidate(
  document: vscode.TextDocument,
  sourceFile: ts.SourceFile,
  nameNode: ts.DeclarationName,
  node:
    | ts.FunctionDeclaration
    | ts.MethodDeclaration
    | ts.MethodSignature
    | ts.FunctionExpression
    | ts.ArrowFunction
    | ts.GetAccessorDeclaration
    | ts.SetAccessorDeclaration,
  container: string | undefined,
  kind: ParsedSymbolCandidate['kind']
): ParsedSymbolCandidate {
  const renderedName = renderCallableName(nameNode, node);
  const params = node.parameters.map((parameter) => ({
    name: renderParameterName(parameter.name, parameter.questionToken),
    type: parameter.type ? normalizeWhitespace(parameter.type.getText(sourceFile)) : undefined
  }));
  const returnType = renderReturnType(node, sourceFile);
  const signature = buildCallableSignature(renderedName, container, params, returnType);

  return {
    name: renderedName,
    kind,
    container,
    signature,
    range: rangeForNode(document, nameNode),
    declarationRange: declarationRangeForNode(document, sourceFile, node),
    params,
    returnType
  };
}

function createTypeCandidate(
  document: vscode.TextDocument,
  sourceFile: ts.SourceFile,
  nameNode: ts.Identifier,
  signature: string,
  inheritanceChain?: string[]
): ParsedSymbolCandidate {
  return {
    name: signature,
    kind: 'type',
    signature,
    range: rangeForNode(document, nameNode),
    declarationRange: declarationRangeUntilToken(document, sourceFile, nameNode.parent, ['{', '=']),
    inheritanceChain
  };
}

function createObjectCandidate(
  document: vscode.TextDocument,
  sourceFile: ts.SourceFile,
  nameNode: ts.Identifier
): ParsedSymbolCandidate {
  return {
    name: nameNode.text,
    kind: 'object',
    signature: nameNode.text,
    range: rangeForNode(document, nameNode),
    declarationRange: declarationRangeUntilToken(document, sourceFile, nameNode.parent.parent, ['{'])
  };
}

function rangeForNode(document: vscode.TextDocument, node: ts.Node): vscode.Range {
  return new vscode.Range(
    document.positionAt(node.getStart()),
    document.positionAt(node.getEnd())
  );
}

function declarationRangeForNode(
  document: vscode.TextDocument,
  sourceFile: ts.SourceFile,
  node:
    | ts.FunctionDeclaration
    | ts.MethodDeclaration
    | ts.MethodSignature
    | ts.FunctionExpression
    | ts.ArrowFunction
    | ts.GetAccessorDeclaration
    | ts.SetAccessorDeclaration
): vscode.Range {
  if ('body' in node && node.body) {
    return new vscode.Range(
      document.positionAt(node.getStart(sourceFile)),
      document.positionAt(Math.max(node.body.getFullStart() - 1, node.getStart(sourceFile)))
    );
  }

  return new vscode.Range(
    document.positionAt(node.getStart(sourceFile)),
    document.positionAt(node.getEnd())
  );
}

function declarationRangeUntilToken(
  document: vscode.TextDocument,
  sourceFile: ts.SourceFile,
  node: ts.Node,
  tokens: string[]
): vscode.Range {
  const start = node.getStart(sourceFile);
  const text = sourceFile.getFullText().slice(start, node.getEnd());
  let endOffset = text.length;

  for (const token of tokens) {
    const index = text.indexOf(token);
    if (index !== -1) {
      endOffset = Math.min(endOffset, index);
    }
  }

  return new vscode.Range(
    document.positionAt(start),
    document.positionAt(start + endOffset)
  );
}

function renderCallableName(
  nameNode: ts.DeclarationName,
  node:
    | ts.FunctionDeclaration
    | ts.MethodDeclaration
    | ts.MethodSignature
    | ts.FunctionExpression
    | ts.ArrowFunction
    | ts.GetAccessorDeclaration
    | ts.SetAccessorDeclaration
): string {
  const baseName = declarationNameText(nameNode);
  const typeParameters =
    'typeParameters' in node && node.typeParameters
      ? `<${node.typeParameters.map((parameter) => normalizeWhitespace(parameter.getText())).join(', ')}>`
      : '';
  return `${baseName}${typeParameters}`;
}

function renderTypeName(
  name: string,
  typeParameters?: ts.NodeArray<ts.TypeParameterDeclaration>
): string {
  if (!typeParameters || typeParameters.length === 0) {
    return name;
  }

  return `${name}<${typeParameters.map((parameter) => normalizeWhitespace(parameter.getText())).join(', ')}>`;
}

function renderParameterName(
  name: ts.BindingName,
  questionToken?: ts.QuestionToken
): string {
  const rendered = name.getText();
  return questionToken ? `${rendered}?` : rendered;
}

function renderReturnType(
  node:
    | ts.FunctionDeclaration
    | ts.MethodDeclaration
    | ts.MethodSignature
    | ts.FunctionExpression
    | ts.ArrowFunction
    | ts.GetAccessorDeclaration
    | ts.SetAccessorDeclaration,
  sourceFile: ts.SourceFile
): string | undefined {
  if ('type' in node && node.type) {
    return normalizeWhitespace(node.type.getText(sourceFile));
  }

  return undefined;
}

function collectHeritage(
  heritageClauses?: ts.NodeArray<ts.HeritageClause>
): string[] | undefined {
  const heritage = heritageClauses
    ?.flatMap((clause) => clause.types.map((type) => normalizeWhitespace(type.getText())))
    .filter(Boolean);
  return heritage && heritage.length > 0 ? heritage : undefined;
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

function declarationNameText(name: ts.DeclarationName): string {
  if (ts.isIdentifier(name) || ts.isPrivateIdentifier(name)) {
    return name.text;
  }

  return name.getText();
}

function isNamedDeclarationName(
  name: ts.DeclarationName
): name is ts.Identifier | ts.StringLiteral | ts.NumericLiteral | ts.PrivateIdentifier {
  return (
    ts.isIdentifier(name) ||
    ts.isStringLiteral(name) ||
    ts.isNumericLiteral(name) ||
    ts.isPrivateIdentifier(name)
  );
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
    lookupName: stripGenericSuffix(signatureName(candidate.signature)),
    arity: signatureArity(candidate.signature)
  };
}

function scriptKindFor(languageId: string): ts.ScriptKind {
  switch (languageId) {
    case 'javascript':
      return ts.ScriptKind.JS;
    case 'javascriptreact':
      return ts.ScriptKind.JSX;
    case 'typescriptreact':
      return ts.ScriptKind.TSX;
    default:
      return ts.ScriptKind.TS;
  }
}

function stripGenericSuffix(value: string): string {
  return value.replace(/<.*>$/, '');
}
