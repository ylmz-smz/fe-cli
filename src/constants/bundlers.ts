import type { Framework } from './frameworks.js';

export const BUNDLERS = ['vite', 'webpack', 'rspack', 'next'] as const;
export type Bundler = (typeof BUNDLERS)[number];

export const BUNDLERS_BY_FRAMEWORK: Record<Framework, readonly Bundler[]> = {
	vue: ['vite', 'webpack', 'rspack'] as const,
	react: ['vite', 'webpack', 'rspack'] as const,
	next: ['next'] as const,
};
