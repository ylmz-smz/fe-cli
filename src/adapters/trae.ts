import path from 'node:path';
import fs from 'fs-extra';
import type { ToolAdapter, AdapterContext, SkillSelection, McpSelection } from './types.js';
import { readJsonSafe, writeJsonSafe } from '../utils/fs.js';
import { mergeConfig } from '../core/merge-config.js';
import { TOOL_CONFIG_PATHS } from '../core/paths.js';
import { logger } from '../utils/logger.js';

export const traeAdapter: ToolAdapter = {
  id: 'trae',

  async applySkills(ctx, skills) {
    if (skills.length === 0) return;
    const dir = path.join(ctx.projectRoot, TOOL_CONFIG_PATHS.trae, 'rules');
    await fs.ensureDir(dir);

    for (const skill of skills) {
      const filePath = path.join(dir, `${skill.id}.md`);
      await fs.writeFile(filePath, skill.content, 'utf-8');
    }
    logger.success('Trae: skills written to .trae/rules/');
  },

  async applyMcp(ctx, mcp) {
    if (mcp.length === 0) return;
    const configPath = path.join(ctx.projectRoot, TOOL_CONFIG_PATHS.trae, 'mcp.json');
    await fs.ensureDir(path.dirname(configPath));
    const existing = (await readJsonSafe<Record<string, unknown>>(configPath)) ?? {};
    const mcpEntries = Object.fromEntries(mcp.map((m) => [m.id, m.config]));
    await writeJsonSafe(configPath, mergeConfig(existing, mcpEntries));
    logger.success('Trae: MCP config written');
  },

  async applyRules(ctx) {
    const rulesDir = path.join(ctx.projectRoot, TOOL_CONFIG_PATHS.trae, 'rules');
    await fs.ensureDir(rulesDir);
    logger.success('Trae: rules directory ensured');
  },
};
