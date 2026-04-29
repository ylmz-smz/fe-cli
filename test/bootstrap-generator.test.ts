import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { generateBootstrapArtifacts } from '../src/generators/bootstrap-generator.js';

test('generateBootstrapArtifacts writes bootstrap structure and resolved docs', async () => {
  const projectPath = await fs.mkdtemp(path.join(os.tmpdir(), 'fe-kit-bootstrap-'));

  try {
    await generateBootstrapArtifacts({
      projectName: 'demo-app',
      projectPath,
      framework: 'react',
      router: 'react-router',
      stateManagement: 'zustand',
      bundler: 'vite',
      lintTools: ['eslint', 'prettier'],
      devTools: ['vscode'],
      skills: [],
      mcpServers: [],
      featureDomains: ['auth', 'dashboard'],
    });

    assert.equal(await fs.pathExists(path.join(projectPath, 'src', 'core')), true);
    assert.equal(await fs.pathExists(path.join(projectPath, 'src', 'features', 'auth')), true);
    assert.equal(await fs.pathExists(path.join(projectPath, 'src', 'features', 'dashboard')), true);
    assert.equal(await fs.pathExists(path.join(projectPath, 'docs')), true);
    assert.equal(await fs.pathExists(path.join(projectPath, 'plan')), true);

    const checklist = await fs.readFile(path.join(projectPath, 'docs', 'bootstrap', 'init-checklist.md'), 'utf8');
    assert.match(checklist, /Project Bootstrap Checklist/);

    const prompt = await fs.readFile(path.join(projectPath, 'docs', 'bootstrap', 'project-bootstrap.prompt.md'), 'utf8');
    assert.match(prompt, /Project Bootstrap/);

    const scaffoldTree = await fs.readFile(path.join(projectPath, 'docs', 'bootstrap', 'scaffold-tree.md'), 'utf8');
    assert.match(scaffoldTree, /Scaffold Tree Template/);
    assert.match(scaffoldTree, /可选扩展/);
    assert.match(scaffoldTree, /auth/);
    assert.match(scaffoldTree, /dashboard/);

    const instructions = await fs.readFile(path.join(projectPath, '.github', 'copilot-instructions.md'), 'utf8');
    assert.match(instructions, /demo-app/);
    assert.match(instructions, /Vite/);
    assert.doesNotMatch(instructions, /<app-name>/);
  } finally {
    await fs.remove(projectPath);
  }
});
