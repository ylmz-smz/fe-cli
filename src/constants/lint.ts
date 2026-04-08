export const LINT_TOOLS = [
  'eslint',
  'stylelint',
  'prettier',
  'editorconfig',
] as const;

export type LintTool = (typeof LINT_TOOLS)[number];

export const QUALITY_TOOLS = [
  'eslint',
  'stylelint',
  'prettier',
  'editorconfig',
  'commitlint',
] as const;

export type QualityTool = (typeof QUALITY_TOOLS)[number];
