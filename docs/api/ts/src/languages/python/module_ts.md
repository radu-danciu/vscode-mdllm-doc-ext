## src/languages/python/module.ts

### `PythonLanguageModule`

Brief: Python resolver backed by deterministic text parsing.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `PythonLanguageModule.canHandle(document: vscode.TextDocument) -> boolean`

Brief: Reports whether the module handles the current document.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `PythonLanguageModule.getLangBucket(_document: vscode.TextDocument, config: ExternalDocsConfig) -> string`

Brief: Returns the configured Python docs bucket.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `PythonLanguageModule.resolveSymbol(context: SymbolContext) -> Promise<ResolvedSymbol | null>`

Brief: Resolves a Python symbol at the current position.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `PythonLanguageModule.listSymbols(context: SymbolEnumerationContext) -> Promise<ResolvedSymbol[]>`

Brief: Enumerates Python symbols in a file.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `PythonLanguageModule.createStub(symbol: ResolvedSymbol) -> string`

Brief: Builds a mirrored docs stub for a Python symbol.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `PythonLanguageModule.normalizeSignature(signature: string) -> string`

Brief: Normalizes Python signature spacing for lookup.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `PythonLanguageModule.matchesEntry(symbol: ResolvedSymbol, entry: { signature: string }) -> boolean`

Brief: Fallback entry matcher for Python docs.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `parsePythonDocument(document: vscode.TextDocument, context: SymbolEnumerationContext) -> ParsedSymbolCandidate[]`

Brief: Parses a Python source file into candidate declarations.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `extractTemplateValues(value?: string) -> Array<{ name: string; value: string }> | undefined`

Brief: Extracts template-like values from a Python type string.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `toResolvedSymbol(context: SymbolEnumerationContext, candidate: ParsedSymbolCandidate) -> ResolvedSymbol`

Brief: Promotes a parsed Python candidate into a resolved symbol.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---
