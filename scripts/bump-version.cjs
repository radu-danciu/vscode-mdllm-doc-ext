const fs = require('fs');
const path = require('path');
const { assertSemver } = require('./release-info.cjs');

function bumpVersion(current, bump) {
  const [major, minor, patch] = current.split('.').map(Number);
  if (bump === 'major') {
    return `${major + 1}.0.0`;
  }
  if (bump === 'minor') {
    return `${major}.${minor + 1}.0`;
  }
  if (bump === 'patch') {
    return `${major}.${minor}.${patch + 1}`;
  }
  if (/^\d+\.\d+\.\d+$/.test(bump)) {
    return bump;
  }

  throw new Error('Usage: npm run release:bump -- <major|minor|patch|x.y.z>');
}

function updateVersion(rootDir = process.cwd(), bump = 'patch') {
  const packagePath = path.join(rootDir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  assertSemver(packageJson.version);
  const nextVersion = bumpVersion(packageJson.version, bump);
  packageJson.version = nextVersion;
  fs.writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);
  return nextVersion;
}

if (require.main === module) {
  const bump = process.argv[2] ?? 'patch';
  const nextVersion = updateVersion(process.cwd(), bump);
  process.stdout.write(
    [
      `Updated package.json to ${nextVersion}.`,
      'Commit the change, then run `npm run release:tag` on the release commit.',
      'The release tag format will be v<major.minor.patch>.<git_sha>.'
    ].join('\n') + '\n'
  );
}

module.exports = {
  updateVersion,
  bumpVersion
};
