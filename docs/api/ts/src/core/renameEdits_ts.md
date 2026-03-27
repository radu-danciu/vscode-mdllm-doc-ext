## src/core/renameEdits.ts

### `SymbolRenamePlan`

Brief: Canonical rename metadata used to mirror source renames into markdown documentation.

Details:
Carries the before-and-after symbol identity, callable shape, and primary docs file mapping needed to plan safe markdown rewrites.

---

### `PrimaryDocHeadingMatch`

Brief: Describes the primary mirrored heading chosen for a markdown rename.

Details:
The match can be exact or a unique stale heading that still confidently corresponds to the renamed source symbol.

---

### `buildSymbolRenamePlan(target: Pick<ResolvedDocumentationTarget, 'symbol' | 'mapping'>, newName: string) -> SymbolRenamePlan | null`

Brief: Builds the rename plan for a resolved source symbol and requested replacement name.

Details:
Returns `null` when the target cannot be renamed safely through simple tail-identifier replacement.

Params:

- `target`: Resolved source target and mirrored docs mapping.
- `newName`: Replacement symbol name coming from the editor rename flow.

Returns:
Canonical rename plan used by the markdown rewrite stage, or `null` when no safe plan exists.

---

### `rewriteMarkdownCodeSpans(content: string, plan: SymbolRenamePlan, primaryMatch?: PrimaryDocHeadingMatch | null) -> string`

Brief: Rewrites backticked code spans inside a markdown document according to a rename plan.

Details:
The optional `primaryMatch` allows stale headings and code spans in the primary mirrored file to be repaired while the rename is being applied.

Params:

- `content`: Markdown source to rewrite.
- `plan`: Canonical rename plan describing the old and new symbol identities.
- `primaryMatch`: Exact or stale primary heading match when one was identified in the main mirrored file.

Returns:
Markdown text with matching code spans updated to the renamed symbol.

---

### `appendMarkdownRenameEdits(workspaceEdit: vscode.WorkspaceEdit, workspaceFolder: vscode.WorkspaceFolder, docsRoot: string, plan: SymbolRenamePlan) -> Promise<void>`

Brief: Appends mirrored markdown edits to an existing source rename workspace edit.

Details:
This scans the docs tree, rewrites matching backticked references, and updates the primary mirrored heading when it can be identified safely.

Params:

- `workspaceEdit`: Existing source rename edits that should be augmented with markdown updates.
- `workspaceFolder`: Workspace root that owns the mirrored docs tree.
- `docsRoot`: Relative docs root configured for the extension.
- `plan`: Canonical rename plan for the source symbol being renamed.

Returns:
Promise that resolves after markdown edits have been appended to the workspace edit.

---

### `loadPrimaryDocHeadingMatch(plan: SymbolRenamePlan) -> Promise<PrimaryDocHeadingMatch | null>`

Brief: Loads and selects the primary mirrored heading used to anchor stale-aware rename repair.

Details:
The selected match is reused across all markdown files so stale qualified references can move with the source rename.

Params:

- `plan`: Canonical rename plan for the source symbol being renamed.

Returns:
Exact or stale primary heading match, or `null` when no safe primary heading can be chosen.

---

### `canonicalHead(signature: string) -> string`

Brief: Extracts the qualified symbol head from a canonical signature.

Details:
This is used to compare rename targets and to rewrite backticked qualified references consistently.

Params:

- `signature`: Canonical signature or heading text.

Returns:
Qualified symbol head with return-type text removed.

---

### `replaceTailIdentifier(value: string, newName: string) -> string`

Brief: Replaces only the last identifier segment of a qualified symbol path.

Details:
Generic suffixes are preserved so type-like names stay structurally intact during rename planning.

Params:

- `value`: Qualified symbol head to rewrite.
- `newName`: Replacement tail identifier.

Returns:
Qualified symbol head with only the last identifier replaced.

---

### `replaceLastOccurrence(value: string, search: string, replacement: string) -> string`

Brief: Replaces the last occurrence of a substring in a larger string.

Details:
Rename planning uses this to swap the old qualified head for the new one inside the canonical signature.

Params:

