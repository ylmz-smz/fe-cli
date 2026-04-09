#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import prompts from 'prompts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const pkgPath = path.join(projectRoot, 'package.json');

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

async function main() {
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
}

await main();

