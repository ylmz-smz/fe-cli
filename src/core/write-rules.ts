import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';
import type { Framework } from '../constants/frameworks.js';
import type { StackFramework } from './detect-stack.js';
import { META_DIR } from '../constants/meta.js';
import { logger } from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function rulesSourceDir(): string {
  return path.resolve(__dirname, '..', 'rules');
}

export async function writeRules(
  projectRoot: string,
  framework: Framework | StackFramework,
): Promise<void> {
  const targetDir = path.join(projectRoot, META_DIR, 'rules');
  const srcBase = rulesSourceDir();

  const frameworkDir = mapFrameworkRulesDir(framework);
  const dirs = [
    ...(frameworkDir ? [path.join(srcBase, frameworkDir)] : []),
    path.join(srcBase, 'common'),
  ];

  for (const dir of dirs) {
    if (!(await fs.pathExists(dir))) continue;
    const relative = path.basename(dir);
    await fs.copy(dir, path.join(targetDir, relative), { overwrite: false });
  }

  logger.success(`Rules for ${framework} written to ${META_DIR}/rules/`);
}

function mapFrameworkRulesDir(fw: Framework | StackFramework): string | null {
  if (fw === 'vue' || fw === 'nuxt') return 'vue';
  if (fw === 'react' || fw === 'next') return 'react';
  return null;
}
