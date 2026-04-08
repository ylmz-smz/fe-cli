export const DEV_TOOLS = [
  'cursor',
  'claude-code',
  'vscode',
  'codebuddy-cn',
  'trae',
  'idea',
] as const;

export type DevToolId = (typeof DEV_TOOLS)[number];
