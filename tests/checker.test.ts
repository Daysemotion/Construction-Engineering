import test from 'node:test';
import assert from 'node:assert/strict';
import { inspect, conflicts } from '../src/checker.ts';
import { exampleRecord, simulatedApproval, simulatedPass } from '../src/example.ts';
import { planHash } from '../src/model.ts';
import type { RecordData } from '../src/model.ts';

function approved(): RecordData { const record = exampleRecord(); simulatedApproval(record); return record; }
function invalid(record: unknown, pattern: RegExp): void {
  const result = inspect(record); assert.equal(result.valid, false); assert.match(result.errors.join('\n'), pattern);
  assert.deepEqual(result.ready, []);
}
function running(record: RecordData, task = 'contract', attempt = 1): void {
  const definition = record.plan.tasks.find(t => t.id === task)!;
  record.runs.push({ task, attempt, actor: definition.owner, state: 'running',
    startedAt: '2026-01-01T00:01:00Z', dependencyArtifacts: {} });
}
function independent(): RecordData {
  const record = exampleRecord();
  for (const task of record.plan.tasks) task.dependsOn = [];
  simulatedApproval(record); return record;
}

test('draft is structurally valid but never ready before owner authorization', () => {
  const result = inspect(exampleRecord()); assert.equal(result.valid, true); assert.equal(result.approved, false); assert.deepEqual(result.ready, []);
});
test('approved plan offers only dependency-ready work', () => assert.deepEqual(inspect(approved()).ready, ['contract']));
test('full simulated delivery and upstream change invalidate transitive consumers', () => {
  const record = approved(); simulatedPass(record, 'contract', 1, 1);
  assert.deepEqual(inspect(record).ready, ['web-migration']);
  simulatedPass(record, 'web-migration', 1, 2); assert.deepEqual(inspect(record).ready, ['integration']);
  simulatedPass(record, 'integration', 1, 3);
  assert.deepEqual(Object.values(inspect(record).states), ['passed', 'passed', 'passed']);
  simulatedPass(record, 'contract', 2, 4);
  const result = inspect(record); assert.equal(result.valid, true); assert.equal(result.states['web-migration'], 'stale');
  assert.equal(result.states.integration, 'stale'); assert.deepEqual(result.ready, ['web-migration']);
});
test('changing plan content invalidates approval without changing revision', () => {
  const record = approved(); record.plan.tasks[0].units++; assert.equal(inspect(record).approved, false); assert.deepEqual(inspect(record).ready, []);
});
test('plan object key order does not affect digest', () => {
  const record = approved(); const reordered = Object.fromEntries(Object.entries(record.plan).reverse());
  assert.equal(inspect({ ...record, plan: reordered }).planHash, planHash(record.plan));
});
test('revocation stops new dispatch', () => {
  const record = approved(); record.approvals.push({ ...record.approvals[0], decision: 'revoke', at: '2026-01-01T00:02:00Z' });
  assert.deepEqual(inspect(record).ready, []);
});
test('worker cannot approve', () => { const record = approved(); record.approvals[0].actor = 'api-worker'; invalid(record, /Only the recorded owner/); });
test('equal-time conflicting decisions are rejected across datetime precision', () => {
  const record = approved(); record.approvals.push({ ...record.approvals[0], decision: 'revoke', at: '2026-01-01T00:00:00.000Z' });
  invalid(record, /Ambiguous approvals/);
});
test('attempt before approval is rejected', () => {
  const record = approved(); record.approvals[0].at = '2026-01-01T00:02:00Z'; running(record); invalid(record, /without matching approval/);
});
test('cycles and unknown dependencies fail closed', () => {
  const record = approved(); record.plan.tasks[0].dependsOn = ['integration']; invalid(record, /cycle/);
  record.plan.tasks[0].dependsOn = ['absent']; invalid(record, /Unknown dependency/);
});
test('duplicate IDs fail closed', () => {
  const record = approved(); record.plan.tasks.push(record.plan.tasks[0]); invalid(record, /Duplicate task/);
});
test('organization cycles and depth overflow are detected', () => {
  const record = approved(); record.plan.actors[2].parent = 'api-worker'; invalid(record, /Organization cycle/);
  record.plan.actors[2].parent = 'general'; record.plan.limits.maxDepth = 2; invalid(record, /depth exceeded/);
});
test('subcontractor design report is mandatory for its work', () => {
  const record = approved(); record.plan.proposals = []; invalid(record, /Missing subcontractor proposal/);
});
test('proposal cannot claim another contractors work', () => {
  const record = approved(); record.plan.proposals[0].taskIds.push('web-migration'); invalid(record, /crosses contractor ownership/);
});
test('resource paths overlap by segment, not string prefix', () => {
  assert.equal(conflicts(['auth'], ['auth/schema']), true);
  assert.equal(conflicts(['auth'], ['authentication']), false);
  assert.equal(conflicts(['auth/schema'], ['auth/schema-v2']), false);
});
test('unsafe or ambiguous resource names rejected', () => {
  const record = approved(); record.plan.tasks[0].resources = ['auth/../web']; invalid(record, /Invalid resource/);
});
test('next batch reserves resources and actor slots across candidates', () => {
  const record = independent(); assert.deepEqual(inspect(record).ready, ['contract', 'web-migration']);
  record.plan.tasks[1].resources = ['auth']; record.approvals = []; simulatedApproval(record);
  assert.deepEqual(inspect(record).ready, ['contract']);
});
test('coordinators and inspectors consume global slots', () => {
  const record = independent(); record.coordinationSessions.push('inspector'); assert.deepEqual(inspect(record).ready, ['contract']);
  record.coordinationSessions.push('api', 'web'); invalid(record, /Concurrent execution limit/);
});
test('duplicate and double-counted coordination records rejected', () => {
  const record = approved(); record.coordinationSessions.push('general'); invalid(record, /Duplicate coordination/);
  record.coordinationSessions = ['api-worker']; running(record); invalid(record, /double-counted/);
});
test('recorded running resource conflict is an error', () => {
  const record = independent(); record.plan.tasks[1].resources = ['auth']; record.approvals = []; simulatedApproval(record);
  running(record); running(record, 'web-migration'); invalid(record, /Shared resource conflict/);
});
test('running reservations and actual costs both consume budget', () => {
  const record = independent(); record.plan.limits.budgetUnits = 15; record.approvals = []; simulatedApproval(record);
  assert.deepEqual(inspect(record).ready, ['contract']); running(record);
  assert.equal(inspect(record).reservedUnits, 10); assert.deepEqual(inspect(record).ready, []);
});
test('overspending is detected rather than silently accepted', () => {
  const record = approved(); simulatedPass(record, 'contract'); record.runs[0].unitsUsed = 11; invalid(record, /exceeded reservation/);
});
test('global budget includes all failed attempts', () => {
  const record = approved(); record.plan.limits.budgetUnits = 10; record.approvals = []; simulatedApproval(record);
  for (let attempt = 1; attempt <= 2; attempt++) record.runs.push({ task: 'contract', attempt, actor: 'api-worker', state: 'failed',
    startedAt: `2026-01-01T00:0${attempt}:00Z`, endedAt: `2026-01-01T00:0${attempt}:10Z`, unitsUsed: 6, dependencyArtifacts: {} });
  invalid(record, /Project budget exceeded/);
});
test('independent inspector cannot be the implementer', () => {
  const record = approved(); simulatedPass(record, 'contract'); record.inspections[0].reviewer = 'api-worker'; invalid(record, /distinct inspector/);
});
test('standard work cannot silently downgrade inspection to self-review', () => {
  const record = approved(); simulatedPass(record, 'contract'); record.inspections[0].kind = 'self'; invalid(record, /Independent inspection required/);
});
test('artifact mismatch and inspection before submission are rejected', () => {
  const record = approved(); simulatedPass(record, 'contract'); record.inspections[0].artifact = 'wrong'; invalid(record, /artifact\/attempt mismatch/);
  record.inspections[0].artifact = record.runs[0].artifact!; record.inspections[0].at = '2026-01-01T00:00:20Z'; invalid(record, /predates submission/);
});
test('failed inspection needs actionable findings and permits bounded rework', () => {
  const record = approved(); simulatedPass(record, 'contract'); record.inspections[0].verdict = 'fail'; invalid(record, /needs findings/);
  record.inspections[0].findings = ['Error status changed']; assert.deepEqual(inspect(record).ready, ['contract']);
});
test('attempt limit prevents unbounded rework', () => {
  const record = approved(); record.plan.limits.maxAttempts = 1; record.approvals = []; simulatedApproval(record);
  simulatedPass(record, 'contract'); record.inspections[0].verdict = 'fail'; record.inspections[0].findings = ['Mismatch'];
  assert.deepEqual(inspect(record).ready, []); simulatedPass(record, 'contract', 2, 2); invalid(record, /Attempt limit exceeded/);
});
test('attempts cannot skip numbers or retry before inspection', () => {
  const record = approved(); simulatedPass(record, 'contract', 2); invalid(record, /unique and consecutive/);
  record.runs[0].attempt = 1; record.inspections = []; simulatedPass(record, 'contract', 2, 2); invalid(record, /prior attempt settled/);
});
test('downstream work cannot start before accepted prerequisite', () => {
  const record = approved(); simulatedPass(record, 'contract', 1, 2); simulatedPass(record, 'web-migration', 1, 1);
  invalid(record, /not accepted at start/);
});
test('historically accepted but stale intermediate cannot unlock new work', () => {
  const record = approved(); simulatedPass(record, 'contract', 1, 1); simulatedPass(record, 'web-migration', 1, 2);
  simulatedPass(record, 'contract', 2, 3); simulatedPass(record, 'integration', 1, 4);
  invalid(record, /not accepted at start: integration <- web-migration/);
});
test('submitted work holds its resource until inspection', () => {
  const record = independent(); record.plan.tasks[1].resources = ['auth']; record.approvals = []; simulatedApproval(record);
  simulatedPass(record, 'contract'); record.inspections = [];
  assert.deepEqual(inspect(record).ready, ['integration']); // Unrelated resources remain usable in this independent fixture.
});
test('missing artifact, cost and malformed input fail without throwing', () => {
  const record = approved(); simulatedPass(record, 'contract'); delete record.runs[0].artifact; delete record.runs[0].unitsUsed;
  invalid(record, /needs artifact/); invalid(null, /Invalid input/); invalid({ plan: {} }, /Invalid input/);
});
test('strict schema rejects unknown fields and nonfinite budgets', () => {
  invalid({ ...exampleRecord(), unexpected: true }, /Unrecognized key/);
  const record = approved(); record.plan.limits.budgetUnits = Infinity; invalid(record, /Invalid input/);
});
test('2000-node synthetic graph validates without recursive stack traversal', () => {
  const record = exampleRecord(); record.plan.mode = 'large'; record.plan.limits.maxTasks = 2500;
  record.plan.tasks = Array.from({ length: 2000 }, (_, i) => ({ id: `t${i}`, title: `Task ${i}`, owner: i % 2 ? 'web-worker' : 'api-worker',
    dependsOn: i ? [`t${i - 1}`] : [], resources: [`module/m${i}`], acceptance: ['Contract preserved'], units: 1, priority: 0 }));
  for (const proposal of record.plan.proposals) proposal.taskIds = record.plan.tasks.filter(t => t.owner.startsWith(proposal.contractor)).map(t => t.id);
  simulatedApproval(record); const result = inspect(record); assert.equal(result.valid, true, result.errors.join('\n')); assert.deepEqual(result.ready, ['t0']);
});
test('many deterministic DAG variations never dispatch unmet prerequisites', () => {
  for (let count = 2; count < 80; count++) {
    const record = exampleRecord(); record.plan.tasks = Array.from({ length: count }, (_, i) => ({ id: `t${i}`, title: `Task ${i}`, owner: i % 2 ? 'web-worker' : 'api-worker',
      dependsOn: i > 1 ? [`t${Math.floor(i / 2) - 1}`] : [], resources: [`module/m${i}`], acceptance: ['Verified'], units: 1, priority: i }));
    for (const proposal of record.plan.proposals) proposal.taskIds = record.plan.tasks.filter(t => t.owner.startsWith(proposal.contractor)).map(t => t.id);
    simulatedApproval(record); const result = inspect(record); assert.equal(result.valid, true);
    for (const taskId of result.ready) assert.equal(record.plan.tasks.find(t => t.id === taskId)!.dependsOn.length, 0);
    assert.ok(result.ready.length + record.coordinationSessions.length <= record.plan.limits.maxConcurrent);
  }
});

