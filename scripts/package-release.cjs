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

function packageRelease(rootDir = process.cwd()) {
  const info = getReleaseInfo(rootDir);
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
