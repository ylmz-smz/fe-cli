import type { SkillSelection } from '../adapters/types.js';

export interface SkillDefinition {
  id: string;
  label: string;
  description: string;
  content: string;
  tags: string[];
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
  return BUILTIN_SKILLS;
}

export function getSkillById(id: string): SkillSelection | undefined {
  const def = BUILTIN_SKILLS.find((s) => s.id === id);
  if (!def) return undefined;
  return { id: def.id, label: def.label, content: def.content };
}
