import path from 'node:path';
import fs from 'fs-extra';
import type { ToolAdapter, AdapterContext } from './types.js';
import { TOOL_CONFIG_PATHS } from '../core/paths.js';
import { loadRuleSources } from '../core/rule-writers.js';
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

    // Keep JetBrains config untouched; write our own additive folder.
    const rulesDir = path.join(dir, 'fe-kit', 'rules');
    await fs.ensureDir(rulesDir);

    const rules = await loadRuleSources(ctx.framework);
    for (const rule of rules) {
      const filename = `${rule.category}-${rule.name}.md`;
      await fs.writeFile(path.join(rulesDir, filename), rule.content + '\n', 'utf-8');
    }

    logger.success('IDEA: rules written to .idea/fe-kit/rules/');
  },
};
