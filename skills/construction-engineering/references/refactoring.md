# Large changes and refactoring

## Baseline

Distinguish behavior preservation from intended behavior changes and track them separately.
Inventory public APIs, formats, errors, permissions, performance constraints, and build/deployment consumers.
Record baseline tests and failures. Add targeted characterization where affected behavior lacks a baseline.

## Decomposition

Use impact and ownership boundaries, not mandatory frontend/backend divisions.
Possible trades: contracts/adapters, consumer migration, data transition, integrated verification.
Assign shared foundations one owner; bind consumers to explicit versions.
Track runtime consumers, external APIs, and migrations separately from mechanical file renames.

## Migration waves

1. Establish baseline and behavior-preservation evidence.
2. Add new structure and compatibility adapter while retaining the old path.
3. Migrate a small consumer set; run differential, contract, and integration checks.
4. Expand by waves, holding affected expansion when earlier failures remain unresolved.
5. Remove old paths only after consumer coverage and relevant observations justify it.

Check authority for deletion, data conversion, and deployment. Irreversible data changes need explicit recovery.
Do not include unauthorized behavior changes under the name of refactoring.

## Verification and rollback

Compare outputs, errors, and side effects for equivalent inputs.
Measure performance in comparable environments with agreed tolerances.
Identify rollback commits/configuration, data recovery, triggers, and ownership.
Rehearse where feasible before claiming recoverability.
Completion depends on affected consumer migration, compatibility, and readiness, not test count.

## Scaling

Keep the overall plan at milestone/contract level; detail the next wave.
Allocate workers when needed and reduce implementation throughput when inspection becomes the bottleneck.
Keep global context compact and link detailed records. Preserve failures, unknowns, and pending decisions in summaries.
