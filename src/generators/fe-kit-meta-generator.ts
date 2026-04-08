import path from 'node:path';
import fs from 'fs-extra';
import type { InitAnswers, EnhanceAnswers } from '../types/selections.js';
import type {
  ProjectMeta,
  SkillsMeta,
  McpMeta,
  ToolsMeta,
  SkillEntry,
  McpEntry,
} from '../types/fe-kit-config.js';
import type { ProjectDetection } from '../core/detect-project.js';
import type { StackDetection } from '../core/detect-stack.js';
import { META_DIR, CLI_VERSION } from '../constants/meta.js';
import { readJsonSafe, writeJsonSafe } from '../utils/fs.js';
import { mergeConfig } from '../core/merge-config.js';
import { writeRules } from '../core/write-rules.js';
import { logger } from '../utils/logger.js';

function metaDir(root: string): string {
  return path.join(root, META_DIR);
}

/** Called by `init` — writes fresh .fe-kit/ directory. */
export async function writeFeKitMeta(answers: InitAnswers): Promise<void> {
  const dir = metaDir(answers.projectPath);
  await fs.ensureDir(dir);

  const project: ProjectMeta = {
    name: answers.projectName,
    framework: answers.framework,
    router: answers.router,
    stateManagement: answers.stateManagement,
    bundler: answers.bundler,
    typescript: true,
    lintTools: answers.lintTools,
    templateVersion: '0.1.0',
    rulesVersion: '0.1.0',
    cliVersion: CLI_VERSION,
  };

  const skills: SkillsMeta = {
    enabled: answers.skills.map((id) => ({
      id,
      source: 'builtin' as const,
      targets: answers.devTools,
      version: CLI_VERSION,
    })),
  };

  const mcp: McpMeta = {
    enabled: answers.mcpServers.map((id) => ({
      id,
      adapterStatus: Object.fromEntries(answers.devTools.map((t) => [t, 'written' as const])),
      version: CLI_VERSION,
    })),
    configVersion: CLI_VERSION,
  };

  const tools: ToolsMeta = {
    selectedTools: answers.devTools,
    paths: {},
    extensionRecommendations: [],
  };

  await Promise.all([
    writeJsonSafe(path.join(dir, 'project.json'), project),
    writeJsonSafe(path.join(dir, 'skills.json'), skills),
    writeJsonSafe(path.join(dir, 'mcp.json'), mcp),
    writeJsonSafe(path.join(dir, 'tools.json'), tools),
  ]);

  await writeRules(answers.projectPath, answers.framework);
  logger.success(`.fe-kit/ metadata written`);
}

/** Called by `enhance` — merges into existing .fe-kit/ or creates it. */
export async function updateFeKitMeta(
  projectRoot: string,
  detection: ProjectDetection | StackDetection,
  answers: EnhanceAnswers,
): Promise<void> {
  const dir = metaDir(projectRoot);
  await fs.ensureDir(dir);

  const fw = detection.framework;
  const isClassicDetection = 'router' in detection;

  const projectPath = path.join(dir, 'project.json');
  const existingProject = (await readJsonSafe<Record<string, unknown>>(projectPath)) ?? {
    name: detection.name,
    framework: fw,
    router: isClassicDetection ? ((detection as ProjectDetection).router ?? '') : '',
    stateManagement: isClassicDetection ? ((detection as ProjectDetection).stateManagement ?? '') : '',
    bundler: detection.bundler ?? 'vite',
    typescript: true,
    lintTools: [],
    templateVersion: '0.1.0',
    rulesVersion: '0.1.0',
    cliVersion: CLI_VERSION,
  };
  await writeJsonSafe(projectPath, { ...existingProject, cliVersion: CLI_VERSION });

  const skillsPath = path.join(dir, 'skills.json');
  const existingSkills = (await readJsonSafe<SkillsMeta>(skillsPath)) ?? { enabled: [] };
  const newSkillEntries: SkillEntry[] = answers.skills.map((id) => ({
    id,
    source: 'builtin' as const,
    targets: answers.devTools,
    version: CLI_VERSION,
  }));
  await writeJsonSafe(
    skillsPath,
    mergeConfig(existingSkills, { enabled: newSkillEntries }),
  );

  const mcpPath = path.join(dir, 'mcp.json');
  const existingMcp = (await readJsonSafe<McpMeta>(mcpPath)) ?? {
    enabled: [],
    configVersion: CLI_VERSION,
  };
  const newMcpEntries: McpEntry[] = answers.mcpServers.map((id) => ({
    id,
    adapterStatus: Object.fromEntries(answers.devTools.map((t) => [t, 'written' as const])),
    version: CLI_VERSION,
  }));
  await writeJsonSafe(
    mcpPath,
    mergeConfig(existingMcp, { enabled: newMcpEntries, configVersion: CLI_VERSION }),
  );

  const toolsPath = path.join(dir, 'tools.json');
  const existingTools = (await readJsonSafe<ToolsMeta>(toolsPath)) ?? {
    selectedTools: [],
    paths: {},
    extensionRecommendations: [],
  };
  await writeJsonSafe(
    toolsPath,
    mergeConfig(existingTools, { selectedTools: answers.devTools }),
  );

  await writeRules(projectRoot, fw);
  logger.success(`.fe-kit/ metadata updated`);
}
