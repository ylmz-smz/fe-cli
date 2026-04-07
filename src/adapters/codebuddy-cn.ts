import path from 'node:path';
import fs from 'fs-extra';
import type { ToolAdapter, AdapterContext, SkillSelection, McpSelection } from './types.js';
import { readJsonSafe, writeJsonSafe } from '../utils/fs.js';
import { mergeConfig } from '../core/merge-config.js';
import { TOOL_CONFIG_PATHS } from '../core/paths.js';
import { logger } from '../utils/logger.js';

export const codebuddyCnAdapter: ToolAdapter = {
  id: 'codebuddy-cn',

  async applySkills(ctx, skills) {
    if (skills.length === 0) return;
    const dir = path.join(ctx.projectRoot, TOOL_CONFIG_PATHS['codebuddy-cn']);
    await fs.ensureDir(dir);

    const configPath = path.join(dir, 'skills.json');
    const existing = (await readJsonSafe<{ skills?: string[] }>(configPath)) ?? {};
    const merged = mergeConfig(existing, {
      skills: skills.map((s) => s.id),
    });
    await writeJsonSafe(configPath, merged);
    logger.success('CodeBuddyCN: skills config written');
  },

  async applyMcp(ctx, mcp) {
    if (mcp.length === 0) return;
    const dir = path.join(ctx.projectRoot, TOOL_CONFIG_PATHS['codebuddy-cn']);
    await fs.ensureDir(dir);

    const configPath = path.join(dir, 'mcp.json');
    const existing = (await readJsonSafe<Record<string, unknown>>(configPath)) ?? {};
    const mcpEntries = Object.fromEntries(mcp.map((m) => [m.id, m.config]));
    await writeJsonSafe(configPath, mergeConfig(existing, mcpEntries));
    logger.success('CodeBuddyCN: MCP config written');
  },

  async applyRules(ctx) {
    const rulesDir = path.join(ctx.projectRoot, TOOL_CONFIG_PATHS['codebuddy-cn'], 'rules');
    await fs.ensureDir(rulesDir);
    logger.success('CodeBuddyCN: rules directory ensured');
  },
};
