import prompts from 'prompts';
import type { EnhanceAnswers } from '../types/selections.js';
import type { ProjectDetection } from '../core/detect-project.js';
import { DEV_TOOLS } from '../constants/tools.js';
import { getSkillCatalog } from '../skills/catalog.js';
import { getMcpCatalog } from '../mcp/catalog.js';

export async function runEnhancePrompts(
  detection: ProjectDetection,
): Promise<EnhanceAnswers | null> {
  const response = await prompts(
    [
      {
        type: 'multiselect',
        name: 'devTools',
        message: `Dev tools to configure for this ${detection.framework} project:`,
        choices: DEV_TOOLS.map((t) => ({ title: t, value: t, selected: t === 'vscode' })),
        min: 1,
        hint: 'Select at least one',
      },
      {
        type: 'multiselect',
        name: 'skills',
        message: 'Skills to add:',
        choices: getSkillCatalog().map((s) => ({
          title: `${s.label} — ${s.description}`,
          value: s.id,
          selected: false,
        })),
      },
      {
        type: 'multiselect',
        name: 'mcpServers',
        message: 'MCP servers to add:',
        choices: getMcpCatalog().map((m) => ({
          title: `${m.label} — ${m.description}`,
          value: m.id,
          selected: false,
        })),
      },
    ],
    { onCancel: () => process.exit(0) },
  );

  if (!response.devTools) return null;
  return response as EnhanceAnswers;
}
