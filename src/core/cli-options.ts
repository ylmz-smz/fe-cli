import type { Framework } from '../constants/frameworks.js';
import { FRAMEWORKS, ROUTERS, STATE_MANAGERS } from '../constants/frameworks.js';
import type { Bundler } from '../constants/bundlers.js';
import { BUNDLERS, BUNDLERS_BY_FRAMEWORK } from '../constants/bundlers.js';
import type { DevToolId } from '../constants/tools.js';
import { DEV_TOOLS } from '../constants/tools.js';
import type { LintTool, QualityTool } from '../constants/lint.js';
import { LINT_TOOLS, QUALITY_TOOLS } from '../constants/lint.js';
import { getSkillCatalog } from '../skills/catalog.js';
import { getMcpCatalog } from '../mcp/catalog.js';
import type { PackageManager } from './post-init.js';

export interface InitCommandOptions {
  projectName?: string;
  projectPath?: string;
  framework?: string;
  router?: string;
  stateManagement?: string;
  bundler?: string;
  lintTools?: string[];
  devTools?: string[];
  skills?: string[];
  mcpServers?: string[];
  featureDomains?: string[];
  yes?: boolean;
  install?: boolean | string;
  packageManager?: string;
  gitInit?: boolean | string;
  gitCommit?: boolean | string;
  gitMessage?: string;
}

export interface InitPromptOptions {
  projectName?: string;
  projectPath?: string;
  framework?: Framework;
  router?: string;
  stateManagement?: string;
  bundler?: Bundler;
  lintTools?: LintTool[];
  devTools?: DevToolId[];
  skills?: string[];
  mcpServers?: string[];
  featureDomains?: string[];
  yes?: boolean;
  install?: boolean;
  packageManager?: PackageManager;
  gitInit?: boolean;
  gitCommit?: boolean;
  gitMessage?: string;
}

export interface EnhanceCommandOptions {
  devTools?: string[];
  qualityTools?: string[];
  skills?: string[];
  mcpServers?: string[];
  yes?: boolean;
}

export interface EnhancePromptOptions {
  devTools?: DevToolId[];
  qualityTools?: QualityTool[];
  skills?: string[];
  mcpServers?: string[];
  yes?: boolean;
}

const FRAMEWORK_SET = new Set<string>(FRAMEWORKS);
const BUNDLER_SET = new Set<string>(BUNDLERS);
const ROUTER_SET = new Set<string>(Object.values(ROUTERS));
const DEV_TOOL_SET = new Set<string>(DEV_TOOLS);
const LINT_TOOL_SET = new Set<string>(LINT_TOOLS);
const QUALITY_TOOL_SET = new Set<string>(QUALITY_TOOLS);
const PACKAGE_MANAGERS = ['pnpm', 'npm', 'yarn', 'bun'] as const;
const PACKAGE_MANAGER_SET = new Set<string>(PACKAGE_MANAGERS);

function formatList(values: readonly string[]): string {
  return values.join(', ');
}

function toUnique(values: string[] | undefined): string[] | undefined {
  if (!values) return undefined;
  const cleaned = values
    .map((v) => v.trim())
    .filter(Boolean);
  return [...new Set(cleaned)];
}

function assertEnumValue(value: string | undefined, validSet: Set<string>, label: string): string | undefined {
  if (!value) return undefined;
  if (!validSet.has(value)) {
    throw new Error(`Invalid ${label}: ${value}`);
  }
  return value;
}

function assertEnumList(values: string[] | undefined, validSet: Set<string>, label: string): string[] | undefined {
  const unique = toUnique(values);
  if (!unique) return undefined;

  const invalid = unique.filter((v) => !validSet.has(v));
  if (invalid.length > 0) {
    throw new Error(`Invalid ${label}: ${invalid.join(', ')}`);
  }

  return unique;
}

function getStateManagerSet(framework: Framework): Set<string> {
  return new Set<string>(STATE_MANAGERS[framework]);
}

