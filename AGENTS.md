\# AGENTS.md



This repository uses global Codex skills for routing and execution discipline.

Project-specific truth lives locally in this repo and must take precedence over generic assumptions.



\## Repository rules

\- Follow the real project stack, file structure, and conventions already present in this repository.

\- Do not invent architecture, contracts, or flows that are not supported by the code or project context.

\- Prefer small, bounded iterations over broad speculative changes.

\- Keep user-visible behavior, auth rules, and data semantics explicit.

\- If scope is unclear, route to analysis or audit before implementation.

\- If contracts, boundaries, or data flow are unclear, route to architecture before implementation.

\- If behavior changes, validation is required before claiming completion.

\- If auth, permissions, secrets, sensitive data, runtime, or deploy behavior changes, security and/or infra review are required.

\- Docs must reflect implemented reality, not intention.



\## Local source of truth

Use these local files as the primary repo-specific context:

\- `project.context.core.md`

\- `project.context.full.md`

\- `project.context.history.md`



\## Context usage

\- Use `project.context.core.md` as the default operating context for normal work.

\- Use `project.context.full.md` when architecture, contracts, infra, security, or deeper repository truth is needed.

\- Use `project.context.history.md` for continuity across sessions, prior decisions, and deferred work.

\- If these files are missing, stale, or contradictory, surface that explicitly instead of guessing.



\## Skill routing policy

\- Use one primary skill per session or phase.

\- Reroute when the nature of the work materially changes.

\- Do not mix architecture, implementation, validation, and audit into one blurred pass unless the route explicitly requires it.



\## Completion policy

No work should be considered COMPLETE unless the scoped success criterion is satisfied and the relevant validation evidence exists.

If evidence is incomplete, mark the work PARTIAL or BLOCKED rather than overstating progress.

