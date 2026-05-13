import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';
import type { InitAnswers } from '../types/selections.js';
import { SCAFFOLD_VERSIONS } from '../constants/dependency-versions.js';
import { logger } from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function resolveTemplateDir(framework: string, bundler: string): Promise<string | null> {
  const dirName = `${framework}-${bundler}-ts`;
  const candidates = [
    path.resolve(__dirname, '..', 'templates', dirName),
    path.resolve(__dirname, 'templates', dirName),
  ];

  for (const candidate of candidates) {
    if (await fs.pathExists(candidate)) {
      return candidate;
    }
  }

  return null;
}

export async function generateProject(answers: InitAnswers): Promise<void> {
  const { projectPath, projectName, framework, bundler, router, stateManagement, lintTools } = answers;

  await fs.ensureDir(projectPath);

  const srcTemplate = await resolveTemplateDir(framework, bundler);
  if (srcTemplate) {
    await fs.copy(srcTemplate, projectPath, { overwrite: false });
    logger.success(`Template ${framework}-${bundler}-ts copied`);
  } else {
    logger.warn(`No full template for ${framework}-${bundler}-ts. Generating minimal project.`);
    await generateMinimalProject(answers);
  }

  await patchPackageJson(projectPath, projectName, framework, bundler, router, stateManagement, lintTools);
  logger.success('package.json configured');

  await ensureNextStyleScaffold(projectPath, framework);
}

async function ensureNextStyleScaffold(projectPath: string, framework: InitAnswers['framework']): Promise<void> {
  const dirs = [
    path.join(projectPath, 'public'),
  ];

  await Promise.all(dirs.map((d) => fs.ensureDir(d)));

  const keepFiles = [
    path.join(projectPath, 'public', '.gitkeep'),
  ];
  await Promise.all(keepFiles.map((p) => fs.ensureFile(p)));

  if (framework === 'vue') {
    await fs.ensureDir(path.join(projectPath, 'src', 'composables'));
    await fs.ensureFile(path.join(projectPath, 'src', 'composables', 'README.md'));
    await fs.writeFile(
      path.join(projectPath, 'src', 'composables', 'README.md'),
      ['# composables/', '', 'Vue 项目里这里更常放 composables。', ''].join('\n'),
      'utf-8',
    );
  }
}

async function generateMinimalProject(answers: InitAnswers): Promise<void> {
  const { projectPath, framework, bundler } = answers;

  if (framework === 'next') {
    await generateMinimalNextProject(projectPath);
    return;
  }

  const srcDir = path.join(projectPath, 'src');
  await fs.ensureDir(srcDir);

  const mainFile = framework === 'react' ? 'main.tsx' : 'main.ts';

  const mainContent = framework === 'react'
    ? [
        "import React from 'react';",
        "import ReactDOM from 'react-dom/client';",
        "import App from './App';",
        '',
        "ReactDOM.createRoot(document.getElementById('root')!).render(",
        '  <React.StrictMode>',
        '    <App />',
        '  </React.StrictMode>,',
        ');',
      ].join('\n')
    : [
        "import { createApp } from 'vue';",
        "import App from './App.vue';",
        '',
        "createApp(App).mount('#app');",
      ].join('\n');

  await fs.writeFile(path.join(srcDir, mainFile), mainContent, 'utf-8');

  if (framework === 'react') {
    await fs.writeFile(
      path.join(srcDir, 'App.tsx'),
      [
        "import React from 'react';",
        '',
        'function App() {',
        '  return <div>Hello fe-kit</div>;',
        '}',
        '',
        'export default App;',
      ].join('\n'),
      'utf-8',
    );
  } else {
    await fs.writeFile(
      path.join(srcDir, 'App.vue'),
      [
        '<script setup lang="ts">',
        "const msg = 'Hello fe-kit';",
        '</script>',
        '',
        '<template>',
        '  <div>{{ msg }}</div>',
        '</template>',
      ].join('\n'),
      'utf-8',
    );

    await fs.writeFile(
      path.join(srcDir, 'env.d.ts'),
      [
        "declare module '*.vue' {",
        "  import type { DefineComponent } from 'vue';",
        '  const component: DefineComponent<{}, {}, any>;',
        '  export default component;',
        '}',
        '',
      ].join('\n'),
      'utf-8',
    );
  }

  await fs.writeFile(
    path.join(projectPath, 'index.html'),
    [
      '<!DOCTYPE html>',
      '<html lang="en">',
      '<head>',
      '  <meta charset="UTF-8" />',
      '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
      '  <title>fe-kit project</title>',
      '</head>',
      '<body>',
      `  <div id="${framework === 'react' ? 'root' : 'app'}"></div>`,
      `  <script type="module" src="/src/${mainFile}"></script>`,
      '</body>',
      '</html>',
    ].join('\n'),
    'utf-8',
  );

  const tsconfig = {
    compilerOptions: {
      target: 'ES2020',
      module: 'ESNext',
      moduleResolution: 'bundler',
      strict: true,
      jsx: framework === 'react' ? 'react-jsx' : 'preserve',
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true,
      isolatedModules: true,
      baseUrl: '.',
      paths: { '@/*': ['src/*'] },
    },
    include: ['src'],
  };
  await fs.writeJson(path.join(projectPath, 'tsconfig.json'), tsconfig, { spaces: 2 });

  await writeBundlerConfig(projectPath, framework, bundler);
}

