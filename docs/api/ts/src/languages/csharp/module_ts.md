# src/languages/csharp/module.ts

## CSharpLanguageModule

Brief: Resolves C# declarations into canonical signatures for mirrored docs lookup.

Details:
The module recognizes namespaces, classes, interfaces, records, and methods with a text parser that is tuned for the extension's indexing and hover workflows.

Inheritance:
- LanguageModule

---

## CSharpLanguageModule.canHandle(document: vscode.TextDocument) -> boolean

Brief: Reports whether the module should parse the current document as C#.

Details:
The check is intentionally narrow because the extension only maps a single `csharp` language identifier through this resolver.

Params:
- `document`: Text document being evaluated.

Returns:
True when the document language ID is `csharp`.

---

## CSharpLanguageModule.getLangBucket(document: vscode.TextDocument, config: ExternalDocsConfig) -> string

Brief: Returns the configured docs bucket for C# sources.

Details:
All C# files map into the single C# language bucket from workspace configuration.

Params:
- `document`: Text document being resolved.
- `config`: Normalized external docs configuration.

Returns:
C# docs bucket name from the workspace settings.

---

## CSharpLanguageModule.resolveSymbol(context: SymbolContext) -> Promise<ResolvedSymbol | null>

Brief: Resolves the symbol at the current cursor position from a C# document.

Details:
The method parses candidate declarations, finds the matching range, and then packages the result into the standard `ResolvedSymbol` structure used elsewhere in the extension.

Params:
- `context`: Resolution context including document, workspace, and config data.

Returns:
Resolved symbol metadata when a matching declaration is found, otherwise null.

---

## CSharpLanguageModule.createStub(symbol: ResolvedSymbol) -> string

Brief: Generates the default Markdown stub for a resolved C# symbol.

Details:
The implementation uses the shared stub generator so C# entries follow the same authoring structure as the other language modules.

Params:
- `symbol`: Resolved symbol to document.

Returns:
Template Markdown for a new mirrored docs entry.

---

## CSharpLanguageModule.normalizeSignature(signature: string) -> string

Brief: Normalizes C# signature spacing before docs matching.

Details:
The method keeps dotted member paths, comma spacing, and generic bracket formatting stable so parsed entries compare consistently with resolved symbols.

Params:
- `signature`: Raw signature text.

Returns:
Normalized signature string suitable for index comparison.

---

## CSharpLanguageModule.matchesEntry(symbol: ResolvedSymbol, entry: { signature: string }) -> boolean

Brief: Matches a resolved C# symbol against a parsed docs entry by name and arity.

Details:
This allows the docs index to tolerate formatting differences while still choosing the correct Markdown section for a symbol.

Params:
- `symbol`: Resolved source symbol.
- `entry`: Parsed Markdown entry candidate.

Returns:
True when the entry matches the symbol's normalized name and parameter count.

---

## parseCSharpDocument(document: vscode.TextDocument) -> ParsedSymbolCandidate[]

Brief: Parses a C# document into candidate type and method declarations.

Details:
The parser tracks namespace and type nesting, captures inheritance lists, and emits signatures that align with the extension's docs lookup rules.

Params:
- `document`: Source document to scan.

Returns:
Parsed symbol candidates in source order.

---

## renderCSharpParams(params: Array<{ name: string; type?: string }>) -> string

Brief: Renders normalized parameter metadata back into C#-style parameter text.

Details:
This helper restores the `type name` ordering expected by the canonical C# signature formatter.

Params:
- `params`: Normalized parameter descriptors.

Returns:
Comma-separated C# parameter list text.

---

## extractGenericValues(value?: string) -> Array<{ name: string; value: string }> | undefined

Brief: Extracts generic argument values from a type reference.

Details:
When inheritance includes a closed generic type, this helper converts the argument list into numbered placeholder mappings for stub generation.

Params:
- `value`: Type text that may include generic arguments.

Returns:
Generic argument mappings, or undefined when no generic argument list is present.

---

## countOpenBraces(value: string) -> number

Brief: Counts opening braces in a source line.

Details:
The parser uses brace counts to maintain namespace and type nesting while scanning the document line by line.

Params:
- `value`: Source line text.

Returns:
Number of `{` characters in the input.

---

## countCloseBraces(value: string) -> number

Brief: Counts closing braces in a source line.

Details:
Together with `countOpenBraces`, this helper supports the lightweight block-depth tracking used by the C# parser.

Params:
- `value`: Source line text.

Returns:
Number of `}` characters in the input.

---

## CSharpLanguageModule.getLangBucket(_document: vscode.TextDocument, config: ExternalDocsConfig) -> string

Brief: Describes the repo-local method `getLangBucket` on `CSharpLanguageModule` in `src/languages/csharp/module.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:
- `_document`: Input accepted by `getLangBucket`.
- `config`: Input accepted by `getLangBucket`.

Returns:
Value returned by `getLangBucket`.

---

## extractGenericValues(value: string) -> Array<{ name: string; value: string }> | undefined

Brief: Describes the repo-local function `extractGenericValues` in `src/languages/csharp/module.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:
- `value`: Input accepted by `extractGenericValues`.

Returns:
Value returned by `extractGenericValues`.

---
