# External Markdown Docs

*This repository was put together using an agentic LLM AI framework. If that offends you in any way, you are free to not use it.*

[![CI](https://github.com/radu-danciu/vscode-mdllm-doc-ext/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/radu-danciu/vscode-mdllm-doc-ext/actions/workflows/ci.yml)
[![Release](https://github.com/radu-danciu/vscode-mdllm-doc-ext/actions/workflows/release-build.yml/badge.svg)](https://github.com/radu-danciu/vscode-mdllm-doc-ext/actions/workflows/release-build.yml)

Keep symbol documentation in Markdown files outside source code, while still getting hover docs, click-through navigation, and quick stub creation inside VS Code.

Language support:

- C / C++
- C#
- JavaScript / TypeScript
- Python

## What it does

- Shows hover documentation from mirrored Markdown files.
- Sends `Go to Definition` / Ctrl+Click to the matching Markdown entry.
- Falls back to built-in or other extension hovers and definitions when no mirrored Markdown entry exists.
- Offers `Create Symbol Documentation` only when no mirrored doc entry and no better hover result exist.
- Mirrors source files into `docs/api/<language-bucket>/...`.

Example mappings:

- `src/core/config.ts` -> `docs/api/ts/src/core/config_ts.md`
- `include/math/vector.h` -> `docs/api/cpp/include/math/vector_h.md`
- `src/Foo/Bar.cs` -> `docs/api/csharp/src/Foo/Bar_cs.md`
- `pkg/math/vector.py` -> `docs/api/python/pkg/math/vector_py.md`

## Markdown format

```md
## src/core/config.ts

### `getConfig(workspaceFolder: vscode.WorkspaceFolder) -> ExternalDocsConfig`

Brief: Reads the extension settings for a workspace.

Details:
Shared config entrypoint for the extension.

---
```

The first `##` heading identifies the source file. Each `###` heading is one symbol entry keyed by canonical signature.

## Commands

- `Create Symbol Documentation`
- `Open Symbol Documentation`
- `Rebuild Documentation Index`

## Settings

```json
{
  "externalDocs.codeRoot": ".",
  "externalDocs.docsRoot": "docs/api",
  "externalDocs.openMode": "split",
  "externalDocs.languageBuckets.cpp": "cpp",
  "externalDocs.languageBuckets.csharp": "csharp",
  "externalDocs.languageBuckets.typescript": "ts",
  "externalDocs.languageBuckets.javascript": "js",
  "externalDocs.languageBuckets.python": "python"
}
```

## Quick start

1. Open a workspace that contains source files plus mirrored docs.
2. Keep docs under `docs/api/<bucket>/...` or change `externalDocs.docsRoot`.
3. Hover a supported symbol with an existing Markdown entry.
4. Hover a supported symbol with only source comments to see the source-comment fallback.
5. Use `Create Symbol Documentation` on a supported symbol that has neither mirrored docs nor a better built-in hover.

## Dogfooding this repo

This repository is set up to work as its own sample workspace with the default settings.

- Source: `src/` and `showcase/`
- Self-hosted docs: `docs/api/...`
- Manual TypeScript test file: `showcase/ts/showcase.ts`
- Cross-language samples: `showcase/`

Hover `normalizeShowcase` or `ShowcaseVector`, then Ctrl+Click to jump to `docs/api/ts/showcase/ts/showcase_ts.md`.
Hover `builtinCommentShowcase` to confirm built-in/source-comment hover behavior still works when there is no external Markdown entry.
Use the cross-language examples under `showcase/` for manual checks in TypeScript, JavaScript, Python, C++, and C#, each with matching docs under `docs/api/<bucket>/showcase/...`.

## Development

```bash
npm install
npm run check
npm run package:vsix
```

Output VSIX:

- `dist/vscode-mdllm-doc-ext.vsix`

Developer notes and extension architecture are in `docs/developer-guide.md`.

## Release flow

Base extension versions stay in semver form inside `package.json`:

- `major.minor.patch`

Release tags and release VSIX filenames add the current git short SHA:

- `major.minor.patch.git_sha`

Typical flow:

```bash
npm run release:bump -- patch
git commit -am "Release 0.1.1"
npm run release:tag
git push --follow-tags
```

Useful commands:

- `npm run check`
- `npm run release:info`
- `npm run package:vsix`
- `npm run package:release`
- `npm run publish:release` when publishing locally on purpose

GitHub release packaging and GitHub release assets live in the `Release Build` workflow, which reruns `npm run check` before packaging.
Marketplace publishing is a separate `Marketplace Publish` workflow and expects a repository secret named `VSCE_PAT`. No secret material is stored in this repository.
Tagged releases upload the packaged `.vsix` back to GitHub as both an Actions artifact and a GitHub release asset.

## Limitations

- Symbol resolution is heuristic and text-based in this first pass.
- Common functions, methods, classes/types, TypeScript interfaces and type aliases, and object-like containers are supported first.
- Matching is exact signature first, then normalized signature, then narrow fallback matching.

## License

MIT. See the `LICENSE` file in the repository root.
