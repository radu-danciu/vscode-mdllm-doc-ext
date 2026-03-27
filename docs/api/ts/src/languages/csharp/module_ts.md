## src/languages/csharp/module.ts

### `CSharpLanguageModule`

Brief: C# resolver backed by deterministic text parsing.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `CSharpLanguageModule.canHandle(document: vscode.TextDocument) -> boolean`

Brief: Reports whether the module handles the current document.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `CSharpLanguageModule.getLangBucket(_document: vscode.TextDocument, config: ExternalDocsConfig) -> string`

Brief: Returns the configured C# docs bucket.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `CSharpLanguageModule.resolveSymbol(context: SymbolContext) -> Promise<ResolvedSymbol | null>`

Brief: Resolves a C# symbol at the current position.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `CSharpLanguageModule.listSymbols(context: SymbolEnumerationContext) -> Promise<ResolvedSymbol[]>`

Brief: Enumerates C# symbols in a file.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `CSharpLanguageModule.createStub(symbol: ResolvedSymbol) -> string`

Brief: Builds a mirrored docs stub for a C# symbol.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `CSharpLanguageModule.normalizeSignature(signature: string) -> string`

Brief: Normalizes C# signature spacing for lookup.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `CSharpLanguageModule.matchesEntry(symbol: ResolvedSymbol, entry: { signature: string }) -> boolean`

Brief: Fallback entry matcher for C# docs.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `parseCSharpDocument(document: vscode.TextDocument) -> ParsedSymbolCandidate[]`

Brief: Parses a C# source file into candidate declarations.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `renderCSharpParams(params: Array<{ name: string; type?: string }>) -> string`

Brief: Renders normalized C# parameter metadata.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `extractGenericValues(value?: string) -> Array<{ name: string; value: string }> | undefined`

Brief: Extracts generic argument values from a C# type string.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `countOpenBraces(value: string) -> number`

Brief: Counts opening braces in a source line.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `countCloseBraces(value: string) -> number`

Brief: Counts closing braces in a source line.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `toResolvedSymbol(context: SymbolEnumerationContext, candidate: ParsedSymbolCandidate) -> ResolvedSymbol`

Brief: Promotes a parsed C# candidate into a resolved symbol.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---
