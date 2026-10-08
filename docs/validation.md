# Validation record

Date: 2026-10-08 (Asia/Seoul). Release: 0.1.0.

## Scope

The deliverable is a reusable operating skill and an offline TypeScript consistency checker.
Validation covers that deliverable, not the quality of a real product built by an autonomous agent fleet.
No paid model API, production service, deployment, or customer data was used.

## Automated checks

The suite contains 49 tests, including:

- Unapproved plans cannot produce dispatch suggestions; changed plan content invalidates approval.
- Owner-only declared approvals, revocation, ambiguous timestamps, and start-time authorization.
- Unknown/duplicate graph references, cycles, organization depth, and subcontractor proposal coverage.
- Resource path boundaries, shared resources, actor exclusivity, and global recorded session limits.
- Actual consumption, running reservations, failed attempts, and historical oversubscription.
- Independent inspection identity, exact artifact binding, inspection chronology, and bounded rework.
- Transitive staleness and rejection of stale intermediate inputs at historical start time.
- Strict input parsing and supported timestamp precision.
- A synthetic 2,000-task dependency chain and 78 deterministic DAG variations.
- CLI initialization, draft checking, reports, malformed JSON, explicit simulation labels, and overwrite refusal.
- Self-contained skill installation and refusal to replace an existing destination.
- Project-scoped installation with spaces in paths, preservation of project/customized files,
  explicit destination support, and rejection of missing scope or invalid project directories.
- Staged workflow records: design rejection, shared configuration handoff, failed integration, and staleness through documentation.

TypeScript type checking, local Markdown link checks, English-document checks, generated JSON Schema,
and the skill-creator validator are also part of release verification.
The 2,000-task case tests graph bookkeeping with synthetic records, not 2,000 live agents or production throughput.

## Independent forward testing

An independent agent applied the skill to an authentication-refactor scenario with API/web/mobile consumers,
conflicting staffing requests, three global sessions, shared schema ownership, an existing mobile failure,
an upstream artifact change, and unavailable independent inspection.

That pass identified unclear gating for unavailable reviewers and existing failures. The quality procedure now
distinguishes self-checks from independent acceptance and classifies baseline/candidate failures by impact.
The execution guide explicitly counts coordinators and reviewers in the global session budget.

A separate read-only pass over the checker reproduced two additional issues:

1. Completed attempts concealed historical concurrency/resource/reservation conflicts.
2. Accepted submillisecond timestamps lost precision during comparison.

The checker now replays recorded task intervals and settlements, and rejects unsupported timestamp precision.
Four regression tests cover historical capacity, resources, budgets, actor overlap, and precision handling.

An early test incorrectly expected all work to stop when one submitted artifact held a resource. It was corrected
to assert that unrelated work remains eligible in a fixture with no prerequisite connection.

## Operational limits

The workflow update also received an independent read-only behavioral evaluation: conflicting timeout/retry
proposals, missing cancellation semantics, mismatched configuration versions, an occupied QA port, a proposed
criteria reduction, and an unknown running process after restart. The evaluator held affected acceptance,
preserved existing authority, routed design and environment issues separately, and allowed unrelated work.
Two clarifications were incorporated: exception acceptance never counts as independent inspection, and restart
reconciliation needs host/process/effect evidence rather than a missing PID. This was a hypothetical walkthrough,
not live orchestration or an independent code audit.

- No authenticated approval service, immutable audit store, agent launcher, or permission sandbox is implemented.
- Evidence references are structurally required but not opened or executed by the checker.
- Reported identities and consumption must come from trusted host observations.
- Current coordination-session capacity is checked; its historical timeline is not represented.
- Priority ordering is deterministic and does not automatically implement fairness or starvation prevention.
- Large refactoring and migration procedures were scenario-tested, not run against a production monorepo.
- Personal skill installation enables discovery; automatic invocation remains a host decision.
- Stage meaning, contract negotiations, blocker routing, and context packets are documentation procedures;
  the version-1 checker validates their explicitly supplied task graph, not their completeness or semantic correctness.

## Repeat verification

Run `npm ci`, `npm run schema`, `npm run examples`, and `npm run check` in the toolkit repository.
Run the host's skill-creator `quick_validate.py` against the skill folder when available.
Use an isolated Python environment with PyYAML for that validator; it is not a runtime dependency of the kit.
Inspect real failure evidence before changing policy. Do not translate a successful synthetic check into a production claim.
