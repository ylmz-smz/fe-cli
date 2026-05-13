import prompts from 'prompts';
import type { EnhanceAnswers } from '../types/selections.js';
import type { StackDetection } from '../core/detect-stack.js';
import { summarizeStack } from '../core/detect-stack.js';
import type { QualityTool } from '../constants/lint.js';
import { DEV_TOOLS } from '../constants/tools.js';
import { getSkillCatalog } from '../skills/catalog.js';
import { getMcpCatalog } from '../mcp/catalog.js';
import type { EnhancePromptDefaults } from '../core/resolve-enhance-defaults.js';
import type { EnhancePromptOptions } from '../core/cli-options.js';


interface QualityToolOption {
  id: QualityTool;
  label: string;
  description: string;
  selected: boolean;
}

function getApplicableTools(stack: StackDetection): QualityToolOption[] {
  const tools: QualityToolOption[] = [];

  tools.push({
    id: 'eslint',
    label: 'ESLint',
    description: 'Linting for JavaScript / TypeScript',
    selected: true,
  });

  tools.push({
    id: 'prettier',
    label: 'Prettier',
    description: 'Code formatting',
    selected: true,
  });

  tools.push({
    id: 'editorconfig',
    label: 'EditorConfig',
    description: 'Cross-editor indentation & whitespace settings',
    selected: true,
  });

  if (stack.projectKind === 'frontend') {
    tools.push({
      id: 'stylelint',
      label: 'Stylelint',
      description: 'CSS / SCSS linting',
      selected: false,
    });
  }

  tools.push({
    id: 'commitlint',
    label: 'commitlint',
    description: 'Enforce conventional commit messages',
    selected: false,
  });

  return tools;
}

export async function runEnhancePrompts(
  stack: StackDetection,
  defaults?: EnhancePromptDefaults,
  options: EnhancePromptOptions = {},
): Promise<EnhanceAnswers | null> {
  const stackLabel = summarizeStack(stack);
  const applicableTools = getApplicableTools(stack);
  const hasSavedDefaults = defaults?.hasSavedDevTools ?? false;
  const defaultDevTools = defaults?.devTools ?? [];
  const hasSavedQualityDefaults = defaults?.hasSavedQualityTools ?? false;
  const defaultQualityTools = new Set(defaults?.qualityTools ?? []);
  const hasSavedSkillDefaults = defaults?.hasSavedSkills ?? false;
  const defaultSkills = new Set(defaults?.skills ?? []);
  const hasSavedMcpDefaults = defaults?.hasSavedMcpServers ?? false;
  const defaultMcpServers = new Set(defaults?.mcpServers ?? []);

  const resolvedDevTools =
    options.devTools ??
    (hasSavedDefaults ? defaultDevTools : ['cursor']);

  const resolvedQualityTools =
    options.qualityTools ??
    applicableTools
      .filter((tool) => (hasSavedQualityDefaults ? defaultQualityTools.has(tool.id) : tool.selected))
      .map((tool) => tool.id);

  const resolvedSkills =
    options.skills ??
    getSkillCatalog()
      .filter((skill) => (hasSavedSkillDefaults ? defaultSkills.has(skill.id) : false))
      .map((skill) => skill.id);

  const resolvedMcpServers =
    options.mcpServers ??
    getMcpCatalog()
      .filter((server) => (hasSavedMcpDefaults ? defaultMcpServers.has(server.id) : false))
      .map((server) => server.id);

  if (options.yes) {
    if (resolvedDevTools.length === 0) {
      throw new Error('At least one dev tool is required.');
    }

    return {
      devTools: resolvedDevTools,
      qualityTools: resolvedQualityTools,
      skills: resolvedSkills,
      mcpServers: resolvedMcpServers,
    };
  }

  const response = await prompts(
    [
      {
        type: options.devTools !== undefined ? null : 'multiselect',
        name: 'devTools',
        message: `Dev tools to configure for this ${stackLabel} project:`,
        choices: DEV_TOOLS.map((t) => ({
          title: t,
          value: t,
          selected: resolvedDevTools.includes(t),
        })),
        min: 1,
        hint: 'Select at least one',
      },
      {
        type: options.qualityTools !== undefined ? null : 'multiselect',
        name: 'qualityTools',
        message: 'Code quality tools to install & configure:',
        choices: applicableTools.map((t) => ({
          title: `${t.label} — ${t.description}`,
          value: t.id,
          selected: resolvedQualityTools.includes(t.id),
        })),
        hint: 'Space to toggle, Enter to confirm',
      },
      {
        type: options.skills !== undefined ? null : 'multiselect',
        name: 'skills',
        message: 'Skills to add:',
        choices: getSkillCatalog().map((s) => ({
          title: s.label,
          description: s.description,
          value: s.id,
          selected: resolvedSkills.includes(s.id),
        })),
      },
      {
        type: options.mcpServers !== undefined ? null : 'multiselect',
        name: 'mcpServers',
        message: 'MCP servers to add:',
        choices: getMcpCatalog().map((m) => ({
          title: m.label,
          description: m.description,
          value: m.id,
          selected: resolvedMcpServers.includes(m.id),
        })),
      },
    ],
    { onCancel: () => process.exit(0) },
  );

  const devTools = (options.devTools ?? response.devTools ?? []) as EnhanceAnswers['devTools'];
  if (devTools.length === 0) {
    throw new Error('At least one dev tool is required.');
  }

  return {
    devTools,
    qualityTools: (options.qualityTools ?? response.qualityTools ?? []) as EnhanceAnswers['qualityTools'],
    skills: options.skills ?? response.skills ?? [],
    mcpServers: options.mcpServers ?? response.mcpServers ?? [],
  };
}
