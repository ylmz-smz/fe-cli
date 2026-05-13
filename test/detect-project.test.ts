import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { detectProject } from '../src/core/detect-project.js';

test('detectProject detects next app-router project', async () => {
  const projectPath = await fs.mkdtemp(path.join(os.tmpdir(), 'fe-kit-detect-next-'));

  try {
    await fs.writeJson(path.join(projectPath, 'package.json'), {
      name: 'next-detect-app',
      dependencies: {
        next: '^15.1.8',
        react: '^19.0.0',
        'react-dom': '^19.0.0',
        zustand: '^5.0.0',
      },
      devDependencies: {
        typescript: '^5.8.0',
      },
    });

    const detected = await detectProject(projectPath);
    assert.ok(detected);
    assert.equal(detected.framework, 'next');
    assert.equal(detected.router, 'next-app-router');
    assert.equal(detected.stateManagement, 'zustand');
    assert.equal(detected.bundler, 'next');
    assert.equal(detected.hasTypeScript, true);
  } finally {
    await fs.remove(projectPath);
  }
});
