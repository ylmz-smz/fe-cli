import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { resolveEnhanceDefaults } from '../src/core/resolve-enhance-defaults.js';
import { getMcpCatalog } from '../src/mcp/catalog.js';

test('resolveEnhanceDefaults reads saved selections and filters invalid IDs', async () => {
  const projectRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'fe-kit-enhance-defaults-'));
  const metaDir = path.join(projectRoot, '.fe-kit');
  const mcpId = getMcpCatalog()[0]?.id;

  assert.ok(mcpId, 'mcp catalog should provide at least one builtin mcp');

  try {
    await fs.ensureDir(metaDir);
    await fs.writeJson(path.join(metaDir, 'tools.json'), {
      selectedTools: ['vscode', 'invalid-tool', 'vscode'],
      paths: {},
      extensionRecommendations: [],
    });

    await fs.writeJson(path.join(metaDir, 'project.json'), {
      name: 'demo',
      framework: 'react',
      router: 'react-router',
      stateManagement: 'zustand',
      bundler: 'vite',
      featureDomains: [],
      typescript: true,
      lintTools: ['eslint', 'prettier', 'editorconfig'],
      templateVersion: '0.1.0',
      rulesVersion: '0.1.0',
      cliVersion: '0.0.1',
    });

    await fs.writeJson(path.join(metaDir, 'skills.json'), {
      enabled: [{ id: 'invalid-skill' }],
    });

    await fs.writeJson(path.join(metaDir, 'mcp.json'), {
      enabled: [{ id: mcpId }, { id: 'invalid-mcp' }],
      configVersion: '0.0.1',
    });

    await fs.writeFile(path.join(projectRoot, 'commitlint.config.cjs'), 'module.exports = {};\n', 'utf8');

    const defaults = await resolveEnhanceDefaults(projectRoot);

    assert.deepEqual(defaults.devTools, ['vscode']);
    assert.equal(defaults.hasSavedDevTools, true);

    assert.deepEqual(defaults.qualityTools, ['eslint', 'prettier', 'editorconfig', 'commitlint']);
    assert.equal(defaults.hasSavedQualityTools, true);

    assert.deepEqual(defaults.skills, []);
    assert.equal(defaults.hasSavedSkills, true);

    assert.deepEqual(defaults.mcpServers, [mcpId]);
    assert.equal(defaults.hasSavedMcpServers, true);
  } finally {
    await fs.remove(projectRoot);
  }
});

test('resolveEnhanceDefaults returns empty defaults when no metadata exists', async () => {
  const projectRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'fe-kit-enhance-empty-'));

  try {
    const defaults = await resolveEnhanceDefaults(projectRoot);

    assert.deepEqual(defaults.devTools, []);
    assert.deepEqual(defaults.qualityTools, []);
    assert.deepEqual(defaults.skills, []);
    assert.deepEqual(defaults.mcpServers, []);

    assert.equal(defaults.hasSavedDevTools, false);
    assert.equal(defaults.hasSavedQualityTools, false);
    assert.equal(defaults.hasSavedSkills, false);
    assert.equal(defaults.hasSavedMcpServers, false);
  } finally {
    await fs.remove(projectRoot);
  }
});
