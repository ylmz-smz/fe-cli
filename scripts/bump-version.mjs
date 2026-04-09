#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import prompts from 'prompts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const pkgPath = path.join(projectRoot, 'package.json');

function parseArgs(argv) {
  const args = new Set(argv);
  return {
    commit: !args.has('--no-commit'),
  };
}

function parseSemver(v) {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(String(v).trim());
  if (!m) return null;
  return { major: Number(m[1]), minor: Number(m[2]), patch: Number(m[3]) };
}

function formatSemver(s) {
  return `${s.major}.${s.minor}.${s.patch}`;
}

function bump(current, kind) {
  const next = { ...current };
  if (kind === 'patch') next.patch += 1;
  if (kind === 'minor') {
    next.minor += 1;
    next.patch = 0;
  }
  if (kind === 'major') {
    next.major += 1;
    next.minor = 0;
    next.patch = 0;
  }
  return next;
}

function tryGitCommit({ nextVersion }) {
  const message = `chore(release): bump version to v${nextVersion}`;
  try {
    execFileSync('git', ['rev-parse', '--is-inside-work-tree'], { cwd: projectRoot, stdio: 'ignore' });
  } catch {
    console.warn('[bump-version] Not a git repo; skip auto-commit');
    return;
  }

  try {
    execFileSync('git', ['add', 'package.json'], { cwd: projectRoot, stdio: 'inherit' });
    execFileSync('git', ['commit', '-m', message], { cwd: projectRoot, stdio: 'inherit' });
    console.log(`[bump-version] Committed: ${message}`);
  } catch (e) {
    console.error('[bump-version] Git commit failed; version file was still updated.');
    process.exitCode = 1;
  }
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const raw = await fs.readFile(pkgPath, 'utf-8');
  const pkg = JSON.parse(raw);
  const currentRaw = pkg?.version;
  const current = parseSemver(currentRaw);
  if (!current) {
    console.error(`[bump-version] Unsupported version: ${JSON.stringify(currentRaw)} (expected x.y.z)`);
    process.exitCode = 1;
    return;
  }

  const candidates = [
    { title: `patch → ${formatSemver(bump(current, 'patch'))}`, value: 'patch' },
    { title: `minor → ${formatSemver(bump(current, 'minor'))}`, value: 'minor' },
    { title: `major → ${formatSemver(bump(current, 'major'))}`, value: 'major' },
    { title: 'custom…', value: 'custom' },
  ];

  const { kind } = await prompts(
    {
      type: 'select',
      name: 'kind',
      message: `Current version: ${formatSemver(current)}. Select bump type`,
      choices: candidates,
    },
    {
      onCancel: () => {
        process.exitCode = 130;
      },
    },
  );
  if (!kind) return;

  let nextVersion;
  if (kind === 'custom') {
    const { custom } = await prompts(
      {
        type: 'text',
        name: 'custom',
        message: 'Enter target version (x.y.z)',
        validate: (v) => (parseSemver(v) ? true : 'Invalid semver, expected x.y.z'),
      },
      {
        onCancel: () => {
          process.exitCode = 130;
        },
      },
    );
    if (!custom) return;
    nextVersion = String(custom).trim();
  } else {
    nextVersion = formatSemver(bump(current, kind));
  }

  const { confirm } = await prompts(
    {
      type: 'confirm',
      name: 'confirm',
      message: `Update package.json version: ${formatSemver(current)} → ${nextVersion}?`,
      initial: true,
    },
    {
      onCancel: () => {
        process.exitCode = 130;
      },
    },
  );
  if (!confirm) return;

  pkg.version = nextVersion;
  await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
  console.log(`[bump-version] Updated version to ${nextVersion}`);

  if (opts.commit) {
    tryGitCommit({ nextVersion });
  }
}

await main();

