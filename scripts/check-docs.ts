import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const problems: string[] = [];
let checked = 0;
async function walk(directory: string): Promise<void> {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (['node_modules', '.git', '.test-output'].includes(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (entry.name.endsWith('.md')) {
      checked++;
      const content = await readFile(path, 'utf8');
      if (/[\uAC00-\uD7AF]/u.test(content)) problems.push(`${path}: maintained documentation must be in English`);
      for (const match of content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
        const target = match[1].split('#')[0];
        if (!target || /^[a-z]+:\/\//i.test(target)) continue;
        try { await stat(resolve(dirname(path), target)); }
        catch { problems.push(`${path}: missing link ${target}`); }
      }
    }
  }
}
await walk(root);
if (problems.length) { console.error(problems.join('\n')); process.exitCode = 1; }
else console.log(`Verified local Markdown links in ${checked} documents.`);
