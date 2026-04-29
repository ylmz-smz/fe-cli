import path from 'node:path';
import fs from 'fs-extra';
import type { InitAnswers } from '../types/selections.js';
import { readBootstrapConventionAsset, readBootstrapPromptAsset } from '../core/bootstrap-assets.js';
import { logger } from '../utils/logger.js';

export function normalizeFeatureDomains(input: string | string[] | undefined): string[] {
  const values = Array.isArray(input) ? input : typeof input === 'string' ? input.split(',') : [];

  return [...new Set(values
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, ''))
    .filter(Boolean))];
}

function titleCase(value: string): string {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}

function uiRuntimeLabel(framework: InitAnswers['framework']): string {
  return framework === 'react' ? 'React' : 'Vue 3';
}

function commandValue(command: 'dev' | 'typecheck' | 'lint' | 'test'): string {
  return `run ${command}`;
}

function scaffoldDomains(featureDomains: string[]): string[] {
  return featureDomains.length > 0 ? featureDomains : ['feature-one', 'feature-two'];
}

function replaceTemplateVars(template: string, answers: InitAnswers): string {
  const replacements: Record<string, string> = {
    '<app-name>': answers.projectName,
    '<build-stack>': titleCase(answers.bundler),
    '<language-stack>': 'TypeScript',
    '<ui-or-runtime-stack>': uiRuntimeLabel(answers.framework),
    '<routing-solution>': answers.router,
    '<state-solution>': answers.stateManagement,
    '<test-solution>': 'Node test smoke entry',
    '<package-manager>': 'pnpm',
    '<dev-command>': commandValue('dev'),
    '<typecheck-command>': commandValue('typecheck'),
    '<lint-command>': commandValue('lint'),
    '<test-command>': commandValue('test'),
    '<dynamic-route-pattern>': '[param]',
    '<layout-dir-pattern>': '_layout',
  };

  return Object.entries(replacements).reduce(
    (content, [key, value]) => content.replaceAll(key, value),
    template,
  );
}

function bootstrapDirs(projectPath: string): string[] {
  return [
    path.join(projectPath, 'src', 'core', 'hooks'),
    path.join(projectPath, 'src', 'core', 'http'),
    path.join(projectPath, 'src', 'core', 'query'),
    path.join(projectPath, 'src', 'core', 'router'),
    path.join(projectPath, 'src', 'core', 'store'),
    path.join(projectPath, 'src', 'core', 'utils'),
    path.join(projectPath, 'src', 'features'),
    path.join(projectPath, 'src', 'components'),
    path.join(projectPath, 'src', 'layouts'),
    path.join(projectPath, 'src', 'theme'),
    path.join(projectPath, 'src', 'assets'),
    path.join(projectPath, 'docs', 'bootstrap'),
    path.join(projectPath, 'docs', 'codebase-map'),
    path.join(projectPath, 'plan'),
    path.join(projectPath, 'tests'),
  ];
}

function featureDirs(projectPath: string, featureDomains: string[]): string[] {
  return featureDomains.flatMap((domain) => [
    path.join(projectPath, 'src', 'features', domain, 'pages'),
    path.join(projectPath, 'src', 'features', domain, 'components'),
    path.join(projectPath, 'src', 'features', domain, 'services'),
    path.join(projectPath, 'src', 'features', domain, 'types'),
    path.join(projectPath, 'src', 'features', domain, 'constants'),
    path.join(projectPath, 'src', 'features', domain, 'hooks'),
  ]);
}

async function ensureVisibleDirs(dirs: string[]): Promise<void> {
  await Promise.all(dirs.map(async (dir) => {
    await fs.ensureDir(dir);
    await fs.ensureFile(path.join(dir, '.gitkeep'));
  }));
}

function renderScaffoldTree(template: string, featureDomains: string[]): string {
  const domains = scaffoldDomains(featureDomains);
  const firstDomain = domains[0];
  const secondDomain = domains[1] ?? `${firstDomain}-extra`;
  const additionalDomains = domains.slice(2);

  let rendered = template
    .replaceAll('<domain-a>', firstDomain)
    .replaceAll('<domain-b>', secondDomain);

  if (additionalDomains.length === 0) {
    return rendered;
  }

  const additionalBlock = additionalDomains.map((domain) => [
    `    ${domain}/`,
    '      pages/',
    '      components/',
    '      services/',
    '      types/',
    '      constants/',
    '      hooks/',
  ].join('\n')).join('\n');

  rendered = rendered.replace(
    '  components/',
    `${additionalBlock}\n  components/`,
  );

  return rendered;
}

async function writeBootstrapInstructions(projectPath: string, answers: InitAnswers): Promise<void> {
  const template = await readBootstrapConventionAsset(path.join('templates', 'copilot-instructions.template.md'));
  const rendered = replaceTemplateVars(template, answers);
  const instructionsPath = path.join(projectPath, '.github', 'copilot-instructions.md');

  await fs.ensureDir(path.dirname(instructionsPath));
  await fs.writeFile(instructionsPath, rendered.trimEnd() + '\n', 'utf-8');
}

async function writeSmokeTest(projectPath: string): Promise<void> {
  const smokeTestPath = path.join(projectPath, 'tests', 'smoke.test.mjs');
  const content = [
    "import test from 'node:test';",
    "import assert from 'node:assert/strict';",
    '',
    "test('smoke', () => {",
    '  assert.equal(true, true);',
    '});',
    '',
  ].join('\n');

  await fs.writeFile(smokeTestPath, content, 'utf-8');
}

export async function generateBootstrapArtifacts(answers: InitAnswers): Promise<void> {
  const dirs = [
    ...bootstrapDirs(answers.projectPath),
    ...featureDirs(answers.projectPath, answers.featureDomains),
  ];

  await ensureVisibleDirs(dirs);

  const checklist = await readBootstrapConventionAsset(path.join('templates', 'init-checklist.md'));
  const prompt = await readBootstrapPromptAsset('project-bootstrap.prompt.md');
  const scaffoldTreeTemplate = await readBootstrapConventionAsset(path.join('templates', 'scaffold-tree.md'));

  await Promise.all([
    fs.writeFile(path.join(answers.projectPath, 'docs', 'bootstrap', 'init-checklist.md'), checklist.trimEnd() + '\n', 'utf-8'),
    fs.writeFile(path.join(answers.projectPath, 'docs', 'bootstrap', 'project-bootstrap.prompt.md'), prompt.trimEnd() + '\n', 'utf-8'),
    fs.writeFile(path.join(answers.projectPath, 'docs', 'bootstrap', 'scaffold-tree.md'), renderScaffoldTree(scaffoldTreeTemplate, answers.featureDomains).trimEnd() + '\n', 'utf-8'),
    writeBootstrapInstructions(answers.projectPath, answers),
    writeSmokeTest(answers.projectPath),
  ]);

  logger.success('Bootstrap conventions written to docs/bootstrap and .github/');
}
