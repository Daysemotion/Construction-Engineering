import { RecordSchema, planHash } from './model.ts';
import type { RecordData } from './model.ts';

export interface CheckResult {
  valid: boolean; errors: string[]; warnings: string[]; planHash?: string;
  approved: boolean; ready: string[]; states: Record<string, string>;
  spentUnits: number; reservedUnits: number;
}

export function inspect(input: unknown): CheckResult {
  const result: CheckResult = { valid: false, errors: [], warnings: [], approved: false,
    ready: [], states: {}, spentUnits: 0, reservedUnits: 0 };
  const parsed = RecordSchema.safeParse(input);
  if (!parsed.success) {
    result.errors = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`);
    return result;
  }
  const record = parsed.data;
  const milliseconds = (at: string) => Date.parse(at);
  const { plan, runs, inspections, approvals } = record;
  const { limits } = plan;
  const error = (message: string) => result.errors.push(message);
  result.planHash = planHash(plan);
  const actors = new Map(plan.actors.map(a => [a.id, a]));
  const tasks = new Map(plan.tasks.map(t => [t.id, t]));
  if (actors.size !== plan.actors.length) error('Duplicate actor ID');
  if (tasks.size !== plan.tasks.length) error('Duplicate task ID');
  if (plan.tasks.length > limits.maxTasks) error('Task count exceeds maxTasks');
  const owners = plan.actors.filter(a => a.role === 'owner');
  const generals = plan.actors.filter(a => a.role === 'general');
  if (owners.length !== 1 || generals.length !== 1) error('Exactly one owner and one general required');
  const parents: Record<string, string[]> = {
    owner: [], general: ['owner'], subcontractor: ['general'],
    lead: ['subcontractor', 'lead'], worker: ['subcontractor', 'lead'], inspector: ['owner'],
  };
  for (const actor of plan.actors) {
    if (actor.role === 'owner') { if (actor.parent) error('Owner must have no parent'); }
    else if (!actor.parent || !parents[actor.role].includes(actors.get(actor.parent)?.role ?? '')) {
      error(`Invalid parent for ${actor.id}`);
    }
    const seen = new Set<string>();
    let cursor: string | undefined = actor.id;
    while (cursor) {
      if (seen.has(cursor)) { error(`Organization cycle at ${actor.id}`); break; }
      seen.add(cursor);
      cursor = actors.get(cursor)?.parent;
    }
    if (seen.size > limits.maxDepth) error(`Organization depth exceeded at ${actor.id}`);
  }
  const contractorOf = (actorId: string): string | undefined => {
    const seen = new Set<string>();
    let actor = actors.get(actorId);
    while (actor && !seen.has(actor.id)) {
      if (actor.role === 'subcontractor') return actor.id;
      seen.add(actor.id); actor = actor.parent ? actors.get(actor.parent) : undefined;
    }
  };
  const indegree = new Map<string, number>();
  const children = new Map<string, string[]>();
  for (const task of plan.tasks) {
    const actor = actors.get(task.owner);
    if (!actor || !['general', 'subcontractor', 'lead', 'worker'].includes(actor.role)) error(`Invalid task owner: ${task.id}`);
    if (new Set(task.dependsOn).size !== task.dependsOn.length) error(`Duplicate dependency: ${task.id}`);
    if (new Set(task.resources).size !== task.resources.length) error(`Duplicate resource: ${task.id}`);
    for (const resource of task.resources) {
      // Hierarchical logical resources; portable and independent of OS filesystem paths.
      if (!/^[a-z0-9_-]+(?:\/[a-z0-9_.-]+)*$/.test(resource) || resource.split('/').some(s => s === '.' || s === '..')) {
        error(`Invalid resource ${resource}: use lowercase logical paths`);
      }
    }
    indegree.set(task.id, task.dependsOn.length);
    for (const dependency of task.dependsOn) {
      if (!tasks.has(dependency)) error(`Unknown dependency ${dependency} in ${task.id}`);
      children.set(dependency, [...(children.get(dependency) ?? []), task.id]);
    }
    if (task.units > limits.budgetUnits) error(`Task reservation exceeds project budget: ${task.id}`);
  }
  const queue = plan.tasks.filter(t => t.dependsOn.length === 0).map(t => t.id);
  const order: string[] = [];
  for (let index = 0; index < queue.length; index++) {
    const current = queue[index]; order.push(current);
    for (const child of children.get(current) ?? []) {
      indegree.set(child, indegree.get(child)! - 1);
      if (indegree.get(child) === 0) queue.push(child);
    }
  }
  if (order.length !== tasks.size) error('Task graph has a cycle or unresolved dependency');
  const covered = new Set<string>();
  const proposing = new Set<string>();
  for (const proposal of plan.proposals) {
    if (actors.get(proposal.contractor)?.role !== 'subcontractor') error(`Invalid proposal contractor ${proposal.contractor}`);
    if (proposing.has(proposal.contractor)) error(`Duplicate proposal ${proposal.contractor}`);
    proposing.add(proposal.contractor);
    for (const taskId of proposal.taskIds) {
      if (covered.has(taskId)) error(`Overlapping proposal ownership: ${taskId}`);
      covered.add(taskId);
      const task = tasks.get(taskId);
      if (!task || contractorOf(task.owner) !== proposal.contractor) error(`Proposal crosses contractor ownership: ${taskId}`);
    }
  }
  for (const task of plan.tasks) {
    if (contractorOf(task.owner) && !covered.has(task.id)) error(`Missing subcontractor proposal: ${task.id}`);
    if (plan.mode !== 'small' && !contractorOf(task.owner)) error(`Standard/large work must belong to a subcontractor: ${task.id}`);
  }
  for (const approval of approvals) {
    if (actors.get(approval.actor)?.role !== 'owner') error('Only the recorded owner may approve or revoke');
  }
  const matching = approvals.filter(a => a.planHash === result.planHash).sort((a, b) => milliseconds(a.at) - milliseconds(b.at));
  if (matching.some((a, i) => i > 0 && milliseconds(a.at) === milliseconds(matching[i - 1].at))) error('Ambiguous approvals with equal timestamps');
  result.approved = matching.at(-1)?.decision === 'approve';
  if (!result.approved) result.warnings.push('No current approval; existing authorization must be recorded with its source');

  const histories = new Map<string, RecordData['runs']>();
  for (const run of runs) {
    const task = tasks.get(run.task);
    if (!task) { error(`Unknown run task ${run.task}`); continue; }
    if (run.actor !== task.owner) error(`Run actor differs from task owner: ${run.task}`);
    if (run.state === 'running') {
      if (run.endedAt || run.unitsUsed !== undefined || run.artifact) error(`Running attempt cannot have completion fields: ${run.task}`);
      result.reservedUnits += task.units;
    } else {
      if (!run.endedAt || run.unitsUsed === undefined) error(`Ended attempt needs endedAt and unitsUsed: ${run.task}`);
      if (run.endedAt && milliseconds(run.endedAt) <= milliseconds(run.startedAt)) error(`Attempt must end strictly after start: ${run.task}`);
      result.spentUnits += run.unitsUsed ?? 0;
    }
    if (run.state === 'submitted' && !run.artifact) error(`Submitted attempt needs artifact: ${run.task}`);
    if (run.unitsUsed !== undefined && run.unitsUsed > task.units) error(`Attempt exceeded reservation: ${run.task}`);
    const inputKeys = Object.keys(run.dependencyArtifacts).sort();
    if (JSON.stringify(inputKeys) !== JSON.stringify([...task.dependsOn].sort())) error(`Dependency inputs do not match plan: ${run.task}`);
    const authorization = matching.filter(a => milliseconds(a.at) <= milliseconds(run.startedAt)).at(-1);
    if (authorization?.decision !== 'approve') error(`Attempt started without matching approval: ${run.task}`);
    histories.set(run.task, [...(histories.get(run.task) ?? []), run]);
  }
  const reviews = new Map<string, RecordData['inspections'][number]>();
  for (const review of inspections) {
    const key = `${review.task}:${review.attempt}`;
    if (reviews.has(key)) error(`Duplicate inspection for ${key}; preserve rework as a new attempt`);
    reviews.set(key, review);
    const run = histories.get(review.task)?.find(r => r.attempt === review.attempt);
    if (!run || run.state !== 'submitted' || run.artifact !== review.artifact) error(`Inspection artifact/attempt mismatch: ${key}`);
    if (!actors.has(review.reviewer)) error(`Unknown reviewer: ${key}`);
    if (run && (!run.endedAt || milliseconds(review.at) < milliseconds(run.endedAt))) error(`Inspection predates submission: ${key}`);
    if (review.kind === 'independent' && (actors.get(review.reviewer)?.role !== 'inspector' || review.reviewer === run?.actor)) {
      error(`Independent inspection needs a distinct inspector: ${key}`);
    }
    if (plan.mode !== 'small' && review.kind !== 'independent') error(`Independent inspection required in ${plan.mode} mode: ${key}`);
    if (review.verdict === 'fail' && review.findings.length === 0) error(`Failed inspection needs findings: ${key}`);
  }
  const latest = new Map<string, RecordData['runs'][number]>();
  for (const [taskId, history] of histories) {
    history.sort((a, b) => a.attempt - b.attempt);
    if (history.length > limits.maxAttempts) error(`Attempt limit exceeded: ${taskId}`);
    for (let index = 0; index < history.length; index++) {
      const run = history[index];
      if (run.attempt !== index + 1) error(`Attempts must be unique and consecutive: ${taskId}`);
      const previous = history[index - 1];
      if (previous) {
        const review = reviews.get(`${taskId}:${previous.attempt}`);
        const finished = previous.state === 'submitted' ? review?.at : previous.endedAt;
        if (!finished || previous.state === 'running' || milliseconds(finished) > milliseconds(run.startedAt)) error(`Retry before prior attempt settled: ${taskId}`);
      }
    }
    latest.set(taskId, history.at(-1)!);
  }
  // Resolve full dependency lineage at a moment, so a historically accepted but now
  // stale intermediate result cannot be used to start a new downstream task.
  const snapshots = new Map<number, Map<string, string>>();
  const acceptedAt = (at: string): Map<string, string> => {
    const instant = milliseconds(at);
    if (snapshots.has(instant)) return snapshots.get(instant)!;
    const accepted = new Map<string, string>();
    for (const taskId of order) {
      const task = tasks.get(taskId)!;
      const previous = histories.get(taskId)?.filter(r => milliseconds(r.startedAt) <= instant).at(-1);
      const review = previous && reviews.get(`${taskId}:${previous.attempt}`);
      if (previous?.state === 'submitted' && previous.artifact && review?.verdict === 'pass' && milliseconds(review.at) <= instant &&
          task.dependsOn.every(dep => accepted.has(dep) && accepted.get(dep) === previous.dependencyArtifacts[dep])) {
        accepted.set(taskId, previous.artifact);
      }
    }
    snapshots.set(instant, accepted);
    return accepted;
  };
  // Verify dependency evidence at the time of each start, not just the current snapshot.
  for (const run of runs) {
    for (const [dependency, artifact] of Object.entries(run.dependencyArtifacts)) {
      if (acceptedAt(run.startedAt).get(dependency) !== artifact) {
        error(`Dependency was not accepted at start: ${run.task} <- ${dependency}`);
      }
    }
  }
  for (const taskId of order) {
    const task = tasks.get(taskId)!;
    const run = latest.get(taskId);
    if (!run) { result.states[taskId] = 'pending'; continue; }
    const stale = task.dependsOn.some(dep => result.states[dep] !== 'passed' || latest.get(dep)?.artifact !== run.dependencyArtifacts[dep]);
    if (stale) { result.states[taskId] = 'stale'; continue; }
    const review = reviews.get(`${taskId}:${run.attempt}`);
    result.states[taskId] = review ? (review.verdict === 'pass' ? 'passed' : 'rejected') : run.state;
  }
  // Replay the portions of history proven by supplied task timestamps. Finished
  // attempts must not erase an earlier capacity, resource, or budget violation.
  type Event = { at: number; kind: 'finish' | 'release' | 'start'; run: RecordData['runs'][number] };
  const events: Event[] = [];
  for (const run of runs) {
    if (!tasks.has(run.task)) continue;
    events.push({ at: milliseconds(run.startedAt), kind: 'start', run });
    if (run.endedAt) events.push({ at: milliseconds(run.endedAt), kind: 'finish', run });
    const review = reviews.get(`${run.task}:${run.attempt}`);
    const released = run.state === 'submitted' ? review?.at : run.endedAt;
    if (released) events.push({ at: milliseconds(released), kind: 'release', run });
  }
  const rank = { finish: 0, release: 1, start: 2 };
  events.sort((a, b) => a.at - b.at || rank[a.kind] - rank[b.kind]);
  const activeHistory = new Map<string, RecordData['runs'][number]>();
  const heldHistory = new Map<string, string[]>();
  let historicalSpent = 0;
  let historicalReserved = 0;
  for (const event of events) {
    const { run } = event;
    const key = `${run.task}:${run.attempt}`;
    const task = tasks.get(run.task)!;
    if (event.kind === 'finish') {
      activeHistory.delete(key);
      historicalReserved -= task.units;
      historicalSpent += run.unitsUsed ?? 0;
    } else if (event.kind === 'release') heldHistory.delete(key);
    else {
      if ([...activeHistory.values()].some(other => other.actor === run.actor)) error(`Historical actor overlap: ${key}`);
      if ([...heldHistory.values()].some(resources => conflicts(resources, task.resources))) error(`Historical resource conflict: ${key}`);
      activeHistory.set(key, run); heldHistory.set(key, task.resources);
      historicalReserved += task.units;
      if (activeHistory.size > limits.maxConcurrent) error(`Historical concurrency exceeded: ${key}`);
    }
    if (historicalSpent + historicalReserved > limits.budgetUnits) error(`Historical budget exceeded at ${key}`);
  }
  const running = runs.filter(r => r.state === 'running');
  const coordination = record.coordinationSessions;
  if (new Set(coordination).size !== coordination.length) error('Duplicate coordination session');
  for (const actorId of coordination) {
    if (!actors.has(actorId) || actors.get(actorId)?.role === 'owner') error(`Invalid coordination session ${actorId}`);
    if (running.some(r => r.actor === actorId)) error(`Session double-counted as coordinator and worker: ${actorId}`);
  }
  if (new Set(running.map(r => r.actor)).size !== running.length) error('One actor cannot run multiple attempts concurrently');
  if (running.length + coordination.length > limits.maxConcurrent) error('Concurrent execution limit exceeded');
  const held: { task: string; resources: string[] }[] = [];
  for (const [taskId, run] of latest) {
    if (run.state === 'running' || (run.state === 'submitted' && !reviews.has(`${taskId}:${run.attempt}`))) {
      const resources = tasks.get(taskId)!.resources;
      if (held.some(h => conflicts(h.resources, resources))) error(`Shared resource conflict: ${taskId}`);
      held.push({ task: taskId, resources });
    }
  }
  if (result.spentUnits + result.reservedUnits > limits.budgetUnits) error('Project budget exceeded');
  if (Object.values(result.states).includes('stale')) result.warnings.push('Stale downstream results require rework/reinspection on current inputs');
  result.valid = result.errors.length === 0;
  if (!result.valid || !result.approved) return result;
  let free = limits.maxConcurrent - running.length - coordination.length;
  let remaining = limits.budgetUnits - result.spentUnits - result.reservedUnits;
  const candidates = [...plan.tasks].sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id));
  const busyActors = new Set([...running.map(r => r.actor), ...coordination]);
  for (const task of candidates) {
    const history = histories.get(task.id) ?? [];
    const state = result.states[task.id];
    if (free <= 0 || !['pending', 'failed', 'cancelled', 'rejected', 'stale'].includes(state)) continue;
    if (busyActors.has(task.owner)) continue;
    if (held.some(h => h.task === task.id)) continue;
    if (history.length >= limits.maxAttempts) continue;
    if (task.dependsOn.some(dep => result.states[dep] !== 'passed')) continue;
    if (task.units > remaining || held.some(h => conflicts(h.resources, task.resources))) continue;
    result.ready.push(task.id); free--; remaining -= task.units;
    busyActors.add(task.owner);
    held.push({ task: task.id, resources: task.resources });
  }
  return result;
}

export function conflicts(left: string[], right: string[]): boolean {
  return left.some(a => right.some(b => a === b || a.startsWith(`${b}/`) || b.startsWith(`${a}/`)));
}
