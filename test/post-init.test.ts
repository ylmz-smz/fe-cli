import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import {
  resolvePackageManager,
  runPostInitTasks,
  type CommandRunner,
} from '../src/core/post-init.js';

class FakeRunner implements CommandRunner {
  readonly commands: Array<{ command: string; args: string[]; cwd: string }> = [];

  constructor(private readonly availableCommands: Set<string>) {}

  hasCommand(command: string): boolean {
    return this.availableCommands.has(command);
  }

  run(command: string, args: string[], cwd: string): void {
    this.commands.push({ command, args, cwd });
  }
}

const silentLogger = {
  step: (_msg: string): void => {},
  success: (_msg: string): void => {},
  warn: (_msg: string): void => {},
};

test('resolvePackageManager uses lockfile priority', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'fe-kit-pm-'));
  const runner = new FakeRunner(new Set(['pnpm', 'npm']));

  try {
    await fs.writeFile(path.join(root, 'package-lock.json'), '{}', 'utf8');
    const pm = await resolvePackageManager(root, undefined, runner);
    assert.equal(pm, 'npm');
  } finally {
    await fs.remove(root);
  }
});

test('runPostInitTasks installs dependencies by default', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'fe-kit-post-init-install-'));
  const runner = new FakeRunner(new Set(['pnpm']));

  try {
    await runPostInitTasks(root, {}, runner, silentLogger);

    assert.deepEqual(runner.commands, [
      { command: 'pnpm', args: ['install'], cwd: root },
    ]);
  } finally {
    await fs.remove(root);
  }
});

test('runPostInitTasks supports git init and initial commit', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'fe-kit-post-init-git-'));
  const runner = new FakeRunner(new Set(['pnpm', 'git']));

  try {
    await runPostInitTasks(
      root,
      {
        install: false,
        gitInit: true,
        gitCommit: true,
        gitMessage: 'chore: init repo',
      },
      runner,
      silentLogger,
    );

    assert.deepEqual(runner.commands, [
      { command: 'git', args: ['init'], cwd: root },
      { command: 'git', args: ['add', '.'], cwd: root },
      { command: 'git', args: ['commit', '-m', 'chore: init repo'], cwd: root },
    ]);
  } finally {
    await fs.remove(root);
  }
});
