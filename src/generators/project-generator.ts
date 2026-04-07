import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';
import type { InitAnswers } from '../types/selections.js';
import { logger } from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function templateDir(framework: string, bundler: string): string {
  return path.resolve(__dirname, '..', 'templates', `${framework}-${bundler}-ts`);
}

export async function generateProject(answers: InitAnswers): Promise<void> {
  const { projectPath, projectName, framework, bundler, router, stateManagement } = answers;

  await fs.ensureDir(projectPath);

  const srcTemplate = templateDir(framework, bundler);
  if (await fs.pathExists(srcTemplate)) {
    await fs.copy(srcTemplate, projectPath, { overwrite: false });
    logger.success(`Template ${framework}-${bundler}-ts copied`);
  } else {
    logger.warn(`No full template for ${framework}-${bundler}-ts. Generating minimal project.`);
    await generateMinimalProject(answers);
  }

  await patchPackageJson(projectPath, projectName, framework, bundler, router, stateManagement);
  logger.success('package.json configured');
}

async function generateMinimalProject(answers: InitAnswers): Promise<void> {
  const { projectPath, framework, bundler } = answers;
  const srcDir = path.join(projectPath, 'src');
  await fs.ensureDir(srcDir);

  const ext = framework === 'react' ? 'tsx' : 'ts';
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
      path.join(projectPath, 'webpack.config.ts'),
      [
        "// Webpack config placeholder — full template coming in P1",
        "import path from 'path';",
        '',
        'export default {',
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
      path.join(projectPath, 'rspack.config.ts'),
      [
        "// Rspack config placeholder — full template coming in P1",
        "import { defineConfig } from '@rspack/cli';",
        '',
        'export default defineConfig({',
        "  entry: { main: './src/main." + (framework === 'react' ? 'tsx' : 'ts') + "' },",
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
): Promise<void> {
  const pkgPath = path.join(projectPath, 'package.json');
  const existing = (await fs.pathExists(pkgPath))
    ? await fs.readJson(pkgPath)
    : {};

  const deps: Record<string, string> = { ...existing.dependencies };
  const devDeps: Record<string, string> = { ...existing.devDependencies };

  if (framework === 'vue') {
    deps.vue = '^3.5.0';
    if (router === 'vue-router') deps['vue-router'] = '^4.5.0';
    if (stateManagement === 'pinia') deps.pinia = '^2.3.0';
    if (stateManagement === 'vuex') deps.vuex = '^4.1.0';
  } else {
    deps.react = '^19.0.0';
    deps['react-dom'] = '^19.0.0';
    devDeps['@types/react'] = '^19.0.0';
    devDeps['@types/react-dom'] = '^19.0.0';
    if (router === 'react-router') deps['react-router-dom'] = '^7.0.0';
    if (stateManagement === 'redux-toolkit') {
      deps['@reduxjs/toolkit'] = '^2.6.0';
      deps['react-redux'] = '^9.2.0';
    }
    if (stateManagement === 'zustand') deps.zustand = '^5.0.0';
    if (stateManagement === 'mobx') {
      deps.mobx = '^6.13.0';
      deps['mobx-react-lite'] = '^4.1.0';
    }
  }

  devDeps.typescript = '^5.8.0';

  if (bundler === 'vite') {
    devDeps.vite = '^6.3.0';
    if (framework === 'react') devDeps['@vitejs/plugin-react'] = '^4.4.0';
    if (framework === 'vue') devDeps['@vitejs/plugin-vue'] = '^5.2.0';
  } else if (bundler === 'webpack') {
    devDeps.webpack = '^5.99.0';
    devDeps['webpack-cli'] = '^6.0.0';
    devDeps['ts-loader'] = '^9.5.0';
  } else if (bundler === 'rspack') {
    devDeps['@rspack/core'] = '^1.3.0';
    devDeps['@rspack/cli'] = '^1.3.0';
  }

  const scripts: Record<string, string> = { ...existing.scripts };
  if (bundler === 'vite') {
    scripts.dev = 'vite';
    scripts.build = 'vite build';
    scripts.preview = 'vite preview';
  } else if (bundler === 'webpack') {
    scripts.dev = 'webpack serve --mode development';
    scripts.build = 'webpack --mode production';
  } else if (bundler === 'rspack') {
    scripts.dev = 'rspack serve';
    scripts.build = 'rspack build';
  }

  const pkg = {
    ...existing,
    name,
    version: '0.1.0',
    private: true,
    type: 'module',
    scripts,
    dependencies: deps,
    devDependencies: devDeps,
  };

  await fs.writeJson(pkgPath, pkg, { spaces: 2 });
}
