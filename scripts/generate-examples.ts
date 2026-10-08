import { mkdir, writeFile } from 'node:fs/promises';
import { exampleRecord, simulatedApproval, simulatedPass } from '../src/example.ts';

const directory = new URL('../examples/', import.meta.url);
await mkdir(directory, { recursive: true });
const save = async (name: string, value: unknown) => writeFile(new URL(name, directory), JSON.stringify(value, null, 2) + '\n');
const record = exampleRecord();
await save('refactor-draft.json', record);
simulatedApproval(record);
simulatedPass(record, 'contract', 1, 1);
simulatedPass(record, 'web-migration', 1, 2);
simulatedPass(record, 'integration', 1, 3);
await save('refactor-complete.simulated.json', record);
simulatedPass(record, 'contract', 2, 4);
await save('refactor-stale.simulated.json', record);
console.log('Generated fictional example records; no product work or inspections executed.');
