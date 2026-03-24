const childProcess = require('child_process');
const { packageRelease } = require('./package-release.cjs');

function runNpx(args, cwd, env) {
  const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  childProcess.execFileSync(command, args, {
    cwd,
    stdio: 'inherit',
    env
  });
}

function publishRelease(rootDir = process.cwd()) {
  const pat = process.env.VSCE_PAT;
  if (!pat) {
    throw new Error('VSCE_PAT must be set to publish a release.');
  }

  const info = packageRelease(rootDir);
  runNpx(['vsce', 'publish', '--packagePath', info.artifactPath, '--pat', pat], rootDir, process.env);
  return info;
}

if (require.main === module) {
  const info = publishRelease();
  process.stdout.write(`Published ${info.artifactPath}\n`);
}

module.exports = {
  publishRelease
};
