import { createHash } from 'node:crypto';
import { z } from 'zod';

const text = z.string().trim().min(1);
const id = z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/);
// Date.parse has millisecond precision. Do not accept timestamps it would silently truncate.
const time = z.iso.datetime().regex(/T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/,
  'Use UTC timestamps with at most millisecond precision');
const nonnegative = z.number().finite().nonnegative();
const positiveInt = z.number().int().positive();
export const ActorSchema = z.strictObject({
  id, role: z.enum(['owner', 'general', 'subcontractor', 'lead', 'worker', 'inspector']),
  parent: id.optional(), responsibility: text,
});
export const TaskSchema = z.strictObject({
  id, title: text, owner: id, dependsOn: z.array(id), resources: z.array(text),
  acceptance: z.array(text).min(1), units: positiveInt, priority: z.number().int(),
});
export const PlanSchema = z.strictObject({
  schemaVersion: z.literal(1), id, revision: positiveInt, objective: text,
  exclusions: z.array(text), mode: z.enum(['small', 'standard', 'large']),
  limits: z.strictObject({ maxConcurrent: positiveInt, maxAttempts: positiveInt,
    maxDepth: positiveInt, maxTasks: positiveInt.max(10000), budgetUnits: positiveInt }),
  unitDescription: text,
  actors: z.array(ActorSchema).min(2).max(10000),
  proposals: z.array(z.strictObject({
    contractor: id, taskIds: z.array(id).min(1), requestedWorkers: positiveInt,
    rationale: text, design: text, interfaceRefs: z.array(text), risks: z.array(text),
  })),
  integrationDecision: text,
  tasks: z.array(TaskSchema).min(1).max(10000),
});
export const ApprovalSchema = z.strictObject({
  planHash: z.string().regex(/^[a-f0-9]{64}$/), actor: id,
  decision: z.enum(['approve', 'revoke']), sourceRef: text, at: time,
});
export const RunSchema = z.strictObject({
  task: id, attempt: positiveInt, actor: id, state: z.enum(['running', 'submitted', 'failed', 'cancelled']),
  startedAt: time, endedAt: time.optional(), unitsUsed: nonnegative.optional(),
  artifact: text.optional(), dependencyArtifacts: z.record(id, text),
});
export const InspectionSchema = z.strictObject({
  task: id, attempt: positiveInt, artifact: text, reviewer: id,
  kind: z.enum(['self', 'independent']), verdict: z.enum(['pass', 'fail']),
  at: time, evidence: z.array(text).min(1), findings: z.array(text),
});
export const RecordSchema = z.strictObject({
  plan: PlanSchema, approvals: z.array(ApprovalSchema), runs: z.array(RunSchema),
  inspections: z.array(InspectionSchema), coordinationSessions: z.array(id),
});
export type Plan = z.infer<typeof PlanSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type RecordData = z.infer<typeof RecordSchema>;

// Sort object keys so property insertion order does not invalidate an approval.
// Array order remains significant (e.g. an intentionally reordered work package).
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    const object = value as Record<string, unknown>;
    return `{${Object.keys(object).sort().map(k => `${JSON.stringify(k)}:${canonical(object[k])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}
export function planHash(plan: Plan): string {
  return createHash('sha256').update(canonical(plan)).digest('hex');
}
