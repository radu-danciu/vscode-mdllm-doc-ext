# src/core/markdownParser.ts

## parseMarkdownEntries(content: string, normalizeSignature: (signature: string) => string) -> ParsedDocFile

Brief: Parses one mirrored Markdown file into symbol entries keyed by `##` headings.

Details:
The parser keeps the format intentionally small so docs remain easy to edit by hand and easy to index quickly.

Returns:
Parsed file metadata plus its symbol entries.

---
