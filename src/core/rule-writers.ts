import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';
import type { Framework } from '../constants/frameworks.js';
import type { StackFramework } from './detect-stack.js';
import { logger } from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function rulesSourceDir(): string {
  const candidates = [
    // Built output: dist/rules (when bundled into dist/cli.mjs)
    path.resolve(__dirname, 'rules'),
    // Built output: dist/rules (when running from dist/core/*)
    path.resolve(__dirname, '..', 'rules'),
    // Source repo: src/rules (when running from src/core/*)
    path.resolve(__dirname, '..', '..', 'src', 'rules'),
    // Fallback for running from repo root without a build
    path.resolve(process.cwd(), 'src', 'rules'),
  ];

  for (const dir of candidates) {
    if (fs.existsSync(dir)) return dir;
  }

  return candidates[0];
}

export interface RuleFile {
  /** Filename stem, e.g. "typescript" */
  name: string;
  /** Category: "common", "react", or "vue" */
  category: string;
  /** Raw markdown body (no frontmatter) */
  content: string;
}

function stripFrontmatter(raw: string): string {
  if (!raw.startsWith('---')) return raw.trim();
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return raw.trim();
  return raw.slice(end + '\n---'.length).replace(/^\s*\n+/, '').trimEnd();
}

function mapFrameworkDir(fw: Framework | StackFramework): string | null {
  if (fw === 'vue' || fw === 'nuxt') return 'vue';
  if (fw === 'react' || fw === 'next') return 'react';
  return null;
}

export async function loadRuleSources(
  framework: Framework | StackFramework,
): Promise<RuleFile[]> {
  const srcBase = rulesSourceDir();
  if (!(await fs.pathExists(srcBase))) {
    logger.warn(`Rules source directory not found: ${srcBase}`);
    return [];
  }
  const fwDir = mapFrameworkDir(framework);
  const dirs: { dir: string; category: string }[] = [
    { dir: path.join(srcBase, 'common'), category: 'common' },
  ];
  if (fwDir) {
    dirs.push({ dir: path.join(srcBase, fwDir), category: fwDir });
  }

  const rules: RuleFile[] = [];
  for (const { dir, category } of dirs) {
    if (!(await fs.pathExists(dir))) continue;
    const files = await fs.readdir(dir);
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (ext !== '.md' && ext !== '.mdc') continue;
      const raw = await fs.readFile(path.join(dir, file), 'utf-8');
      rules.push({
        name: path.basename(file, ext),
        category,
        content: stripFrontmatter(raw),
      });
    }
  }
  return rules;
}

function toMdcContent(rule: RuleFile, globs?: string[]): string {
  const globLine = globs ? `globs: ${JSON.stringify(globs)}` : '';
  const lines = [
    '---',
    `description: ${rule.category}/${rule.name} conventions`,
    ...(globLine ? [globLine] : []),
    'alwaysApply: true',
    '---',
    '',
    rule.content,
    '',
  ];
  return lines.join('\n');
}

function ruleGlobs(rule: RuleFile): string[] | undefined {
  if (rule.category === 'react') return ['**/*.{tsx,jsx,ts,js}'];
  if (rule.category === 'vue') return ['**/*.{vue,ts,js}'];
  return undefined;
}

export async function writeCursorRules(
  projectRoot: string,
  framework: Framework | StackFramework,
): Promise<void> {
  const rules = await loadRuleSources(framework);
  const dir = path.join(projectRoot, '.cursor', 'rules');
  await fs.ensureDir(dir);

  for (const rule of rules) {
    const filename = `${rule.category}-${rule.name}.mdc`;
    await fs.writeFile(path.join(dir, filename), toMdcContent(rule, ruleGlobs(rule)), 'utf-8');
  }
}

export async function writeCodeBuddyRules(
  projectRoot: string,
  framework: Framework | StackFramework,
): Promise<void> {
  const rules = await loadRuleSources(framework);
  const dir = path.join(projectRoot, '.codebuddy', 'rules');
  await fs.ensureDir(dir);

  for (const rule of rules) {
    const filename = `${rule.category}-${rule.name}.mdc`;
    await fs.writeFile(path.join(dir, filename), toMdcContent(rule, ruleGlobs(rule)), 'utf-8');
  }
}

export async function writeCopilotInstructions(
  projectRoot: string,
  framework: Framework | StackFramework,
): Promise<void> {
  const rules = await loadRuleSources(framework);
  const dir = path.join(projectRoot, '.github');
  await fs.ensureDir(dir);

  const sections = rules.map((r) => r.content);
  const body = [
    '# Project Coding Guidelines',
    '',
    ...sections.flatMap((s) => [s, '']),
  ].join('\n');

  await fs.writeFile(path.join(dir, 'copilot-instructions.md'), body, 'utf-8');
}
