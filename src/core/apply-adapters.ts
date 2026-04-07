import type { AdapterContext, SkillSelection, McpSelection } from '../adapters/types.js';
import type { Framework } from '../constants/frameworks.js';
import type { StackFramework } from './detect-stack.js';
import type { DevToolId } from '../constants/tools.js';
import { getAdapters } from '../adapters/registry.js';
import { getSkillById } from '../skills/catalog.js';
import { getMcpById } from '../mcp/catalog.js';
import { logger } from '../utils/logger.js';

export interface AdapterInput {
  framework: Framework | StackFramework;
  devTools: DevToolId[];
  skills: string[];
  mcpServers: string[];
}

export async function applyAdapters(
  projectRoot: string,
  input: AdapterInput,
): Promise<void> {
  const adapters = getAdapters(input.devTools);
  const ctx: AdapterContext = { projectRoot, framework: input.framework };

  const skills: SkillSelection[] = input.skills
    .map(getSkillById)
    .filter((s): s is SkillSelection => s !== undefined);

  const mcp: McpSelection[] = input.mcpServers
    .map(getMcpById)
    .filter((m): m is McpSelection => m !== undefined);

  for (const adapter of adapters) {
    logger.step(`Applying config for ${adapter.id}...`);
    await adapter.applySkills(ctx, skills);
    await adapter.applyMcp(ctx, mcp);
    await adapter.applyRules(ctx);
  }
}
