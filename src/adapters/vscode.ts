import path from 'node:path';
import fs from 'fs-extra';
import type { ToolAdapter, AdapterContext, SkillSelection, McpSelection } from './types.js';
import { readJsonSafe, writeJsonSafe } from '../utils/fs.js';
import { mergeConfig } from '../core/merge-config.js';
import { writeCopilotInstructions } from '../core/rule-writers.js';
import { logger } from '../utils/logger.js';
import { TOOL_CONFIG_PATHS } from '../core/paths.js';

export const vscodeAdapter: ToolAdapter = {
  id: 'vscode',

  async applySkills(_ctx, skills) {
    if (skills.length === 0) return;
    logger.info('VS Code: skills are applied via Copilot instructions — no separate skills directory.');
  },

  async applyMcp(ctx, mcp) {
    if (mcp.length === 0) return;
    const dir = path.join(ctx.projectRoot, TOOL_CONFIG_PATHS.vscode);
    await fs.ensureDir(dir);

    const configPath = path.join(dir, 'mcp.json');
    const existing = (await readJsonSafe<Record<string, unknown>>(configPath)) ?? {};
    const serversSection = (existing.servers as Record<string, unknown>) ?? {};

    for (const m of mcp) {
      serversSection[m.id] = m.config;
    }

    await writeJsonSafe(configPath, mergeConfig(existing, { servers: serversSection }));
    logger.success('VS Code: MCP config written to .vscode/mcp.json (servers)');
  },

  async applyRules(ctx) {
    const dir = path.join(ctx.projectRoot, TOOL_CONFIG_PATHS.vscode);
    await fs.ensureDir(dir);

    const extensionsPath = path.join(dir, 'extensions.json');
    const existing = (await readJsonSafe<{ recommendations?: string[] }>(extensionsPath)) ?? {};
    const recs = new Set(existing.recommendations ?? []);

    const recommended = [
      'dbaeumer.vscode-eslint',
      'esbenp.prettier-vscode',
      'stylelint.vscode-stylelint',
    ];
    if (ctx.framework === 'vue') recommended.push('Vue.volar');
    for (const ext of recommended) recs.add(ext);

    await writeJsonSafe(extensionsPath, { recommendations: [...recs] });

    await writeCopilotInstructions(ctx.projectRoot, ctx.framework);
    logger.success('VS Code: extensions.json + .github/copilot-instructions.md updated');
  },
};
