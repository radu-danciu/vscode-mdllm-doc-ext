# src/core/definitionProvider.ts

## ExternalDocsDefinitionProvider

Brief: Routes Go to Definition from source symbols into their Markdown documentation entry.

Details:
If the docs file exists but the symbol entry does not, navigation lands at the top of the Markdown file.

Inheritance:
- vscode.DefinitionProvider

---

## ExternalDocsDefinitionProvider.provideDefinition(document: vscode.TextDocument, position: vscode.Position) -> Promise<vscode.Definition | null>

Brief: Describes the repo-local method `provideDefinition` on `ExternalDocsDefinitionProvider` in `src/core/definitionProvider.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:
- `document`: Input accepted by `provideDefinition`.
- `position`: Input accepted by `provideDefinition`.

Returns:
Value returned by `provideDefinition`.

---
