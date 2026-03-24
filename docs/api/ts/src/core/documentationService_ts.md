## src/core/documentationService.ts

### `DocumentationService`

Brief: Coordinates symbol resolution, doc lookup, and Markdown document opening.

Details:
This is the shared execution path used by hover, definition, and command handlers so symbol lookup stays consistent.

Inheritance:

- `none`

---

### `DocumentationService.resolveAt(document: vscode.TextDocument, position: vscode.Position) -> Promise<ResolvedDocumentationTarget | null>`

Brief: Resolves the hovered or invoked source location into a supported symbol plus its mapped docs file.

Details:
Combines workspace config, language-module resolution, and mirrored path mapping in one place.

Returns:
Target metadata when a supported symbol is found, otherwise null.

---

### `ResolvedDocumentationTarget`

Brief: Defines the repo-local type `ResolvedDocumentationTarget` in `src/core/documentationService.ts`.

Details:
This entry keeps the repository self-documented so the extension can resolve its own type symbols while developing against this workspace.

---

### `ResolvedDocumentationCandidate`

Brief: Defines the repo-local type `ResolvedDocumentationCandidate` in `src/core/documentationService.ts`.

Details:
This entry keeps the repository self-documented so the extension can resolve its own type symbols while developing against this workspace.

---

### `DocumentPosition`

Brief: Defines the repo-local type `DocumentPosition` in `src/core/documentationService.ts`.

Details:
This entry keeps the repository self-documented so the extension can resolve its own type symbols while developing against this workspace.

---

### `DocumentationService.getDocIndex() -> DocIndex`

Brief: Describes the repo-local method `getDocIndex` on `DocumentationService` in `src/core/documentationService.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Returns:
Value returned by `getDocIndex`.

---

### `DocumentationService.isHoverSuppressed() -> boolean`

Brief: Describes the repo-local method `isHoverSuppressed` on `DocumentationService` in `src/core/documentationService.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Returns:
Value returned by `isHoverSuppressed`.

---

### `DocumentationService.isDefinitionSuppressed() -> boolean`

Brief: Describes the repo-local method `isDefinitionSuppressed` on `DocumentationService` in `src/core/documentationService.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Returns:
Value returned by `isDefinitionSuppressed`.

---

### `DocumentationService.withSuppressedHover(callback: () => Promise<T>) -> Promise<T>`

Brief: Describes the repo-local method `withSuppressedHover` on `DocumentationService` in `src/core/documentationService.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:

- `callback`: Input accepted by `withSuppressedHover`.

Returns:
Value returned by `withSuppressedHover`.

---

### `DocumentationService.withSuppressedDefinition(callback: () => Promise<T>) -> Promise<T>`

Brief: Describes the repo-local method `withSuppressedDefinition` on `DocumentationService` in `src/core/documentationService.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:

- `callback`: Input accepted by `withSuppressedDefinition`.

Returns:
Value returned by `withSuppressedDefinition`.

---

### `DocumentationService.resolveDirectAt(document: vscode.TextDocument, position: vscode.Position) -> Promise<ResolvedDocumentationTarget | null>`

Brief: Describes the repo-local method `resolveDirectAt` on `DocumentationService` in `src/core/documentationService.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:

- `document`: Input accepted by `resolveDirectAt`.
- `position`: Input accepted by `resolveDirectAt`.

Returns:
Value returned by `resolveDirectAt`.

---

### `DocumentationService.resolveFromTarget(target: CommandTarget) -> Promise<ResolvedDocumentationTarget | null>`

Brief: Describes the repo-local method `resolveFromTarget` on `DocumentationService` in `src/core/documentationService.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:

- `target`: Input accepted by `resolveFromTarget`.

Returns:
Value returned by `resolveFromTarget`.

---

### `DocumentationService.findEntry(target: ResolvedDocumentationTarget) -> Promise<DocEntry | null>`

Brief: Describes the repo-local method `findEntry` on `DocumentationService` in `src/core/documentationService.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:

- `target`: Input accepted by `findEntry`.

Returns:
Value returned by `findEntry`.

---

### `DocumentationService.resolveCandidatesFromTarget(target: CommandTarget, maxCandidates) -> Promise<ResolvedDocumentationCandidate[]>`

Brief: Describes the repo-local method `resolveCandidatesFromTarget` on `DocumentationService` in `src/core/documentationService.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:

- `target`: Input accepted by `resolveCandidatesFromTarget`.
- `maxCandidates`: Input accepted by `resolveCandidatesFromTarget`.

Returns:
Value returned by `resolveCandidatesFromTarget`.

---

### `DocumentationService.resolveDocumentationCandidates(document: vscode.TextDocument, position: vscode.Position, maxCandidates) -> Promise<ResolvedDocumentationCandidate[]>`

Brief: Describes the repo-local method `resolveDocumentationCandidates` on `DocumentationService` in `src/core/documentationService.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:

- `document`: Input accepted by `resolveDocumentationCandidates`.
- `position`: Input accepted by `resolveDocumentationCandidates`.
- `maxCandidates`: Input accepted by `resolveDocumentationCandidates`.

Returns:
Value returned by `resolveDocumentationCandidates`.

---

### `DocumentationService.queryOtherHoverProviders(document: vscode.TextDocument, position: vscode.Position) -> Promise<vscode.Hover[]>`

