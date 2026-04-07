export const LINT_TOOLS = [
  'eslint',
  'stylelint',
  'prettier',
  'editorconfig',
  'tslint',
] as const;

export type LintTool = (typeof LINT_TOOLS)[number];

export const TSLINT_DEPRECATION_WARNING =
  'TSLint is deprecated. Consider migrating to ESLint + @typescript-eslint.';
