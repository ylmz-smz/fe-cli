import type { ToolAdapter, AdapterContext, SkillSelection, McpSelection } from './types.js';
import path from 'node:path';
import { readJsonSafe, writeJsonSafe } from '../utils/fs.js';
import { mergeConfig } from '../core/merge-config.js';
import { writeCodeBuddyRules } from '../core/rule-writers.js';
import { logger } from '../utils/logger.js';

export const codebuddyCnAdapter: ToolAdapter = {
  id: 'codebuddy-cn',

  async applySkills(_ctx, skills) {
    if (skills.length === 0) return;
    logger.info('CodeBuddy: skills are applied via rules — no separate skills directory needed.');
  },

  async applyMcp(ctx, mcp) {
    if (mcp.length === 0) return;
    const configPath = path.join(ctx.projectRoot, '.mcp.json');
    const existing = (await readJsonSafe<Record<string, unknown>>(configPath)) ?? {};
    const mcpSection = (existing.mcpServers as Record<string, unknown>) ?? {};

    for (const m of mcp) {
      mcpSection[m.id] = m.config;
    }

    await writeJsonSafe(configPath, mergeConfig(existing, { mcpServers: mcpSection }));
    logger.success('CodeBuddy: MCP config written to .mcp.json');
  },

  async applyRules(ctx) {
    await writeCodeBuddyRules(ctx.projectRoot, ctx.framework);
    logger.success('CodeBuddy: rules written to .codebuddy/rules/*.mdc');
  },
};
