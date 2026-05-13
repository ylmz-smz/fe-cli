const { defineConfig } = require('@rspack/cli');
const { VueLoaderPlugin } = require('vue-loader');

module.exports = defineConfig({
  entry: { main: './src/main.ts' },
  resolve: {
    extensions: ['.ts', '.js', '.vue'],
  },
  module: {
    rules: [
      { test: /\.vue$/, loader: 'vue-loader', options: { experimentalInlineMatchResource: true } },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: 'builtin:swc-loader',
        options: {
          jsc: { parser: { syntax: 'typescript' } },
        },
      },
    ],
  },
  plugins: [new VueLoaderPlugin()],
});
