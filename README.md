# Construction Engineering

**A documentation-first workflow for accountable AI software teams.**

Construction Engineering brings construction-site coordination to software work: an owner commissions outcomes,
a general contractor reconciles the plan, specialist subcontractors propose designs and staffing, workers
implement bounded tasks, and independent inspectors verify specific deliverables.

Use it for cross-module development, shared API changes, and staged refactoring. Small changes stay small.
The core is a portable skill made of Markdown instructions and templates. An optional TypeScript checker
validates project records; it does not launch agents or execute product tests.

## How it works

```text
Owner
  └─ General contractor
       ├─ Subcontractor → optional lead → workers
       └─ Subcontractor → optional lead → workers

Independent inspectors → evidence and findings to the owner
```

Responsibilities, task dependencies, and approval authority are separate. Each subcontractor proposes how to
deliver its scope. The general contractor reconciles interfaces, shared resources, staffing, and sequencing
within the owner's authorization.

The workflow covers design inspection, implementation review, independent trade QA, combined-artifact
verification, and documentation handover. Rejections return to the responsible stage. Shared API changes
require an agreed behavioral contract as well as a writer sequence. Existing authorization is honored;
the process does not ask for the same approval twice.

See the [shared API walkthrough](docs/shared-api-scenario.md) for a concrete example.

## Quick start: clone and install

Recommended: clone this repository once, then install the skill into each project where you want to use it.
Keep the checkout in your tools directory, separate from your application repositories.
You need Git and **Node.js 24 or later**. Replace the example project path with an existing directory.

```sh
git clone https://github.com/Daysemotion/Construction-Engineering.git
cd Construction-Engineering
node scripts/install-skill.ts --project "/path/to/your-project"
```

The installer needs no npm dependencies or API key. Quote paths containing spaces.
For each new project, run the same installer from this checkout with that project's path.
Cloning alone downloads the toolkit; the install step places the skill where the agent can discover it.

Windows example:

```powershell
node scripts/install-skill.ts --project "C:\Projects\My App"
```

This installs only the portable skill:

```text
your-project/
  .agents/
    skills/
      construction-engineering/
        SKILL.md
        LICENSE
        agents/
        assets/
        references/
```

Open the target project in Codex and start with:

```text
Use $construction-engineering to complete this task: [your objective].
Preserve [required behavior]. Exclude [out-of-scope work].
You may plan, implement, and test within this scope. Ask only for decisions
that exceed this authorization. Do not deploy or use paid services.
```

Adapt the authorization to your needs. To review a proposal before execution, say so explicitly.
Installation alone does not authorize work or external actions.

