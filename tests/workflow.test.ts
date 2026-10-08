import test from 'node:test';
import assert from 'node:assert/strict';
import { inspect } from '../src/checker.ts';
import { exampleRecord, simulatedApproval, simulatedPass } from '../src/example.ts';
import type { RecordData } from '../src/model.ts';

// Synthetic protocol fixture: no agents, product checks, or real approvals are executed.
function workflow(): RecordData {
  const record = exampleRecord();
  record.plan.actors.push(
    { id: 'api-qa', role: 'worker', parent: 'api', responsibility: 'Execute API QA independently of implementation' },
    { id: 'web-qa', role: 'worker', parent: 'web', responsibility: 'Execute web QA independently of implementation' },
  );
  const task = (id: string, owner: string, dependsOn: string[], resources: string[], acceptance: string) =>
    ({ id, title: id, owner, dependsOn, resources, acceptance: [acceptance], units: 10, priority: 10 });
  record.plan.tasks = [
    task('design', 'api-worker', [], ['contracts/api'], 'Reconciled timeout, retry, cancellation behavior and QA scenarios are unambiguous'),
    task('api', 'api-worker', ['design'], ['config/api'], 'Implementation meets accepted contract'),
    task('web', 'web-worker', ['design'], ['config/api'], 'Consumer settings meet accepted contract'),
    task('api-qa', 'api-qa', ['api'], ['qa/api'], 'Failure and cancellation scenarios executed against exact API artifact'),
    task('web-qa', 'web-qa', ['web'], ['qa/web'], 'Consumer scenarios executed against exact web artifact'),
    task('integration', 'api-worker', ['api-qa', 'web-qa'], ['integration/api'], 'Exact combined revision passes cross-trade scenarios'),
    task('docs', 'web-worker', ['integration'], ['docs/api'], 'Documentation agrees with accepted combined artifact'),
  ];
  for (const proposal of record.plan.proposals) {
    proposal.taskIds = record.plan.tasks.filter(t => t.owner.startsWith(proposal.contractor)).map(t => t.id);
    proposal.requestedWorkers = 2;
  }
  simulatedApproval(record);
  return record;
}

function result(record: RecordData) {
  const checked = inspect(record);
  assert.equal(checked.valid, true, checked.errors.join('\n'));
  return checked;
}

test('rejected design never unlocks implementation until its corrected artifact passes', () => {
  const record = workflow();
  simulatedPass(record, 'design', 1, 1);
  record.inspections[0].verdict = 'fail';
  record.inspections[0].findings = ['Cancellation behavior is undefined'];
  assert.deepEqual(result(record).ready, ['design']);
  simulatedPass(record, 'design', 2, 2);
  assert.deepEqual(result(record).ready, ['api']);
});

test('shared configuration stays held until inspection while independent QA can proceed', () => {
  const record = workflow();
  simulatedPass(record, 'design', 1, 1);
  simulatedPass(record, 'api', 1, 2);
  const review = record.inspections.pop()!;
  assert.deepEqual(result(record).ready, []);
  record.inspections.push(review);
  assert.deepEqual(result(record).ready, ['api-qa', 'web']);
});

test('local trade passes cannot unlock documentation when combined verification fails', () => {
  const record = workflow();
  for (const [index, id] of ['design', 'api', 'web', 'api-qa', 'web-qa', 'integration'].entries()) {
    simulatedPass(record, id, 1, index + 1);
  }
  record.inspections.at(-1)!.verdict = 'fail';
  record.inspections.at(-1)!.findings = ['Consumer retries continue after cancellation'];
  assert.deepEqual(result(record).ready, ['integration']);
  assert.notEqual(result(record).states.docs, 'passed');
  simulatedPass(record, 'integration', 2, 7);
  assert.deepEqual(result(record).ready, ['docs']);
});

test('revised design invalidates implementation, QA, integration and handover transitively', () => {
  const record = workflow();
  for (const [index, id] of ['design', 'api', 'web', 'api-qa', 'web-qa', 'integration', 'docs'].entries()) {
    simulatedPass(record, id, 1, index + 1);
  }
  assert.ok(Object.values(result(record).states).every(state => state === 'passed'));
  simulatedPass(record, 'design', 2, 8);
  const checked = result(record);
  for (const id of ['api', 'web', 'api-qa', 'web-qa', 'integration', 'docs']) assert.equal(checked.states[id], 'stale');
  assert.deepEqual(checked.ready, ['api']);
});
