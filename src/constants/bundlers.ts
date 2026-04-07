export const BUNDLERS = ['vite', 'webpack', 'rspack'] as const;
export type Bundler = (typeof BUNDLERS)[number];
