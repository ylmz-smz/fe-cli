import type { SkillSelection } from '../adapters/types.js';
import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const { pathExistsSync, readdirSync, readFileSync } = fs;

export interface SkillDefinition {
  id: string;
  label: string;
  description: string;
  content: string;
  tags: string[];
  /** Absolute path to the original SKILL.md. */
  sourcePath: string;
}

function toLabel(id: string): string {
  return id
    .split(/[-_]/g)
    .filter(Boolean)
    .map((w) => w.slice(0, 1).toUpperCase() + w.slice(1))
    .join(' ');
}

function splitFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  if (!raw.startsWith('---\n')) return { meta: {}, body: raw };

  const end = raw.indexOf('\n---\n', 4);
  if (end === -1) return { meta: {}, body: raw };

  const fm = raw.slice(4, end).trim();
  const body = raw.slice(end + '\n---\n'.length).replace(/^\n+/, '');

  const meta: Record<string, string> = {};
  for (const line of fm.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf(':');
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    value = value.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
    meta[key] = value;
  }

  return { meta, body };
}

function skillsDir(): string {
  return fileURLToPath(new URL('./skills/', import.meta.url));
}

function loadSkillsFromDir(): SkillDefinition[] {
  const dir = skillsDir();
  if (!pathExistsSync(dir)) return [];

  const entries = readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort((a, b) => a.localeCompare(b));

  const defs: SkillDefinition[] = [];
  for (const dirName of entries) {
    const p = path.join(dir, dirName, 'SKILL.md');
    if (!pathExistsSync(p)) continue;

    const raw = readFileSync(p, 'utf8');
    const { meta, body } = splitFrontmatter(raw);
    const id = meta.name?.trim() || dirName;
    const description = meta.description?.trim() || '';

    defs.push({
      id,
      label: toLabel(id),
      description,
      content: body.trimEnd(),
      tags: [],
      sourcePath: p,
    });
  }

  return defs;
}

export function getSkillCatalog(): SkillDefinition[] {
  return loadSkillsFromDir();
}

export function getSkillById(id: string): SkillSelection | undefined {
  const def = getSkillCatalog().find((s) => s.id === id);
  if (!def) return undefined;
  return { id: def.id, label: def.label, content: def.content, sourcePath: def.sourcePath };
}
