# project.context.history.md

## Purpose
This file stores session continuity, prior decisions, and evidence-backed repository discovery notes that should not bloat the active working context.

## Session history

### Session 001
- Date: 2026-03-16
- Route used: setup / workflow hardening
- Objective: establish Codex skill workflow and create initial local context files
- Outcome: baseline local context files were created, but they contained setup-era placeholders rather than repo-backed product truth
- Key decisions:
  - project-specific truth lives locally in `AGENTS.md` and `project.context.*.md`
  - one primary skill should be used per phase/session
  - `.system` under global skills should not be modified
- Follow-up created:
  - replace placeholders with real repo truth

### Session 002
- Date: 2026-03-16
- Route used: system-analysis
- Objective: inspect the repo in evidence-first order and replace setup placeholders with confirmed product and architecture truth
- Required exploration order completed:
  - `app/page.tsx`
  - `app/layout.tsx`
  - `app/dashboard/layout.tsx`
  - `lib/auth-context.tsx`
  - `lib/data-context.tsx`
  - `lib/types.ts`
  - `lib/mock-data.ts`
  - `lib/dashboard-selectors.ts`
  - `app/api/maxwell/route.ts`
  - `docs/session-handoff.md`
- Additional evidence inspected after required order:
  - `package.json`
  - `next.config.mjs`
  - `components/app-sidebar.tsx`
  - `components/maxwell-fab.tsx`
  - `components/maxwell-chat.tsx`
  - route inventory under `app/`
- Confirmed findings:
  - the product is a role-based sales-to-delivery workspace with finance/rewards/reporting surfaces plus Maxwell AI chat
  - auth is client-side, in-memory, and mock-backed; login matches email only and ignores password
  - business data is in-memory React context state seeded from `lib/mock-data.ts`
  - the only confirmed server route is `/api/maxwell`
  - the app is mock-first overall, with a partially real AI integration surface
  - dashboard authorization helpers exist, but trusted backend authorization was not proven
- Critical risks recorded:
  - passwordless mock login
  - client-side authorization only
  - no durable persistence for business data
  - TypeScript build errors ignored in `next.config.mjs`
  - no repo-local automated tests found
  - reports selectors contain hardcoded monthly history values
- Local files updated:
  - `project.context.core.md`
  - `project.context.full.md`
  - `project.context.history.md`

## Historical decisions
- Decision: keep `project.context.core.md` concise and operational
  - Why: day-to-day sessions need short trusted context
  - Impact: deeper architecture/risk truth belongs in `project.context.full.md`
- Decision: separate confirmed truth from hypotheses and unknowns
  - Why: this repo contains demo scaffolding and mock-first behavior that could be overstated if not labeled carefully
  - Impact: future sessions should preserve evidence strength instead of flattening everything into "facts"

## Deferred work log
- Item: inspect `hooks/`, `components/` beyond the dashboard shell, and any remaining non-core surfaces if deeper architectural mapping is needed
  - Reason deferred: current context update only required enough evidence to establish product/runtime/auth/data truth
  - Risk level: low
  - Recommended next route: system-analysis
- Item: determine whether any external backend, secrets model, or deployment workflow exists outside inspected files
  - Reason deferred: not provable from the inspected repo surfaces
  - Risk level: medium
  - Recommended next route: system-infra or system-audit
- Item: validate whether Maxwell is configured and working in runtime environments
  - Reason deferred: no live env/config verification was performed
  - Risk level: medium
  - Recommended next route: system-infra or system-testing

## Notes for future sessions
- Treat Session 001 as setup history, not product truth.
- Treat Session 002 as the first repo-backed context baseline.
- If future code contradicts these context files, update the context from code evidence rather than preserving stale assumptions.
