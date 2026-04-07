import type { DevToolId } from '../constants/tools.js';
import type { ToolAdapter } from './types.js';
import { vscodeAdapter } from './vscode.js';
import { claudeCodeAdapter } from './claude-code.js';
import { codebuddyCnAdapter } from './codebuddy-cn.js';
import { traeAdapter } from './trae.js';
import { ideaAdapter } from './idea.js';

const adapters: Record<DevToolId, ToolAdapter> = {
  vscode: vscodeAdapter,
  'claude-code': claudeCodeAdapter,
  'codebuddy-cn': codebuddyCnAdapter,
  trae: traeAdapter,
  idea: ideaAdapter,
};

export function getAdapter(id: DevToolId): ToolAdapter {
  return adapters[id];
}

export function getAdapters(ids: DevToolId[]): ToolAdapter[] {
  return ids.map((id) => adapters[id]);
}
