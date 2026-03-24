# src/core/pathMapper.ts

## mapSourceToDocs(workspaceFolder: vscode.WorkspaceFolder, sourceUri: vscode.Uri, config: ExternalDocsConfig, langBucket: string) -> PathMappingResult | null

Brief: Maps a source file into its mirrored Markdown docs path.

Details:
This is the central rule that keeps source and docs trees aligned across all supported languages.

Returns:
Mirrored docs path information or null when the source is outside the configured code root.

---

## PathMappingResult

Brief: Defines the repo-local type `PathMappingResult` in `src/core/pathMapper.ts`.

Details:
This entry keeps the repository self-documented so the extension can resolve its own type symbols while developing against this workspace.

---
