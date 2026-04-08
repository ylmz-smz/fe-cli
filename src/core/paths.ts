import type { DevToolId } from '../constants/tools.js';

/** Default config directories/files per IDE/tool inside a project root. */
export const TOOL_CONFIG_PATHS: Record<DevToolId, string> = {
  cursor: '.cursor',
  'claude-code': '.claude',
  vscode: '.vscode',
  'codebuddy-cn': '.codebuddy',
  trae: '.trae',
  idea: '.idea',
};
