import { planHash } from './model.ts';
import type { RecordData } from './model.ts';

/** Fictional plan. No LLMs, shell commands, approvals, or tests are actually executed. */
export function exampleRecord(): RecordData {
  return {
    plan: {
      schemaVersion: 1, id: 'auth-refactor', revision: 1,
      objective: 'Preserve authentication behavior while moving consumers to a shared contract',
      exclusions: ['Production deployment', 'Changing login behavior'], mode: 'standard',
      limits: { maxConcurrent: 3, maxAttempts: 3, maxDepth: 5, maxTasks: 100, budgetUnits: 100 },
      unitDescription: 'Synthetic planning credits; not money, tokens, or measured runtime',
      actors: [
        { id: 'owner', role: 'owner', responsibility: 'Scope and authorization' },
        { id: 'general', role: 'general', parent: 'owner', responsibility: 'Integration and conflict decisions' },
        { id: 'api', role: 'subcontractor', parent: 'general', responsibility: 'Auth contract and backend' },
        { id: 'web', role: 'subcontractor', parent: 'general', responsibility: 'Web consumer migration' },
        { id: 'api-worker', role: 'worker', parent: 'api', responsibility: 'Contract implementation' },
        { id: 'web-worker', role: 'worker', parent: 'web', responsibility: 'Consumer implementation' },
        { id: 'inspector', role: 'inspector', parent: 'owner', responsibility: 'Independent verification' },
      ],
      proposals: [
        { contractor: 'api', taskIds: ['contract', 'integration'], requestedWorkers: 1,
          rationale: 'Contract is sequential; reuse worker for integration',
          design: 'Add compatible contract, verify behavior before migration',
          interfaceRefs: ['contract/auth-v1'], risks: ['Unknown external consumers'] },
        { contractor: 'web', taskIds: ['web-migration'], requestedWorkers: 1,
          rationale: 'One coherent consumer boundary', design: 'Migrate behind adapter',
          interfaceRefs: ['contract/auth-v1'], risks: ['Stale contract versions'] },
      ],
      integrationDecision: 'Approve staffing proposal of two workers; keep one session for coordination; independent inspection uses an available slot',
      tasks: [
        { id: 'contract', title: 'Characterize and extract authentication contract', owner: 'api-worker',
          dependsOn: [], resources: ['auth/schema'], acceptance: ['Existing success and error behavior preserved'], units: 10, priority: 100 },
        { id: 'web-migration', title: 'Migrate web consumer', owner: 'web-worker',
          dependsOn: ['contract'], resources: ['web/auth'], acceptance: ['Consumer contract tests pass'], units: 10, priority: 50 },
        { id: 'integration', title: 'Verify combined artifact', owner: 'api-worker',
          dependsOn: ['contract', 'web-migration'], resources: ['integration/auth'],
          acceptance: ['Combined exact revision passes required end-to-end checks'], units: 10, priority: 10 },
      ],
    }, approvals: [], runs: [], inspections: [], coordinationSessions: ['general'],
  };
}

export function simulatedApproval(record: RecordData): void {
  record.approvals.push({ planHash: planHash(record.plan), actor: 'owner', decision: 'approve',
    at: '2026-01-01T00:00:00Z', sourceRef: 'SIMULATION ONLY: fictional owner approval' });
}

export function simulatedPass(record: RecordData, taskId: string, attempt = 1, minute = 1): void {
  const task = record.plan.tasks.find(t => t.id === taskId)!;
  const at = (offset: number) => new Date(Date.UTC(2026, 0, 1, 0, minute, offset)).toISOString();
  const artifact = `simulation:${taskId}:v${attempt}`;
  record.runs.push({ task: taskId, actor: task.owner, attempt, state: 'submitted',
    startedAt: at(0), endedAt: at(10), unitsUsed: 5, artifact,
    dependencyArtifacts: Object.fromEntries(task.dependsOn.map(dep => [dep,
      record.runs.filter(r => r.task === dep).at(-1)!.artifact!])),
  });
  record.inspections.push({ task: taskId, attempt, artifact, reviewer: 'inspector',
    kind: 'independent', verdict: 'pass', at: at(20), evidence: ['SIMULATED evidence; no product tests run'], findings: [] });
}
