# Subcontractor planning, reconciliation, and authorization

## Subcontractor proposal

1. Assigned outcomes, criteria, design choices, alternatives.
2. Independently verifiable work packages and prerequisite artifacts.
3. Deliverables, shared resources, checks, recovery approach per package.
4. Requested roles and concurrency, justified by independent work, coordination cost, and inspection capacity.
5. Contracts, inputs, and timing required from other trades.
6. Risks, assumptions, estimated cost range, rework limits.

Assign requirement IDs and prepare development work items and separate QA scenarios before implementation.
For each scenario, specify requirement IDs, inputs, expected behavior, relevant failure/boundary cases,
environment, and intended evidence. A planned scenario is not an executed test.

Use justified staffing rather than fixed headcounts. Propose discovery where estimates are not credible.

## General-contractor reconciliation

- Check coverage and duplication against requirements.
- Name providers and consumers of APIs, schemas, shared types, deployment environments.
- Resolve cycles through contract-definition tasks, stubs, or compatibility adapters.
- Assign a shared-resource writer or sequence. Separate workspaces do not resolve semantic conflict.
- Include inspection and integration capacity in the global resource calculation.
- Preserve proposals and explain accepted, reduced, or expanded staffing requests.

## Design inspection

After reconciliation, submit the versioned design, requirements, development items, QA scenarios,
contract versions, and resource assignments to the designated inspector. Inspection checks coverage,
ambiguous behavior, feasibility, compatibility, and whether the proposed evidence can demonstrate the criteria.
Use the [stage gates](quality.md) for the pass decision and independence requirements.
Do not begin affected implementation until its design is accepted; authorized discovery and unrelated work may continue.
Design acceptance is a technical decision, not a new owner authorization request.

## Shared-contract negotiation

Trigger negotiation when multiple trades change or consume an API, schema, shared configuration,
or other behavioral contract, even when they edit different files or use separate worktrees.

1. Each proposing subcontractor records the change ID, purpose, current contract version, proposed behavior,
   compatibility impact, consumers, shared resources, and QA scenarios.
2. The general contractor obtains affected trades' requirements, resolves incompatible assumptions, and records
   a single target contract. Unresolved behavior holds only dependent work; file sequencing alone cannot resolve it.
3. Name the contract custodian, implementation writer or explicit writer sequence, integration owner,
   affected tasks, and alternative work for waiting trades. Review waiting work to prevent starvation.
4. Record the decision, authority source, effective contract version, and design-inspection result.
   Use existing delegated authority for in-scope decisions; escalate only decisions outside that authority.
5. Writers use the accepted version. On handoff, verify the predecessor's accepted artifact and actual workspace
   before acquiring the shared resource. Release it only after work and required inspection settle.
6. Revalidate affected consumers and the combined artifact. Preserve superseded evidence and mark its current
   applicability unverified until impact-appropriate checks pass.

For example, a web trade's longer timeout and an API trade's reduced retry policy require one agreed
timeout/retry/cancellation contract. Assigning turns on a configuration file does not establish that agreement.
The coordinator records and checks ownership; actual mutual exclusion requires host/runtime support.

## Authorization

| Situation | Action |
|---|---|
| Owner explicitly requires plan approval | Prepare a concrete integrated proposal, then request approval |
| Owner already authorized autonomous completion | Record the source and scope; proceed within it |
| Reallocation or sequencing stays in scope | General contractor decides and records rationale |
| Scope, budget, or access exceeds authority | Prepare impact and alternatives; hold only affected actions |
| External side effect has unclear authority | Resolve specific authorization before execution |

Record plan version, scope, limits, decision, and source. Documents do not create authorization.
Silence, elapsed time, and an agent's report are not owner approval.
Delegation does not automatically carry into unrelated projects. User and host instructions take precedence.

## Change control

Record change ID, rationale, previous/new contract, affected work/evidence, resource impact,
alternatives, decision-maker, authority, and effective version.
Trace downstream consumers when an accepted upstream artifact changes.
Never adjust criteria just to hide failure. Preserve findings when criteria legitimately change.

Workers may report completion and propose corrections, but cannot silently rewrite requirement wording,
exclusions, or acceptance criteria. The accountable subcontractor revises its design through a change request;
the general contractor reconciles cross-trade effects and records the decision under existing authority.
Reinspect affected design and QA scenarios before resuming dependent implementation. Preserve the previous version.

Example: web W1 passed against API A1. When A2 replaces A1, retain that historical evidence,
but mark W1's suitability for A2 unverified. Trace integration artifacts transitively.
Inspect A2 and revalidate or revise consumers. An assertion of no impact still needs evidence.

## Owner-facing proposal

Make scope, uncertainty, staffing, recommendation, and risks understandable without reading every report.
Report criteria as completed, awaiting inspection, or blocked instead of unsupported completion percentages.
