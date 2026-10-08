# Shared API workflow walkthrough

This fictional walkthrough applies the canonical procedures in the
[skill](../skills/construction-engineering/SKILL.md). It is not a record of live agents or product tests.

## Commission and proposals

The owner authorizes an in-scope reliability improvement, excluding deployment and paid services.
The web subcontractor proposes a longer timeout; the API subcontractor proposes fewer retries.
Both identify `config/api` as shared and name the API contract's providers and consumers.
The general contractor reconciles their proposals using the existing authorization, without another owner prompt.

The target design defines request deadlines, maximum attempts, cancellation propagation, and compatibility.
Requirement R-CANCEL says cancellation must prevent subsequent retries. Scenario QA-CANCEL sends a request,
cancels it during a retry delay, and observes whether another request is issued. Results are still proposed.
The general contractor assigns one writer per turn and gives waiting trades independent fixture preparation.

## Design rejection and correction

An independent inspector finds cancellation behavior missing from the first design artifact D1.
Affected implementation remains held. The API subcontractor revises the design with web input; the general
contractor reconciles it. D2 and its QA scenarios pass design inspection. No worker silently weakens R-CANCEL.
If the correction changes plan fields, archive the earlier plan/record and bind the revised plan to the existing
authority where covered, as described in the machine contract.

## Implementation, QA, and integration

API writes the shared configuration and submits A1. Its declared resource remains held until inspection settles.
Web then checks the accepted artifact and actual workspace, acquires its turn, and submits W1.
Separate QA executors test the trade outputs against the accepted scenarios. Those local passes do not imply
system acceptance. The integration owner prepares a manifest of A1, W1, D2, and the exact combined revision.

Combined QA finds a retry still occurs after cancellation. The general contractor routes this implementation
defect to the responsible subcontractor, preserving the failed evidence and holding documentation acceptance.
After correction, affected trade checks and integration are repeated against the new versions. Documentation
is updated and inspected against the accepted combined revision before the handover report.

## Environment interruption and restart

If the QA server fails to start, record an environment blocker rather than a product defect or successful QA.
Assign recovery, a bounded retry, and a resume condition: server health check passes and no prior test process
is still executing. On restart, inspect process state, changed files, contract versions, and previous effects.
Do not spawn a duplicate attempt just because the worklog says running. If the cause repeats, return it to the
general contractor to change the approach. This walkthrough does not implement automatic restart or locking.

## Checker coverage

[Workflow tests](../tests/workflow.test.ts) exercise synthetic records for rejected design, serialized shared
configuration with independent work, failed integration, and transitive invalidation through documentation.
They demonstrate the existing dependency and resource rules on a staged graph. The checker does not know
that a task is a design gate, evaluate QA-CANCEL, authenticate inspectors, or enforce the worklog's blockers.
Real execution and evidence assessment remain necessary.
