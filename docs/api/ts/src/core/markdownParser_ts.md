## src/core/markdownParser.ts

### `parseMarkdownEntries(content: string, normalizeSignature: (signature: string) => string) -> ParsedDocFile`

Brief: Parses one mirrored Markdown file into symbol entries keyed by `###` headings.

Details:
The parser accepts the repo-standard `##` file title plus backticked `###` signature headings, while still tolerating the older heading layout during migration.

Returns:
Parsed file metadata plus its symbol entries.

---

### `unwrapSignatureHeading(value: string) -> string`

Brief: Removes one outer pair of backticks from a parsed signature heading.

Details:
This keeps canonical signature matching stable even though mirrored docs now render signatures as inline code.

Returns:
Normalized signature text without markdown fencing.

---
