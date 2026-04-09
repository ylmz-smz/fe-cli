import { defineConfig } from 'tsup';
import { copyFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import pkg from './package.json';

function copyDirSync(src: string, dest: string) {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    if (statSync(srcPath).isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

/** Copy only subdirectories (skill templates) from src/skills/, skip .ts source files. */
function copySkillDirs(src: string, dest: string) {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const srcPath = join(src, entry);
    if (statSync(srcPath).isDirectory()) {
      copyDirSync(srcPath, join(dest, entry));
    }
  }
}

export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['esm'],
  target: 'node18',
  outDir: 'dist',
  clean: true,
  splitting: false,
  sourcemap: true,
  dts: false,
  define: {
    __CLI_VERSION__: JSON.stringify(pkg.version),
  },
  banner: { js: '#!/usr/bin/env node' },
  outExtension: () => ({ js: '.mjs' }),
  onSuccess: async () => {
    copyDirSync('src/templates', 'dist/templates');
    copyDirSync('src/rules', 'dist/rules');
    copySkillDirs('src/skills', 'dist/skills');
  },
});
