## src/core/renameProvider.ts

### `ExternalDocsRenameProvider`

Brief: Augments source-initiated renames with mirrored Markdown edits.

Details:
The provider delegates the actual symbol rename to the editor or language tooling first, then appends synchronized edits for mirrored docs and backticked code references.

Inheritance:

- `none`

---

### `ExternalDocsRenameProvider.prepareRename(document: vscode.TextDocument, position: vscode.Position) -> Promise<vscode.Range | { range: vscode.Range; placeholder: string } | null>`

Brief: Validates that rename starts on the symbol identifier token instead of anywhere inside the widened declaration range.

Details:
This keeps declaration-wide doc resolution for hover and definition without letting F2 on parameter or return-type text rewrite the wrong symbol docs.

Params:

- `document`: Source document being renamed.
- `position`: Cursor position where rename was invoked.

Returns:
The identifier range and placeholder when the symbol supports synchronized rename, otherwise null.

---

### `ExternalDocsRenameProvider.provideRenameEdits(document: vscode.TextDocument, position: vscode.Position, newName: string) -> Promise<vscode.WorkspaceEdit | null>`

Brief: Delegates source rename edits to the language provider and appends mirrored Markdown updates.

Details:
The returned workspace edit keeps the editor's normal symbol rename behavior intact while extending it to the repo's external-docs convention.

Params:

- `document`: Source document being renamed.
- `position`: Cursor position where rename was invoked.
- `newName`: Replacement symbol name.

Returns:
The merged rename edit, or null when rename should fall back entirely to the editor.

---
