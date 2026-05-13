import path from 'node:path';
import prompts from 'prompts';
import type { InitAnswers } from '../types/selections.js';
import { FRAMEWORKS, ROUTERS, STATE_MANAGERS, type Framework } from '../constants/frameworks.js';
import { BUNDLERS_BY_FRAMEWORK } from '../constants/bundlers.js';
import { DEV_TOOLS } from '../constants/tools.js';
import { LINT_TOOLS } from '../constants/lint.js';
import { getSkillCatalog } from '../skills/catalog.js';
import { getMcpCatalog } from '../mcp/catalog.js';
import { normalizeFeatureDomains } from '../generators/bootstrap-generator.js';
import type { InitPromptOptions } from '../core/cli-options.js';

function pickFirst<T>(values: readonly T[]): T {
  return values[0];
}

function resolveInitAnswers(
  response: Record<string, unknown>,
  options: InitPromptOptions,
): InitAnswers {
  const framework = options.framework ?? (response.framework as Framework | undefined) ?? pickFirst(FRAMEWORKS);
  const bundlers = BUNDLERS_BY_FRAMEWORK[framework];
  const projectName = options.projectName ?? (response.projectName as string | undefined) ?? 'fe-kit-app';
  const projectPathInput = options.projectPath ?? (response.projectPath as string | undefined) ?? `./${projectName}`;

  const router = options.router ?? (response.router as string | undefined) ?? ROUTERS[framework];
  const stateManagement =
    options.stateManagement ??
    (response.stateManagement as string | undefined) ??
    pickFirst(STATE_MANAGERS[framework]);
  const bundler = options.bundler ?? (response.bundler as InitAnswers['bundler'] | undefined) ?? pickFirst(bundlers);

  const lintTools = options.lintTools ?? (response.lintTools as InitAnswers['lintTools'] | undefined) ?? [...LINT_TOOLS];
  const devTools = options.devTools ?? (response.devTools as InitAnswers['devTools'] | undefined) ?? ['cursor'];
  const skills = options.skills ?? (response.skills as string[] | undefined) ?? [];
  const mcpServers = options.mcpServers ?? (response.mcpServers as string[] | undefined) ?? [];
  const featureDomains =
    options.featureDomains ??
    normalizeFeatureDomains(response.featureDomainsRaw as string | string[] | undefined);

  if (!projectName.trim()) {
    throw new Error('Project name is required.');
  }

  if (devTools.length === 0) {
    throw new Error('At least one dev tool is required.');
  }

  return {
    projectName,
    projectPath: path.resolve(projectPathInput),
    framework,
    router,
    stateManagement,
    bundler,
    lintTools,
    devTools,
    skills,
    mcpServers,
    featureDomains,
  };
}

export async function runInitPrompts(options: InitPromptOptions = {}): Promise<InitAnswers | null> {
  if (options.yes) {
    return resolveInitAnswers({}, options);
  }

  const response = await prompts(
    [
      {
        type: options.projectName !== undefined ? null : 'text',
        name: 'projectName',
        message: 'Project name:',
        validate: (v: string) => (v.trim() ? true : 'Project name is required'),
      },
      {
        type: options.projectPath !== undefined ? null : 'text',
        name: 'projectPath',
        message: 'Project path:',
        initial: (prev: string) => `./${prev}`,
        format: (v: string) => path.resolve(v),
      },
      {
        type: options.framework !== undefined ? null : 'select',
        name: 'framework',
        message: 'Frontend framework:',
        initial: FRAMEWORKS.indexOf(options.framework ?? pickFirst(FRAMEWORKS)),
        choices: FRAMEWORKS.map((f) => ({ title: f.charAt(0).toUpperCase() + f.slice(1), value: f })),
      },
      {
        type: options.router !== undefined ? null : 'select',
        name: 'router',
        message: 'Router:',
        choices: (_prev: unknown, answers: Record<string, unknown>) => {
          const fw = options.framework ?? (answers.framework as Framework);
          return [{ title: ROUTERS[fw], value: ROUTERS[fw] }];
        },
      },
      {
        type: options.stateManagement !== undefined ? null : 'select',
        name: 'stateManagement',
        message: 'State management:',
        choices: (_prev: unknown, answers: Record<string, unknown>) => {
          const fw = options.framework ?? (answers.framework as Framework);
          return STATE_MANAGERS[fw].map((s) => ({ title: s, value: s }));
        },
      },
      {
        type: options.bundler !== undefined ? null : 'select',
        name: 'bundler',
        message: 'Build tool:',
        choices: (_prev: unknown, answers: Record<string, unknown>) => {
          const fw = options.framework ?? (answers.framework as Framework);
          const bundlers = BUNDLERS_BY_FRAMEWORK[fw];
          return bundlers.map((b) => ({ title: b.charAt(0).toUpperCase() + b.slice(1), value: b }));
        },
      },
      {
        type: options.lintTools !== undefined ? null : 'multiselect',
        name: 'lintTools',
        message: 'Code quality tools (space to toggle):',
        choices: LINT_TOOLS.map((t) => ({
          title: t,
          value: t,
          selected: options.lintTools ? options.lintTools.includes(t) : true,
        })),
        hint: 'ESLint + Prettier recommended',
      },
      {
        type: options.devTools !== undefined ? null : 'multiselect',
        name: 'devTools',
        message: 'Dev tools to configure:',
        choices: DEV_TOOLS.map((t) => ({
          title: t,
          value: t,
          selected: options.devTools ? options.devTools.includes(t) : t === 'cursor',
        })),
        min: 1,
        hint: 'Select at least one',
      },
      {
        type: options.skills !== undefined ? null : 'multiselect',
        name: 'skills',
        message: 'Built-in Skills to enable:',
        choices: getSkillCatalog().map((s) => ({
          title: s.label,
          description: s.description,
          value: s.id,
          selected: options.skills ? options.skills.includes(s.id) : false,
        })),
      },
      {
        type: options.mcpServers !== undefined ? null : 'multiselect',
        name: 'mcpServers',
        message: 'MCP servers to enable:',
        choices: getMcpCatalog().map((m) => ({
          title: m.label,
          description: m.description,
          value: m.id,
          selected: options.mcpServers ? options.mcpServers.includes(m.id) : false,
        })),
      },
      {
        type: options.featureDomains !== undefined ? null : 'text',
        name: 'featureDomainsRaw',
        message: 'Feature domains (comma-separated, optional):',
        hint: 'Example: auth, dashboard, reporting',
        initial: options.featureDomains?.join(', ') ?? '',
      },
    ],
    { onCancel: () => process.exit(0) },
  );

  return resolveInitAnswers(response as Record<string, unknown>, options);
}
