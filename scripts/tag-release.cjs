const childProcess = require('child_process');
const { getReleaseInfo } = require('./release-info.cjs');

function runGit(args, cwd) {
  return childProcess.execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit']
  });
}

function ensureGitTreeAvailable(rootDir) {
  runGit(['rev-parse', '--is-inside-work-tree'], rootDir);
}

function tagRelease(rootDir = process.cwd()) {
  ensureGitTreeAvailable(rootDir);
  const info = getReleaseInfo(rootDir);
  runGit(['tag', '-a', info.gitTag, '-m', `Release ${info.releaseVersion}`], rootDir);
  return info;
}

if (require.main === module) {
  const info = tagRelease();
  process.stdout.write(
    [
      `Created git tag ${info.gitTag}.`,
      'Push it with `git push --follow-tags` to trigger the release workflow.'
    ].join('\n') + '\n'
  );
}

module.exports = {
  tagRelease
};
