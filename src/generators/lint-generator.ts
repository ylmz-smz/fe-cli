import path from 'node:path';
import fs from 'fs-extra';
import type { InitAnswers } from '../types/selections.js';
import type { LintTool } from '../constants/lint.js';
import { logger } from '../utils/logger.js';

export async function generateLintConfigs(answers: InitAnswers): Promise<void> {
  const { projectPath, lintTools, framework } = answers;

  for (const tool of lintTools) {
    await GENERATORS[tool]?.(projectPath, framework);
  }
}

const GENERATORS: Record<LintTool, (root: string, fw: string) => Promise<void>> = {
  eslint: generateEslint,
  stylelint: generateStylelint,
  prettier: generatePrettier,
  editorconfig: generateEditorConfig,
  tslint: generateTslint,
};

async function generateEslint(root: string, fw: string): Promise<void> {
  const pkgPath = path.join(root, 'package.json');
  const pkg = await fs.readJson(pkgPath);
  const devDeps = pkg.devDependencies ?? {};

  devDeps.eslint = '^9.25.0';
  devDeps['@eslint/js'] = '^9.25.0';
  devDeps['typescript-eslint'] = '^8.30.0';
  devDeps.globals = '^16.0.0';

  if (fw === 'vue') {
    devDeps['eslint-plugin-vue'] = '^10.0.0';
  } else {
    devDeps['eslint-plugin-react-hooks'] = '^5.2.0';
    devDeps['eslint-plugin-react-refresh'] = '^0.4.0';
  }

  pkg.devDependencies = devDeps;
  await fs.writeJson(pkgPath, pkg, { spaces: 2 });

  const configLines = fw === 'vue'
    ? [
        "import js from '@eslint/js';",
        "import tseslint from 'typescript-eslint';",
        "import pluginVue from 'eslint-plugin-vue';",
        '',
        'export default tseslint.config(',
        '  js.configs.recommended,',
        '  ...tseslint.configs.recommended,',
        "  ...pluginVue.configs['flat/recommended'],",
        '  {',
        "    files: ['**/*.vue'],",
        '    languageOptions: {',
        '      parserOptions: { parser: tseslint.parser },',
        '    },',
        '  },',
        ');',
      ]
    : [
        "import js from '@eslint/js';",
        "import tseslint from 'typescript-eslint';",
        "import reactHooks from 'eslint-plugin-react-hooks';",
        "import reactRefresh from 'eslint-plugin-react-refresh';",
        "import globals from 'globals';",
        '',
        'export default tseslint.config(',
        '  js.configs.recommended,',
        '  ...tseslint.configs.recommended,',
        '  {',
        "    files: ['**/*.{ts,tsx}'],",
        '    plugins: {',
        "      'react-hooks': reactHooks,",
        "      'react-refresh': reactRefresh,",
        '    },',
        '    languageOptions: {',
        '      globals: globals.browser,',
        '    },',
        '    rules: {',
        "      ...reactHooks.configs.recommended.rules,",
        "      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],",
        '    },',
        '  },',
        ');',
      ];

  await fs.writeFile(path.join(root, 'eslint.config.mjs'), configLines.join('\n'), 'utf-8');
  logger.success('ESLint 9 flat config generated');
}

async function generateStylelint(root: string): Promise<void> {
  const pkgPath = path.join(root, 'package.json');
  const pkg = await fs.readJson(pkgPath);
  pkg.devDependencies = {
    ...pkg.devDependencies,
    stylelint: '^16.17.0',
    'stylelint-config-standard': '^37.0.0',
  };
  await fs.writeJson(pkgPath, pkg, { spaces: 2 });

  await fs.writeJson(
    path.join(root, '.stylelintrc.json'),
    { extends: ['stylelint-config-standard'] },
    { spaces: 2 },
  );
  logger.success('Stylelint config generated');
}

async function generatePrettier(root: string): Promise<void> {
  const pkgPath = path.join(root, 'package.json');
  const pkg = await fs.readJson(pkgPath);
  pkg.devDependencies = { ...pkg.devDependencies, prettier: '^3.5.0' };
  await fs.writeJson(pkgPath, pkg, { spaces: 2 });

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

async function generateTslint(root: string): Promise<void> {
  logger.warn('TSLint is deprecated. Generating placeholder for legacy compatibility.');

  const pkgPath = path.join(root, 'package.json');
  const pkg = await fs.readJson(pkgPath);
  pkg.devDependencies = { ...pkg.devDependencies, tslint: '^6.1.3' };
  await fs.writeJson(pkgPath, pkg, { spaces: 2 });

  await fs.writeJson(
    path.join(root, 'tslint.json'),
    {
      extends: ['tslint:recommended'],
      rules: {},
      linterOptions: { exclude: ['node_modules/**'] },
    },
    { spaces: 2 },
  );
}
