## src/languages/common.ts

### `ParsedSymbolCandidate`

Brief: Shared parsed-symbol shape used before promotion to a resolved symbol.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `getWordRange(document: vscode.TextDocument, position: vscode.Position) -> vscode.Range | undefined`

Brief: Returns the wide identifier range used during lookup.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `rangeContains(range: vscode.Range, position: vscode.Position) -> boolean`

Brief: Tests whether a position falls inside a range.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `declarationLineRange(document: vscode.TextDocument, lineIndex: number) -> vscode.Range`

Brief: Builds a declaration range for a single source line.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `captureBalancedDeclarationRange(document: vscode.TextDocument, startLine: number, endPattern: RegExp) -> vscode.Range`

Brief: Captures a declaration range while balancing nested syntax.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `declarationText(document: vscode.TextDocument, startLine: number, endPattern: RegExp) -> string`

Brief: Normalizes a declaration range into single-line text.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `identifierRangeOnLine(line: string, lineIndex: number, name: string) -> vscode.Range | undefined`

Brief: Finds the identifier span for a parsed declaration.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `selectBestCandidate(candidates: ParsedSymbolCandidate[], position: vscode.Position) -> ParsedSymbolCandidate | undefined`

Brief: Chooses the best parsed candidate for a position.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `splitParams(paramText: string) -> Array<{ name: string; type?: string }>`

Brief: Splits a raw parameter list into normalized descriptors.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `splitTopLevel(value: string, separator: string) -> string[]`

Brief: Splits text on a top-level separator while honoring nesting.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `signatureName(signature: string) -> string`

Brief: Extracts the terminal name from a canonical signature.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `signatureArity(signature: string) -> number | undefined`

Brief: Computes the top-level arity of a callable signature.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `terminatesDeclaration(endPattern: RegExp, char: string, next?: string) -> boolean`

Brief: Checks whether a top-level token should terminate declaration capture.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `escapeRegex(value: string) -> string`

Brief: Escapes literal text for safe regex matching.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---
