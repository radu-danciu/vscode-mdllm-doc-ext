const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');
const { getReleaseInfo } = require('./release-info.cjs');

function runNpx(args, cwd) {
  const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  childProcess.execFileSync(command, args, {
    cwd,
    stdio: 'inherit'
  });
}

function runNpmScript(script, cwd) {
  const command = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  childProcess.execFileSync(command, ['run', script], {
    cwd,
    stdio: 'inherit'
  });
}

function hasCommand(command) {
  const lookup = process.platform === 'win32' ? 'where' : 'which';
  try {
    childProcess.execFileSync(lookup, [command], {
      stdio: 'ignore'
    });
    return true;
  } catch {
    return false;
  }
}

function runRepoCheck(cwd) {
  if (process.platform === 'linux' && hasCommand('xvfb-run')) {
    childProcess.execFileSync('xvfb-run', ['-a', process.platform === 'win32' ? 'npm.cmd' : 'npm', 'run', 'check'], {
      cwd,
      stdio: 'inherit'
    });
    return;
  }

  runNpmScript('check', cwd);
}

function packageRelease(rootDir = process.cwd()) {
  const info = getReleaseInfo(rootDir);
  runRepoCheck(rootDir);
  fs.mkdirSync(path.dirname(info.artifactPath), { recursive: true });
  runNpx(['vsce', 'package', '-o', info.artifactPath], rootDir);
  return info;
}

if (require.main === module) {
  const info = packageRelease();
  process.stdout.write(`Packaged ${info.artifactPath}\n`);
}

module.exports = {
  packageRelease
};
