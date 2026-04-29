import { runInitPrompts } from '../prompts/init-prompts.js';
import { generateProject } from '../generators/project-generator.js';
import { generateBootstrapArtifacts } from '../generators/bootstrap-generator.js';
import { generateLintConfigs } from '../generators/lint-generator.js';
import { writeFeKitMeta } from '../generators/fe-kit-meta-generator.js';
import { generateReadme } from '../generators/readme-generator.js';
import { applyAdapters } from '../core/apply-adapters.js';
import { logger } from '../utils/index.js';

export async function initializeProject(answers: Awaited<ReturnType<typeof runInitPrompts>> extends infer T ? Exclude<T, null> : never): Promise<void> {
  await generateProject(answers);
  await generateBootstrapArtifacts(answers);
  await generateLintConfigs(answers);
  await writeFeKitMeta(answers);
  await generateReadme(answers);
  await applyAdapters(answers.projectPath, answers);
}

export async function initCommand(): Promise<void> {
  logger.step('Starting new project initialization...');

  const answers = await runInitPrompts();
  if (!answers) return;

  await initializeProject(answers);

  logger.success(`Project "${answers.projectName}" created at ${answers.projectPath}`);
}
