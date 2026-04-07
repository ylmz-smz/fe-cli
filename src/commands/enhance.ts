import { detectProject } from '../core/detect-project.js';
import { runEnhancePrompts } from '../prompts/enhance-prompts.js';
import { updateFeKitMeta } from '../generators/fe-kit-meta-generator.js';
import { applyAdapters } from '../core/apply-adapters.js';
import { logger } from '../utils/index.js';

export async function enhanceCommand(): Promise<void> {
  logger.step('Analyzing current project...');

  const projectRoot = process.cwd();
  const detection = await detectProject(projectRoot);

  if (!detection) {
    logger.error(
      'Could not detect a frontend project in the current directory. ' +
      'Make sure package.json exists with vue or react in dependencies.',
    );
    process.exitCode = 1;
    return;
  }

  logger.info(`Detected: ${detection.framework} + ${detection.bundler ?? 'unknown bundler'}`);

  const answers = await runEnhancePrompts(detection);
  if (!answers) return;

  await updateFeKitMeta(projectRoot, detection, answers);
  await applyAdapters(projectRoot, {
    framework: detection.framework,
    ...answers,
  });

  logger.success('Project enhanced successfully.');
}
