## src/core/docIndex.ts

### `DocIndex`

Brief: Caches parsed mirrored Markdown files and resolves entries.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `DocIndexMatchType`

Brief: Detailed match classification returned by the docs index.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `DocIndexMatchResult`

Brief: Detailed docs-index lookup result with match mode and entry.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `DocIndex.clear() -> void`

Brief: Clears the parsed-doc cache.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `DocIndex.invalidate(uri: vscode.Uri) -> void`

Brief: Invalidates a single cached Markdown file.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `DocIndex.getParsedDoc(uri: vscode.Uri, normalizeSignature: (signature: string) => string) -> Promise<ParsedDocFile | null>`

Brief: Loads and parses a mirrored docs file.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `DocIndex.findEntry(uri: vscode.Uri, symbol: ResolvedSymbol, module: LanguageModule) -> Promise<DocEntry | null>`

Brief: Finds the best docs entry for a resolved symbol.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `DocIndex.findEntryDetailed(uri: vscode.Uri, symbol: ResolvedSymbol, module: LanguageModule) -> Promise<DocIndexMatchResult>`

Brief: Finds the best docs entry and reports how it matched.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---
