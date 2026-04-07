import path from 'node:path';
import fs from 'fs-extra';
import { detectProject } from '../core/detect-project.js';
import type { ProjectDetection } from '../core/detect-project.js';
import { detectStack, summarizeStack } from '../core/detect-stack.js';
import type { StackDetection } from '../core/detect-stack.js';
import { runEnhancePrompts } from '../prompts/enhance-prompts.js';
import { updateFeKitMeta } from '../generators/fe-kit-meta-generator.js';
import { generateQualityTooling } from '../generators/quality-generator.js';
import { applyAdapters } from '../core/apply-adapters.js';
import { logger } from '../utils/index.js';

export async function enhanceCommand(): Promise<void> {
  logger.step('Analyzing current project...');

  const projectRoot = process.cwd();

  const classicDetection = await detectProject(projectRoot);
  const stack: StackDetection | null = classicDetection
    ? await toStackDetection(projectRoot, classicDetection)
    : await detectStack(projectRoot);

  if (!stack) {
    logger.error(
      'Could not detect a project in the current directory. ' +
      'Make sure package.json exists.',
    );
    process.exitCode = 1;
    return;
  }

  logger.info(`Detected: ${summarizeStack(stack)}`);

  const answers = await runEnhancePrompts(stack);
  if (!answers) return;

  await updateFeKitMeta(projectRoot, classicDetection ?? stack, answers);

  if (answers.qualityTools.length > 0) {
    await generateQualityTooling(projectRoot, stack, answers.qualityTools);
  }

  await applyAdapters(projectRoot, {
    framework: stack.framework,
    ...answers,
  });

  logger.success('Project enhanced successfully.');
}

async function toStackDetection(
  root: string,
  d: ProjectDetection,
): Promise<StackDetection> {
  return {
    name: d.name,
    projectKind: 'frontend',
    framework: d.framework,
    bundler: d.bundler,
    hasTypeScript: d.hasTypeScript,
    hasGit: await fs.pathExists(path.join(root, '.git')),
  };
}
