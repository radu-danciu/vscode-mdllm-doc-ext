# src/core/types.ts

## SymbolKind

Brief: Defines the repo-local type `SymbolKind` in `src/core/types.ts`.

Details:
This entry keeps the repository self-documented so the extension can resolve its own type symbols while developing against this workspace.

---

## OpenMode

Brief: Defines the repo-local type `OpenMode` in `src/core/types.ts`.

Details:
This entry keeps the repository self-documented so the extension can resolve its own type symbols while developing against this workspace.

---

## ExternalDocsConfig

Brief: Defines the repo-local type `ExternalDocsConfig` in `src/core/types.ts`.

Details:
This entry keeps the repository self-documented so the extension can resolve its own type symbols while developing against this workspace.

---

## SymbolParam

Brief: Defines the repo-local type `SymbolParam` in `src/core/types.ts`.

Details:
This entry keeps the repository self-documented so the extension can resolve its own type symbols while developing against this workspace.

---

## FrozenTypeArgument

Brief: Defines the repo-local type `FrozenTypeArgument` in `src/core/types.ts`.

Details:
This entry keeps the repository self-documented so the extension can resolve its own type symbols while developing against this workspace.

---

## ResolvedSymbol

Brief: Defines the repo-local type `ResolvedSymbol` in `src/core/types.ts`.

Details:
This entry keeps the repository self-documented so the extension can resolve its own type symbols while developing against this workspace.

---

## SymbolContext

Brief: Defines the repo-local type `SymbolContext` in `src/core/types.ts`.

Details:
This entry keeps the repository self-documented so the extension can resolve its own type symbols while developing against this workspace.

---

## DocEntry

Brief: Defines the repo-local type `DocEntry` in `src/core/types.ts`.

Details:
This entry keeps the repository self-documented so the extension can resolve its own type symbols while developing against this workspace.

---

## ParsedDocFile

Brief: Defines the repo-local type `ParsedDocFile` in `src/core/types.ts`.

Details:
This entry keeps the repository self-documented so the extension can resolve its own type symbols while developing against this workspace.

---

## LanguageModule

Brief: Defines the repo-local type `LanguageModule` in `src/core/types.ts`.

Details:
This entry keeps the repository self-documented so the extension can resolve its own type symbols while developing against this workspace.

---

## LanguageModule.canHandle(document: vscode.TextDocument) -> boolean

Brief: Describes the repo-local method `canHandle` on `LanguageModule` in `src/core/types.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:
- `document`: Input accepted by `canHandle`.

Returns:
Value returned by `canHandle`.

---

## LanguageModule.getLangBucket(document: vscode.TextDocument, config: ExternalDocsConfig) -> string

Brief: Describes the repo-local method `getLangBucket` on `LanguageModule` in `src/core/types.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:
- `document`: Input accepted by `getLangBucket`.
- `config`: Input accepted by `getLangBucket`.

Returns:
Value returned by `getLangBucket`.

---

## LanguageModule.resolveSymbol(context: SymbolContext) -> Promise<ResolvedSymbol | null>

Brief: Describes the repo-local method `resolveSymbol` on `LanguageModule` in `src/core/types.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:
- `context`: Input accepted by `resolveSymbol`.

Returns:
Value returned by `resolveSymbol`.

---

## LanguageModule.createStub(symbol: ResolvedSymbol) -> string

Brief: Describes the repo-local method `createStub` on `LanguageModule` in `src/core/types.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:
- `symbol`: Input accepted by `createStub`.

Returns:
Value returned by `createStub`.

---

## LanguageModule.normalizeSignature(signature: string) -> string

Brief: Describes the repo-local method `normalizeSignature` on `LanguageModule` in `src/core/types.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:
- `signature`: Input accepted by `normalizeSignature`.

Returns:
Value returned by `normalizeSignature`.

---

## LanguageModule.matchesEntry(symbol: ResolvedSymbol, entry: DocEntry) -> boolean

Brief: Describes the repo-local method `matchesEntry` on `LanguageModule` in `src/core/types.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:
- `symbol`: Input accepted by `matchesEntry`.
- `entry`: Input accepted by `matchesEntry`.

Returns:
Value returned by `matchesEntry`.

---

## CommandTarget

Brief: Defines the repo-local type `CommandTarget` in `src/core/types.ts`.

Details:
This entry keeps the repository self-documented so the extension can resolve its own type symbols while developing against this workspace.

---