Codex discovers repository skills in `.agents/skills`; see the
[official skill documentation](https://learn.chatgpt.com/docs/build-skills).
If the skill does not appear, restart Codex. You can commit the installed folder in your target repository
to share the same workflow with collaborators. Other agents can read the skill directly, but discovery,
delegation, permissions, and independent execution depend on their host.

## Other installation options

Choose one scope to avoid duplicate copies of the same skill in the host's selector.

| Option | Command | Destination |
|---|---|---|
| Project | `node scripts/install-skill.ts --project "/path/to/project"` | `<project>/.agents/skills/construction-engineering` |
| Personal | `node scripts/install-skill.ts --user` | `~/.agents/skills/construction-engineering` |
| Explicit location | `node scripts/install-skill.ts --target "/path/to/skills/construction-engineering"` | Exact directory supplied |

For hosts using a different or legacy skill directory, use `--target`. The installer does not infer a location
from `CODEX_HOME`. Running it without a scope prints usage and makes no changes.

**Without Node.js:** manually copy the complete `skills/construction-engineering` folder into the appropriate
skill directory. The skill itself has no runtime dependency. Keep all its references and templates together.

The installer refuses an existing destination and does not modify `AGENTS.md`, host configuration, or project
source files. To update your clean toolkit checkout, run `git pull --ff-only` from its directory.
Installed copies are snapshots and do not update automatically: compare the new skill with your installed copy,
back up local changes, and merge deliberately. To uninstall, remove only the installed skill directory after
preserving any local changes.
If upgrading from `construction-orchestrator`, migrate any customizations and retire the old installed copy
to avoid keeping two versions active.

For an optional repository default, merge the [AGENTS.md snippet](skills/construction-engineering/assets/repository-instructions.md)
into your project's existing instructions. Do not replace that file wholesale.

## Optional record checker

Use the checker when you want deterministic checks on a supplied task graph, authorization records,
resource claims, attempts, and artifact-specific inspection. Run these commands from this checkout:

```sh
npm ci
npm run check
npm run orch -- demo
npm run orch -- init .orchestration/my-project
npm run orch -- check .orchestration/my-project/record.json
npm run orch -- ready .orchestration/my-project/record.json
npm run orch -- report .orchestration/my-project/record.json
```

You can pass an absolute record path for a different project. There is no npm registry release or global CLI
installation required; `npm run orch` runs the helper in this checkout.

| Command | Result |
|---|---|
| `init <new-directory>` | Creates an unapproved fictional record and worklog template; refuses an existing directory |
| `check <record.json>` | Checks schema and record consistency; exits nonzero for invalid records |
| `hash <record.json>` | Prints the validated plan's hash |
| `ready <record.json>` | Suggests a next batch from supplied state; does not dispatch it |
| `report <record.json>` | Summarizes declared states, consumption, and findings |
| `demo` | Runs a clearly labeled simulation, with no real approvals or product tests |

Replace initialized example data with actual project information before use. Record an actual authorization
source for the exact plan hash. A valid record can still be unapproved, blocked, or incomplete.
All commands except `init` are read-only. See the [machine contract](skills/construction-engineering/references/machine-contract.md)
for stage encoding, evidence limitations, and chronology rules.

## Repository contents

| Path | Purpose |
|---|---|
| [skills/construction-engineering](skills/construction-engineering/SKILL.md) | Canonical portable workflow, references, and project template |
| [src](src/model.ts) | Optional TypeScript schema, checker, and CLI |
| [scripts](scripts/install-skill.ts) | Installation, schema/example generation, and documentation checks |
| [tests](tests/workflow.test.ts) | Checker, CLI, installer, and synthetic workflow tests |
| [schemas](schemas/record.schema.json) | Generated JSON Schema for editors |
| [examples](examples/refactor-draft.json) | Draft and explicitly simulated records |
| [docs](docs/validation.md) | Worked scenarios and verification scope |
| [.github/workflows](.github/workflows/verify.yml) | Verification on Windows and Linux |

Local work records, dependencies, credentials, and test environments are excluded by `.gitignore`.
No private project history is required to install or use the workflow.

## Boundaries

- Markdown guides agent behavior; actual permissions and read-only inspection require host enforcement.
- The checker validates declared identities and evidence references; it does not authenticate people or open evidence files.
- Resource checks cover declared logical resources. They do not lock files or discover undeclared semantic conflicts.
- Agent execution, crash recovery, waiting, and scheduling need host support; this repository is not a distributed runtime.
- Synthetic graph tests do not establish production fleet scale or autonomous delivery quality.

## Contributing and verification

Read [AGENTS.md](AGENTS.md). Keep maintained documentation in English and reusable policy inside the skill.
For changes to executable helpers or the schema:

```sh
npm ci
npm run check
npm run schema
npm run examples
git diff -- schemas examples
```

Commit intentionally regenerated artifacts with their source changes. Preserve no-overwrite installation,
existing authorization, exact-artifact inspection, and small-task scaling. Report reproducible issues with
sanitized inputs and expected/actual behavior; do not include secrets or private agent transcripts.

The [validation record](docs/validation.md) explains what was tested and what remains unverified.

## License

Construction Engineering's code and workflow documentation are available under the [MIT License](LICENSE).
Keep the copyright and license notice when redistributing copies or substantial portions. The portable skill
includes the same license so it travels with project installations. Third-party dependencies retain their own licenses.
