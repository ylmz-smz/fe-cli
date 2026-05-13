import path from 'node:path';
import { spawnSync } from 'node:child_process';
import fs from 'fs-extra';
import { logger } from '../utils/logger.js';

export type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun';

export interface PostInitOptions {
  install?: boolean;
  packageManager?: PackageManager;
  gitInit?: boolean;
  gitCommit?: boolean;
  gitMessage?: string;
}

export interface CommandRunner {
  hasCommand(command: string): boolean;
  run(command: string, args: string[], cwd: string): void;
}

interface LoggerLike {
  step(msg: string): void;
  success(msg: string): void;
  warn(msg: string): void;
}

const LOCKFILE_ORDER: Array<{ file: string; manager: PackageManager }> = [
  { file: 'pnpm-lock.yaml', manager: 'pnpm' },
  { file: 'package-lock.json', manager: 'npm' },
  { file: 'yarn.lock', manager: 'yarn' },
  { file: 'bun.lockb', manager: 'bun' },
  { file: 'bun.lock', manager: 'bun' },
];

const FALLBACK_MANAGER_ORDER: PackageManager[] = ['pnpm', 'npm', 'yarn', 'bun'];

export const DEFAULT_INITIAL_COMMIT_MESSAGE = 'chore: initialize project with fe-kit';

export const defaultCommandRunner: CommandRunner = {
  hasCommand(command: string): boolean {
    const result = spawnSync(command, ['--version'], { stdio: 'ignore' });
    return result.status === 0;
  },
  run(command: string, args: string[], cwd: string): void {
    const result = spawnSync(command, args, {
      cwd,
      stdio: 'inherit',
    });

    if (result.error) {
      throw new Error(`Failed to execute ${command}: ${result.error.message}`);
    }

    if (result.status !== 0) {
      throw new Error(`Command failed: ${command} ${args.join(' ')} (exit code ${result.status ?? 'unknown'})`);
    }
  },
};

export async function resolvePackageManager(
  projectPath: string,
  preferred: PackageManager | undefined,
  runner: CommandRunner = defaultCommandRunner,
): Promise<PackageManager> {
  if (preferred) return preferred;

  for (const entry of LOCKFILE_ORDER) {
    if (await fs.pathExists(path.join(projectPath, entry.file))) {
      return entry.manager;
    }
  }

  for (const manager of FALLBACK_MANAGER_ORDER) {
    if (runner.hasCommand(manager)) {
      return manager;
    }
  }

  throw new Error(
    'No package manager found. Install one of: pnpm, npm, yarn, bun, or pass --package-manager explicitly.',
  );
}

export async function runPostInitTasks(
  projectPath: string,
  options: PostInitOptions,
  runner: CommandRunner = defaultCommandRunner,
  log: LoggerLike = logger,
): Promise<void> {
  const shouldInstall = options.install ?? true;
  const shouldGitInit = options.gitInit ?? false;
  const shouldGitCommit = options.gitCommit ?? false;

  if (shouldInstall) {
    const pm = await resolvePackageManager(projectPath, options.packageManager, runner);
    log.step(`Installing dependencies with ${pm}...`);
    runner.run(pm, ['install'], projectPath);
    log.success(`Dependencies installed with ${pm}`);
  }

  if (!shouldGitInit && !shouldGitCommit) {
    return;
  }

  if (!runner.hasCommand('git')) {
    throw new Error('Git is not available in PATH, cannot run git init/commit automation.');
  }

  const gitDir = path.join(projectPath, '.git');
  const hasGitRepo = await fs.pathExists(gitDir);

  if (shouldGitInit) {
    if (hasGitRepo) {
      log.warn('Git repository already exists, skipping git init.');
    } else {
      log.step('Initializing git repository...');
      runner.run('git', ['init'], projectPath);
      log.success('Git repository initialized');
    }
  }

  const canCommit = shouldGitCommit && (shouldGitInit || hasGitRepo || (await fs.pathExists(gitDir)));
  if (!canCommit && shouldGitCommit) {
    log.warn('Skipping initial commit because no git repository exists. Use --git-init to enable it.');
    return;
  }

  if (canCommit) {
    const commitMessage = options.gitMessage?.trim() || DEFAULT_INITIAL_COMMIT_MESSAGE;
    log.step('Creating initial git commit...');
    runner.run('git', ['add', '.'], projectPath);
    runner.run('git', ['commit', '-m', commitMessage], projectPath);
    log.success('Initial git commit created');
  }
}
