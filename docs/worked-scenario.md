# Worked scenario: authentication refactor

This is a planning exercise, not a claim that a product was built or its tests were executed.

## Commission

Preserve authentication behavior while restructuring an API used by web and mobile.
Repository edits are authorized without additional approval; production deployment is excluded.
The host supports three total active sessions. API requests four workers; web requests three.
Both need the shared authentication schema. A mobile test already fails at baseline.

## Subcontractor proposals and reconciliation

Keep the API and web staffing requests as proposals, not automatically granted allocations.
Require their decomposition, interface assumptions, and parallelism rationale. Assign mobile accountability explicitly.
The general contractor reserves its active session, leaving at most two simultaneous worker/reviewer slots.
Assign schema write ownership to the API trade. Consumer characterization can proceed without modifying it.
Do not invent actual contractor reports when only headcounts are supplied.

## Plan

Baseline characterization → compatible contract extraction → inspected API artifact → web/mobile migration
→ exact combined artifact → integrated inspection → delivery report.
Independent consumer characterization can occur before extraction; implementation relying on a new contract waits for it.
The owner has already authorized in-scope implementation. Record that source rather than requesting it again.

## Existing mobile failure

Capture its signature at baseline and candidate revisions. Determine whether authentication acceptance is affected.
An unrelated unchanged defect does not stop unrelated implementation. A relevant or unexplained failure leaves the
associated criterion unproven. Report the suite's true state; do not declare all tests passed.

## Upstream change

API A1 passed; web W1 used A1. When A2 is introduced, retain the A1/W1 historical record but invalidate W1's
eligibility against A2. Trace mobile and combined artifacts too. Inspect A2, then rework or revalidate consumers.
Continue unaffected work. In-scope rework does not require a new owner decision.

## Reviewer unavailable

Record self-check results and independent inspection as pending/unavailable. Prepare tests and unrelated work,
but do not promote the artifact to an independently accepted prerequisite. Ask for a criterion change only if
the needed authority is absent; do not manufacture an inspector identity. The standard-mode checker stays strict.

## Delivery disposition

Report implementation, verified criteria, baseline defects, missing independent evidence, and recovery separately.
Do not claim production deployment or human acceptance. A rollback plan is not a rehearsed rollback unless executed.

## Smaller work

For a local typo or contained low-impact fix, use small mode: one owner/implementer role chain, a concise record,
and appropriate direct verification. Do not instantiate subcontractors and extra agents merely to resemble the example.
