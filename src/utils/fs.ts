import fs from 'fs-extra';
import path from 'node:path';

/** Safely read a JSON file; returns undefined when file is missing or malformed. */
export async function readJsonSafe<T = unknown>(
  filePath: string,
): Promise<T | undefined> {
  try {
    return (await fs.readJson(filePath)) as T;
  } catch {
    return undefined;
  }
}

/** Write JSON with consistent formatting. Creates parent dirs as needed. */
export async function writeJsonSafe(
  filePath: string,
  data: unknown,
): Promise<void> {
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeJson(filePath, data, { spaces: 2 });
}
