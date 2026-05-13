import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { initializeProject } from '../src/commands/init.js';

interface SmokeCase {
  framework: 'react' | 'vue' | 'next';
  bundler: 'vite' | 'webpack' | 'rspack' | 'next';
  router: string;
  stateManagement: string;
  mainFile: string;
  configFile?: string;
}

const CASES: SmokeCase[] = [
  {
    framework: 'react',
    bundler: 'vite',
    router: 'react-router',
    stateManagement: 'zustand',
    mainFile: 'src/main.tsx',
    configFile: 'vite.config.ts',
  },
  {
    framework: 'react',
    bundler: 'webpack',
    router: 'react-router',
    stateManagement: 'zustand',
    mainFile: 'src/main.tsx',
    configFile: 'webpack.config.cjs',
  },
  {
    framework: 'react',
    bundler: 'rspack',
    router: 'react-router',
    stateManagement: 'zustand',
    mainFile: 'src/main.tsx',
    configFile: 'rspack.config.cjs',
  },
  {
    framework: 'vue',
    bundler: 'vite',
    router: 'vue-router',
    stateManagement: 'pinia',
    mainFile: 'src/main.ts',
    configFile: 'vite.config.ts',
  },
  {
    framework: 'vue',
    bundler: 'webpack',
    router: 'vue-router',
    stateManagement: 'pinia',
    mainFile: 'src/main.ts',
    configFile: 'webpack.config.cjs',
  },
  {
    framework: 'vue',
    bundler: 'rspack',
    router: 'vue-router',
    stateManagement: 'pinia',
    mainFile: 'src/main.ts',
    configFile: 'rspack.config.cjs',
  },
  {
    framework: 'next',
    bundler: 'next',
    router: 'next-app-router',
    stateManagement: 'zustand',
    mainFile: 'app/page.tsx',
  },
];

for (const c of CASES) {
  test(`template smoke: ${c.framework}-${c.bundler}`, async () => {
    const projectPath = await fs.mkdtemp(path.join(os.tmpdir(), `fe-kit-smoke-${c.framework}-${c.bundler}-`));

    try {
      await initializeProject({
        projectName: `${c.framework}-${c.bundler}-app`,
        projectPath,
        framework: c.framework,
        router: c.router,
        stateManagement: c.stateManagement,
        bundler: c.bundler,
        lintTools: ['eslint', 'prettier'],
        devTools: ['vscode'],
        skills: [],
        mcpServers: [],
        featureDomains: ['auth'],
      });

      assert.equal(await fs.pathExists(path.join(projectPath, 'package.json')), true);
      assert.equal(await fs.pathExists(path.join(projectPath, c.mainFile)), true);
      if (c.configFile) {
        assert.equal(await fs.pathExists(path.join(projectPath, c.configFile)), true);
      }
      assert.equal(await fs.pathExists(path.join(projectPath, '.fe-kit', 'project.json')), true);
      assert.equal(await fs.pathExists(path.join(projectPath, 'docs', 'bootstrap', 'init-checklist.md')), true);

      const pkg = await fs.readJson(path.join(projectPath, 'package.json'));
      assert.ok(pkg.scripts.dev);
      assert.ok(pkg.scripts.build);
      assert.ok(pkg.scripts.typecheck);
      assert.ok(pkg.scripts.test);
    } finally {
      await fs.remove(projectPath);
    }
  });
}
