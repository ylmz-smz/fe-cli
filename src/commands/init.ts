import { runInitPrompts } from '../prompts/init-prompts.js';
import { generateProject } from '../generators/project-generator.js';
import { generateLintConfigs } from '../generators/lint-generator.js';
import { writeFeKitMeta } from '../generators/fe-kit-meta-generator.js';
import { applyAdapters } from '../core/apply-adapters.js';
import { logger } from '../utils/index.js';

export async function initCommand(): Promise<void> {
  logger.step('Starting new project initialization...');

  const answers = await runInitPrompts();
  if (!answers) return;

  await generateProject(answers);
  await generateLintConfigs(answers);
  await writeFeKitMeta(answers);
  await applyAdapters(answers.projectPath, answers);

  logger.success(`Project "${answers.projectName}" created at ${answers.projectPath}`);
}
