export const DEV_TOOLS = [
  'vscode',
  'claude-code',
  'codebuddy-cn',
  'trae',
  'idea',
] as const;

export type DevToolId = (typeof DEV_TOOLS)[number];
