import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { initializeProject } from '../src/commands/init.js';

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
