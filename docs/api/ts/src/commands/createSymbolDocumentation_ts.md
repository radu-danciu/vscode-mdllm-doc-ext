## src/commands/createSymbolDocumentation.ts

### `registerCreateSymbolDocumentationCommand(documentationService: DocumentationService) -> vscode.Disposable`

Brief: Registers the create-documentation command.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `pickCandidate(candidates: ResolvedDocumentationCandidate[]) -> Promise<ResolvedDocumentationCandidate | undefined>`

Brief: Lets the user choose one candidate when multiple create-doc targets are available.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---
