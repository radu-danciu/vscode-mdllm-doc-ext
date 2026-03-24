## scripts/package-release.cjs

### `runNpx(args, cwd)`

Brief: Describes the repo-local function `runNpx` in `scripts/package-release.cjs`.

Details:
This self-hosted entry keeps the workspace fully dogfooded for hover, definition, and markdown lookup flows.

Params:

- `args`: Input accepted by `runNpx`.
- `cwd`: Input accepted by `runNpx`.

---

### `runNpmScript(script, cwd)`

Brief: Runs a repository-local npm script before packaging a release artifact.

Details:
This helper keeps release packaging gated behind the same local checks used by CI and tagged builds.

Params:

- `script`: npm script name to execute.
- `cwd`: Working directory for the npm command.

---

### `hasCommand(command)`

Brief: Checks whether a shell command is available in the current environment.

Details:
Release packaging uses this helper to decide whether it can launch the repo checks through `xvfb-run` on Linux CI runners.

Params:

- `command`: Executable name to probe.

---

### `runRepoCheck(cwd)`

Brief: Runs the repository `check` gate with the right wrapper for the current platform.

Details:
On Linux CI runners this helper uses `xvfb-run` so VS Code integration tests still pass when packaging a release inside a headless environment.

Params:

- `cwd`: Working directory for the repo check command.

---

### `packageRelease(rootDir)`

Brief: Packages a release VSIX after the repository checks pass.

Details:
This helper enforces the local `check` gate before invoking `vsce package`, while still handling headless Linux packaging runs correctly.

Params:

- `rootDir`: Input accepted by `packageRelease`.

---
