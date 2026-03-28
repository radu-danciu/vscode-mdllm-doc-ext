# Developer Guide

## Philosophy

Keep the extension boring, deterministic, and easy to extend.

- The core stays language-agnostic.
- Each language module owns symbol detection and canonical signatures.
- Markdown files are the source of truth for documentation content.
- Mirrored file paths make docs easy for both humans and tools to locate.
- Heuristic string matching is preferred over heavy semantic tooling.
- The extension should not steal hovers or definitions when the editor already has a better answer.
- Source-driven rename should preserve the editor's normal rename semantics and only append conservative Markdown edits.
- The repository should remain fully dogfooded: the extension code, helper scripts, tests, and showcase samples all live beside mirrored docs.

## Repository layout

```text
src/
  extension.ts          extension activation and registration
  commands/             user-facing commands
  core/                 config, mapping, parsing, indexing, providers
  languages/            built-in language modules

showcase/
  ts/ js/ python/       repo-local valid sample files per supported language
  cpp/ csharp/          cross-language manual showcase sources

docs/
  api/                  mirrored Markdown docs for the repo itself and showcase files
  developer-guide.md    maintainer notes

test/
  core/                 path mapping and Markdown parser/index tests
  languages/            resolver and stub tests per language
  integration/          VS Code host tests
  fixtures/             cross-language sample workspaces used by automated tests

scripts/
  *.cjs                 release/version helpers, also mirrored into docs/api/js/scripts
```

## Core flow

1. A hover, definition request, rename request, or command resolves the active document and cursor position.
2. The registry selects a `LanguageModule` for that document.
3. The module produces a `ResolvedSymbol` with a canonical signature.
4. The path mapper mirrors the source file into a docs file path.
5. The doc index parses the Markdown file and finds the matching `###` entry.
6. If a Markdown entry exists, the provider or command renders it or opens it directly.
7. If no Markdown entry exists, hover/definition fall back to the editor or other extensions first.
8. Source-driven rename delegates the real source edit to the editor or language tooling and only appends mirrored Markdown edits afterward.
9. Only when there is still no better result does the extension offer the create-doc affordance or source-comment fallback.

## Adding another language

Add a new module under `src/languages/` that implements the shared `LanguageModule` contract.

The module should provide:

- supported VS Code language IDs
- symbol resolution at the cursor
- canonical signatures for functions/methods and types
- signature normalization
- stub generation
- optional narrow fallback matching

Then:

1. Register the module in `src/extension.ts`.
2. Add fixture source files and mirrored docs under `test/fixtures/`.
3. Add resolver tests in `test/languages/`.
4. Add integration coverage if the new language changes end-to-end behavior.
5. Add or update a valid sample under `showcase/` plus its mirrored docs if the language is user-visible in the repository sample.

## Stub format

All modules emit the same general Markdown shape:

- `## <source-relative-path>`
- ``### `<canonical signature>` ``
- `Brief`
- `Details`
- `Params` when relevant
- `Returns` when relevant
- `Inheritance` for type/class/object stubs when recoverable
- `Template Arguments` when concrete substitutions are known

## What not to do

- Do not push semantic-engine complexity into the core.
- Do not make fallback matching broad enough to create false positives.
- Do not centralize all docs into a single index file.
- Do not rely on in-source comments as the primary documentation source; they are only a fallback when mirrored docs are absent.

## Release process

- Keep `VERSION` and `package.json` aligned on a normal semver version: `major.minor.patch`.
- Treat `VERSION` as the canonical plaintext source and update it alongside feature/fix commits so release tags are cut from an already-accounted-for base version.
- Use `npm run release:bump -- <major|minor|patch|x.y.z>` to update both `VERSION` and `package.json` for the next base version.
- Commit the release change.
- Use `npm run release:tag` on the release commit to create `vmajor.minor.patch.git_sha`.
- Push with `git push --follow-tags`.
- `CI` validates the repository on pushes and pull requests.
- `Release Build` validates the tag format, reruns `npm run check`, packages the tagged build, and uploads the VSIX back to GitHub.
- `Marketplace Publish` is separate, secret-gated by `VSCE_PAT`, and publishes a packaged tagged VSIX to the VS Code Marketplace.
- Changing `package.json.name` changes the extension identity for VS Code and Marketplace update purposes.
- Local publish remains optional and is intentionally outside the default repository workflow.
