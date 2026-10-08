# Operating model

## Purpose

Translate the owner's objective into specialist proposals. The general contractor reconciles interfaces,
schedules, resources, and accountability. Preserve traceability as scope grows.
The organization describes responsibility; the task graph describes prerequisites. Keep them separate.

## Choose a scale

| Mode | Signals | Operating requirements |
|---|---|---|
| Small | One boundary, explicit criteria, limited impact | Combined coordination/execution roles, concise plan and verification |
| Standard | Multiple boundaries, shared interfaces or resources | Subcontractor proposals, integrated dependency graph, independent inspection |
| Large | Multiple subsystems, staged migration, significant impact | Standard plus planning waves, integration ownership, change/recovery records, capacity management |

Do not classify by file count alone or preallocate a fixed hierarchy.
Roles are logical responsibilities; actual sessions depend on independence, cost, and host capacity.
If one session performs multiple roles, disclose that fact and do not claim independent inspection.

## Lifecycle

1. Intake: objective, exclusions, acceptance criteria, existing authorization, external effects.
2. Discovery: code structure, baseline tests, impact, external contracts. Label unknowns.
3. Trade allocation: subcontractor boundaries, inputs, proposed shared contracts.
4. Subcontractor planning: designs, work packages, staffing rationale, dependencies, alternatives.
5. Reconciliation: resolve incompatible contracts, excessive staffing, dependency cycles.
6. Authorization: bind scope to a plan version; apply existing delegation where applicable.
7. Design inspection: apply the [stage gates](quality.md) to the reconciled design and QA plan before affected implementation.
8. Execution: dispatch eligible work; record artifacts, changes, consumption, blockers.
9. Inspection: code review, trade QA, and combined-artifact verification using the stage gates.
10. Delivery: inspected documentation, requirement-to-evidence mapping, unresolved issues, operation and recovery guidance.

Material changes can return to planning. In-scope sequencing belongs to the general contractor.
Failures do not automatically require owner intervention: perform authorized rework within its limits.

## Organization and graph

Owner → general contractor → subcontractor → optional team lead → worker.
Independent inspectors report evidence without allowing the implementation chain to override findings.
Shared records exist outside conversations. Messages support negotiation; authorized records determine execution.
Keep prerequisite graphs acyclic. Represent rework as another attempt, not a prerequisite cycle.

## Resource economics

Never sum currency, tokens, and time as one metric. Label estimates and unmeasured quantities.
Concurrency is constrained by independent work, shared resources, inspection capacity, and host/model limits.
Merge work packages when handoff cost exceeds execution value. Add leads only for demonstrated coordination needs.
