# Self-checks, independent inspection, and acceptance

## Evidence levels

| Level | Meaning |
|---|---|
| Proposed | Planned check, not executed |
| Self-check | Implementer records actual commands, inputs, results |
| Independent inspection | Separate execution identity verifies exact artifact against criteria |
| Integrated inspection | Combined trade outputs verified as an exact system revision |

Changing a role name within one session is self-review. Separate agents can share blind spots;
also use executable tests, differential comparison, and requirement traceability.

## Unavailable independent inspection

Independent inspection is mandatory by default in standard/large modes.
Record self-check success separately from pending independent inspection.
Continue unrelated discovery, test preparation, and stub work that does not rely on the unaccepted artifact.
Do not use pending artifacts as accepted prerequisites or declare final acceptance.
If criterion-change authority was already delegated, record rationale, substitutes, and residual risk.
Otherwise request only that missing decision. Never relabel the project small to bypass inspection.
The checker does not support exception acceptance in standard/large modes; report such decisions separately.
For an authorized exception, record the authority source, affected criteria/artifacts, unavailable inspection,
substitute evidence, decision-maker, and residual risk. Label the disposition accepted by authorized exception;
independent inspection remains unavailable, not passed. Do not forge a passing checker inspection for the substitute.

## Known baseline failures

Record failure fingerprint, baseline/candidate reproduction, affected requirements, and regression assessment.
Unchanged unrelated baseline defects do not block unrelated work, but do not make the suite green.
Failures affecting required behavior, or with unexplained impact, leave those criteria unproven.
Do not hide regressions inside baseline failures or delete tests merely to pass.

## Before implementation

Define observable criteria with meaningful failure/boundary conditions.
Record commands, expected results, fixtures, environment, and baseline failures.
Avoid tests duplicating implementation and disproportionate testing of low-impact wording changes.

## Stage gates

Stages describe work, not additional management layers. In standard/large work, express material gates as
separate dependency tasks when using the checker. Each task's accepted artifact unlocks its dependents.
The inspector evaluates the exact submitted version; an author's summary cannot substitute for the artifact.

| Gate | Submission | Pass condition |
|---|---|---|
| Design | Reconciled design, requirement IDs, development items, QA scenarios, input contracts | Mandatory behavior is unambiguous, covered, feasible, and verifiable; shared-contract decisions are resolved |
| Implementation | Exact code revision, input versions, self-check results | Code meets the accepted design, relevant tests and code review support the criteria, blocking findings resolved |
| Trade QA | Accepted implementation, approved scenarios, actual execution evidence | Required normal, failure, and boundary behavior verified in the applicable environment |
| Integration | Manifest of exact trade outputs and contract versions, combined revision, integration scenarios | Required interactions work together; individual passes do not override a failed combined check |
| Documentation and handover | Documentation revision linked to the accepted implementation/integration artifact | Architecture, changed contracts, decisions, operation and recovery guidance agree with the delivered system |

For small, low-impact work, combine applicable gates in a concise verification record and explain omitted gates.
Do not require browser QA for a documentation edit or a new wiki for an existing well-documented project.
For standard/large work, preserve independent inspection as defined above. If unavailable, hold affected acceptance
and follow the existing exception procedure rather than inventing a reviewer.

Inspectors report findings and reinspection scope; they do not edit the artifact they are independently inspecting.
If an inspector becomes an implementer, assign a different independent inspector for that changed artifact.
Read-only tool permissions should enforce this where available; prose alone does not restrict tool access.

## Execution evidence and integration

Trace requirement ID → development item → QA scenario → evidence → inspected artifact.
For executed checks, record the command or UI procedure, environment, expected/actual result, timestamp,
executor, and log or screenshot reference; include an exit code for commands and hashes where available.
Verify relevant evidence exists and matches the target version. File existence or a hash does not prove correctness.
Keep proposed, unexecuted, failed, and successful checks distinguishable.

Use real UI interaction when acceptance depends on UI behavior; use API/CLI checks where those are the relevant surface.
For persistence, verify the state after reload or restart, not only a success message. Choose checks by requirement.
An independent QA executor must be distinct from the implementation executor; inspect its evidence separately
when the chosen task graph requires acceptance of the QA report itself.

The integration owner collects an exact input manifest and verifies the combined revision against cross-trade
scenarios, including negotiated shared-contract behavior. Bind results to that combined artifact.
Changing a constituent artifact triggers impact assessment and invalidates affected combined evidence.
Do not announce delivery merely because each trade has passed locally.

## Accepted project knowledge

Update the existing project documentation or index after accepted changes. Link concise decisions and operational
guidance to exact artifacts; keep raw conversations and execution logs separate from accepted project knowledge.
Inspect documentation against the delivered implementation. If code changes during documentation work,
reassess affected checks and refresh the handover rather than documenting an obsolete version as current.

## Inspection packet and decision

Provide task/attempt ID, commit/content hash, input versions, commands, environment, results,
logs, limitations, and requirement-to-evidence links.
Screenshots support relevant visual criteria but do not replace behavioral tests.

Pass only with evidence for every mandatory criterion and no blocking defect.
Rejection includes reproduction, expected/actual behavior, impact, and reinspection scope.
Report unexecuted checks honestly, with blockers, substitutes, and remaining uncertainty.
Changed artifacts need impact-appropriate reinspection. Passing packages cannot override failed integration.

## Delivery

Provide evidence by requirement, operating instructions, compatibility changes, recovery, open defects,
and actual verification scope. Autonomous execution does not authorize inventing human acceptance.
