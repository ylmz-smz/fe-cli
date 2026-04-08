import type { DevToolId } from '../constants/tools.js';
import type { ToolAdapter } from './types.js';
import { cursorAdapter } from './cursor.js';
import { claudeCodeAdapter } from './claude-code.js';
import { vscodeAdapter } from './vscode.js';
import { codebuddyCnAdapter } from './codebuddy-cn.js';
import { traeAdapter } from './trae.js';
import { ideaAdapter } from './idea.js';

const adapters: Record<DevToolId, ToolAdapter> = {
  cursor: cursorAdapter,
  'claude-code': claudeCodeAdapter,
  vscode: vscodeAdapter,
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
