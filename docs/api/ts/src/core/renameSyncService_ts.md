## src/core/renameSyncService.ts

### `RenameSyncService`

Brief: Watches source document edits and mirrors declaration renames into external markdown docs.

Details:
This service covers rename flows where another language provider performs the source refactor and the extension still needs to synchronize mirrored markdown afterward.

---

### `RenameSyncService.dispose() -> void`

Brief: Disposes the document watchers and clears cached source snapshots.

Details:
Called when the extension is deactivated so the background rename-sync observers are removed cleanly.

Returns:
No return value.

---

### `RenameSyncService.handleDocumentChange(event: vscode.TextDocumentChangeEvent) -> Promise<void>`

Brief: Processes a source document change and applies mirrored markdown edits when it resolves to a declaration rename.

Details:
Markdown documents and self-applied doc-sync edits are ignored so the service only reacts to relevant source-side changes.

Params:

- `event`: Source document change event from the workspace.

Returns:
Promise that resolves after any derived markdown edits have been applied.

---

### `RenameSyncService.deriveRenameSyncPlan(event: vscode.TextDocumentChangeEvent, previousText: string) -> Promise<{ target: ResolvedDocumentationTarget; plan: SymbolRenamePlan } | null>`

Brief: Derives a rename plan by diffing the file’s pre-change and post-change symbol inventories.

Details:
This avoids depending on fragmented text-change payloads and instead compares the actual declaration symbols that existed before and after the source edit.

Params:

- `event`: Source document change event from the workspace.
- `previousText`: Cached pre-change text for the document.

Returns:
Resolved documentation target and markdown rename plan, or `null` when no unique declaration rename can be inferred.

---

### `RenameSyncService.findRenamedSymbolPair(previousSymbols: readonly ResolvedSymbol[], currentSymbols: readonly ResolvedSymbol[]) -> { previous: ResolvedSymbol; current: ResolvedSymbol } | null`

Brief: Finds the unique declaration pair that differs only by symbol name between the old and new file states.

Details:
The comparison keeps kind, owning container, callable shape, return type, and declaration line aligned so only conservative rename candidates are accepted.

Params:

- `previousSymbols`: Symbols parsed from the pre-change file snapshot.
- `currentSymbols`: Symbols parsed from the post-change file state.

Returns:
Matching before-and-after symbol pair, or `null` when no unique rename candidate exists.

---

### `RenameSyncService.normalizeType(value?: string) -> string`

Brief: Normalizes type text for stable comparison during rename detection.

Details:
Whitespace-only differences are collapsed so symbol comparisons focus on semantic shape rather than formatting.

Params:

- `value`: Type text to normalize.

Returns:
Whitespace-normalized type text, or an empty string when no type is present.

---

### `RenameSyncService.equalTypeLists(left: readonly string[], right: readonly string[]) -> boolean`

Brief: Compares two type lists for normalized ordered equality.

Details:
Rename detection uses this to confirm that pre-change and post-change call signatures still describe the same declaration apart from the symbol name.

Params:

- `left`: First type list.
- `right`: Second type list.

Returns:
`true` when the two type lists are equal after normalization.

---
