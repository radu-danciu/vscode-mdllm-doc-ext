const { getReleaseInfo, getGitSha } = require('./release-info.cjs');

function verifyReleaseTag(rootDir = process.cwd(), tagName = process.env.GITHUB_REF_NAME) {
  if (!tagName) {
    throw new Error('Release tag name is required.');
  }

  const ref = process.env.GITHUB_REF_NAME ? process.env.GITHUB_REF_NAME : 'HEAD';
  const commitRef = process.env.GITHUB_REF_NAME ? `${tagName}^{commit}` : ref;
  const expected = `v${getReleaseInfo(rootDir, commitRef).releaseVersion}`;
  if (tagName !== expected) {
    throw new Error(`Release tag must be ${expected}, received ${tagName}.`);
  }

  return {
    tagName,
    expected,
    gitSha: getGitSha(rootDir, commitRef)
  };
}

if (require.main === module) {
  const result = verifyReleaseTag();
  process.stdout.write(`Verified release tag ${result.tagName}.\n`);
}

module.exports = {
  verifyReleaseTag
};
