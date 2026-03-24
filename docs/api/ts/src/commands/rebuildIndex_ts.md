# src/commands/rebuildIndex.ts

## registerRebuildIndexCommand(documentationService: DocumentationService)

Brief: Registers the command that clears the in-memory Markdown index cache.

Details:
This is the explicit recovery path after large manual documentation edits or configuration changes.

---

## registerRebuildIndexCommand(documentationService: DocumentationService) -> vscode.Disposable

Brief: Describes the repo-local function `registerRebuildIndexCommand` in `src/commands/rebuildIndex.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:
- `documentationService`: Input accepted by `registerRebuildIndexCommand`.

Returns:
Value returned by `registerRebuildIndexCommand`.

---
