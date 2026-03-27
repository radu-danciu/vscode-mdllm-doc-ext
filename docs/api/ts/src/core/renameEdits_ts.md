## src/core/renameEdits.ts

### `SymbolRenamePlan`

Brief: Canonical before-and-after symbol metadata used during doc rewrites.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `buildSymbolRenamePlan(target: Pick<ResolvedDocumentationTarget, 'symbol'>, newName: string) -> SymbolRenamePlan | null`

Brief: Builds the rename plan for a source symbol.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `rewriteMarkdownCodeSpans(content: string, plan: SymbolRenamePlan) -> string`

Brief: Rewrites backticked code spans during rename.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `appendMarkdownRenameEdits(workspaceEdit: vscode.WorkspaceEdit, workspaceFolder: vscode.WorkspaceFolder, docsRoot: string, plan: SymbolRenamePlan) -> Promise<void>`

Brief: Appends mirrored Markdown edits to an existing rename edit.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `canonicalHead(signature: string) -> string`

Brief: Extracts the canonical qualified head used during rename matching.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `replaceLastOccurrence(value: string, search: string, replacement: string) -> string`

Brief: Replaces the last matching substring during rename rewriting.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `replaceTailIdentifier(value: string, newName: string) -> string`

Brief: Rewrites only the tail identifier of a qualified symbol path.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---

### `rewriteCodeSpan(value: string, plan: SymbolRenamePlan) -> string`

Brief: Rewrites a single backticked code span according to a rename plan.

Details:
Self-hosted mirrored documentation entry used for runtime lookup and repo dogfooding.

---
