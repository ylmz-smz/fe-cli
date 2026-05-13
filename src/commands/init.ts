import { runInitPrompts } from '../prompts/init-prompts.js';
import { generateProject } from '../generators/project-generator.js';
import { generateBootstrapArtifacts } from '../generators/bootstrap-generator.js';
import { generateLintConfigs } from '../generators/lint-generator.js';
import { writeFeKitMeta } from '../generators/fe-kit-meta-generator.js';
import { generateReadme } from '../generators/readme-generator.js';
import { applyAdapters } from '../core/apply-adapters.js';
import { normalizeInitCommandOptions } from '../core/cli-options.js';
import type { InitCommandOptions } from '../core/cli-options.js';
import { runPostInitTasks } from '../core/post-init.js';
import { logger } from '../utils/index.js';

export async function initializeProject(answers: Awaited<ReturnType<typeof runInitPrompts>> extends infer T ? Exclude<T, null> : never): Promise<void> {
  await generateProject(answers);
  await generateBootstrapArtifacts(answers);
  await generateLintConfigs(answers);
  await writeFeKitMeta(answers);
  await generateReadme(answers);
  await applyAdapters(answers.projectPath, answers);
}

export async function initCommand(options: InitCommandOptions = {}): Promise<void> {
  logger.step('Starting new project initialization...');

  const normalized = normalizeInitCommandOptions(options);
  const answers = await runInitPrompts(normalized);
  if (!answers) return;

  await initializeProject(answers);
  await runPostInitTasks(answers.projectPath, {
    install: normalized.install,
    packageManager: normalized.packageManager,
    gitInit: normalized.gitInit,
    gitCommit: normalized.gitCommit,
    gitMessage: normalized.gitMessage,
  });

  logger.success(`Project "${answers.projectName}" created at ${answers.projectPath}`);
}