async function generateMinimalNextProject(projectPath: string): Promise<void> {
  const appDir = path.join(projectPath, 'app');
  await fs.ensureDir(appDir);

  await fs.writeFile(
    path.join(appDir, 'layout.tsx'),
    [
      "import type { ReactNode } from 'react';",
      '',
      'export default function RootLayout({ children }: { children: ReactNode }) {',
      '  return (',
      "    <html lang=\"en\">",
      '      <body>{children}</body>',
      '    </html>',
      '  );',
      '}',
      '',
    ].join('\n'),
    'utf-8',
  );

  await fs.writeFile(
    path.join(appDir, 'page.tsx'),
    [
      'export default function HomePage() {',
      '  return <main>Hello fe-kit + Next.js</main>;',
      '}',
      '',
    ].join('\n'),
    'utf-8',
  );

  await fs.writeFile(
    path.join(projectPath, 'next-env.d.ts'),
    [
      '/// <reference types="next" />',
      '/// <reference types="next/image-types/global" />',
      '',
      '// NOTE: This file should not be edited',
      '',
    ].join('\n'),
    'utf-8',
  );

  await fs.writeJson(
    path.join(projectPath, 'tsconfig.json'),
    {
      compilerOptions: {
        target: 'ES2020',
        lib: ['dom', 'dom.iterable', 'esnext'],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: 'esnext',
        moduleResolution: 'bundler',
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: 'preserve',
        incremental: true,
        plugins: [{ name: 'next' }],
        baseUrl: '.',
        paths: { '@/*': ['*'] },
      },
      include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
      exclude: ['node_modules'],
    },
    { spaces: 2 },
  );
}

async function writeBundlerConfig(
  projectPath: string,
  framework: string,
  bundler: string,
): Promise<void> {
  if (bundler === 'vite') {
    const plugin = framework === 'react'
      ? "import react from '@vitejs/plugin-react';"
      : "import vue from '@vitejs/plugin-vue';";
    const pluginCall = framework === 'react' ? 'react()' : 'vue()';

    await fs.writeFile(
      path.join(projectPath, 'vite.config.ts'),
      [
        "import { defineConfig } from 'vite';",
        plugin,
        '',
        'export default defineConfig({',
        `  plugins: [${pluginCall}],`,
        '  resolve: {',
        "    alias: { '@': '/src' },",
        '  },',
        '});',
      ].join('\n'),
      'utf-8',
    );
  } else if (bundler === 'webpack') {
    await fs.writeFile(
      path.join(projectPath, 'webpack.config.cjs'),
      [
        "// Webpack config placeholder — full template coming in P1",
        "const path = require('path');",
        '',
        'module.exports = {',
        "  mode: 'development',",
        "  entry: './src/main." + (framework === 'react' ? 'tsx' : 'ts') + "',",
        '  resolve: {',
        "    extensions: ['.ts', '.tsx', '.js', '.jsx', '.vue'],",
        '  },',
        '};',
      ].join('\n'),
      'utf-8',
    );
  } else if (bundler === 'rspack') {
    await fs.writeFile(
      path.join(projectPath, 'rspack.config.cjs'),
      [
        "// Rspack config placeholder — full template coming in P1",
        "const { defineConfig } = require('@rspack/cli');",
        '',
        'module.exports = defineConfig({',
        "  entry: { main: './src/main." + (framework === 'react' ? 'tsx' : 'ts') + "' },",
        '  module: {',
        '    rules: [',
        "      { test: /\\.tsx?$/, exclude: /node_modules/, loader: 'builtin:swc-loader' },",
        '    ],',
        '  },',
        '});',
      ].join('\n'),
      'utf-8',
    );
  }
}

