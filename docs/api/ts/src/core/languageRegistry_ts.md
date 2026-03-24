## src/core/languageRegistry.ts

### `LanguageRegistry`

Brief: Defines the repo-local type `LanguageRegistry` in `src/core/languageRegistry.ts`.

Details:
This entry keeps the repository self-documented so the extension can resolve its own type symbols while developing against this workspace.

---

### `LanguageRegistry.getModuleForDocument(document: vscode.TextDocument) -> LanguageModule | undefined`

Brief: Describes the repo-local method `getModuleForDocument` on `LanguageRegistry` in `src/core/languageRegistry.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:

- `document`: Input accepted by `getModuleForDocument`.

Returns:
Value returned by `getModuleForDocument`.

---

### `LanguageRegistry.getModules() -> readonly LanguageModule[]`

Brief: Describes the repo-local method `getModules` on `LanguageRegistry` in `src/core/languageRegistry.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Returns:
Value returned by `getModules`.

---
