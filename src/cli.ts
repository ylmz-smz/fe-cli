import { Command } from 'commander';
import { CLI_NAME, CLI_VERSION } from './constants/index.js';
import { initCommand } from './commands/init.js';
import { enhanceCommand } from './commands/enhance.js';

const program = new Command();

function parseCsvOption(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

program
  .name(CLI_NAME)
  .description('Frontend project scaffold CLI — init, enhance, and manage your dev environment.')
  .version(CLI_VERSION);

program
  .command('init')
  .description('Initialize a new frontend project with Vue, React, or Next.js + TypeScript')
  .option('--project-name <name>', 'Project name')
  .option('--project-path <path>', 'Project path')
  .option('--framework <framework>', 'Framework (vue|react|next)')
  .option('--router <router>', 'Router (vue-router|react-router|next-app-router)')
  .option('--state-management <stateManagement>', 'State manager (pinia|vuex|redux-toolkit|zustand|mobx)')
  .option('--bundler <bundler>', 'Build tool (vite|webpack|rspack|next)')
  .option('--lint-tools <tools>', 'Comma-separated lint tools', parseCsvOption)
  .option('--dev-tools <tools>', 'Comma-separated dev tools', parseCsvOption)
  .option('--skills <ids>', 'Comma-separated skill IDs', parseCsvOption)
  .option('--mcp-servers <ids>', 'Comma-separated MCP server IDs', parseCsvOption)
  .option('--feature-domains <domains>', 'Comma-separated feature domains', parseCsvOption)
  .option('--yes', 'Skip prompts and use defaults for missing values')
  .option('--install [value]', 'Install dependencies after scaffolding (default: true)')
  .option('--package-manager <pm>', 'Package manager (pnpm|npm|yarn|bun)')
  .option('--git-init [value]', 'Initialize git repository (default: false)')
  .option('--git-commit [value]', 'Create initial commit (default: false)')
  .option('--git-message <message>', 'Initial commit message')
  .action(async (options) => {
    try {
      await initCommand(options);
    } catch (err) {
      console.error(err);
      process.exitCode = 1;
    }
  });

program
  .command('enhance')
  .description('Enhance an existing frontend project with dev tools, skills, MCP, and rules')
  .option('--dev-tools <tools>', 'Comma-separated dev tools', parseCsvOption)
  .option('--quality-tools <tools>', 'Comma-separated quality tools', parseCsvOption)
  .option('--skills <ids>', 'Comma-separated skill IDs', parseCsvOption)
  .option('--mcp-servers <ids>', 'Comma-separated MCP server IDs', parseCsvOption)
  .option('--yes', 'Skip prompts and use defaults for missing values')
  .action(async (options) => {
    try {
      await enhanceCommand(options);
    } catch (err) {
      console.error(err);
      process.exitCode = 1;
    }
  });

program.parse();
