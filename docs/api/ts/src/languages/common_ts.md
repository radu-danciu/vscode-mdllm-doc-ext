# src/languages/common.ts

## ParsedSymbolCandidate

Brief: Shared parsed-symbol shape used by the language modules before a candidate is promoted into a resolved symbol.

Details:
The interface keeps parser output uniform across languages so later matching, signature normalization, and stub generation can work against one structure.

Inheritance:
- none

---

## getWordRange(document: vscode.TextDocument, position: vscode.Position) -> vscode.Range | undefined

Brief: Returns the word range used as the initial lookup span for symbol resolution.

Details:
The helper applies the extension's broader identifier regex so language modules can recognize names that include separators such as `.`, `:`, and generic markers.

Params:
- `document`: Text document being inspected.
- `position`: Cursor or hover location to resolve.

Returns:
The matching word range, or undefined when the position is not on a supported identifier token.

---

## rangeContains(range: vscode.Range, position: vscode.Position) -> boolean

Brief: Tests whether a position falls inside a parsed candidate range.

Details:
Language-module parsers use this to select the symbol candidate that actually encloses the cursor after building a list of declarations from the file text.

Params:
- `range`: Candidate declaration range.
- `position`: Cursor or hover location being checked.

Returns:
True when the position lies within the inclusive start and end bounds of the range.

---

## splitParams(paramText: string) -> Array<{ name: string; type?: string }>

Brief: Splits a raw parameter list into normalized name and type pairs.

Details:
The parser handles both colon-style and space-separated type syntaxes, strips simple default values, and preserves enough structure for signature generation and stub output.

Params:
- `paramText`: Raw parameter text captured from a declaration signature.

Returns:
Normalized parameter descriptors in declaration order.

---

## splitTopLevel(value: string, separator: string) -> string[]

Brief: Splits text on a separator while ignoring nested generic, call, and index expressions.

Details:
This is the low-level utility that keeps comma-separated parsing stable when signatures contain nested angle brackets, parentheses, or brackets.

Params:
- `value`: Text to split.
- `separator`: Single-character separator to break on at top level.

Returns:
Top-level segments with nested sections preserved intact.

---

## signatureName(signature: string) -> string

Brief: Extracts the terminal symbol name from a canonical signature string.

Details:
Matching logic uses this helper to compare docs entries and resolved symbols even when signatures include namespaces, containers, or return types.

Params:
- `signature`: Canonical signature string.

Returns:
The last identifier-like segment of the signature.

---

## signatureArity(signature: string) -> number | undefined

Brief: Computes the top-level parameter count for a canonical signature.

Details:
The helper returns a stable arity value for overload matching and leaves the result undefined for signatures that do not contain an argument list.

Params:
- `signature`: Canonical signature string.

Returns:
Parameter count, zero for an empty argument list, or undefined when no callable signature is present.

---
