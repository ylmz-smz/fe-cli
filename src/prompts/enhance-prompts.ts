import prompts from 'prompts';
import type { EnhanceAnswers } from '../types/selections.js';
import type { StackDetection } from '../core/detect-stack.js';
import { summarizeStack } from '../core/detect-stack.js';
import type { QualityTool } from '../constants/lint.js';
import { DEV_TOOLS } from '../constants/tools.js';
import { getSkillCatalog } from '../skills/catalog.js';
import { getMcpCatalog } from '../mcp/catalog.js';
import type { EnhancePromptDefaults } from '../core/resolve-enhance-defaults.js';


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

  const response = await prompts(
    [
      {
        type: 'multiselect',
        name: 'devTools',
        message: `Dev tools to configure for this ${stackLabel} project:`,
        choices: DEV_TOOLS.map((t) => ({
          title: t,
          value: t,
          selected: hasSavedDefaults ? defaultDevTools.includes(t) : t === 'cursor',
        })),
        min: 1,
        hint: 'Select at least one',
      },
      {
        type: 'multiselect',
        name: 'qualityTools',
        message: 'Code quality tools to install & configure:',
        choices: applicableTools.map((t) => ({
          title: `${t.label} — ${t.description}`,
          value: t.id,
          selected: hasSavedQualityDefaults ? defaultQualityTools.has(t.id) : t.selected,
        })),
        hint: 'Space to toggle, Enter to confirm',
      },
      {
        type: 'multiselect',
        name: 'skills',
        message: 'Skills to add:',
        choices: getSkillCatalog().map((s) => ({
          title: s.label,
          description: s.description,
          value: s.id,
          selected: hasSavedSkillDefaults ? defaultSkills.has(s.id) : false,
        })),
      },
      {
        type: 'multiselect',
        name: 'mcpServers',
        message: 'MCP servers to add:',
        choices: getMcpCatalog().map((m) => ({
          title: m.label,
          description: m.description,
          value: m.id,
          selected: hasSavedMcpDefaults ? defaultMcpServers.has(m.id) : false,
        })),
      },
    ],
    { onCancel: () => process.exit(0) },
  );

  if (!response.devTools) return null;

  return {
    devTools: response.devTools,
    qualityTools: response.qualityTools ?? [],
    skills: response.skills ?? [],
    mcpServers: response.mcpServers ?? [],
  };
}
