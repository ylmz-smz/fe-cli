import path from 'node:path';
import fs from 'fs-extra';
import type { ToolAdapter, AdapterContext } from './types.js';
import { TOOL_CONFIG_PATHS } from '../core/paths.js';
import { logger } from '../utils/logger.js';

export const ideaAdapter: ToolAdapter = {
  id: 'idea',

  async applySkills(ctx, skills) {
    if (skills.length === 0) return;
    const dir = path.join(ctx.projectRoot, TOOL_CONFIG_PATHS.idea);
    await fs.ensureDir(dir);
    logger.info('IDEA: skill integration is a placeholder — manual config may be needed.');
  },

  async applyMcp(ctx, mcp) {
    if (mcp.length === 0) return;
    const dir = path.join(ctx.projectRoot, TOOL_CONFIG_PATHS.idea);
    await fs.ensureDir(dir);
    logger.info('IDEA: MCP integration is a placeholder — manual config may be needed.');
  },

  async applyRules(ctx) {
    const dir = path.join(ctx.projectRoot, TOOL_CONFIG_PATHS.idea);
    await fs.ensureDir(dir);
    logger.info('IDEA: rules integration is a placeholder.');
  },
};
