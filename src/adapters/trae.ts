import path from 'node:path';
import fs from 'fs-extra';
import type { ToolAdapter, AdapterContext, SkillSelection, McpSelection } from './types.js';
import { readJsonSafe, writeJsonSafe } from '../utils/fs.js';
import { mergeConfig } from '../core/merge-config.js';
import { TOOL_CONFIG_PATHS } from '../core/paths.js';
import { loadRuleSources } from '../core/rule-writers.js';
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
    const mcpSection = (existing.mcpServers as Record<string, unknown>) ?? {};

    for (const m of mcp) {
      mcpSection[m.id] = m.config;
    }

    await writeJsonSafe(configPath, mergeConfig(existing, { mcpServers: mcpSection }));
    logger.success('Trae: MCP config written to .trae/mcp.json');
  },

  async applyRules(ctx) {
    const rulesDir = path.join(ctx.projectRoot, TOOL_CONFIG_PATHS.trae, 'rules');
    await fs.ensureDir(rulesDir);

    const rules = await loadRuleSources(ctx.framework);
    for (const rule of rules) {
      const filename = `${rule.category}-${rule.name}.md`;
      await fs.writeFile(path.join(rulesDir, filename), rule.content + '\n', 'utf-8');
    }
    logger.success('Trae: rules written to .trae/rules/');
  },
};
