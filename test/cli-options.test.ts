import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeInitCommandOptions, normalizeEnhanceCommandOptions } from '../src/core/cli-options.js';

test('normalizeInitCommandOptions keeps valid values', () => {
  const normalized = normalizeInitCommandOptions({
    projectName: 'demo-app',
    framework: 'react',
    router: 'react-router',
    stateManagement: 'zustand',
    bundler: 'vite',
    lintTools: ['eslint', 'prettier'],
    devTools: ['vscode', 'cursor'],
    skills: [],
    mcpServers: [],
    featureDomains: ['auth', 'dashboard'],
    yes: true,
  });

  assert.equal(normalized.framework, 'react');
  assert.equal(normalized.router, 'react-router');
  assert.equal(normalized.stateManagement, 'zustand');
  assert.deepEqual(normalized.devTools, ['vscode', 'cursor']);
  assert.deepEqual(normalized.featureDomains, ['auth', 'dashboard']);
});

test('normalizeInitCommandOptions rejects invalid router/framework pair', () => {
  assert.throws(
    () => {
      normalizeInitCommandOptions({ framework: 'vue', router: 'react-router' });
    },
    /Invalid router for framework vue/,
  );
});

test('normalizeInitCommandOptions rejects invalid bundler/framework pair', () => {
  assert.throws(
    () => {
      normalizeInitCommandOptions({ framework: 'next', bundler: 'vite' });
    },
    /Invalid bundler for framework next/,
  );
});

test('normalizeEnhanceCommandOptions rejects invalid quality tool', () => {
  assert.throws(
    () => {
      normalizeEnhanceCommandOptions({ qualityTools: ['eslint', 'bad-tool'] });
    },
    /Invalid qualityTools/,
  );
});

test('normalizeInitCommandOptions parses stage2 flags', () => {
  const normalized = normalizeInitCommandOptions({
    install: 'false',
    packageManager: 'pnpm',
    gitInit: 'true',
    gitCommit: true,
    gitMessage: 'chore: initial commit',
  });

  assert.equal(normalized.install, false);
  assert.equal(normalized.packageManager, 'pnpm');
  assert.equal(normalized.gitInit, true);
  assert.equal(normalized.gitCommit, true);
  assert.equal(normalized.gitMessage, 'chore: initial commit');
});

test('normalizeInitCommandOptions rejects invalid package manager', () => {
  assert.throws(
    () => {
      normalizeInitCommandOptions({ packageManager: 'foo' });
    },
    /Invalid packageManager/,
  );
});
