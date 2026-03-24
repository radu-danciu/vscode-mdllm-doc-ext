# src/languages/stub.ts

## createDefaultStub(symbol: ResolvedSymbol) -> string

Brief: Builds a default mirrored Markdown stub for a resolved symbol.

Details:
The template includes the standard section layout used throughout the repo and expands parameter, return, inheritance, and template-argument placeholders from the resolved symbol metadata.

Params:
- `symbol`: Resolved symbol metadata used to seed the stub content.

Returns:
Markdown text ready to write into a mirrored docs file.

---
