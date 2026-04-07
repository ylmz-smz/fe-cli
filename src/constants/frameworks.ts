export const FRAMEWORKS = ['vue', 'react'] as const;
export type Framework = (typeof FRAMEWORKS)[number];

export const ROUTERS: Record<Framework, string> = {
  vue: 'vue-router',
  react: 'react-router',
};

export const STATE_MANAGERS: Record<Framework, readonly string[]> = {
  vue: ['pinia', 'vuex'] as const,
  react: ['redux-toolkit', 'zustand', 'mobx'] as const,
};
