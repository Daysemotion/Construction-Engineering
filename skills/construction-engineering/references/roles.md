# Roles and authority

| Role | Inputs | Decisions and outputs | Boundaries |
|---|---|---|---|
| Owner | Integrated proposals, alternatives, evidence | Objective, budget, delegation, material changes, acceptance | Agents cannot invent owner authorization |
| General contractor | Commission and subcontractor proposals | Trade boundaries, integrated design, sequence/resources, recommendation | Cannot expand authority or conceal failed inspection |
| Subcontractor | Assigned scope and shared contracts | Design, staffing proposal, work orders, self-quality control | Cannot unilaterally change another trade's contract |
| Team lead | Work package and limits | Local allocation, conflict resolution, progress synthesis | Cannot duplicate parent budgets for each team |
| Worker | Inputs, write scope, criteria | Implementation, self-check evidence, blockers | Cannot assume prerequisites or independently approve itself |
| Inspector | Requirements, exact artifact, procedure | Reproduction, pass/fail, actionable findings | Cannot pass on summary alone or remove failed evidence |

A general contractor may implement work but cannot independently inspect its own implementation.
Inspectors coordinate timing while preserving original findings for owner visibility.

## Requesting a subcontractor proposal

Provide outcomes and exclusions; shared contract draft; architecture, code, and test references;
planning effort limits; whether execution is authorized; and required design, staffing, evidence, risks, and alternatives.
Missing information produces explicit assumptions, investigation, or questions, not invented facts.
Discovery can continue within scope; blocked dependencies are not completed work.

## Minimal session packet

Task ID, role, objective, input artifact versions, allowed/excluded write scopes, shared contracts,
acceptance criteria, executable checks, resource limits, reporting route, and stop conditions.
Exclude secrets and unrelated conversations. Reference canonical source material.

## Reporting routes

- Worker to subcontractor: changes, executed checks, impact, blockers, next action.
- Subcontractor to general contractor: outcomes, cross-trade requests, deviations, recommendation.
- General contractor to owner: overall impact, recommendation, alternatives, missing decisions, evidence.
- Peers negotiate directly; shared-contract changes become recorded decisions visible to the general contractor.
- For urgent risk, stop affected work and notify the general contractor without waiting for routine reporting.

Do not duplicate every report into every context. Keep originals and link them from concise summaries.
