## src/core/types.ts

### `SymbolKind`

Brief: Supported source symbol categories.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `OpenMode`

Brief: Documentation open modes.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `ExternalDocsConfig`

Brief: Normalized extension configuration.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `SymbolParam`

Brief: Normalized parameter metadata.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `FrozenTypeArgument`

Brief: Captured template or generic argument substitution.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `ResolvedSymbol`

Brief: Canonical resolved source symbol metadata.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `SymbolContext`

Brief: Lookup context for resolving a single symbol at a position.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `SymbolEnumerationContext`

Brief: Lookup context for enumerating all symbols in a file.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `DocEntry`

Brief: Parsed Markdown documentation entry.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `ParsedDocFile`

Brief: Parsed mirrored docs file with source header and entries.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `LanguageModule`

Brief: Language-specific source resolver contract.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `LanguageModule.canHandle(document: vscode.TextDocument) -> boolean`

Brief: Reports whether the module handles a document.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `LanguageModule.getLangBucket(document: vscode.TextDocument, config: ExternalDocsConfig) -> string`

Brief: Returns the configured docs bucket for a document.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `LanguageModule.resolveSymbol(context: SymbolContext) -> Promise<ResolvedSymbol | null>`

Brief: Resolves the best symbol at the current cursor position.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `LanguageModule.listSymbols(context: SymbolEnumerationContext) -> Promise<ResolvedSymbol[]>`

Brief: Enumerates the documentable symbols in a file.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `LanguageModule.createStub(symbol: ResolvedSymbol) -> string`

Brief: Builds a mirrored docs stub for a resolved symbol.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `LanguageModule.normalizeSignature(signature: string) -> string`

Brief: Normalizes signature text for docs matching.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `LanguageModule.matchesEntry(symbol: ResolvedSymbol, entry: DocEntry) -> boolean`

Brief: Per-language fallback matcher for docs entries.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `CommandTarget`

Brief: Serialized command target used by extension commands.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---
