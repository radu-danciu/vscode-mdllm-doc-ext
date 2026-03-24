# src/languages/python/module.ts

## PythonLanguageModule

Brief: Resolves Python declarations into canonical signatures for mirrored docs lookup.

Details:
The module infers module-qualified paths, class nesting, callable signatures, inheritance, and template-like type arguments from straightforward source-text parsing.

Inheritance:
- LanguageModule

---

## PythonLanguageModule.canHandle(document: vscode.TextDocument) -> boolean

Brief: Reports whether the module should parse the current document as Python.

Details:
The check only accepts the `python` language identifier so unsupported files fail fast before any parser work begins.

Params:
- `document`: Text document being evaluated.

Returns:
True when the document language ID is `python`.

---

## PythonLanguageModule.getLangBucket(document: vscode.TextDocument, config: ExternalDocsConfig) -> string

Brief: Returns the configured docs bucket for Python sources.

Details:
All Python files map into the Python language bucket from workspace configuration.

Params:
- `document`: Text document being resolved.
- `config`: Normalized external docs configuration.

Returns:
Python docs bucket name from the workspace settings.

---

## PythonLanguageModule.resolveSymbol(context: SymbolContext) -> Promise<ResolvedSymbol | null>

Brief: Resolves the symbol at the current cursor position from a Python document.

Details:
The method combines identifier lookup, parsed-candidate range checks, module-path derivation, and canonical metadata assembly for downstream docs matching.

Params:
- `context`: Resolution context including document, workspace, and config data.

Returns:
Resolved symbol metadata when a matching declaration is found, otherwise null.

---

## PythonLanguageModule.createStub(symbol: ResolvedSymbol) -> string

Brief: Generates the default Markdown stub for a resolved Python symbol.

Details:
The implementation delegates to the shared stub builder so Python docs entries follow the same section layout as the rest of the repo.

Params:
- `symbol`: Resolved symbol to document.

Returns:
Template Markdown for a new mirrored docs entry.

---

## PythonLanguageModule.normalizeSignature(signature: string) -> string

Brief: Normalizes Python signature spacing before docs matching.

Details:
The method stabilizes dotted paths, arrow spacing, and comma spacing so Markdown entries and resolved source symbols compare consistently.

Params:
- `signature`: Raw signature text.

Returns:
Normalized signature string suitable for index comparison.

---

## PythonLanguageModule.matchesEntry(symbol: ResolvedSymbol, entry: { signature: string }) -> boolean

Brief: Matches a resolved Python symbol against a parsed docs entry by name and arity.

Details:
This keeps overload-like callable matching simple and resilient even when signatures differ in formatting details.

Params:
- `symbol`: Resolved source symbol.
- `entry`: Parsed Markdown entry candidate.

Returns:
True when the entry matches the symbol's normalized name and parameter count.

---

## parsePythonDocument(document: vscode.TextDocument, context: SymbolContext) -> ParsedSymbolCandidate[]

Brief: Parses a Python document into candidate class, function, and method declarations.

Details:
The parser derives the module path from the configured source root, tracks indentation-based class nesting, and emits canonical signatures for later docs lookup.

Params:
- `document`: Source document to scan.
- `context`: Resolution context used to compute the module-relative path.

Returns:
Parsed symbol candidates in source order.

---

## extractTemplateValues(value?: string) -> Array<{ name: string; value: string }> | undefined

Brief: Extracts bracketed template-like values from Python base-type text.

Details:
The helper supports both square-bracket and angle-bracket forms so generic base classes can populate template argument placeholders in generated stubs.

Params:
- `value`: Type text that may include generic arguments.

Returns:
Template argument mappings, or undefined when no generic argument list is present.

---

## PythonLanguageModule.getLangBucket(_document: vscode.TextDocument, config: ExternalDocsConfig) -> string

Brief: Describes the repo-local method `getLangBucket` on `PythonLanguageModule` in `src/languages/python/module.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:
- `_document`: Input accepted by `getLangBucket`.
- `config`: Input accepted by `getLangBucket`.

Returns:
Value returned by `getLangBucket`.

---

## extractTemplateValues(value: string) -> Array<{ name: string; value: string }> | undefined

Brief: Describes the repo-local function `extractTemplateValues` in `src/languages/python/module.ts`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:
- `value`: Input accepted by `extractTemplateValues`.

Returns:
Value returned by `extractTemplateValues`.

---
