import { defineConfig } from '@rspack/cli';
import { VueLoaderPlugin } from '@rspack/plugin-vue';

export default defineConfig({
  entry: { main: './src/main.ts' },
  resolve: {
    extensions: ['.ts', '.js', '.vue'],
  },
  module: {
    rules: [
      { test: /\.vue$/, loader: 'vue-loader', options: { experimentalInlineMatchResource: true } },
      { test: /\.ts$/, loader: 'builtin:swc-loader', options: { jsc: { parser: { syntax: 'typescript' } } }, type: 'javascript/auto' },
    ],
  },
  plugins: [new VueLoaderPlugin()],
});
