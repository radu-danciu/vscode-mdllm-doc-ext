## src/extension.ts

### `activate(context: vscode.ExtensionContext) -> Promise<void>`

Brief: Activates the extension and registers providers, commands, and cache invalidation hooks.

Details:
This is the single entrypoint that wires the language modules into the shared core behavior, including file-backed hover, definition, and rename providers.

Returns:
Activation completion.

---

### `deactivate() -> void`

Brief: Describes the repo-local function `deactivate` in `src/extension.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Returns:
Value returned by `deactivate`.

---
