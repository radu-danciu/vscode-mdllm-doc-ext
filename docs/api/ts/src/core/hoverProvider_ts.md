## src/core/hoverProvider.ts

### `ExternalDocsHoverProvider`

Brief: Supplies hover content from external Markdown entries.

Details:
Shows a concise preview for documented symbols and a create-doc affordance for supported symbols without docs.

Inheritance:

- `vscode.HoverProvider`

---

### `ExternalDocsHoverProvider.provideHover(document: vscode.TextDocument, position: vscode.Position) -> Promise<vscode.Hover | null>`

Brief: Describes the repo-local method `provideHover` on `ExternalDocsHoverProvider` in `src/core/hoverProvider.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:

- `document`: Input accepted by `provideHover`.
- `position`: Input accepted by `provideHover`.

Returns:
Value returned by `provideHover`.

---

### `ExternalDocsHoverProvider.renderSingleDocumentationHover(document: vscode.TextDocument, position: vscode.Position, candidate: ResolvedDocumentationCandidate & { entry: NonNullable<ResolvedDocumentationCandidate['entry']> }, hoverRange: vscode.Range) -> vscode.Hover`

Brief: Describes the repo-local method `renderSingleDocumentationHover` on `ExternalDocsHoverProvider` in `src/core/hoverProvider.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:

- `document`: Input accepted by `renderSingleDocumentationHover`.
- `position`: Input accepted by `renderSingleDocumentationHover`.
- `candidate`: Input accepted by `renderSingleDocumentationHover`.
- `hoverRange`: Input accepted by `renderSingleDocumentationHover`.

Returns:
Value returned by `renderSingleDocumentationHover`.

---

### `ExternalDocsHoverProvider.renderDocumentationChooserHover(candidates: Array<ResolvedDocumentationCandidate & { entry: NonNullable<ResolvedDocumentationCandidate['entry']> }>, hoverRange: vscode.Range) -> vscode.Hover`

Brief: Describes the repo-local method `renderDocumentationChooserHover` on `ExternalDocsHoverProvider` in `src/core/hoverProvider.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:

- `candidates`: Input accepted by `renderDocumentationChooserHover`.
- `hoverRange`: Input accepted by `renderDocumentationChooserHover`.

Returns:
Value returned by `renderDocumentationChooserHover`.

---

### `ExternalDocsHoverProvider.renderSingleCreateHover(candidate: ResolvedDocumentationCandidate, hoverRange: vscode.Range) -> vscode.Hover`

Brief: Describes the repo-local method `renderSingleCreateHover` on `ExternalDocsHoverProvider` in `src/core/hoverProvider.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:

- `candidate`: Input accepted by `renderSingleCreateHover`.
- `hoverRange`: Input accepted by `renderSingleCreateHover`.

Returns:
Value returned by `renderSingleCreateHover`.

---

### `ExternalDocsHoverProvider.renderCreateChooserHover(candidates: ResolvedDocumentationCandidate[], hoverRange: vscode.Range) -> vscode.Hover`

Brief: Describes the repo-local method `renderCreateChooserHover` on `ExternalDocsHoverProvider` in `src/core/hoverProvider.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:

- `candidates`: Input accepted by `renderCreateChooserHover`.
- `hoverRange`: Input accepted by `renderCreateChooserHover`.

Returns:
Value returned by `renderCreateChooserHover`.

---

### `ExternalDocsHoverProvider.renderSingleSourceDocumentationHover(candidate: ResolvedDocumentationCandidate, hoverRange: vscode.Range) -> vscode.Hover`

Brief: Describes the repo-local method `renderSingleSourceDocumentationHover` on `ExternalDocsHoverProvider` in `src/core/hoverProvider.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:

- `candidate`: Input accepted by `renderSingleSourceDocumentationHover`.
- `hoverRange`: Input accepted by `renderSingleSourceDocumentationHover`.

Returns:
Value returned by `renderSingleSourceDocumentationHover`.

---

### `ExternalDocsHoverProvider.renderSourceDocumentationChooserHover(candidates: ResolvedDocumentationCandidate[], hoverRange: vscode.Range) -> vscode.Hover`

Brief: Describes the repo-local method `renderSourceDocumentationChooserHover` on `ExternalDocsHoverProvider` in `src/core/hoverProvider.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:

- `candidates`: Input accepted by `renderSourceDocumentationChooserHover`.
- `hoverRange`: Input accepted by `renderSourceDocumentationChooserHover`.

Returns:
Value returned by `renderSourceDocumentationChooserHover`.

---
