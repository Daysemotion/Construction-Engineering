import { mkdir, writeFile } from 'node:fs/promises';
import { z } from 'zod';
import { RecordSchema } from '../src/model.ts';

await mkdir(new URL('../schemas/', import.meta.url), { recursive: true });
await writeFile(new URL('../schemas/record.schema.json', import.meta.url), JSON.stringify(z.toJSONSchema(RecordSchema), null, 2) + '\n');
console.log('Generated schemas/record.schema.json from src/model.ts');
