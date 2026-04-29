import path from 'node:path';
import fs from 'fs-extra';
import { META_DIR } from '../constants/meta.js';
import { DEV_TOOLS } from '../constants/tools.js';
import type { DevToolId } from '../constants/tools.js';
import { QUALITY_TOOLS } from '../constants/lint.js';
import type { QualityTool, LintTool } from '../constants/lint.js';
import { getSkillCatalog } from '../skills/catalog.js';
import { getMcpCatalog } from '../mcp/catalog.js';
import { readJsonSafe } from '../utils/fs.js';
import type { SkillsMeta, McpMeta, ToolsMeta, ProjectMeta } from '../types/fe-kit-config.js';

export interface EnhancePromptDefaults {
  devTools: DevToolId[];
  qualityTools: QualityTool[];
  skills: string[];
  mcpServers: string[];
  hasSavedDevTools: boolean;
  hasSavedQualityTools: boolean;
  hasSavedSkills: boolean;
  hasSavedMcpServers: boolean;
}

const DEV_TOOL_SET = new Set<string>(DEV_TOOLS);
const QUALITY_TOOL_SET = new Set<string>(QUALITY_TOOLS);

const LINT_TO_QUALITY: Record<LintTool, QualityTool> = {
  eslint: 'eslint',
  stylelint: 'stylelint',
  prettier: 'prettier',
  editorconfig: 'editorconfig',
};

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function filterDevTools(values: unknown): DevToolId[] {
  if (!Array.isArray(values)) return [];
  return unique(values.filter((v): v is DevToolId => typeof v === 'string' && DEV_TOOL_SET.has(v)));
}

function filterQualityTools(values: unknown): QualityTool[] {
  if (!Array.isArray(values)) return [];
  return unique(values.filter((v): v is QualityTool => typeof v === 'string' && QUALITY_TOOL_SET.has(v)));
}

function filterStringIds(values: unknown, validIds: Set<string>): string[] {
  if (!Array.isArray(values)) return [];
  return unique(values.filter((v): v is string => typeof v === 'string' && validIds.has(v)));
}

async function detectCommitlintEnabled(projectRoot: string): Promise<boolean> {
  const configFiles = [
    'commitlint.config.cjs',
    'commitlint.config.js',
    'commitlint.config.mjs',
    '.commitlintrc',
    '.commitlintrc.json',
    '.commitlintrc.js',
    '.commitlintrc.cjs',
    '.commitlintrc.yaml',
    '.commitlintrc.yml',
  ];

  const hasConfig = await Promise.all(
    configFiles.map((name) => fs.pathExists(path.join(projectRoot, name))),
  );
  return hasConfig.some(Boolean);
}

export async function resolveEnhanceDefaults(
  projectRoot: string,
): Promise<EnhancePromptDefaults> {
  const metaDir = path.join(projectRoot, META_DIR);

  const [toolsMeta, skillsMeta, mcpMeta, projectMeta, commitlintEnabled] = await Promise.all([
    readJsonSafe<ToolsMeta>(path.join(metaDir, 'tools.json')),
    readJsonSafe<SkillsMeta>(path.join(metaDir, 'skills.json')),
    readJsonSafe<McpMeta>(path.join(metaDir, 'mcp.json')),
    readJsonSafe<ProjectMeta>(path.join(metaDir, 'project.json')),
    detectCommitlintEnabled(projectRoot),
  ]);

  const devTools = filterDevTools(toolsMeta?.selectedTools);

  const lintTools = Array.isArray(projectMeta?.lintTools)
    ? projectMeta.lintTools.map((tool) => LINT_TO_QUALITY[tool]).filter(Boolean)
    : [];
  const qualityTools = filterQualityTools(
    commitlintEnabled ? [...lintTools, 'commitlint'] : lintTools,
  );

  const validSkillIds = new Set(getSkillCatalog().map((s) => s.id));
  const skills = filterStringIds(skillsMeta?.enabled?.map((s) => s.id), validSkillIds);

  const validMcpIds = new Set(getMcpCatalog().map((m) => m.id));
  const mcpServers = filterStringIds(mcpMeta?.enabled?.map((m) => m.id), validMcpIds);

  return {
    devTools,
    qualityTools,
    skills,
    mcpServers,
    hasSavedDevTools: Array.isArray(toolsMeta?.selectedTools),
    hasSavedQualityTools: Array.isArray(projectMeta?.lintTools) || commitlintEnabled,
    hasSavedSkills: Array.isArray(skillsMeta?.enabled),
    hasSavedMcpServers: Array.isArray(mcpMeta?.enabled),
  };
}
