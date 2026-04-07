import type { SkillSelection } from '../adapters/types.js';
import { pathExistsSync, readdirSync, readFileSync } from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export interface SkillDefinition {
  id: string;
  label: string;
  description: string;
  content: string;
  tags: string[];
}

function toLabel(id: string): string {
  return id
    .split(/[-_]/g)
    .filter(Boolean)
    .map((w) => w.slice(0, 1).toUpperCase() + w.slice(1))
    .join(' ');
}

function splitFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  // Minimal YAML frontmatter splitter:
  // ---
  // key: value
  // ---
  if (!raw.startsWith('---\n')) return { meta: {}, body: raw };

  const end = raw.indexOf('\n---\n', 4);
  if (end === -1) return { meta: {}, body: raw };

  const fm = raw.slice(4, end).trim();
  const body = raw.slice(end + '\n---\n'.length).replace(/^\n+/, '');

  const meta: Record<string, string> = {};
  for (const line of fm.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf(':');
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    value = value.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
    meta[key] = value;
  }

  return { meta, body };
}

function loadFileBackedSkills(): SkillDefinition[] {
  // In dist: <pkgRoot>/dist/skills/catalog.mjs
  // Skills live at <pkgRoot>/skills/
  const skillsDir = fileURLToPath(new URL('../../skills/', import.meta.url));
  if (!pathExistsSync(skillsDir)) return [];

  const entries = readdirSync(skillsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort((a, b) => a.localeCompare(b));

  const defs: SkillDefinition[] = [];
  for (const dir of entries) {
    const p = path.join(skillsDir, dir, 'SKILL.md');
    if (!pathExistsSync(p)) continue;

    const raw = readFileSync(p, 'utf8');
    const { meta, body } = splitFrontmatter(raw);
    const id = meta.name?.trim() || dir;
    const description = meta.description?.trim() || '';

    defs.push({
      id,
      label: toLabel(id),
      description,
      content: body.trimEnd(),
      tags: [],
    });
  }

  return defs;
}

const BUILTIN_SKILLS: SkillDefinition[] = [
  {
    id: 'frontend-patterns',
    label: 'Frontend Patterns',
    description: 'React/Vue component patterns, state management, and performance best practices.',
    content: [
      '# Frontend Patterns',
      '',
      '## Component Design',
      '- Prefer functional components with hooks (React) or Composition API (Vue).',
      '- Single Responsibility Principle: one component = one concern.',
      '- Extract reusable logic into custom hooks / composables.',
      '',
      '## State Management',
      '- Keep state as close to where it is used as possible.',
      '- Use derived state instead of duplicating data.',
      '- Avoid deeply nested state; flatten when possible.',
      '',
      '## Performance',
      '- Memoize expensive computations (useMemo / computed).',
      '- Use lazy loading for routes and heavy components.',
      '- Avoid unnecessary re-renders by stabilizing references.',
    ].join('\n'),
    tags: ['frontend', 'react', 'vue'],
  },
  {
    id: 'typescript-strict',
    label: 'TypeScript Strict Mode',
    description: 'Enforce strict TypeScript patterns: no any, proper generics, exhaustive checks.',
    content: [
      '# TypeScript Strict Mode Guidelines',
      '',
      '- Enable `strict: true` in tsconfig.json.',
      '- Never use `any`; prefer `unknown` and narrow with type guards.',
      '- Use discriminated unions for state variants.',
      '- Use `satisfies` for inline type validation without widening.',
      '- Prefer `as const` for literal types.',
      '- Always handle all switch/union cases (exhaustive checks).',
    ].join('\n'),
    tags: ['typescript'],
  },
  {
    id: 'git-conventions',
    label: 'Git Conventions',
    description: 'Conventional commits, branch naming, and PR practices.',
    content: [
      '# Git Conventions',
      '',
      '## Commit Messages',
      '- Format: `type(scope): description`',
      '- Types: feat, fix, docs, style, refactor, perf, test, chore',
      '',
      '## Branch Naming',
      '- `feat/<ticket>-<short-desc>`',
      '- `fix/<ticket>-<short-desc>`',
      '- `chore/<desc>`',
      '',
      '## Pull Requests',
      '- Keep PRs small and focused.',
      '- Include a summary and test plan.',
    ].join('\n'),
    tags: ['git'],
  },
  {
    id: 'code-review',
    label: 'Code Review Guidelines',
    description: 'Standards for reviewing and writing reviewable code.',
    content: [
      '# Code Review Guidelines',
      '',
      '- Review for correctness, readability, and maintainability.',
      '- Prefer suggesting improvements over prescribing solutions.',
      '- Every PR should have tests for new behavior.',
      '- Check for proper error handling and edge cases.',
      '- Verify backward compatibility.',
    ].join('\n'),
    tags: ['workflow'],
  },
  {
    id: 'css-best-practices',
    label: 'CSS / Styling Best Practices',
    description: 'CSS architecture, naming, and responsive design guidelines.',
    content: [
      '# CSS / Styling Best Practices',
      '',
      '- Use CSS Modules or scoped styles to avoid global conflicts.',
      '- Follow a consistent naming convention (BEM or utility-first).',
      '- Prefer logical properties for RTL support.',
      '- Use CSS custom properties for theming.',
      '- Mobile-first responsive design with min-width breakpoints.',
    ].join('\n'),
    tags: ['css', 'frontend'],
  },
];

export function getSkillCatalog(): SkillDefinition[] {
  const fileBacked = loadFileBackedSkills();
  if (fileBacked.length === 0) return BUILTIN_SKILLS;

  const fileIds = new Set(fileBacked.map((s) => s.id));
  return [...fileBacked, ...BUILTIN_SKILLS.filter((s) => !fileIds.has(s.id))];
}

export function getSkillById(id: string): SkillSelection | undefined {
  const def = getSkillCatalog().find((s) => s.id === id);
  if (!def) return undefined;
  return { id: def.id, label: def.label, content: def.content };
}