- `value`: Full source string to rewrite.
- `search`: Substring to replace.
- `replacement`: Replacement substring.

Returns:
String with the last matching occurrence replaced.

---

### `selectPrimaryDocHeadingMatch(signatures: readonly string[], plan: SymbolRenamePlan) -> PrimaryDocHeadingMatch | null`

Brief: Chooses the primary mirrored heading that should be updated during rename.

Details:
Exact canonical matches win first. If no exact match exists, a single high-confidence stale heading in the same file can be selected instead.

Params:

- `signatures`: Canonical signatures parsed from the primary mirrored markdown file.
- `plan`: Canonical rename plan for the symbol being renamed.

Returns:
Exact or stale primary heading match, or `null` when no safe target exists.

---

### `rewriteCodeSpan(value: string, plan: SymbolRenamePlan, primaryMatch: PrimaryDocHeadingMatch | null) -> string`

Brief: Rewrites one backticked code span according to the rename plan and primary heading match.

Details:
This function handles exact canonical signatures, stale primary aliases, and container-prefixed child references.

Params:

- `value`: Code span content without backticks.
- `plan`: Canonical rename plan for the source symbol.
- `primaryMatch`: Exact or stale primary heading match when one exists.

Returns:
Rewritten code span content.

---

### `isHighConfidenceStaleMatch(signature: string, plan: SymbolRenamePlan) -> boolean`

Brief: Tests whether a mirrored heading is a unique stale-but-equivalent candidate for rename repair.

Details:
The match requires the same container prefix, callable arity, normalized parameter types, and normalized return type.

Params:

- `signature`: Candidate mirrored heading signature.
- `plan`: Canonical rename plan for the source symbol.

Returns:
`true` when the signature is a safe stale match for the rename target.

---

### `signatureDetails(signature: string) -> { head: string; arity?: number; paramTypes: string[]; returnType?: string; }`

Brief: Extracts normalized callable details from a canonical signature.

Details:
The rename matcher uses these details to compare stale markdown headings against the source symbol being renamed.

Params:

- `signature`: Canonical signature to analyze.

Returns:
Qualified head, arity, normalized parameter types, and normalized return type.

---

### `typeFromParam(value: string) -> string | undefined`

Brief: Extracts the type portion from a parameter fragment.

Details:
Supports both colon-style and space-delimited parameter formats so rename matching can compare callable shapes across languages.

Params:

- `value`: Raw parameter fragment from a canonical signature.

Returns:
Normalized parameter type, or `undefined` when none can be inferred.

---

### `returnTypeFromSignature(signature: string) -> string | undefined`

Brief: Extracts the return type portion from a canonical signature when one exists.

Details:
Supports both arrow-style signatures and signatures that encode the return type before the callable head.

Params:

- `signature`: Canonical signature to inspect.

Returns:
Return type text, or `undefined` when none is present.

---

### `containerPrefixForHead(head: string) -> string`

Brief: Returns the container-qualified prefix of a symbol head.

Details:
This is used to ensure stale-match repair stays inside the same owning type or namespace.

Params:

- `head`: Qualified symbol head.

Returns:
Containing qualified prefix, or an empty string when the head is top-level.

---

### `splitTopLevel(value: string) -> string[]`

Brief: Splits a comma-delimited signature fragment at top level only.

Details:
Nested generics, tuples, and brackets are preserved so callable arity and parameter-type extraction remain stable.

Params:

- `value`: Delimited parameter or type fragment.

Returns:
Top-level segments with nested comma groups preserved.

---

### `normalizeTypeText(value?: string) -> string | undefined`

Brief: Collapses type-text whitespace for stable signature comparison.

Details:
The rename matcher uses this before comparing parameter and return types between source and markdown.

Params:

- `value`: Type text to normalize.

Returns:
Whitespace-normalized type text, or `undefined`.

---

### `equalTypeLists(left: readonly string[], right: readonly string[]) -> boolean`

Brief: Compares two normalized type lists for exact ordered equality.

Details:
This is part of the conservative stale-match test for markdown heading repair during rename.

Params:

- `left`: First normalized type list.
- `right`: Second normalized type list.

Returns:
`true` when the two lists are the same length and contain the same values in order.

---
