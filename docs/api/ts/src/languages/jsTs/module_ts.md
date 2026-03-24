## src/languages/jsTs/module.ts

### `JsTsLanguageModule`

Brief: Resolves JavaScript and TypeScript symbols into canonical signatures used by the external docs index.

Details:
The module handles function declarations, class declarations, class methods, and object-like containers using deterministic text parsing.

Inheritance:

- `LanguageModule`

---

### `JsTsLanguageModule.canHandle(document: vscode.TextDocument) -> boolean`

Brief: Reports whether the module should parse the current document as JavaScript or TypeScript.

Details:
The check delegates to the module's supported language ID list so the resolver treats JS, JSX, TS, and TSX consistently.

Params:

- `document`: Text document being evaluated.

Returns:
True when the document language ID is one of the supported JavaScript or TypeScript variants.

---

### `JsTsLanguageModule.getLangBucket(document: vscode.TextDocument, config: ExternalDocsConfig) -> string`

Brief: Returns the configured docs bucket for the current JavaScript or TypeScript document.

Details:
The method chooses between the JavaScript and TypeScript bucket names based on the document language ID prefix.

Params:

- `document`: Text document being resolved.
- `config`: Normalized external docs configuration.

Returns:
Configured JavaScript or TypeScript docs bucket name.

---

### `JsTsLanguageModule.resolveSymbol(context: SymbolContext) -> Promise<ResolvedSymbol | null>`

Brief: Resolves the symbol at the current cursor position from a JavaScript or TypeScript document.

Details:
The method finds the hovered word range, parses candidate declarations from the file, and returns canonical symbol metadata for later docs lookup.

Params:

- `context`: Resolution context including document, workspace, and config data.

Returns:
Resolved symbol metadata when a matching declaration is found, otherwise null.

---

### `JsTsLanguageModule.createStub(symbol: ResolvedSymbol) -> string`

Brief: Generates the default Markdown stub for a resolved JavaScript or TypeScript symbol.

Details:
The implementation delegates to the shared stub generator so manually authored docs start from a consistent template.

Params:

- `symbol`: Resolved symbol to document.

Returns:
Template Markdown for a new mirrored docs entry.

---

### `JsTsLanguageModule.normalizeSignature(signature: string) -> string`

Brief: Normalizes JavaScript and TypeScript signature spacing before docs matching.

Details:
The method keeps dotted member paths and arrow return markers in a stable format so resolved signatures line up with parsed Markdown entries.

Params:

- `signature`: Raw signature text.

Returns:
Normalized signature string suitable for index comparison.

---

### `JsTsLanguageModule.matchesEntry(symbol: ResolvedSymbol, entry: { signature: string }) -> boolean`

Brief: Matches a resolved JavaScript or TypeScript symbol against a parsed docs entry by name and arity.

Details:
The comparison intentionally focuses on lookup name and parameter count so equivalent signatures still match when formatting differs slightly.

Params:

- `symbol`: Resolved source symbol.
- `entry`: Parsed Markdown entry candidate.

Returns:
True when the entry matches the symbol's normalized name and parameter count.

---

### `parseJsTsDocument(document: vscode.TextDocument) -> ParsedSymbolCandidate[]`

Brief: Parses a JavaScript or TypeScript document into candidate declarations.

Details:
The parser tracks classes, object literals, top-level functions, and methods so the resolver can map cursor positions back to canonical symbol signatures.

Params:

- `document`: Source document to scan.

Returns:
Parsed symbol candidates in source order.

---

### `buildCallableSignature(name: string, container: string | undefined, params: Array<{ name: string; type?: string }>, returnType?: string) -> string`

Brief: Builds the canonical callable signature string for a parsed function or method.

Details:
This helper is shared by top-level functions and container members so both forms render parameters and optional return types consistently.

Params:

- `name`: Unqualified callable name.
- `container`: Optional containing class or object name.
- `params`: Normalized parameter descriptors.
- `returnType`: Optional rendered return type.

Returns:
Canonical callable signature text.

---

### `countOpenBraces(value: string) -> number`

Brief: Counts opening braces in a source line.

Details:
The parser uses brace counts to maintain class and object nesting while scanning the document line by line.

Params:

- `value`: Source line text.

Returns:
Number of `{` characters in the input.

---

### `countCloseBraces(value: string) -> number`

Brief: Counts closing braces in a source line.

Details:
Together with `countOpenBraces`, this helper supports the lightweight block-depth bookkeeping used during JavaScript and TypeScript parsing.

Params:

- `value`: Source line text.

Returns:
Number of `}` characters in the input.

---

### `buildCallableSignature(name: string, container: string | undefined, params: Array<{ name: string; type?: string }>, returnType: string) -> string`

Brief: Describes the repo-local function `buildCallableSignature` in `src/languages/jsTs/module.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:

- `name`: Input accepted by `buildCallableSignature`.
- `container`: Input accepted by `buildCallableSignature`.
- `params`: Input accepted by `buildCallableSignature`.
- `returnType`: Input accepted by `buildCallableSignature`.

Returns:
Value returned by `buildCallableSignature`.

---
