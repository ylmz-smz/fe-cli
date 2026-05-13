export const SCAFFOLD_VERSIONS = {
  framework: {
    react: '^19.0.0',
    reactDom: '^19.0.0',
    next: '^15.1.8',
    reactTypes: '^19.0.0',
    reactDomTypes: '^19.0.0',
    reactRouterDom: '^7.0.0',
    reduxToolkit: '^2.6.0',
    reactRedux: '^9.2.0',
    zustand: '^5.0.0',
    mobx: '^6.13.0',
    mobxReactLite: '^4.1.0',

    vue: '^3.5.32',
    vueRouter: '^4.5.0',
    pinia: '^2.3.0',
    vuex: '^4.1.0',
  },
  language: {
    typescript: '^5.8.0',
    vueTsc: '^3.2.6',
    vueTsconfig: '^0.9.1',
    nodeTypes: '^24.12.2',
  },
  bundler: {
    vite: '^8.0.8',
    vitePluginReact: '^6.0.0',
    vitePluginVue: '^6.0.5',

    webpack: '^5.99.0',
    webpackCli: '^6.0.0',
    webpackDevServer: '^5.2.0',
    tsLoader: '^9.5.0',
    cssLoader: '^7.1.0',
    styleLoader: '^4.0.0',
    htmlWebpackPlugin: '^5.6.0',
    vueLoader: '^17.4.0',

    rspackCore: '^1.3.0',
    rspackCli: '^1.3.0',
    rspackVueLoader: '^17.4.0',
  },
} as const;
