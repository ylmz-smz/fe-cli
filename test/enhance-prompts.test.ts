import test from 'node:test';
import assert from 'node:assert/strict';
import { runEnhancePrompts } from '../src/prompts/enhance-prompts.js';
import type { StackDetection } from '../src/core/detect-stack.js';

const stack: StackDetection = {
  name: 'demo',
  projectKind: 'frontend',
  framework: 'react',
  bundler: 'vite',
  hasTypeScript: true,
  hasGit: true,
};

test('runEnhancePrompts supports non-interactive mode with explicit options', async () => {
  const result = await runEnhancePrompts(
    stack,
    undefined,
    {
      devTools: ['vscode'],
      qualityTools: ['eslint', 'prettier'],
      skills: [],
      mcpServers: [],
      yes: true,
    },
  );

  assert.ok(result);
  assert.deepEqual(result.devTools, ['vscode']);
  assert.deepEqual(result.qualityTools, ['eslint', 'prettier']);
});
