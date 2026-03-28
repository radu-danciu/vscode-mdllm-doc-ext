const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

function readPackageJson(rootDir) {
  const packagePath = path.join(rootDir, 'package.json');
  return JSON.parse(fs.readFileSync(packagePath, 'utf8'));
}

function readVersionFile(rootDir) {
  const versionPath = path.join(rootDir, 'VERSION');
  return fs.readFileSync(versionPath, 'utf8').trim();
}

function assertSemver(version) {
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    throw new Error(`package.json version must use major.minor.patch. Received "${version}".`);
  }
}

function getGitSha(rootDir, ref = 'HEAD') {
  return childProcess
    .execFileSync('git', ['rev-parse', '--short', ref], {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'inherit']
    })
    .trim();
}

function getReleaseInfo(rootDir = process.cwd(), ref = 'HEAD') {
  const pkg = readPackageJson(rootDir);
  const version = readVersionFile(rootDir);
  assertSemver(version);
  if (pkg.version !== version) {
    throw new Error(
      `VERSION (${version}) and package.json version (${pkg.version}) must match before release packaging.`
    );
  }
  const gitSha = getGitSha(rootDir, ref);
  const releaseVersion = `${version}.${gitSha}`;
  return {
    packageName: pkg.name,
    packageVersion: version,
    gitSha,
    releaseVersion,
    gitTag: `v${releaseVersion}`,
    artifactPath: path.join(rootDir, 'dist', `${pkg.name}-${releaseVersion}.vsix`)
  };
}

function printField(info, field) {
  if (!(field in info)) {
    throw new Error(`Unknown field "${field}".`);
  }

  process.stdout.write(`${info[field]}\n`);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const fieldIndex = args.indexOf('--field');
  const json = args.includes('--json');
  const info = getReleaseInfo();

  if (fieldIndex !== -1) {
    printField(info, args[fieldIndex + 1]);
  } else if (json) {
    process.stdout.write(`${JSON.stringify(info, null, 2)}\n`);
  } else {
    process.stdout.write(
      [
        `package version: ${info.packageVersion}`,
        `git sha: ${info.gitSha}`,
        `release version: ${info.releaseVersion}`,
        `git tag: ${info.gitTag}`,
        `artifact: ${info.artifactPath}`
      ].join('\n') + '\n'
    );
  }
}

module.exports = {
  getReleaseInfo,
  assertSemver,
  getGitSha,
  readVersionFile
};
