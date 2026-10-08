# Execution, conflicts, and recovery

## Lifecycle and eligibility

Use planned → eligible → running → submitted → inspection passed.
Rejection creates a new attempt. Blocked, cancelled, and failed are not completed; record reasons and next decisions.
Delivery also requires integrated verification and commissioned acceptance criteria.

Eligibility requires authorization, accepted prerequisites, exact inputs, conflict-free resources,
and available concurrency, cost, and attempts. Acquire resources together or release them together.

## Actual delegation

Create agents only when host tools and authority permit. Send a bounded packet and associate the session with its task.
Count active general-contractor, subcontractor, lead, worker, inspector, and nested-agent sessions globally.
Do not replicate parent limits in every team. Without tools, execute sequentially and disclose the limitation.

## Shared workspaces

- Assign write ownership and resource IDs for shared files, schemas, lockfiles, and deployment settings.
- Separate workspaces do not remove API/data-contract coordination.
- Resolve contention by prerequisite impact, total delay, risk, and available alternative work.
- Re-evaluate waiting work to prevent starvation.
- Assign integration ownership; verify the exact combined revision.
- Preserve user changes. Do not overwrite ambiguity or use broad reset/clean operations.

## Handoff and restart

Record accepted artifacts, active attempts, changed files/commits, commands/results, unfinished work,
possible external effects, and next actions. Compare records with actual state on restart.
A running record does not justify repeating work. Check live processes and external completion.
Use task/attempt IDs to find previous work; issue new attempts only after prior termination is established.
Use host session status, process identity including start time, exit/completion records, and artifact or external
operation status as available evidence. A missing PID or stale timestamp alone does not exclude detached work.
If identity or effects cannot be reconciled, hold affected execution and request host-specific recovery evidence;
do not kill an unrelated process merely to clear a port or free a resource.

Include unresolved blockers, their cause and responsible party, the last confirmed effect, resume conditions,
retry bounds, and the earliest retry time when known. On restart, check permissions, current input versions,
resource ownership, and whether the previous action completed before dispatching anything again.

A remote runtime needs leases, heartbeats, fencing tokens, atomic allocation, and transactional state.
Neither these documents nor the checker implements that runtime. Use one writer for file-based records.

## Failure handling

Record a blocker ID, task/attempt, cause, evidence, affected scope, responsible party, return stage,
next action, resume condition, and retry limit. A blocker is not an inspection verdict.

| Cause | Route and next action | Resume condition |
|---|---|---|
| Implementation defect | Worker through its subcontractor; correct against the accepted design | Corrected artifact submitted for the affected checks |
| Ambiguous or missing requirement | Accountable subcontractor's design stage | Revised design and QA scenarios inspected under change control |
| Conflicting trade contracts | General contractor's reconciliation stage | Target contract, writers, sequence, and affected checks settled and design accepted |
| Environment or transient tool failure | Assigned environment/tool operator; inspect effects before bounded recovery | Environment check passes and duplicate execution has been ruled out |
| Shared resource occupied | General contractor schedules independent work and reviews waiting priority | Actual ownership is released and current prerequisites remain accepted |
| Usage limit | Coordinator records reset/retry information and preserves state | Capacity is available within authority and budget; host explicitly resumes execution |
| Missing authority | General contractor checks existing delegation and prepares only the missing decision | Required authority is supplied; unrelated authorized work continues |
| Context loss | Assigned executor reconstructs from accepted references and checkpoint | Current inputs, effects, and unfinished work are understood |

Use the inspection findings to route rework; do not return every rejection to implementation.
Set a proportional retry bound before retrying. Repeated failure with the same cause goes to the general
contractor for revised decomposition, design, environment recovery, or assignment before further attempts.
Record a changed approach and remaining budget; never reset attempt history to evade limits.
Scope expansion follows [change control](planning.md), not weakened criteria.
Waiting records do not schedule wakeups or confer permission. Automated waiting/resumption needs a host/runtime facility.

## Context handoff

Prepare a compact common packet of accepted requirements, architecture, contracts, and rules with versions.
Add role-specific inputs, assigned scope, QA criteria, and the last checkpoint. Keep implementation conversation
separate from the inspector's independent assessment; give the inspector authoritative criteria and actual artifacts.
Update affected packets when upstream contracts change and revalidate dependent results.
Session forks or cached prompts are optional host optimizations, not authority, independent inspection,
or evidence of cost savings. Do not clone stale context or broadcast all conversations to all trades.

## Observability

Where measured, record lead time, rejection/rework, resource waiting, duplicate work, and actual consumption.
Agent confidence and message counts are not quality metrics.
