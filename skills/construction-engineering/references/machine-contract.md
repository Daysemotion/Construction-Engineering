# Optional machine-readable record contract

The companion TypeScript toolkit validates a single project's supplied record and suggests a next batch.
Its canonical runtime schema is `src/model.ts` in the toolkit repository; `schemas/record.schema.json`
is generated from it for editors. The portable skill does not require the toolkit or Node.js.

## Record sections

| Section | Meaning |
|---|---|
| plan | Versioned objective, exclusions, organization, subcontractor proposals, integrated decision, task graph and limits |
| approvals | Owner decision, exact plan hash, timestamp, and real source reference |
| runs | Task attempts, actual actor, timestamps, status, input versions, artifact and resource consumption |
| inspections | Exact task/attempt/artifact, reviewer, independence, verdict, evidence references, findings |
| coordinationSessions | Currently active coordination/inspection actors that consume slots but are not running a task |

IDs use ASCII letters, numbers, underscore, and hyphen. Resource names are lowercase logical paths,
such as `auth/schema`; they are not filesystem paths or glob patterns. Parent/child paths conflict.
Map actual shared files, contracts, and external services to resource names deliberately.
The checker cannot detect undeclared semantic collisions.
Timestamps are UTC with at most three fractional-second digits; ended attempts must end after they start.

The organization has one owner and one general contractor. Subcontractors report to the general contractor;
leads/workers report within their subcontractor; independent inspectors report to the owner.
Standard/large tasks must belong to a subcontractor and be covered by its proposal.
Small mode may assign work directly to the general contractor. Roles do not create real sessions.

## Plan hashing and authorization

`hash` calculates SHA-256 of a canonical validated plan: sorted object keys, preserved array order.
Changing any plan field requires a matching authorization record. Existing authorization may cover a revised
plan; record that actual source instead of requesting approval again unnecessarily. Otherwise obtain it.
The latest matching owner decision controls new dispatch; revocation stops recommendations.
Historical starts must have matching authorization effective at start time.

Records are editable local files, not signed approvals. The checker cannot authenticate the person named,
validate a source reference, or distinguish a forged report from a truthful one. Do not claim it can.
Keep archived plan versions and their execution records separately; changing a plan under old runs causes
the checker to reject their approval binding. Use separate wave records and document cross-wave input artifacts.
Version 1 does not automatically migrate histories or resolve cross-project dependencies.

## Attempts, inspection, and staleness

Attempts are consecutive from one per task. Ended attempts include an end time and measured usage in
the plan's declared unit; running attempts reserve the task's full per-attempt units.
Submitted attempts additionally require an artifact identifier. One final inspection is recorded per attempt;
further work or reinspection is another attempt. All earlier records remain intact.

Inspections bind the exact artifact. Standard/large records require an inspector identity distinct from
the worker. This checks declared identity only; actual separation is an operating responsibility.
Evidence references are not opened or executed. Semantic acceptance remains the inspector's responsibility.

A changed upstream artifact makes downstream results stale, transitively. Stale results cannot satisfy
prerequisites. A running stale attempt still occupies its slot/resource until the operator confirms termination.
Do not relabel it cancelled merely to free a slot if it is still running.

## Resource accounting and recommendations

- Global active slots include running task attempts and coordinationSessions, including inspectors.
- One actor runs at most one task at once. Coordination identities cannot simultaneously occupy a worker slot.
- Running tasks reserve units. All ended attempts, including failures, consume their recorded actual units.
- A running or uninspected submitted attempt holds declared resources.
- The next-batch suggestion reserves slots, resources, actors, and units across all tasks it recommends.
- Candidates sort by descending priority, then ID. The operator must review waiting-task starvation.
- Retry and task-count limits are explicit. Structural errors produce no dispatch recommendations.

`valid: true` means the record is structurally consistent; it does not mean authorized, ready, product-tested,
or delivered. A valid draft can be unapproved; a valid record can have no ready work because of dependencies,
capacity, exhaustion, or inspection. Read states and limits alongside the ready list.

## Operational boundary

### Encoding stage gates without a schema extension

Represent design, implementation, trade QA, integration, and documentation as ordinary tasks with explicit
acceptance criteria and dependencies. A design task's accepted artifact contains the reconciled design and
QA plan; implementation depends on it. Each trade QA task depends on its implementation. Integration depends
on all relevant accepted trade outputs; documentation depends on the accepted combined artifact.
Assign each task to its accountable subcontractor and include it in that subcontractor's proposal.
For an independent trade QA task, use an executor distinct from the implementation worker; the inspector
accepting the QA report must also satisfy the existing inspection identity rules.

The checker enforces the supplied graph and artifact bindings, not the meaning of stage names. It cannot
detect an omitted design/integration task, infer all consumers, verify real QA independence across tasks,
or judge whether scenarios cover requirements. The coordinator and inspector must check those obligations.
Version 1 has no blocker, stage, context-packet, or contract-negotiation fields. Keep those in the linked worklog
using the project record template; do not add unknown JSON fields or invent an accepted artifact to unblock work.
An operational hold can remain even when the checker recommends a task: recommendations never override the
coordinator's blocker/resume checks. Keep actual live runs recorded until termination is confirmed.
This is a documentation protocol update; existing version-1 records remain compatible.

### Runtime limits

This is an offline checker, not an agent runtime, transaction coordinator, filesystem sandbox, cost meter,
identity provider, or immutable audit log. Recommendations are snapshots, not locks or work permits.
Record reads/writes must have one coordinator; never run parallel writers against the same JSON file.
Before dispatch, verify actual session state and re-check the latest record. Real runtime integration must
enforce permissions, atomically allocate work, meter usage, and survive crashes independently.
The checker validates current contention and recorded dependency chronology, not a complete historical
timeline of coordination sessions. It also replays recorded task intervals, resource holds, and budget
reservations so completed attempts cannot conceal past violations. Historical coordination capacity
cannot be reconstructed from a current snapshot. Unknown usage must not be reported as zero measured usage.
