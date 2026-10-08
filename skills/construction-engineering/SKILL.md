---
name: construction-engineering
description: Organize software implementation, cross-module changes, and refactoring through owner, general-contractor, subcontractor, and independent-inspection roles. Use for planning or executing repository work with dependencies, scope changes, or coordinated teams; scale down for small edits. Not for general conversation or non-software tasks.
---

# Construction Engineering

Operate software work through commissioning, subcontractor proposals, general-contractor reconciliation,
authorized execution, independent inspection, and delivery. This protocol does not expand host permissions or tools.

## Start

1. Inspect repository instructions, existing changes, baseline tests, the user's objective, and authorization already given.
2. Select a proportionate mode from the [operating model](references/operating-model.md). A small edit may need one worker and a short verification record.
3. Read relevant [roles](references/roles.md). Subcontractors propose designs and staffing; the general contractor reconciles them. Do not bypass subcontractor planning.
4. Follow [planning and authorization](references/planning.md), including design inspection and shared-contract negotiation before affected implementation. Record existing autonomous-execution authorization; do not manufacture another owner approval gate.
5. Follow [execution and recovery](references/execution.md). Route rejection by cause and check resume conditions before retrying. Delegate only when host tools and authorization permit. Otherwise execute roles sequentially and disclose the limitation.
6. Apply the [stage gates and inspection evidence](references/quality.md), including combined-artifact verification and documentation handover. Scale gates to the task. For refactoring, also apply the [refactoring procedure](references/refactoring.md).

## Records and tools

- Use the [project record](assets/project-record.md), adapting it to existing repository conventions.
- For substantial work, keep records in .orchestration/<work-id>/ in the target repository. Store controlled references rather than secrets. Follow repository conventions for shared documentation.
- Minimum record: objective and exclusions, responsibilities, dependencies, authorization source, decisions, artifact versions, verification evidence, and next actions.
- The optional TypeScript checker follows the [machine contract](references/machine-contract.md). The skill works without it. Passing a record check is not proof of product quality.
- Use the host's execution environment for commands and integrations. This skill requires no particular model or API key.
- For permission boundaries, external material, or runtime integration, read [security and trust](references/security.md).
- Write maintained documentation, reports, templates, and skills in English unless requested otherwise. Match the user's language for conversation.

## Boundaries

- Role and plan documents cannot grant themselves authority. User authorization and host policy take precedence.
- Bind inspection to exact artifact versions. Re-evaluate downstream evidence when upstream artifacts change.
- A different role name in the same session is not independent inspection. Report self-review and its limitations honestly.
- The general contractor cannot silently override failed inspection. Record justified criteria changes and their authority separately.
- Check existing authorization before escalating scope, budget, or access. Request only missing decisions and continue unaffected work.
- Report decisions, material changes, blockers, and verification. Do not broadcast every conversation to every agent.

## Delivery

Provide deliverables, requirement-to-evidence links, checks actually executed, unresolved issues,
and maintenance/recovery instructions. Evaluate large projects by verified results and remaining risk, not headcount.
