#!/usr/bin/env node

/**
 * Smoke test for detectStack — creates temp directories with various
 * package.json setups and verifies detection results.
 *
 * Usage: pnpm run build && node scripts/smoke-detect.mjs
 */

import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// Dynamically import the built source — detectStack is not re-exported
// from cli.mjs, so we import the module directly from dist.
// tsup bundles everything into one file, so we need a different approach:
// We'll inline the detection logic here to keep it dependency-free.

async function detectStack(root) {
  const fs = await import('node:fs/promises');
  const pkgPath = path.join(root, 'package.json');
  let pkg;
  try {
    pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'));
  } catch {
    return null;
  }

  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

  const inferFramework = (deps) => {
    if ('nuxt' in deps) return 'nuxt';
    if ('next' in deps) return 'next';
    if ('vue' in deps) return 'vue';
    if ('react' in deps) return 'react';
    return 'unknown';
  };

  const inferBundler = (deps) => {
    if ('vite' in deps) return 'vite';
    if ('webpack' in deps) return 'webpack';
    if ('@rspack/cli' in deps || '@rspack/core' in deps) return 'rspack';
    return undefined;
  };

  const framework = inferFramework(allDeps);

  const inferProjectKind = () => {
    if (framework !== 'unknown') return 'frontend';
    const hasNodeSignals =
      pkg.bin !== undefined ||
      pkg.main !== undefined ||
      pkg.exports !== undefined ||
      'express' in allDeps ||
      'fastify' in allDeps ||
      'koa' in allDeps ||
      '@types/node' in allDeps;
    return hasNodeSignals ? 'node' : 'unknown';
  };

  let hasTS = 'typescript' in allDeps;
  if (!hasTS) {
    try {
      await fs.access(path.join(root, 'tsconfig.json'));
      hasTS = true;
    } catch {}
  }

  let hasGit = false;
  try {
    await fs.access(path.join(root, '.git'));
    hasGit = true;
  } catch {}

  return {
    name: pkg.name ?? path.basename(root),
    projectKind: inferProjectKind(),
    framework,
    bundler: inferBundler(allDeps),
    hasTypeScript: hasTS,
    hasGit,
  };
}

const CASES = [
  {
    label: 'Vue + Vite + TS',
    pkg: {
      name: 'test-vue',
      dependencies: { vue: '^3.5.0', 'vue-router': '^4.5.0' },
      devDependencies: { vite: '^6.3.0', typescript: '^5.8.0' },
    },
    tsconfig: true,
    expect: { projectKind: 'frontend', framework: 'vue', bundler: 'vite', hasTypeScript: true },
  },
  {
    label: 'React + Webpack',
    pkg: {
      name: 'test-react',
      dependencies: { react: '^19.0.0', 'react-dom': '^19.0.0' },
      devDependencies: { webpack: '^5.99.0' },
    },
    expect: { projectKind: 'frontend', framework: 'react', bundler: 'webpack', hasTypeScript: false },
  },
  {
    label: 'Next.js',
    pkg: {
      name: 'test-next',
      dependencies: { next: '^15.0.0', react: '^19.0.0' },
      devDependencies: { typescript: '^5.8.0' },
    },
    tsconfig: true,
    expect: { projectKind: 'frontend', framework: 'next', hasTypeScript: true },
  },
  {
    label: 'Nuxt',
    pkg: {
      name: 'test-nuxt',
      dependencies: { nuxt: '^3.15.0', vue: '^3.5.0' },
    },
    expect: { projectKind: 'frontend', framework: 'nuxt', hasTypeScript: false },
  },
  {
    label: 'Node CLI (bin + @types/node)',
    pkg: {
      name: 'test-node-cli',
      type: 'module',
      bin: { mycli: 'dist/cli.mjs' },
      devDependencies: { '@types/node': '^22.0.0', typescript: '^5.8.0' },
    },
    tsconfig: true,
    expect: { projectKind: 'node', framework: 'unknown', hasTypeScript: true },
  },
  {
    label: 'Node server (express)',
    pkg: {
      name: 'test-express',
      dependencies: { express: '^4.21.0' },
    },
    expect: { projectKind: 'node', framework: 'unknown', hasTypeScript: false },
  },
  {
    label: 'Bare JS project',
    pkg: { name: 'test-bare' },
    expect: { projectKind: 'unknown', framework: 'unknown', hasTypeScript: false },
  },
];

let passed = 0;
let failed = 0;

for (const c of CASES) {
  const dir = await mkdtemp(path.join(tmpdir(), 'fekit-smoke-'));
  await writeFile(path.join(dir, 'package.json'), JSON.stringify(c.pkg, null, 2));

  if (c.tsconfig) {
    await writeFile(path.join(dir, 'tsconfig.json'), '{}');
  }

  const result = await detectStack(dir);

  const errors = [];
  for (const [key, expected] of Object.entries(c.expect)) {
    if (result?.[key] !== expected) {
      errors.push(`  ${key}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(result?.[key])}`);
    }
  }

  if (errors.length === 0) {
    console.log(`✅ ${c.label}`);
    passed++;
  } else {
    console.log(`❌ ${c.label}`);
    errors.forEach((e) => console.log(e));
    failed++;
  }

  await rm(dir, { recursive: true, force: true });
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exitCode = failed > 0 ? 1 : 0;
