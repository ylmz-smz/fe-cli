import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';
import type { Framework } from '../constants/frameworks.js';
import { META_DIR } from '../constants/meta.js';
import { logger } from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function rulesSourceDir(): string {
  return path.resolve(__dirname, '..', 'rules');
}

export async function writeRules(
  projectRoot: string,
  framework: Framework,
): Promise<void> {
  const targetDir = path.join(projectRoot, META_DIR, 'rules');
  const srcBase = rulesSourceDir();

  const dirs = [path.join(srcBase, framework), path.join(srcBase, 'common')];

  for (const dir of dirs) {
    if (!(await fs.pathExists(dir))) continue;
    const relative = path.basename(dir);
    await fs.copy(dir, path.join(targetDir, relative), { overwrite: false });
  }

  logger.success(`Rules for ${framework} written to ${META_DIR}/rules/`);
}
