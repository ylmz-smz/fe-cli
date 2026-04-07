import path from 'node:path';
import fs from 'fs-extra';
import type { Framework } from '../constants/frameworks.js';
import type { Bundler } from '../constants/bundlers.js';
import { readJsonSafe } from '../utils/fs.js';

export interface ProjectDetection {
  name: string;
  framework: Framework;
  router?: string;
  stateManagement?: string;
  bundler?: Bundler;
  hasTypeScript: boolean;
}

export async function detectProject(
  root: string,
): Promise<ProjectDetection | null> {
  const pkgPath = path.join(root, 'package.json');
  if (!(await fs.pathExists(pkgPath))) return null;

  const pkg = await readJsonSafe<Record<string, unknown>>(pkgPath);
  if (!pkg) return null;

  const allDeps = {
    ...(pkg.dependencies as Record<string, string> | undefined),
    ...(pkg.devDependencies as Record<string, string> | undefined),
  };

  const framework = detectFramework(allDeps);
  if (!framework) return null;

  return {
    name: (pkg.name as string) ?? path.basename(root),
    framework,
    router: detectRouter(allDeps, framework),
    stateManagement: detectStateManagement(allDeps, framework),
    bundler: detectBundler(allDeps),
    hasTypeScript: 'typescript' in allDeps || (await fs.pathExists(path.join(root, 'tsconfig.json'))),
  };
}

function detectFramework(deps: Record<string, string>): Framework | null {
  if ('vue' in deps) return 'vue';
  if ('react' in deps) return 'react';
  return null;
}

function detectRouter(deps: Record<string, string>, fw: Framework): string | undefined {
  if (fw === 'vue' && 'vue-router' in deps) return 'vue-router';
  if (fw === 'react' && 'react-router' in deps) return 'react-router';
  if (fw === 'react' && 'react-router-dom' in deps) return 'react-router';
  return undefined;
}

function detectStateManagement(deps: Record<string, string>, fw: Framework): string | undefined {
  if (fw === 'vue') {
    if ('pinia' in deps) return 'pinia';
    if ('vuex' in deps) return 'vuex';
  }
  if (fw === 'react') {
    if ('@reduxjs/toolkit' in deps) return 'redux-toolkit';
    if ('zustand' in deps) return 'zustand';
    if ('mobx' in deps) return 'mobx';
  }
  return undefined;
}

function detectBundler(deps: Record<string, string>): Bundler | undefined {
  if ('vite' in deps) return 'vite';
  if ('webpack' in deps) return 'webpack';
  if ('@rspack/cli' in deps || '@rspack/core' in deps) return 'rspack';
  return undefined;
}
