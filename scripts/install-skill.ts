import { cp, mkdir, lstat, rename, mkdtemp, rm, stat } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'skills/construction-engineering');
const name = 'construction-engineering';
const args = process.argv.slice(2);
const usage = 'Usage: node scripts/install-skill.ts --project <existing-project> | --user | --target <skill-directory>';
let temporary: string | undefined;
try {
  if (args.length === 1 && ['--help', '-h'].includes(args[0])) {
    console.log(usage);
    process.exit(0);
  }
  let target: string;
  if (args.length === 2 && args[0] === '--project') {
    const project = resolve(args[1]);
    if (!(await stat(project)).isDirectory()) throw new Error(`Not a project directory: ${project}`);
    target = join(project, '.agents', 'skills', name);
  } else if (args.length === 1 && args[0] === '--user') {
    target = join(homedir(), '.agents', 'skills', name);
  } else if (args.length === 2 && args[0] === '--target') {
    target = resolve(args[1]);
  } else if (args.length === 1 && !args[0].startsWith('-')) {
    // Preserve the original explicit destination interface.
    target = resolve(args[0]);
  } else {
    throw new Error(usage);
  }
  await mkdir(dirname(target), { recursive: true });
  try { await lstat(target); throw new Error(`Destination already exists; inspect and update deliberately: ${target}`); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
  // A partial installation is never published as the discoverable skill folder.
  temporary = await mkdtemp(join(dirname(target), `.${name}-install-`));
  const stagedSkill = join(temporary, name);
  await cp(source, stagedSkill, { recursive: true, errorOnExist: true, force: false });
  await rename(stagedSkill, target);
  console.log(`Installed ${target}`);
  console.log('The host may discover it in a new chat or after reload. No global AGENTS.md was modified.');
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  // Only remove the unique staging directory created by this invocation.
  if (temporary) await rm(temporary, { recursive: true, force: true });
}
