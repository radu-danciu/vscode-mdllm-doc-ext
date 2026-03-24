## src/commands/openSymbolDocumentation.ts

### `registerOpenSymbolDocumentationCommand(documentationService: DocumentationService)`

Brief: Registers the command that opens the Markdown documentation for the current symbol.

Details:
This command respects the configured open mode and reuses the same lookup path as hover and definition.

---

### `registerOpenSymbolDocumentationCommand(documentationService: DocumentationService) -> vscode.Disposable`

Brief: Describes the repo-local function `registerOpenSymbolDocumentationCommand` in `src/commands/openSymbolDocumentation.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:

- `documentationService`: Input accepted by `registerOpenSymbolDocumentationCommand`.

Returns:
Value returned by `registerOpenSymbolDocumentationCommand`.

---

### `pickDocumentedCandidate(candidates: Array<ResolvedDocumentationCandidate & { entry: NonNullable<ResolvedDocumentationCandidate['entry']> }>) -> Promise<(ResolvedDocumentationCandidate & { entry: NonNullable<ResolvedDocumentationCandidate['entry']> }) | undefined>`

Brief: Describes the repo-local function `pickDocumentedCandidate` in `src/commands/openSymbolDocumentation.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:

- `candidates`: Input accepted by `pickDocumentedCandidate`.

Returns:
Value returned by `pickDocumentedCandidate`.

---
