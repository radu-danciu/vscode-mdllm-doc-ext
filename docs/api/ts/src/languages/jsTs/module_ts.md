## src/languages/jsTs/module.ts

### `JsTsLanguageModule`

Brief: JavaScript and TypeScript resolver backed by the TypeScript AST.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `JsTsLanguageModule.canHandle(document: vscode.TextDocument) -> boolean`

Brief: Reports whether the module handles the current document.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `JsTsLanguageModule.getLangBucket(document: vscode.TextDocument, config: ExternalDocsConfig) -> string`

Brief: Returns the configured JS or TS docs bucket.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `JsTsLanguageModule.resolveSymbol(context: SymbolContext) -> Promise<ResolvedSymbol | null>`

Brief: Resolves a JavaScript or TypeScript symbol at the current position.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `JsTsLanguageModule.resolveUsageSymbol(context: SymbolContext) -> Promise<ResolvedSymbol | null>`

Brief: Resolves a conservative JavaScript or TypeScript usage-site symbol when declaration lookup is unavailable.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `JsTsLanguageModule.listSymbols(context: SymbolEnumerationContext) -> Promise<ResolvedSymbol[]>`

Brief: Enumerates JavaScript and TypeScript symbols in a file.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `JsTsLanguageModule.createStub(symbol: ResolvedSymbol) -> string`

Brief: Builds a mirrored docs stub for a JavaScript or TypeScript symbol.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `JsTsLanguageModule.normalizeSignature(signature: string) -> string`

Brief: Normalizes JavaScript and TypeScript signatures for lookup.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `JsTsLanguageModule.matchesEntry(symbol: ResolvedSymbol, entry: { signature: string }) -> boolean`

Brief: Fallback entry matcher for JS and TS docs.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `parseJsTsDocument(document: vscode.TextDocument) -> ParsedSymbolCandidate[]`

Brief: Parses a JavaScript or TypeScript source file into candidate declarations.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `findConstructorUsageCandidate(document: vscode.TextDocument, position: vscode.Position) -> ParsedSymbolCandidate | null`

Brief: Resolves a same-file constructor usage to the owning class candidate.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `collectStatementCandidates(document: vscode.TextDocument, sourceFile: ts.SourceFile, statement: ts.Statement, candidates: ParsedSymbolCandidate[]) -> void`

Brief: Collects candidates from a top-level source statement.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `collectVariableCandidates(document: vscode.TextDocument, sourceFile: ts.SourceFile, declaration: ts.VariableDeclaration, candidates: ParsedSymbolCandidate[]) -> void`

Brief: Collects candidates from an object-like variable declaration.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `collectClassMemberCandidates(document: vscode.TextDocument, sourceFile: ts.SourceFile, className: string, classSignature: string, member: ts.ClassElement, candidates: ParsedSymbolCandidate[]) -> void`

Brief: Collects candidates from a class member declaration.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `collectInterfaceMemberCandidates(document: vscode.TextDocument, sourceFile: ts.SourceFile, interfaceName: string, member: ts.TypeElement, candidates: ParsedSymbolCandidate[]) -> void`

Brief: Collects candidates from an interface member declaration.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `createCallableCandidate(document: vscode.TextDocument, sourceFile: ts.SourceFile, nameNode: ts.DeclarationName, node: | ts.FunctionDeclaration | ts.MethodDeclaration | ts.MethodSignature | ts.FunctionExpression | ts.ArrowFunction | ts.GetAccessorDeclaration | ts.SetAccessorDeclaration, container: string | undefined, kind: ParsedSymbolCandidate['kind']) -> ParsedSymbolCandidate`

Brief: Builds a parsed callable candidate from an AST node.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `createTypeCandidate(document: vscode.TextDocument, sourceFile: ts.SourceFile, nameNode: ts.Identifier, signature: string, inheritanceChain?: string[]) -> ParsedSymbolCandidate`

Brief: Builds a parsed type candidate from an AST node.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `createObjectCandidate(document: vscode.TextDocument, sourceFile: ts.SourceFile, nameNode: ts.Identifier) -> ParsedSymbolCandidate`

Brief: Builds a parsed object candidate from an AST node.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `rangeForNode(document: vscode.TextDocument, node: ts.Node) -> vscode.Range`

Brief: Converts an AST node span into a VS Code range.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `declarationRangeForNode(document: vscode.TextDocument, sourceFile: ts.SourceFile, node: | ts.FunctionDeclaration | ts.MethodDeclaration | ts.MethodSignature | ts.FunctionExpression | ts.ArrowFunction | ts.GetAccessorDeclaration | ts.SetAccessorDeclaration) -> vscode.Range`

Brief: Builds the signature-only declaration range for a callable AST node.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `declarationRangeUntilToken(document: vscode.TextDocument, sourceFile: ts.SourceFile, node: ts.Node, tokens: string[]) -> vscode.Range`

Brief: Builds a declaration range that stops before specific tokens.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `renderCallableName(nameNode: ts.DeclarationName, node: | ts.FunctionDeclaration | ts.MethodDeclaration | ts.MethodSignature | ts.FunctionExpression | ts.ArrowFunction | ts.GetAccessorDeclaration | ts.SetAccessorDeclaration) -> string`

Brief: Renders a callable name, including generic parameters when present.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `renderTypeName(name: string, typeParameters?: ts.NodeArray<ts.TypeParameterDeclaration>) -> string`

Brief: Renders a type name with generic parameters when present.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `renderParameterName(name: ts.BindingName, questionToken?: ts.QuestionToken) -> string`

Brief: Renders a parameter name, preserving optional markers.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `renderReturnType(node: | ts.FunctionDeclaration | ts.MethodDeclaration | ts.MethodSignature | ts.FunctionExpression | ts.ArrowFunction | ts.GetAccessorDeclaration | ts.SetAccessorDeclaration, sourceFile: ts.SourceFile) -> string | undefined`

Brief: Renders a normalized callable return type from an AST node.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `findInnermostNodeAtOffset(node: ts.Node, offset: number) -> ts.Node | null`

Brief: Finds the deepest AST node containing a document offset.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `collectHeritage(heritageClauses?: ts.NodeArray<ts.HeritageClause>) -> string[] | undefined`

Brief: Collects normalized heritage clause entries from a type declaration.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `buildCallableSignature(name: string, container: string | undefined, params: Array<{ name: string; type?: string }>, returnType?: string) -> string`

Brief: Builds the canonical callable signature for a JS or TS symbol.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `declarationNameText(name: ts.DeclarationName) -> string`

Brief: Renders a declaration name into canonical text.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `isNamedDeclarationName(name: ts.DeclarationName) -> name is ts.Identifier | ts.StringLiteral | ts.NumericLiteral | ts.PrivateIdentifier`

Brief: Narrows AST declaration names to the supported named forms.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `toResolvedSymbol(context: SymbolEnumerationContext, candidate: ParsedSymbolCandidate) -> ResolvedSymbol`

Brief: Promotes a parsed JS or TS candidate into a resolved symbol.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `scriptKindFor(languageId: string) -> ts.ScriptKind`

Brief: Maps a VS Code language id to a TypeScript script kind.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `stripGenericSuffix(value: string) -> string`

Brief: Removes the trailing generic suffix from a symbol name for fallback matching.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---
