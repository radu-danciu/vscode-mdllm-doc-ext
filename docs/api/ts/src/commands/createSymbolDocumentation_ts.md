## src/commands/createSymbolDocumentation.ts

### `registerCreateSymbolDocumentationCommand(documentationService: DocumentationService)`

Brief: Registers the command that creates or appends documentation stubs for the current symbol.

Details:
The command creates the mirrored Markdown file when needed, appends a stub when the file exists without the symbol entry, and opens the file at the symbol heading.

---

### `registerCreateSymbolDocumentationCommand(documentationService: DocumentationService) -> vscode.Disposable`

Brief: Describes the repo-local function `registerCreateSymbolDocumentationCommand` in `src/commands/createSymbolDocumentation.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:

- `documentationService`: Input accepted by `registerCreateSymbolDocumentationCommand`.

Returns:
Value returned by `registerCreateSymbolDocumentationCommand`.

---

### `pickCandidate(candidates: ResolvedDocumentationCandidate[]) -> Promise<ResolvedDocumentationCandidate | undefined>`

Brief: Describes the repo-local function `pickCandidate` in `src/commands/createSymbolDocumentation.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:

- `candidates`: Input accepted by `pickCandidate`.

Returns:
Value returned by `pickCandidate`.

---
