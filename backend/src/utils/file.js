import { mkdir, writeFile, readdir, stat, rm } from "fs/promises";
import { join, dirname } from "path";
import { existsSync } from "fs";

export async function ensureDir(dir) {
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
}

export async function writeFileSafe(filePath, data) {
  await ensureDir(dirname(filePath));
  await writeFile(filePath, data);
}

export async function cleanOldFiles(dir, maxAgeMin) {
  if (!existsSync(dir)) return;

  const now = Date.now();
  const maxAge = maxAgeMin * 60 * 1000;

  try {
    const entries = await readdir(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      try {
        const stats = await stat(fullPath);
        if (now - stats.mtimeMs > maxAge) {
          await rm(fullPath, { recursive: true, force: true });
        }
      } catch {
        // Skip inaccessible files
      }
    }
  } catch {
    // Directory might not exist yet
  }
}
