import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function resolveAssetPath(
  dirName: 'project-bootstrap-conventions' | 'prompts',
  relativePath: string,
): string {
  const candidates = [
    path.resolve(__dirname, dirName, relativePath),
    path.resolve(__dirname, '..', dirName, relativePath),
    path.resolve(__dirname, '..', '..', dirName, relativePath),
    path.resolve(process.cwd(), dirName, relativePath),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  throw new Error(`Bootstrap asset not found: ${dirName}/${relativePath}`);
}

export async function readBootstrapConventionAsset(relativePath: string): Promise<string> {
  return fs.readFile(resolveAssetPath('project-bootstrap-conventions', relativePath), 'utf-8');
}

export async function readBootstrapPromptAsset(relativePath: string): Promise<string> {
  return fs.readFile(resolveAssetPath('prompts', relativePath), 'utf-8');
}
