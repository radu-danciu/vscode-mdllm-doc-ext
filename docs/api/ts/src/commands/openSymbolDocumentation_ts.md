## src/commands/openSymbolDocumentation.ts

### `registerOpenSymbolDocumentationCommand(documentationService: DocumentationService) -> vscode.Disposable`

Brief: Registers the open-documentation command.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `pickDocumentedCandidate(candidates: Array<ResolvedDocumentationCandidate & { entry: NonNullable<ResolvedDocumentationCandidate['entry']> }>) -> Promise<(ResolvedDocumentationCandidate & { entry: NonNullable<ResolvedDocumentationCandidate['entry']> }) | undefined>`

Brief: Lets the user choose one documented candidate when multiple docs are available.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---