Brief: Describes the repo-local method `queryOtherHoverProviders` on `DocumentationService` in `src/core/documentationService.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:

- `document`: Input accepted by `queryOtherHoverProviders`.
- `position`: Input accepted by `queryOtherHoverProviders`.

Returns:
Value returned by `queryOtherHoverProviders`.

---

### `DocumentationService.queryOtherDefinitionProviders(document: vscode.TextDocument, position: vscode.Position) -> Promise<Array<vscode.Location | vscode.LocationLink>>`

Brief: Describes the repo-local method `queryOtherDefinitionProviders` on `DocumentationService` in `src/core/documentationService.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:

- `document`: Input accepted by `queryOtherDefinitionProviders`.
- `position`: Input accepted by `queryOtherDefinitionProviders`.

Returns:
Value returned by `queryOtherDefinitionProviders`.

---

### `DocumentationService.hasLikelySourceDocumentation(candidates: readonly ResolvedDocumentationCandidate[]) -> boolean`

Brief: Describes the repo-local method `hasLikelySourceDocumentation` on `DocumentationService` in `src/core/documentationService.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:

- `candidates`: Input accepted by `hasLikelySourceDocumentation`.

Returns:
Value returned by `hasLikelySourceDocumentation`.

---

### `DocumentationService.getSourceDocumentationMarkdown(candidate: ResolvedDocumentationCandidate) -> string | null`

Brief: Describes the repo-local method `getSourceDocumentationMarkdown` on `DocumentationService` in `src/core/documentationService.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:

- `candidate`: Input accepted by `getSourceDocumentationMarkdown`.

Returns:
Value returned by `getSourceDocumentationMarkdown`.

---

### `DocumentationService.openDocumentation(docsUri: vscode.Uri, range: vscode.Range | undefined, openMode: ExternalDocsConfig['openMode']) -> Promise<vscode.TextEditor>`

Brief: Describes the repo-local method `openDocumentation` on `DocumentationService` in `src/core/documentationService.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:

- `docsUri`: Input accepted by `openDocumentation`.
- `range`: Input accepted by `openDocumentation`.
- `openMode`: Input accepted by `openDocumentation`.

Returns:
Value returned by `openDocumentation`.

---

### `DocumentationService.getDocumentPositionFromTarget(target: CommandTarget) -> Promise<DocumentPosition | null>`

Brief: Describes the repo-local method `getDocumentPositionFromTarget` on `DocumentationService` in `src/core/documentationService.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:

- `target`: Input accepted by `getDocumentPositionFromTarget`.

Returns:
Value returned by `getDocumentPositionFromTarget`.

---

### `DocumentationService.resolveCandidatesFromDefinitions(document: vscode.TextDocument, position: vscode.Position, maxCandidates: number) -> Promise<ResolvedDocumentationCandidate[]>`

Brief: Describes the repo-local method `resolveCandidatesFromDefinitions` on `DocumentationService` in `src/core/documentationService.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:

- `document`: Input accepted by `resolveCandidatesFromDefinitions`.
- `position`: Input accepted by `resolveCandidatesFromDefinitions`.
- `maxCandidates`: Input accepted by `resolveCandidatesFromDefinitions`.

Returns:
Value returned by `resolveCandidatesFromDefinitions`.

---

### `DocumentationService.documentPositionFromDefinition(definition: vscode.Location | vscode.LocationLink) -> Promise<DocumentPosition | null>`

Brief: Describes the repo-local method `documentPositionFromDefinition` on `DocumentationService` in `src/core/documentationService.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:

- `definition`: Input accepted by `documentPositionFromDefinition`.

Returns:
Value returned by `documentPositionFromDefinition`.

---

### `DocumentationService.targetHasLikelySourceDocumentation(target: ResolvedDocumentationTarget) -> boolean`

Brief: Describes the repo-local method `targetHasLikelySourceDocumentation` on `DocumentationService` in `src/core/documentationService.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:

- `target`: Input accepted by `targetHasLikelySourceDocumentation`.

Returns:
Value returned by `targetHasLikelySourceDocumentation`.

---

### `DocumentationService.extractSourceDocumentation(target: ResolvedDocumentationTarget) -> string | null`

Brief: Describes the repo-local method `extractSourceDocumentation` on `DocumentationService` in `src/core/documentationService.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:

- `target`: Input accepted by `extractSourceDocumentation`.

Returns:
Value returned by `extractSourceDocumentation`.

---

### `DocumentationService.extractLeadingDocComment(document: vscode.TextDocument, symbolLine: number) -> string | null`

Brief: Describes the repo-local method `extractLeadingDocComment` on `DocumentationService` in `src/core/documentationService.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:

- `document`: Input accepted by `extractLeadingDocComment`.
- `symbolLine`: Input accepted by `extractLeadingDocComment`.

Returns:
Value returned by `extractLeadingDocComment`.

---

### `DocumentationService.extractPythonDocstring(document: vscode.TextDocument, symbolLine: number) -> string | null`

Brief: Describes the repo-local method `extractPythonDocstring` on `DocumentationService` in `src/core/documentationService.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:

- `document`: Input accepted by `extractPythonDocstring`.
- `symbolLine`: Input accepted by `extractPythonDocstring`.

Returns:
Value returned by `extractPythonDocstring`.

---

### `DocumentationService.normalizeExtractedDocumentation(value: string) -> string | null`

Brief: Describes the repo-local method `normalizeExtractedDocumentation` on `DocumentationService` in `src/core/documentationService.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:

- `value`: Input accepted by `normalizeExtractedDocumentation`.

Returns:
Value returned by `normalizeExtractedDocumentation`.

---
