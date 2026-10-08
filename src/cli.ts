import { readFile, mkdir, writeFile, copyFile } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inspect } from './checker.ts';
import { exampleRecord, simulatedApproval, simulatedPass } from './example.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [command, path] = process.argv.slice(2);
try {
  if (command === 'init') {
    if (!path) throw new Error('Usage: npm run orch -- init <new-record-directory>');
    const target = resolve(path);
    await mkdir(dirname(target), { recursive: true });
    // Exclusive directory creation; never overwrite an existing project or record.
    await mkdir(target);
    await writeFile(join(target, 'record.json'), JSON.stringify(exampleRecord(), null, 2) + '\n', { flag: 'wx' });
    await copyFile(join(root, 'skills/construction-engineering/assets/project-record.md'), join(target, 'worklog.md'));
    console.log(`Created unapproved example record at ${target}. Replace the example with the actual project before use.`);
  } else if (['check', 'ready', 'report', 'hash'].includes(command)) {
    if (!path) throw new Error(`Usage: npm run orch -- ${command} <record.json>`);
    const result = inspect(JSON.parse(await readFile(resolve(path), 'utf8')));
    if (command === 'hash' && result.planHash) console.log(result.planHash);
    else if (command === 'ready') console.log(JSON.stringify({ ready: result.ready, errors: result.errors, warnings: result.warnings }, null, 2));
    else if (command === 'report') {
      console.log(`# Orchestration record report\n\nValid: ${result.valid}\nApproved: ${result.approved}\nPlan hash: ${result.planHash ?? 'invalid'}\n`);
      console.log(`Recorded units: ${result.spentUnits} spent, ${result.reservedUnits} reserved\n`);
      for (const [id, state] of Object.entries(result.states)) console.log(`- ${id}: ${state}`);
      console.log(`\nSuggested next batch: ${result.ready.join(', ') || '(none)'}`);
      for (const finding of [...result.errors, ...result.warnings]) console.log(`- ${finding}`);
      console.log('\nThis checks supplied records; it does not execute work, authenticate approvals, or verify evidence files.');
    } else console.log(JSON.stringify(result, null, 2));
    if (!result.valid) process.exitCode = 1;
  } else if (command === 'demo') {
    const record = exampleRecord();
    console.log('SIMULATION ONLY — no agents, product tests, or real approvals executed.');
    console.log('Before approval:', inspect(record).ready);
    simulatedApproval(record);
    console.log('After synthetic approval:', inspect(record).ready);
    simulatedPass(record, 'contract', 1, 1);
    console.log('After contract:', inspect(record).ready);
    simulatedPass(record, 'web-migration', 1, 2);
    console.log('After web:', inspect(record).ready);
    simulatedPass(record, 'integration', 1, 3);
    console.log('All submitted and inspected:', inspect(record).states);
    simulatedPass(record, 'contract', 2, 4);
    console.log('After upstream change:', inspect(record).states);
  } else {
    console.log('Commands: init <new-dir> | check <record.json> | ready <record.json> | hash <record.json> | report <record.json> | demo');
    if (command && command !== 'help') process.exitCode = 1;
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
