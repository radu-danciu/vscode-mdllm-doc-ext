# src/core/docIndex.ts

## DocIndex

Brief: Caches parsed Markdown files and resolves symbol entries from them.

Details:
Hover, definition navigation, and create-doc commands all rely on this index to avoid reparsing every docs file on each interaction.

Inheritance:
- none

---

## DocIndex.clear() -> void

Brief: Describes the repo-local method `clear` on `DocIndex` in `src/core/docIndex.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Returns:
Value returned by `clear`.

---

## DocIndex.invalidate(uri: vscode.Uri) -> void

Brief: Describes the repo-local method `invalidate` on `DocIndex` in `src/core/docIndex.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:
- `uri`: Input accepted by `invalidate`.

Returns:
Value returned by `invalidate`.

---

## DocIndex.getParsedDoc(uri: vscode.Uri, normalizeSignature: (signature: string) => string) -> Promise<ParsedDocFile | null>

Brief: Describes the repo-local method `getParsedDoc` on `DocIndex` in `src/core/docIndex.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:
- `uri`: Input accepted by `getParsedDoc`.
- `normalizeSignature`: Input accepted by `getParsedDoc`.

Returns:
Value returned by `getParsedDoc`.

---

## DocIndex.findEntry(uri: vscode.Uri, symbol: ResolvedSymbol, module: LanguageModule) -> Promise<DocEntry | null>

Brief: Describes the repo-local method `findEntry` on `DocIndex` in `src/core/docIndex.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:
- `uri`: Input accepted by `findEntry`.
- `symbol`: Input accepted by `findEntry`.
- `module`: Input accepted by `findEntry`.

Returns:
Value returned by `findEntry`.

---
