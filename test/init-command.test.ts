import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { initCommand, initializeProject } from '../src/commands/init.js';
import { SCAFFOLD_VERSIONS } from '../src/constants/dependency-versions.js';

test('initializeProject runs the full init pipeline for a React Vite project', async () => {
  const projectPath = await fs.mkdtemp(path.join(os.tmpdir(), 'fe-kit-init-'));

  try {
    await initializeProject({
      projectName: 'pipeline-app',
      projectPath,
      framework: 'react',
      router: 'react-router',
      stateManagement: 'zustand',
      bundler: 'vite',
      lintTools: ['eslint', 'prettier'],
      devTools: ['vscode'],
      skills: [],
      mcpServers: [],
      featureDomains: ['auth'],
    });

    assert.equal(await fs.pathExists(path.join(projectPath, 'src', 'features', 'auth')), true);
    assert.equal(await fs.pathExists(path.join(projectPath, 'docs', 'bootstrap', 'project-bootstrap.prompt.md')), true);
    assert.equal(await fs.pathExists(path.join(projectPath, '.fe-kit', 'project.json')), true);

    const instructions = await fs.readFile(path.join(projectPath, '.github', 'copilot-instructions.md'), 'utf8');
    assert.match(instructions, /pipeline-app/);
    assert.match(instructions, /React Component Conventions/);

    const projectMeta = await fs.readJson(path.join(projectPath, '.fe-kit', 'project.json'));
    assert.deepEqual(projectMeta.featureDomains, ['auth']);
  } finally {
    await fs.remove(projectPath);
  }
});

test('initCommand supports non-interactive options mode', async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'fe-kit-init-options-'));
  const projectPath = path.join(tmpRoot, 'non-interactive-app');

  try {
    await initCommand({
      projectName: 'non-interactive-app',
      projectPath,
      framework: 'react',
      router: 'react-router',
      stateManagement: 'zustand',
      bundler: 'vite',
      lintTools: ['eslint', 'prettier'],
      devTools: ['vscode'],
      skills: [],
      mcpServers: [],
      featureDomains: ['auth'],
      yes: true,
      install: false,
    });

    assert.equal(await fs.pathExists(path.join(projectPath, 'package.json')), true);
    assert.equal(await fs.pathExists(path.join(projectPath, '.fe-kit', 'project.json')), true);

    const projectMeta = await fs.readJson(path.join(projectPath, '.fe-kit', 'project.json'));
    assert.equal(projectMeta.framework, 'react');
    assert.equal(projectMeta.bundler, 'vite');
  } finally {
    await fs.remove(tmpRoot);
  }
});

test('initializeProject applies vue vite typecheck/build baseline and version matrix', async () => {
  const projectPath = await fs.mkdtemp(path.join(os.tmpdir(), 'fe-kit-vue-vite-'));

  try {
    await initializeProject({
      projectName: 'vue-vite-app',
      projectPath,
      framework: 'vue',
      router: 'vue-router',
      stateManagement: 'pinia',
      bundler: 'vite',
      lintTools: ['eslint', 'prettier'],
      devTools: ['vscode'],
      skills: [],
      mcpServers: [],
      featureDomains: [],
    });

    const pkg = await fs.readJson(path.join(projectPath, 'package.json'));
    assert.equal(pkg.scripts.build, 'vue-tsc -b && vite build');
    assert.equal(pkg.scripts.typecheck, 'vue-tsc --noEmit');
    assert.equal(pkg.devDependencies['vue-tsc'], SCAFFOLD_VERSIONS.language.vueTsc);
    assert.equal(pkg.devDependencies['@vue/tsconfig'], SCAFFOLD_VERSIONS.language.vueTsconfig);
    assert.equal(pkg.devDependencies.vite, SCAFFOLD_VERSIONS.bundler.vite);
    assert.equal(pkg.devDependencies['@vitejs/plugin-vue'], SCAFFOLD_VERSIONS.bundler.vitePluginVue);
  } finally {
    await fs.remove(projectPath);
  }
});

test('initializeProject applies next baseline and version matrix', async () => {
  const projectPath = await fs.mkdtemp(path.join(os.tmpdir(), 'fe-kit-next-'));

  try {
    await initializeProject({
      projectName: 'next-app',
      projectPath,
      framework: 'next',
      router: 'next-app-router',
      stateManagement: 'zustand',
      bundler: 'next',
      lintTools: ['eslint', 'prettier'],
      devTools: ['vscode'],
      skills: [],
      mcpServers: [],
      featureDomains: [],
    });

    const pkg = await fs.readJson(path.join(projectPath, 'package.json'));
    assert.equal(pkg.scripts.dev, 'next dev');
    assert.equal(pkg.scripts.build, 'next build');
    assert.equal(pkg.scripts.start, 'next start');
    assert.equal(pkg.dependencies.next, SCAFFOLD_VERSIONS.framework.next);
    assert.equal(pkg.dependencies.react, SCAFFOLD_VERSIONS.framework.react);
    assert.equal(pkg.dependencies['react-dom'], SCAFFOLD_VERSIONS.framework.reactDom);
    assert.equal(pkg.type, undefined);
    assert.equal(await fs.pathExists(path.join(projectPath, 'app', 'page.tsx')), true);
    assert.equal(await fs.pathExists(path.join(projectPath, 'next-env.d.ts')), true);
  } finally {
    await fs.remove(projectPath);
  }
});
