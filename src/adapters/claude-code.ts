import path from 'node:path';
import fs from 'fs-extra';
import type { ToolAdapter, AdapterContext, SkillSelection, McpSelection } from './types.js';
import { readJsonSafe, writeJsonSafe } from '../utils/fs.js';
import { mergeConfig } from '../core/merge-config.js';
import { TOOL_CONFIG_PATHS } from '../core/paths.js';
import { logger } from '../utils/logger.js';

export const claudeCodeAdapter: ToolAdapter = {
  id: 'claude-code',

  async applySkills(ctx, skills) {
    if (skills.length === 0) return;
    const dir = path.join(ctx.projectRoot, TOOL_CONFIG_PATHS['claude-code']);
    await fs.ensureDir(dir);

    for (const skill of skills) {
      const filePath = path.join(dir, 'skills', `${skill.id}.md`);
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, skill.content, 'utf-8');
    }
    logger.success('Claude Code: skills written to .claude/skills/');
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
    logger.success('Claude Code: MCP config written to .mcp.json');
  },

  async applyRules(ctx) {
    const rulesDir = path.join(ctx.projectRoot, TOOL_CONFIG_PATHS['claude-code'], 'rules');
    await fs.ensureDir(rulesDir);
    logger.success('Claude Code: rules directory ensured at .claude/rules/');
  },
};
