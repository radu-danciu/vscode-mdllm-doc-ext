# src/languages/cpp/module.ts

## CppLanguageModule

Brief: Resolves C and C++ declarations into canonical signatures used by the mirrored docs index.

Details:
The module tracks namespaces, classes, methods, and template-derived metadata using lightweight text parsing instead of a full language server dependency.

Inheritance:
- LanguageModule

---

## CppLanguageModule.canHandle(document: vscode.TextDocument) -> boolean

Brief: Reports whether the module should parse the current document.

Details:
The check accepts the extension's configured `c` and `cpp` language identifiers so both C and C++ files flow through the same resolver.

Params:
- `document`: Text document being evaluated.

Returns:
True when the document language ID is supported by this module.

---

## CppLanguageModule.getLangBucket(document: vscode.TextDocument, config: ExternalDocsConfig) -> string

Brief: Returns the configured docs bucket for C and C++ sources.

Details:
Unlike the JavaScript and TypeScript module, this resolver always maps into the single C++ docs bucket from workspace configuration.

Params:
- `document`: Text document being resolved.
- `config`: Normalized external docs configuration.

Returns:
C++ docs bucket name from the workspace settings.

---

## CppLanguageModule.resolveSymbol(context: SymbolContext) -> Promise<ResolvedSymbol | null>

Brief: Resolves the symbol at the current cursor position from a C or C++ document.

Details:
The method combines word-range lookup, candidate parsing, range matching, and canonical metadata assembly into the `ResolvedSymbol` shape consumed by the rest of the extension.

Params:
- `context`: Resolution context including document, workspace, and config data.

Returns:
Resolved symbol metadata when a matching declaration is found, otherwise null.

---

## CppLanguageModule.createStub(symbol: ResolvedSymbol) -> string

Brief: Generates the default Markdown stub for a resolved C or C++ symbol.

Details:
The implementation delegates to the shared stub builder so all language modules emit the same section structure.

Params:
- `symbol`: Resolved symbol to document.

Returns:
Template Markdown for a new mirrored docs entry.

---

## CppLanguageModule.normalizeSignature(signature: string) -> string

Brief: Normalizes C++ signature spacing before docs matching.

Details:
The method compresses whitespace while preserving common C++ punctuation rules around namespace separators, commas, and template brackets.

Params:
- `signature`: Raw signature text.

Returns:
Normalized signature string suitable for index comparison.

---

## CppLanguageModule.matchesEntry(symbol: ResolvedSymbol, entry: { signature: string }) -> boolean

Brief: Matches a resolved symbol against a parsed docs entry by name and arity.

Details:
The comparison intentionally ignores other formatting differences so equivalent callable signatures can still bind to the correct Markdown section.

Params:
- `symbol`: Resolved source symbol.
- `entry`: Parsed Markdown entry candidate.

Returns:
True when the entry matches the symbol's normalized name and parameter count.

---

## parseCppDocument(document: vscode.TextDocument) -> ParsedSymbolCandidate[]

Brief: Parses a C or C++ document into candidate declarations.

Details:
The parser tracks namespace and class nesting, recognizes free functions and methods, and captures inheritance and template details needed for later symbol resolution.

Params:
- `document`: Source document to scan.

Returns:
Parsed symbol candidates in source order.

---

## renderCppParams(params: Array<{ name: string; type?: string }>) -> string

Brief: Renders normalized parameter metadata back into C++-style parameter text.

Details:
This helper preserves the `type name` ordering used by the C++ signature formatter when assembling canonical method and function signatures.

Params:
- `params`: Normalized parameter descriptors.

Returns:
Comma-separated C++ parameter list text.

---

## extractTemplateValues(value?: string) -> Array<{ name: string; value: string }> | undefined

Brief: Extracts concrete template argument values from a type reference.

Details:
When inheritance mentions a templated base type, this helper turns the inner argument list into numbered placeholder names used by the docs stub generator.

Params:
- `value`: Type text that may include template arguments.

Returns:
Template argument mappings, or undefined when no template argument list is present.

---

## countOpenBraces(value: string) -> number

Brief: Counts opening braces in a source line.

Details:
The parser uses brace counts to maintain namespace and class nesting without building a full syntax tree.

Params:
- `value`: Source line text.

Returns:
Number of `{` characters in the input.

---

## countCloseBraces(value: string) -> number

Brief: Counts closing braces in a source line.

Details:
Together with `countOpenBraces`, this helper drives the lightweight block-depth bookkeeping used during C++ parsing.

Params:
- `value`: Source line text.

Returns:
Number of `}` characters in the input.

---

## CppLanguageModule.getLangBucket(_document: vscode.TextDocument, config: ExternalDocsConfig) -> string

Brief: Describes the repo-local method `getLangBucket` on `CppLanguageModule` in `src/languages/cpp/module.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:
- `_document`: Input accepted by `getLangBucket`.
- `config`: Input accepted by `getLangBucket`.

Returns:
Value returned by `getLangBucket`.

---

## extractTemplateValues(value: string) -> Array<{ name: string; value: string }> | undefined

Brief: Describes the repo-local function `extractTemplateValues` in `src/languages/cpp/module.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:
- `value`: Input accepted by `extractTemplateValues`.

Returns:
Value returned by `extractTemplateValues`.

---
