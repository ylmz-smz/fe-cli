import { Command } from 'commander';
import { CLI_NAME, CLI_VERSION } from './constants/index.js';
import { initCommand } from './commands/init.js';
import { enhanceCommand } from './commands/enhance.js';

const program = new Command();

program
  .name(CLI_NAME)
  .description('Frontend project scaffold CLI — init, enhance, and manage your dev environment.')
  .version(CLI_VERSION);

program
  .command('init')
  .description('Initialize a new frontend project with Vue or React + TypeScript')
  .action(async () => {
    try {
      await initCommand();
    } catch (err) {
      console.error(err);
      process.exitCode = 1;
    }
  });

program
  .command('enhance')
  .description('Enhance an existing frontend project with dev tools, skills, MCP, and rules')
  .action(async () => {
    try {
      await enhanceCommand();
    } catch (err) {
      console.error(err);
      process.exitCode = 1;
    }
  });

program.parse();
