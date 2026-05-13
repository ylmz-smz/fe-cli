#!/usr/bin/env node

/**
 * Full smoke test for template matrix:
 * - scaffold project via built CLI
 * - install dependencies
 * - run typecheck and build
 *
 * Usage:
 *   pnpm run build
 *   node scripts/smoke-templates.mjs
 */

import { mkdtemp, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const cliPath = path.join(projectRoot, 'dist', 'cli.mjs');

if (!existsSync(cliPath)) {
  console.error('dist/cli.mjs not found. Run "pnpm run build" first.');
  process.exit(1);
}

const CASES = [
  { framework: 'react', bundler: 'vite', router: 'react-router', state: 'zustand' },
  { framework: 'react', bundler: 'webpack', router: 'react-router', state: 'zustand' },
  { framework: 'react', bundler: 'rspack', router: 'react-router', state: 'zustand' },
  { framework: 'vue', bundler: 'vite', router: 'vue-router', state: 'pinia' },
  { framework: 'vue', bundler: 'webpack', router: 'vue-router', state: 'pinia' },
  { framework: 'vue', bundler: 'rspack', router: 'vue-router', state: 'pinia' },
  { framework: 'next', bundler: 'next', router: 'next-app-router', state: 'zustand' },
];

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit' });
  if (result.error) {
    throw new Error(`Failed to run ${command}: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(`Command failed (${result.status}): ${command} ${args.join(' ')}`);
  }
}

let passed = 0;
let failed = 0;

for (const c of CASES) {
  const label = `${c.framework}-${c.bundler}`;
  const sandbox = await mkdtemp(path.join(tmpdir(), `fe-kit-smoke-${label}-`));
  const appPath = path.join(sandbox, 'app');

  try {
    console.log(`\n=== Smoke: ${label} ===`);

    run('node', [
      cliPath,
      'init',
      '--project-name',
      `smoke-${label}`,
      '--project-path',
      appPath,
      '--framework',
      c.framework,
      '--router',
      c.router,
      '--state-management',
      c.state,
      '--bundler',
      c.bundler,
      '--lint-tools',
      'eslint,prettier',
      '--dev-tools',
      'vscode',
      '--feature-domains',
      'auth',
      '--yes',
      '--install',
      'false',
    ], projectRoot);

    run('pnpm', ['install'], appPath);
    run('pnpm', ['run', 'typecheck'], appPath);
    run('pnpm', ['run', 'build'], appPath);

    console.log(`PASS ${label}`);
    passed++;
  } catch (error) {
    console.error(`FAIL ${label}: ${error instanceof Error ? error.message : String(error)}`);
    failed++;
  } finally {
    await rm(sandbox, { recursive: true, force: true });
  }
}

console.log(`\nSmoke summary: ${passed} passed, ${failed} failed`);
process.exitCode = failed > 0 ? 1 : 0;
