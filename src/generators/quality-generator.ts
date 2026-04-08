import path from 'node:path';
import fs from 'fs-extra';
import type { StackDetection, StackFramework } from '../core/detect-stack.js';
import type { QualityTool } from '../constants/lint.js';
import { logger } from '../utils/logger.js';

type Generator = (root: string, stack: StackDetection) => Promise<void>;

const GENERATORS: Record<QualityTool, Generator> = {
  eslint: generateEslint,
  stylelint: generateStylelint,
  prettier: generatePrettier,
  editorconfig: generateEditorConfig,
  commitlint: generateCommitlint,
};

export async function generateQualityTooling(
  root: string,
  stack: StackDetection,
  tools: QualityTool[],
): Promise<void> {
  for (const tool of tools) {
    await GENERATORS[tool](root, stack);
  }
}

// ---------------------------------------------------------------------------
// ESLint — stack-aware config & optional bundler plugin
// ---------------------------------------------------------------------------

async function generateEslint(root: string, stack: StackDetection): Promise<void> {
  const pkg = await readPkg(root);
  const devDeps: Record<string, string> = {
    ...(pkg.devDependencies as Record<string, string> | undefined),
  };

  devDeps.eslint = '^9.25.0';
  devDeps['@eslint/js'] = '^9.25.0';
  devDeps.globals = '^16.0.0';

  if (stack.hasTypeScript) {
    devDeps['typescript-eslint'] = '^8.30.0';
  }

  addFrameworkEslintDeps(devDeps, stack.framework);
  addBundlerEslintPlugin(devDeps, stack);

  pkg.devDependencies = devDeps;
  await writePkg(root, pkg);

  const configContent = buildEslintConfig(stack);
  await fs.writeFile(path.join(root, 'eslint.config.mjs'), configContent, 'utf-8');
  logger.success('ESLint 9 flat config generated');
}

function addFrameworkEslintDeps(devDeps: Record<string, string>, fw: StackFramework): void {
  if (fw === 'vue' || fw === 'nuxt') {
    devDeps['eslint-plugin-vue'] = '^10.0.0';
  } else if (fw === 'react' || fw === 'next') {
    devDeps['eslint-plugin-react-hooks'] = '^5.2.0';
    devDeps['eslint-plugin-react-refresh'] = '^0.4.0';
  }
}

function addBundlerEslintPlugin(devDeps: Record<string, string>, stack: StackDetection): void {
  if (stack.projectKind !== 'frontend') return;

  if (stack.bundler === 'vite') {
    devDeps['vite-plugin-eslint2'] = '^5.0.0';
  } else if (stack.bundler === 'webpack' || stack.bundler === 'rspack') {
    devDeps['eslint-webpack-plugin'] = '^4.2.0';
  }
}

function buildEslintConfig(stack: StackDetection): string {
  const fw = stack.framework;

  if (fw === 'vue' || fw === 'nuxt') return buildVueEslintConfig(stack);
  if (fw === 'react' || fw === 'next') return buildReactEslintConfig(stack);
  return buildGenericEslintConfig(stack);
}

function buildVueEslintConfig(stack: StackDetection): string {
  const lines = [
    "import js from '@eslint/js';",
    ...(stack.hasTypeScript ? ["import tseslint from 'typescript-eslint';"] : []),
    "import pluginVue from 'eslint-plugin-vue';",
    '',
    ...(stack.hasTypeScript
      ? [
          'export default tseslint.config(',
          '  js.configs.recommended,',
          '  ...tseslint.configs.recommended,',
        ]
      : ['export default [', '  js.configs.recommended,']),
    "  ...pluginVue.configs['flat/recommended'],",
    ...(stack.hasTypeScript
      ? [
          '  {',
          "    files: ['**/*.vue'],",
          '    languageOptions: {',
          '      parserOptions: { parser: tseslint.parser },',
          '    },',
          '  },',
          ');',
        ]
      : ['];']),
  ];
  return lines.join('\n');
}

function buildReactEslintConfig(stack: StackDetection): string {
  const lines = [
    "import js from '@eslint/js';",
    ...(stack.hasTypeScript ? ["import tseslint from 'typescript-eslint';"] : []),
    "import reactHooks from 'eslint-plugin-react-hooks';",
    "import reactRefresh from 'eslint-plugin-react-refresh';",
    "import globals from 'globals';",
    '',
    ...(stack.hasTypeScript
      ? [
          'export default tseslint.config(',
          '  js.configs.recommended,',
          '  ...tseslint.configs.recommended,',
        ]
      : ['export default [', '  js.configs.recommended,']),
    '  {',
    "    files: ['**/*.{ts,tsx,js,jsx}'],",
    '    plugins: {',
    "      'react-hooks': reactHooks,",
    "      'react-refresh': reactRefresh,",
    '    },',
    '    languageOptions: {',
    '      globals: globals.browser,',
    '    },',
    '    rules: {',
    '      ...reactHooks.configs.recommended.rules,',
    "      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],",
    '    },',
    '  },',
    ...(stack.hasTypeScript ? [');'] : ['];']),
  ];
  return lines.join('\n');
}

