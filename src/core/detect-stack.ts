import path from 'node:path';
import fs from 'fs-extra';
import type { Bundler } from '../constants/bundlers.js';
import { readJsonSafe } from '../utils/fs.js';

export const STACK_FRAMEWORKS = ['vue', 'react', 'next', 'nuxt', 'unknown'] as const;
export type StackFramework = (typeof STACK_FRAMEWORKS)[number];

export const PROJECT_KINDS = ['frontend', 'node', 'unknown'] as const;
export type ProjectKind = (typeof PROJECT_KINDS)[number];

export interface StackDetection {
  name: string;
  projectKind: ProjectKind;
  framework: StackFramework;
  bundler: Bundler | undefined;
  hasTypeScript: boolean;
  hasGit: boolean;
}

export async function detectStack(root: string): Promise<StackDetection | null> {
  const pkgPath = path.join(root, 'package.json');
  if (!(await fs.pathExists(pkgPath))) return null;

  const pkg = await readJsonSafe<Record<string, unknown>>(pkgPath);
  if (!pkg) return null;

  const allDeps: Record<string, string> = {
    ...(pkg.dependencies as Record<string, string> | undefined),
    ...(pkg.devDependencies as Record<string, string> | undefined),
  };

  const framework = inferFramework(allDeps);
  const bundler = inferBundler(allDeps);
  const hasTypeScript =
    'typescript' in allDeps ||
    (await fs.pathExists(path.join(root, 'tsconfig.json')));
  const hasGit = await fs.pathExists(path.join(root, '.git'));

  return {
    name: (pkg.name as string) ?? path.basename(root),
    projectKind: inferProjectKind(pkg, allDeps, framework),
    framework,
    bundler,
    hasTypeScript,
    hasGit,
  };
}

function inferFramework(deps: Record<string, string>): StackFramework {
  if ('nuxt' in deps) return 'nuxt';
  if ('next' in deps) return 'next';
  if ('vue' in deps) return 'vue';
  if ('react' in deps) return 'react';
  return 'unknown';
}

function inferBundler(deps: Record<string, string>): Bundler | undefined {
  if ('vite' in deps) return 'vite';
  if ('webpack' in deps) return 'webpack';
  if ('@rspack/cli' in deps || '@rspack/core' in deps) return 'rspack';
  return undefined;
}

function inferProjectKind(
  pkg: Record<string, unknown>,
  deps: Record<string, string>,
  framework: StackFramework,
): ProjectKind {
  if (framework !== 'unknown') return 'frontend';

  const hasNodeSignals =
    pkg.bin !== undefined ||
    pkg.main !== undefined ||
    pkg.exports !== undefined ||
    'express' in deps ||
    'fastify' in deps ||
    'koa' in deps ||
    '@types/node' in deps;

  if (hasNodeSignals) return 'node';

  return 'unknown';
}

export function summarizeStack(stack: StackDetection): string {
  const parts: string[] = [];

  if (stack.framework !== 'unknown') {
    parts.push(stack.framework.charAt(0).toUpperCase() + stack.framework.slice(1));
  } else if (stack.projectKind === 'node') {
    parts.push('Node');
  } else {
    parts.push('JavaScript/TypeScript');
  }

  if (stack.bundler) {
    parts.push(stack.bundler.charAt(0).toUpperCase() + stack.bundler.slice(1));
  }

  if (stack.hasTypeScript) parts.push('TypeScript');

  return parts.join(' + ');
}
