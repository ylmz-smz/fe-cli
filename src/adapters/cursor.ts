import path from 'node:path';
import fs from 'fs-extra';
import type { ToolAdapter, AdapterContext, SkillSelection, McpSelection } from './types.js';
import { readJsonSafe, writeJsonSafe } from '../utils/fs.js';
import { mergeConfig } from '../core/merge-config.js';
import { TOOL_CONFIG_PATHS } from '../core/paths.js';
import { writeCursorRules } from '../core/rule-writers.js';
import { logger } from '../utils/logger.js';

export const cursorAdapter: ToolAdapter = {
  id: 'cursor',

  async applySkills(_ctx, skills) {
    if (skills.length === 0) return;
    logger.info('Cursor: skills are applied via rules — no separate skills directory needed.');
  },

  async applyMcp(ctx, mcp) {
    if (mcp.length === 0) return;
    const configPath = path.join(ctx.projectRoot, TOOL_CONFIG_PATHS.cursor, 'mcp.json');
    await fs.ensureDir(path.dirname(configPath));

    const existing = (await readJsonSafe<Record<string, unknown>>(configPath)) ?? {};
    const mcpSection = (existing.mcpServers as Record<string, unknown>) ?? {};

    for (const m of mcp) {
      mcpSection[m.id] = m.config;
    }

    await writeJsonSafe(configPath, mergeConfig(existing, { mcpServers: mcpSection }));
    logger.success('Cursor: MCP config written to .cursor/mcp.json');
  },

  async applyRules(ctx) {
    await writeCursorRules(ctx.projectRoot, ctx.framework);
    logger.success('Cursor: rules written to .cursor/rules/*.mdc');
  },
};