function buildGenericEslintConfig(stack: StackDetection): string {
  const lines = [
    "import js from '@eslint/js';",
    ...(stack.hasTypeScript ? ["import tseslint from 'typescript-eslint';"] : []),
    "import globals from 'globals';",
    '',
    ...(stack.hasTypeScript
      ? [
          'export default tseslint.config(',
          '  js.configs.recommended,',
          '  ...tseslint.configs.recommended,',
        ]
      : ['export default [', '  js.configs.recommended,']),
    '  {',
    "    files: ['**/*.{ts,js}'],",
    '    languageOptions: {',
    '      globals: {',
    '        ...globals.node,',
    '      },',
    '    },',
    '  },',
    ...(stack.hasTypeScript ? [');'] : ['];']),
  ];
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Stylelint
// ---------------------------------------------------------------------------

async function generateStylelint(root: string, stack: StackDetection): Promise<void> {
  const pkg = await readPkg(root);
  const devDeps: Record<string, string> = {
    ...(pkg.devDependencies as Record<string, string> | undefined),
    stylelint: '^16.17.0',
    'stylelint-config-standard': '^37.0.0',
  };

  const fw = stack.framework;
  if (fw === 'vue' || fw === 'nuxt') {
    devDeps['stylelint-config-standard-vue'] = '^1.0.0';
  }

  pkg.devDependencies = devDeps;
  await writePkg(root, pkg);

  const extendsArr = ['stylelint-config-standard'];
  if (fw === 'vue' || fw === 'nuxt') {
    extendsArr.push('stylelint-config-standard-vue');
  }

  await fs.writeJson(
    path.join(root, '.stylelintrc.json'),
    { extends: extendsArr },
    { spaces: 2 },
  );
  logger.success('Stylelint config generated');
}

// ---------------------------------------------------------------------------
// Prettier
// ---------------------------------------------------------------------------

async function generatePrettier(root: string): Promise<void> {
  const pkg = await readPkg(root);
  pkg.devDependencies = {
    ...(pkg.devDependencies as Record<string, string> | undefined),
    prettier: '^3.5.0',
  };
  await writePkg(root, pkg);

  const config = {
    semi: true,
    singleQuote: true,
    tabWidth: 2,
    trailingComma: 'all' as const,
    printWidth: 100,
  };
  await fs.writeJson(path.join(root, '.prettierrc.json'), config, { spaces: 2 });
  logger.success('Prettier config generated');
}

// ---------------------------------------------------------------------------
// EditorConfig
// ---------------------------------------------------------------------------

async function generateEditorConfig(root: string): Promise<void> {
  const content = [
    'root = true',
    '',
    '[*]',
    'indent_style = space',
    'indent_size = 2',
    'end_of_line = lf',
    'charset = utf-8',
    'trim_trailing_whitespace = true',
    'insert_final_newline = true',
  ].join('\n');

  await fs.writeFile(path.join(root, '.editorconfig'), content, 'utf-8');
  logger.success('EditorConfig generated');
}

// ---------------------------------------------------------------------------
// commitlint
// ---------------------------------------------------------------------------

async function generateCommitlint(root: string, stack: StackDetection): Promise<void> {
  const pkg = await readPkg(root);
  const devDeps: Record<string, string> = {
    ...(pkg.devDependencies as Record<string, string> | undefined),
    '@commitlint/cli': '^19.8.0',
    '@commitlint/config-conventional': '^19.8.0',
  };

  devDeps.husky = '^9.1.0';

  pkg.devDependencies = devDeps;

  const scripts = (pkg.scripts ?? {}) as Record<string, string>;
  scripts.prepare ??= 'husky';
  pkg.scripts = scripts;

  await writePkg(root, pkg);

  const isESM = pkg.type === 'module';
  const configName = isESM ? 'commitlint.config.cjs' : 'commitlint.config.js';
  const configContent = [
    "module.exports = { extends: ['@commitlint/config-conventional'] };",
    '',
  ].join('\n');

  await fs.writeFile(path.join(root, configName), configContent, 'utf-8');

  await fs.ensureDir(path.join(root, '.husky'));
  const hookContent = 'npx --no -- commitlint --edit "$1"\n';
  await fs.writeFile(path.join(root, '.husky', 'commit-msg'), hookContent, 'utf-8');

  if (!stack.hasGit) {
    logger.warn('No .git directory detected — commitlint hooks will activate after git init.');
  }

  logger.success('commitlint + husky generated');
}

// ---------------------------------------------------------------------------
// Helpers — reduce repeated readJson / writeJson boilerplate
// ---------------------------------------------------------------------------

async function readPkg(root: string): Promise<Record<string, unknown>> {
  return fs.readJson(path.join(root, 'package.json'));
}

async function writePkg(root: string, data: Record<string, unknown>): Promise<void> {
  await fs.writeJson(path.join(root, 'package.json'), data, { spaces: 2 });
}
