const fs = require('fs');
const path = require('path');
const { getReleaseInfo } = require('./release-info.cjs');

function readPackageJson(rootDir) {
  const packagePath = path.join(rootDir, 'package.json');
  return JSON.parse(fs.readFileSync(packagePath, 'utf8'));
}

function parseRepository(rootDir, override) {
  if (override) {
    return override;
  }

  if (process.env.GITHUB_REPOSITORY) {
    return process.env.GITHUB_REPOSITORY;
  }

  const pkg = readPackageJson(rootDir);
  const repoUrl = pkg.repository?.url ?? pkg.homepage ?? '';
  const match = repoUrl.match(/github\.com[:/](.+?\/.+?)(?:\.git)?$/);
  if (!match) {
    throw new Error('Could not determine GitHub repository. Set GITHUB_REPOSITORY or pass --repo owner/name.');
  }

  return match[1];
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const options = {};
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--repo') {
      options.repo = args[index + 1];
      index += 1;
    } else if (arg === '--tag') {
      options.tag = args[index + 1];
      index += 1;
    }
  }
  return options;
}

async function githubRequest(pathname, token) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'vscode-mdllm-doc-ext-release-check'
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`https://api.github.com${pathname}`, {
    headers
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API request failed for ${pathname}: ${response.status} ${body}`);
  }

  return response.json();
}

async function verifyGithubRelease(rootDir = process.cwd(), options = {}) {
  const info = getReleaseInfo(rootDir);
  const repository = parseRepository(rootDir, options.repo);
  const tagName = options.tag ?? process.env.GITHUB_REF_NAME ?? info.gitTag;
  const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN ?? process.env.GITHUB_PAT ?? '';
  const artifactName = `${info.packageName}-${tagName.replace(/^v/, '')}.vsix`;

  const release = await githubRequest(`/repos/${repository}/releases/tags/${encodeURIComponent(tagName)}`, token);
  if (!release) {
    throw new Error(`No GitHub release exists for tag ${tagName}.`);
  }

  if (release.draft) {
    throw new Error(`GitHub release ${tagName} is still a draft.`);
  }

  if (release.prerelease) {
    throw new Error(`GitHub release ${tagName} is marked as a prerelease.`);
  }

  const asset = release.assets.find((candidate) => candidate.name === artifactName);
  if (!asset) {
    throw new Error(`GitHub release ${tagName} is missing asset ${artifactName}.`);
  }

  const latest = await githubRequest(`/repos/${repository}/releases/latest`, token);
  if (!latest) {
    throw new Error(`GitHub latest release lookup failed for ${repository}.`);
  }

  if (latest.tag_name !== tagName) {
    throw new Error(`GitHub latest release points to ${latest.tag_name}, expected ${tagName}.`);
  }

  return {
    repository,
    tagName,
    latestTagName: latest.tag_name,
    releaseUrl: release.html_url,
    assetName: artifactName,
    assetUrl: asset.browser_download_url
  };
}

if (require.main === module) {
  verifyGithubRelease(process.cwd(), parseArgs(process.argv))
    .then((result) => {
      process.stdout.write(
        [
          `Verified GitHub release ${result.tagName}.`,
          `Release URL: ${result.releaseUrl}`,
          `Asset: ${result.assetName}`,
          `Download: ${result.assetUrl}`
        ].join('\n') + '\n'
      );
    })
    .catch((error) => {
      process.stderr.write(`${error.message}\n`);
      process.exitCode = 1;
    });
}

module.exports = {
  verifyGithubRelease
};