test('completed attempts cannot conceal historical concurrency and resource conflicts', () => {
  const record = independent(); record.coordinationSessions = [];
  record.plan.limits.maxConcurrent = 1; record.plan.tasks[1].resources = ['auth/schema'];
  record.approvals = []; simulatedApproval(record);
  simulatedPass(record, 'contract', 1, 1); simulatedPass(record, 'web-migration', 1, 1);
  invalid(record, /Historical concurrency/); invalid(record, /Historical resource conflict/);
});
test('completed overlapping reservations cannot hide behind low final spend', () => {
  const record = independent(); record.plan.limits.budgetUnits = 15;
  record.approvals = []; simulatedApproval(record);
  simulatedPass(record, 'contract', 1, 1); simulatedPass(record, 'web-migration', 1, 1);
  invalid(record, /Historical budget exceeded/);
});
test('historical actor overlap is invalid even when both attempts have finished', () => {
  const record = independent(); simulatedPass(record, 'contract', 1, 1); simulatedPass(record, 'integration', 1, 1);
  invalid(record, /Historical actor overlap/);
});
test('submillisecond timestamps are rejected rather than silently reordered', () => {
  const record = approved(); record.approvals[0].at = '2026-01-01T00:01:00.0009Z';
  running(record); record.runs[0].startedAt = '2026-01-01T00:01:00.0001Z';
  invalid(record, /at most millisecond precision/);
});
