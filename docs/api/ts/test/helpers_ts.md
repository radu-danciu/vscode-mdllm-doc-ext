# test/helpers.ts

## FixtureConfig

Brief: Defines the repo-local type `FixtureConfig` in `test/helpers.ts`.

Details:
This entry keeps the repository self-documented so the extension can resolve its own type symbols while developing against this workspace.

---

## StoredWorkspaceConfig

Brief: Defines the repo-local type `StoredWorkspaceConfig` in `test/helpers.ts`.

Details:
This entry keeps the repository self-documented so the extension can resolve its own type symbols while developing against this workspace.

---

## getWorkspaceFolder() -> vscode.WorkspaceFolder

Brief: Describes the repo-local function `getWorkspaceFolder` in `test/helpers.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Returns:
Value returned by `getWorkspaceFolder`.

---

## repoRoot() -> string

Brief: Describes the repo-local function `repoRoot` in `test/helpers.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Returns:
Value returned by `repoRoot`.

---

## repoUri(relativePath: string) -> vscode.Uri

Brief: Describes the repo-local function `repoUri` in `test/helpers.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:
- `relativePath`: Input accepted by `repoUri`.

Returns:
Value returned by `repoUri`.

---

## openEditor(relativePath: string) -> Promise<vscode.TextEditor>

Brief: Describes the repo-local function `openEditor` in `test/helpers.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:
- `relativePath`: Input accepted by `openEditor`.

Returns:
Value returned by `openEditor`.

---

## activateExtension() -> Promise<void>

Brief: Describes the repo-local function `activateExtension` in `test/helpers.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Returns:
Value returned by `activateExtension`.

---

## captureWorkspaceConfiguration() -> Promise<void>

Brief: Describes the repo-local function `captureWorkspaceConfiguration` in `test/helpers.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Returns:
Value returned by `captureWorkspaceConfiguration`.

---

## configureWorkspace(config: FixtureConfig) -> Promise<void>

Brief: Describes the repo-local function `configureWorkspace` in `test/helpers.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:
- `config`: Input accepted by `configureWorkspace`.

Returns:
Value returned by `configureWorkspace`.

---

## restoreWorkspaceConfiguration() -> Promise<void>

Brief: Describes the repo-local function `restoreWorkspaceConfiguration` in `test/helpers.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Returns:
Value returned by `restoreWorkspaceConfiguration`.

---

## positionOf(document: vscode.TextDocument, token: string, occurrence) -> vscode.Position

Brief: Describes the repo-local function `positionOf` in `test/helpers.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:
- `document`: Input accepted by `positionOf`.
- `token`: Input accepted by `positionOf`.
- `occurrence`: Input accepted by `positionOf`.

Returns:
Value returned by `positionOf`.

---

## hoverText(editor: vscode.TextEditor, position: vscode.Position) -> Promise<string>

Brief: Describes the repo-local function `hoverText` in `test/helpers.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:
- `editor`: Input accepted by `hoverText`.
- `position`: Input accepted by `hoverText`.

Returns:
Value returned by `hoverText`.

---

## definitionsAt(editor: vscode.TextEditor, position: vscode.Position) -> Promise<vscode.Location[]>

Brief: Describes the repo-local function `definitionsAt` in `test/helpers.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:
- `editor`: Input accepted by `definitionsAt`.
- `position`: Input accepted by `definitionsAt`.

Returns:
Value returned by `definitionsAt`.

---

## removeRelativePath(relativePath: string) -> Promise<void>

Brief: Describes the repo-local function `removeRelativePath` in `test/helpers.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:
- `relativePath`: Input accepted by `removeRelativePath`.

Returns:
Value returned by `removeRelativePath`.

---

## writeRelativeFile(relativePath: string, content: string) -> Promise<void>

Brief: Describes the repo-local function `writeRelativeFile` in `test/helpers.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:
- `relativePath`: Input accepted by `writeRelativeFile`.
- `content`: Input accepted by `writeRelativeFile`.

Returns:
Value returned by `writeRelativeFile`.

---

## readRelativeFile(relativePath: string) -> Promise<string>

Brief: Describes the repo-local function `readRelativeFile` in `test/helpers.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:
- `relativePath`: Input accepted by `readRelativeFile`.

Returns:
Value returned by `readRelativeFile`.

---

## relativeFsPath(uri: vscode.Uri) -> string

Brief: Describes the repo-local function `relativeFsPath` in `test/helpers.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:
- `uri`: Input accepted by `relativeFsPath`.

Returns:
Value returned by `relativeFsPath`.

---