function validateFrameworkLinkage(
  framework: Framework | undefined,
  router: string | undefined,
  stateManagement: string | undefined,
  bundler: Bundler | undefined,
): void {
  if (!framework) return;

  if (router && router !== ROUTERS[framework]) {
    throw new Error(
      `Invalid router for framework ${framework}: ${router}. Expected ${ROUTERS[framework]}.`,
    );
  }

  if (stateManagement && !getStateManagerSet(framework).has(stateManagement)) {
    throw new Error(
      `Invalid stateManagement for framework ${framework}: ${stateManagement}. Allowed: ${formatList(STATE_MANAGERS[framework])}.`,
    );
  }

  if (bundler && !BUNDLERS_BY_FRAMEWORK[framework].includes(bundler)) {
    throw new Error(
      `Invalid bundler for framework ${framework}: ${bundler}. Allowed: ${formatList(BUNDLERS_BY_FRAMEWORK[framework])}.`,
    );
  }
}

function validateIds(ids: string[] | undefined, validSet: Set<string>, label: string): string[] | undefined {
  if (!ids) return undefined;
  const invalid = ids.filter((id) => !validSet.has(id));
  if (invalid.length > 0) {
    throw new Error(`Invalid ${label}: ${invalid.join(', ')}`);
  }
  return ids;
}

function parseBooleanOption(value: boolean | string | undefined, label: string): boolean | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'boolean') return value;

  const normalized = value.trim().toLowerCase();
  if (['true', '1', 'yes', 'y', 'on'].includes(normalized)) return true;
  if (['false', '0', 'no', 'n', 'off'].includes(normalized)) return false;

  throw new Error(`Invalid ${label}: ${value}. Use true/false.`);
}

export function normalizeInitCommandOptions(options: InitCommandOptions): InitPromptOptions {
  const framework = assertEnumValue(options.framework, FRAMEWORK_SET, `framework (allowed: ${formatList(FRAMEWORKS)})`) as Framework | undefined;
  const bundler = assertEnumValue(options.bundler, BUNDLER_SET, `bundler (allowed: ${formatList(BUNDLERS)})`) as Bundler | undefined;
  const router = assertEnumValue(options.router, ROUTER_SET, 'router');

  const lintTools = assertEnumList(options.lintTools, LINT_TOOL_SET, 'lintTools') as LintTool[] | undefined;
  const devTools = assertEnumList(options.devTools, DEV_TOOL_SET, 'devTools') as DevToolId[] | undefined;
  const skillIds = validateIds(toUnique(options.skills), new Set(getSkillCatalog().map((s) => s.id)), 'skills');
  const mcpIds = validateIds(toUnique(options.mcpServers), new Set(getMcpCatalog().map((m) => m.id)), 'mcpServers');
  const packageManager = assertEnumValue(
    options.packageManager,
    PACKAGE_MANAGER_SET,
    `packageManager (allowed: ${formatList(PACKAGE_MANAGERS)})`,
  ) as PackageManager | undefined;

  const stateCandidates = toUnique(options.stateManagement ? [options.stateManagement] : undefined);
  const stateManagement = stateCandidates?.[0];
  validateFrameworkLinkage(framework, router, stateManagement, bundler);

  return {
    projectName: options.projectName?.trim() || undefined,
    projectPath: options.projectPath?.trim() || undefined,
    framework,
    router,
    stateManagement,
    bundler,
    lintTools,
    devTools,
    skills: skillIds,
    mcpServers: mcpIds,
    featureDomains: toUnique(options.featureDomains),
    yes: options.yes,
    install: parseBooleanOption(options.install, 'install'),
    packageManager,
    gitInit: parseBooleanOption(options.gitInit, 'gitInit'),
    gitCommit: parseBooleanOption(options.gitCommit, 'gitCommit'),
    gitMessage: options.gitMessage,
  };
}

export function normalizeEnhanceCommandOptions(options: EnhanceCommandOptions): EnhancePromptOptions {
  const devTools = assertEnumList(options.devTools, DEV_TOOL_SET, 'devTools') as DevToolId[] | undefined;
  const qualityTools = assertEnumList(options.qualityTools, QUALITY_TOOL_SET, 'qualityTools') as QualityTool[] | undefined;
  const skillIds = validateIds(toUnique(options.skills), new Set(getSkillCatalog().map((s) => s.id)), 'skills');
  const mcpIds = validateIds(toUnique(options.mcpServers), new Set(getMcpCatalog().map((m) => m.id)), 'mcpServers');

  return {
    devTools,
    qualityTools,
    skills: skillIds,
    mcpServers: mcpIds,
    yes: options.yes,
  };
}