async function patchPackageJson(
  projectPath: string,
  name: string,
  framework: string,
  bundler: string,
  router: string,
  stateManagement: string,
  lintTools: InitAnswers['lintTools'],
): Promise<void> {
  const pkgPath = path.join(projectPath, 'package.json');
  const existing = (await fs.pathExists(pkgPath))
    ? await fs.readJson(pkgPath)
    : {};

  const deps: Record<string, string> = { ...existing.dependencies };
  const devDeps: Record<string, string> = { ...existing.devDependencies };
  const versions = SCAFFOLD_VERSIONS;

  if (framework === 'vue') {
    deps.vue = versions.framework.vue;
    if (router === 'vue-router') deps['vue-router'] = versions.framework.vueRouter;
    if (stateManagement === 'pinia') deps.pinia = versions.framework.pinia;
    if (stateManagement === 'vuex') deps.vuex = versions.framework.vuex;

    devDeps['vue-tsc'] = versions.language.vueTsc;
    devDeps['@vue/tsconfig'] = versions.language.vueTsconfig;
    devDeps['@types/node'] = versions.language.nodeTypes;
  } else if (framework === 'react') {
    deps.react = versions.framework.react;
    deps['react-dom'] = versions.framework.reactDom;
    devDeps['@types/react'] = versions.framework.reactTypes;
    devDeps['@types/react-dom'] = versions.framework.reactDomTypes;
    if (router === 'react-router') deps['react-router-dom'] = versions.framework.reactRouterDom;
    if (stateManagement === 'redux-toolkit') {
      deps['@reduxjs/toolkit'] = versions.framework.reduxToolkit;
      deps['react-redux'] = versions.framework.reactRedux;
    }
    if (stateManagement === 'zustand') deps.zustand = versions.framework.zustand;
    if (stateManagement === 'mobx') {
      deps.mobx = versions.framework.mobx;
      deps['mobx-react-lite'] = versions.framework.mobxReactLite;
    }
  } else {
    deps.next = versions.framework.next;
    deps.react = versions.framework.react;
    deps['react-dom'] = versions.framework.reactDom;
    devDeps['@types/react'] = versions.framework.reactTypes;
    devDeps['@types/react-dom'] = versions.framework.reactDomTypes;
    devDeps['@types/node'] = versions.language.nodeTypes;

    if (stateManagement === 'redux-toolkit') {
      deps['@reduxjs/toolkit'] = versions.framework.reduxToolkit;
      deps['react-redux'] = versions.framework.reactRedux;
    }
    if (stateManagement === 'zustand') deps.zustand = versions.framework.zustand;
  }

  devDeps.typescript = versions.language.typescript;

  if (bundler === 'vite') {
    devDeps.vite = versions.bundler.vite;
    if (framework === 'react') devDeps['@vitejs/plugin-react'] = versions.bundler.vitePluginReact;
    if (framework === 'vue') devDeps['@vitejs/plugin-vue'] = versions.bundler.vitePluginVue;
  } else if (bundler === 'webpack') {
    devDeps.webpack = versions.bundler.webpack;
    devDeps['webpack-cli'] = versions.bundler.webpackCli;
    devDeps['webpack-dev-server'] = versions.bundler.webpackDevServer;
    devDeps['ts-loader'] = versions.bundler.tsLoader;
    devDeps['css-loader'] = versions.bundler.cssLoader;
    devDeps['style-loader'] = versions.bundler.styleLoader;
    devDeps['html-webpack-plugin'] = versions.bundler.htmlWebpackPlugin;

    if (framework === 'vue') {
      devDeps['vue-loader'] = versions.bundler.vueLoader;
    }
  } else if (bundler === 'rspack') {
    devDeps['@rspack/core'] = versions.bundler.rspackCore;
    devDeps['@rspack/cli'] = versions.bundler.rspackCli;

    if (framework === 'vue') {
      devDeps['vue-loader'] = versions.bundler.rspackVueLoader;
    }
  }

  const scripts: Record<string, string> = { ...existing.scripts };
  if (bundler === 'vite') {
    scripts.dev = 'vite';
    scripts.build = framework === 'vue' ? 'vue-tsc -b && vite build' : 'vite build';
    scripts.preview = 'vite preview';
  } else if (bundler === 'webpack') {
    scripts.dev = 'webpack serve --config webpack.config.cjs --mode development';
    scripts.build = 'webpack --config webpack.config.cjs --mode production';
  } else if (bundler === 'rspack') {
    scripts.dev = 'rspack serve --config rspack.config.cjs';
    scripts.build = 'rspack build --config rspack.config.cjs';
  } else if (bundler === 'next') {
    scripts.dev = 'next dev';
    scripts.build = 'next build';
    scripts.start = 'next start';
  }

  scripts.typecheck ??= framework === 'vue' ? 'vue-tsc --noEmit' : 'tsc --noEmit';
  scripts.test ??= 'node --test ./tests/**/*.test.mjs';

  if (lintTools.includes('eslint')) {
    scripts.lint ??= 'eslint .';
  }
  if (lintTools.includes('prettier')) {
    scripts.format ??= 'prettier --write .';
    scripts['format:check'] ??= 'prettier --check .';
  }

  const pkg: Record<string, unknown> = {
    ...existing,
    name,
    version: '0.1.0',
    private: true,
    scripts,
    dependencies: deps,
    devDependencies: devDeps,
  };

  if (framework !== 'next') {
    pkg.type = 'module';
  } else {
    delete pkg.type;
  }

  await fs.writeJson(pkgPath, pkg, { spaces: 2 });
}
