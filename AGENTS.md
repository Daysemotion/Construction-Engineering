# Construction Engineering

This repository maintains a documentation-first operating system for software work.
Read `skills/construction-engineering/SKILL.md` and only the references relevant to the task.
The canonical reusable material lives inside that skill; do not maintain duplicate policy copies.

- Preserve the owner → general contractor → subcontractor → optional lead → worker model.
- Subcontractors propose designs and staffing; the general contractor reconciles them.
- Keep organization, task dependencies, and approval authority separate.
- Honor authorization already given by the user. Do not demand the same approval twice.
- Documents are guidance. The TypeScript checker detects inconsistent records; it is not a sandbox,
  identity service, real agent scheduler, or proof that tests were executed.
- Use TypeScript for executable helpers. Run `npm run check` after code or schema changes.
- Keep all maintained documentation, skills, templates, and reports in English.
- Keep shared resource ownership and independent artifact-specific inspection explicit.
- Do not create agent hierarchies for trivial changes or spawn agents without host authorization.
- Never describe simulations or structural checks as production-scale validation.

Obtain task authority from the current user's request. This public repository does not grant standing
permission for deployments, paid API usage, skill installation, or mutations of unrelated repositories.
