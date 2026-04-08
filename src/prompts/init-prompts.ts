import path from 'node:path';
import prompts from 'prompts';
import type { InitAnswers } from '../types/selections.js';
import { FRAMEWORKS, ROUTERS, STATE_MANAGERS, type Framework } from '../constants/frameworks.js';
import { BUNDLERS } from '../constants/bundlers.js';
import { DEV_TOOLS } from '../constants/tools.js';
import { LINT_TOOLS } from '../constants/lint.js';
import { getSkillCatalog } from '../skills/catalog.js';
import { getMcpCatalog } from '../mcp/catalog.js';


export async function runInitPrompts(): Promise<InitAnswers | null> {
  const response = await prompts(
    [
      {
        type: 'text',
        name: 'projectName',
        message: 'Project name:',
        validate: (v: string) => (v.trim() ? true : 'Project name is required'),
      },
      {
        type: 'text',
        name: 'projectPath',
        message: 'Project path:',
        initial: (prev: string) => `./${prev}`,
        format: (v: string) => path.resolve(v),
      },
      {
        type: 'select',
        name: 'framework',
        message: 'Frontend framework:',
        choices: FRAMEWORKS.map((f) => ({ title: f.charAt(0).toUpperCase() + f.slice(1), value: f })),
      },
      {
        type: 'select',
        name: 'router',
        message: 'Router:',
        choices: (_prev: unknown, answers: Record<string, unknown>) => {
          const fw = answers.framework as Framework;
          return [{ title: ROUTERS[fw], value: ROUTERS[fw] }];
        },
      },
      {
        type: 'select',
        name: 'stateManagement',
        message: 'State management:',
        choices: (_prev: unknown, answers: Record<string, unknown>) => {
          const fw = answers.framework as Framework;
          return STATE_MANAGERS[fw].map((s) => ({ title: s, value: s }));
        },
      },
      {
        type: 'select',
        name: 'bundler',
        message: 'Build tool:',
        choices: BUNDLERS.map((b) => ({ title: b.charAt(0).toUpperCase() + b.slice(1), value: b })),
      },
      {
        type: 'multiselect',
        name: 'lintTools',
        message: 'Code quality tools (space to toggle):',
        choices: LINT_TOOLS.map((t) => ({
          title: t,
          value: t,
          selected: true,
        })),
        hint: 'ESLint + Prettier recommended',
      },
      {
        type: 'multiselect',
        name: 'devTools',
        message: 'Dev tools to configure:',
        choices: DEV_TOOLS.map((t) => ({ title: t, value: t, selected: t === 'cursor' })),
        min: 1,
        hint: 'Select at least one',
      },
      {
        type: 'multiselect',
        name: 'skills',
        message: 'Built-in Skills to enable:',
        choices: getSkillCatalog().map((s) => ({
          title: `${s.label} — ${s.description}`,
          value: s.id,
          selected: false,
        })),
      },
      {
        type: 'multiselect',
        name: 'mcpServers',
        message: 'MCP servers to enable:',
        choices: getMcpCatalog().map((m) => ({
          title: `${m.label} — ${m.description}`,
          value: m.id,
          selected: false,
        })),
      },
    ],
    { onCancel: () => process.exit(0) },
  );

  if (!response.projectName) return null;

  return response as InitAnswers;
}
