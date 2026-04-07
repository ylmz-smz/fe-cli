import path from 'node:path';
import fs from 'fs-extra';
import type { ToolAdapter, AdapterContext, SkillSelection, McpSelection } from './types.js';
import { readJsonSafe, writeJsonSafe } from '../utils/fs.js';
import { mergeConfig } from '../core/merge-config.js';
import { logger } from '../utils/logger.js';
import { TOOL_CONFIG_PATHS } from '../core/paths.js';

export const vscodeAdapter: ToolAdapter = {
  id: 'vscode',

  async applySkills(ctx, skills) {
    if (skills.length === 0) return;
    const dir = path.join(ctx.projectRoot, TOOL_CONFIG_PATHS.vscode);
    await fs.ensureDir(dir);

    const settingsPath = path.join(dir, 'settings.json');
    const existing = (await readJsonSafe<Record<string, unknown>>(settingsPath)) ?? {};
    const merged = mergeConfig(existing, {
      'fe-kit.skills': skills.map((s) => s.id),
    });
    await writeJsonSafe(settingsPath, merged);
    logger.success('VSCode: skills written to .vscode/settings.json');
  },

  async applyMcp(ctx, mcp) {
    if (mcp.length === 0) return;
    const dir = path.join(ctx.projectRoot, TOOL_CONFIG_PATHS.vscode);
    await fs.ensureDir(dir);

    const settingsPath = path.join(dir, 'settings.json');
    const existing = (await readJsonSafe<Record<string, unknown>>(settingsPath)) ?? {};
    const mcpEntries = Object.fromEntries(mcp.map((m) => [m.id, m.config]));
    const merged = mergeConfig(existing, {
      'fe-kit.mcp': mcpEntries,
    });
    await writeJsonSafe(settingsPath, merged);
    logger.success('VSCode: MCP config written to .vscode/settings.json');
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
    logger.success('VSCode: extensions.json updated');
  },
};
