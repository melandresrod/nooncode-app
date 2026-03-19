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
- Outcome:
  - product/module/runtime truth was captured from the repo
  - auth was documented as mock-only because Supabase work had not yet been audited into context
- Key evidence inspected:
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

### Session 003
- Date: 2026-03-18
- Route used: system-analysis
- Objective: reconcile the roadmap PDFs against the real repo after the completed Supabase auth/session work and the Gmail fix in Leads
- Evidence added:
  - `middleware.ts`
  - `lib/server/auth/session.ts`
  - `lib/server/profiles/repository.ts`
  - `lib/server/supabase/*.ts`
  - `supabase/migrations/0001_phase_1a_auth_profiles.sql`
  - `scripts/seed-phase-1a-users.ts`
  - `QA_AUTH_RUNTIME_CHECKLIST.md`
  - `components/lead-card.tsx`
  - `components/lead-detail.tsx`
  - `tmp_roadmap.txt`
  - `tmp_recap.txt`
  - `tmp_faltantes.txt`
- Confirmed findings:
  - Supabase auth/session is now real and repo-backed when env is enabled
  - dashboard protection is enforced in middleware against session/profile/role state
  - auth context now has a real sign-in/sign-out path with router refresh handling
  - Gmail compose actions in Leads are implemented
  - leads/projects/tasks/rewards/users/points still come from `lib/data-context.tsx` seeded by `lib/mock-data.ts`
  - the repo is now mixed-mode, not fully mock-only and not fully real
- Roadmap correction decided:
  - treat auth/session as Phase 1A complete
  - keep Phase 1 overall as partial because domain persistence is still missing
  - keep Phase 2 as the next real priority because commercial data is not yet server-backed
  - treat Phase 3 as partial because contact shortcuts improved, but proximity/location remain missing
- Artifacts updated:
  - `project.context.core.md`
  - `project.context.full.md`
  - `project.context.history.md`
  - `docs/roadmap-reconciled.md`

### Session 004
- Date: 2026-03-18
- Route used: system-backend
- Objective: implement Phase 2A leads/pipeline persistence foundation without reopening auth/session or the Gmail fix
- Implemented:
  - `supabase/migrations/0002_phase_2a_leads.sql`
  - `/api/leads` CRUD endpoints
  - `lib/server/leads/*` repository/validation/mapping modules
  - `lib/data-context.tsx` lead loading and mutations through the API in Supabase mode
  - leads and pipeline pages updated for async persisted mutations
  - `scripts/seed-phase-2a-leads.ts`
- Validation outcome:
  - code paths were reviewed locally
  - `pnpm.cmd lint` failed because `eslint` is not installed/available in the workspace
  - `pnpm.cmd exec tsc --noEmit` failed because `tsc` is not installed/available in the workspace
- Completion status:
  - implementation complete
  - runtime validation still pending until migration/seed can be applied and the project has working local tooling

### Session 005
- Date: 2026-03-18
- Route used: system-backend
- Objective: implement Phase 2B persistent commercial follow-up without reopening auth/session, Gmail, or Phase 2A base CRUD
- Implemented:
  - `supabase/migrations/0003_phase_2b_lead_activity.sql`
  - `/api/leads/[leadId]/activity` GET/POST endpoints
  - `lib/server/leads/activity-*` repository/schema/mapping modules
  - `lib/leads/activity-serialization.ts`
  - `lib/data-context.tsx` lead activity loading, note persistence, and cache refresh
  - `components/lead-detail.tsx` follow-up timeline UI with persistent note composer
- Confirmed scope boundary:
  - included notes, activity history, and durable status/update logging for leads
  - excluded auth/session rewrites, Gmail changes, proximity, payments, rewards, and commercial hand-off
- Validation outcome:
  - `node_modules\\.bin\\tsc.cmd --noEmit` still fails on pre-existing workspace issues outside this slice
  - no new type errors were surfaced from the newly added Phase 2B files in that run
  - runtime validation remains pending until migration `0003` is applied against the active Supabase project
- Completion status:
  - implementation complete
  - runtime validation pending

### Session 006
- Date: 2026-03-18
- Route used: system-backend
- Objective: implement Phase 2C commercial hand-off foundation without opening project persistence, payments, or delivery flows
- Implemented:
  - `supabase/migrations/0004_phase_2c_lead_proposals.sql`
  - `/api/leads/[leadId]/proposals` GET/POST endpoints
  - `/api/leads/[leadId]/proposals/[proposalId]` PATCH endpoint
  - `lib/server/leads/proposal-*` repository/schema/mapping modules
  - `lib/leads/proposal-serialization.ts`
  - `lib/data-context.tsx` proposal loading, creation, and status updates
  - `components/lead-detail.tsx` proposal composer, persisted proposal list, and hand-off readiness state
- Scope boundary kept:
  - included persistent proposal records linked to leads and commercial hand-off readiness
  - excluded real project persistence, explicit project creation, payments, commissions, rewards, and proximity
- Validation outcome:
  - `node_modules\\.bin\\tsc.cmd --noEmit` still fails only on pre-existing workspace issues outside this slice
  - no new type errors from the newly added Phase 2C files were surfaced in that run
  - runtime validation for migration `0004` is still pending
- Completion status:
  - implementation complete
  - runtime validation pending

### Session 007
- Date: 2026-03-18
- Route used: validation / manual runtime confirmation
- Objective: confirm whether Phase 2A and 2B worked in the active runtime
- Outcome:
  - user confirmed the local flow works after running the app
  - leads persistence and follow-up persistence should now be treated as runtime-validated in the active local environment

### Session 008
- Date: 2026-03-18
- Route used: system-backend
- Objective: implement Phase 2D explicit `lead -> proposal -> project` conversion without opening tasks, payments, or broader delivery persistence
- Implemented:
  - wired existing `0005_phase_2d_projects.sql`, `/api/projects`, `/api/projects/[projectId]`, and `/api/leads/[leadId]/proposals/[proposalId]/project`
  - `lib/data-context.tsx` now loads persisted projects in Supabase mode, merges them with `mockProjects`, converts `handoff_ready` proposals into projects, and persists status updates for real UUID-backed projects
  - `components/lead-detail.tsx` now exposes `Crear proyecto` on `handoff_ready`, shows linked project state, and surfaces `project_created` activity text
  - `lib/types.ts` and `lib/server/supabase/database.types.ts` now include `project_created` and project source-link fields
- Scope boundary kept:
  - included durable project creation from a commercial hand-off proposal and persisted status updates for those real projects
  - excluded task persistence, generic project CRUD, payments, commissions, rewards, and proximity
- Validation outcome:
  - technical validation still shows only pre-existing workspace TypeScript errors outside this slice
  - migration `0005_phase_2d_projects.sql` was applied to the linked Supabase project
  - runtime validation for project conversion is still pending in the app
- Completion status:
  - implementation complete
  - runtime validation pending

### Session 009
- Date: 2026-03-18
- Route used: system-backend
- Objective: implement Phase 2E task persistence foundation on top of the real lead-to-project bridge without opening subtasks, comments, or wider delivery planning
- Implemented:
  - `supabase/migrations/0006_phase_2e_tasks.sql`
  - `/api/tasks` GET/POST endpoint
  - `/api/tasks/[taskId]` PATCH endpoint
  - `lib/server/tasks/*` repository/schema/mapping modules
  - `lib/tasks/serialization.ts`
  - `lib/data-context.tsx` task loading, create, and update persistence for real UUID-backed projects/tasks with mock fallback preserved
  - `app/dashboard/tasks/page.tsx` task creation entry point plus persisted status/progress updates
  - `components/task-form-dialog.tsx` task creation/edit flow now wired to async persistence
- Scope boundary kept:
  - included durable task records linked to persisted projects and persisted task status/progress updates
  - excluded subtasks, comments/history, broader project CRUD, payments, rewards, and proximity
- Validation outcome:
  - technical validation still shows only pre-existing workspace TypeScript errors outside this slice
  - migration `0006_phase_2e_tasks.sql` was applied to the linked Supabase project
  - runtime validation for persisted tasks is still pending in the app
- Completion status:
  - implementation complete
  - runtime validation pending

### Session 010
- Date: 2026-03-18
- Route used: system-testing
- Objective: validate the last pending Phase 2E runtime behavior for `/dashboard/projects` using the linked Supabase project
- Evidence gathered:
  - queried the linked Supabase project with the configured local environment
  - confirmed persisted project `2f39ac50-1bce-4364-9133-1317160d8a5a`
  - confirmed persisted task `25d532a6-ce53-46db-96b1-8a519768e03b` linked to that project with status `review`
  - replayed the same progress/status derivation logic used by `/dashboard/projects`
- Validation outcome:
  - persisted project status `in_progress` plus persisted task status `review` derives to display status `review`
  - persisted task set derives to `85%` progress
  - the pending 2E `/dashboard/projects` reflection check should now be treated as validated against live persisted data
- Completion status:
  - Phase 2E runtime validation closed
  - no application code change was required in this pass

### Session 011
- Date: 2026-03-18
- Route used: system-analysis -> system-backend -> system-frontend
- Objective: implement the next delivery slice after 2E by making real projects editable in `/dashboard/projects` without reopening project creation, tasks history, or Phase 3
- Implemented:
  - widened `PATCH /api/projects/[projectId]` from status-only to bounded project metadata updates
  - `lib/server/projects/schema.ts` now validates project update payloads for budget, PM, team, dates, description, and optional status
  - `lib/server/projects/mappers.ts` now maps those fields into `projects` table updates
  - `lib/data-context.tsx` now persists real-project updates through `/api/projects/[projectId]` instead of leaving them local-only
  - `components/project-form-dialog.tsx` now supports editing persisted project delivery metadata and correctly clearing PM, description, and dates
  - `app/dashboard/projects/page.tsx` now exposes project edit from the detail dialog, resolves PM display from `pmId`, and disables direct project creation in that surface
- Scope boundary kept:
  - included persisted editing for project delivery management fields on existing UUID-backed projects
  - excluded new project creation outside commercial hand-off, project comments/history, subtasks, payments, rewards, and Phase 3 proximity work
- Validation outcome:
  - `node_modules\\.bin\\tsc.cmd --noEmit` still fails only on pre-existing workspace issues outside this slice (`profiles`, `supabase`, `middleware`, seed scripts)
  - no new TypeScript errors from the changed project-management files were surfaced in that run
- Completion status:
  - implementation complete
  - runtime validation still pending

### Session 012
- Date: 2026-03-18
- Route used: system-testing
- Objective: validate the new persisted project-management slice in the local app runtime
- Evidence gathered:
  - used the live local Next dev server at `http://127.0.0.1:3000`
  - created a valid Supabase SSR session for `ana@noon.app`
  - patched project `2f39ac50-1bce-4364-9133-1317160d8a5a` through the app route `PATCH /api/projects/[projectId]`
  - validated persisted fields: `budget`, `pmId`, `teamIds`, `startDate`, `endDate`, `description`
  - verified the updated values through `/api/projects`
  - restored the original project values after the runtime check
- Validation outcome:
  - the post-2E project edit slice is runtime-validated in the active local environment
  - the app route and persisted readback both behaved as expected
- Completion status:
  - runtime validation closed for the persisted `/dashboard/projects` management slice

### Session 013
- Date: 2026-03-18
- Route used: system-testing -> system-docs
- Objective: validate the next post-2E delivery slice for persisted task activity/comments in the local app runtime and update local context
- Implemented before validation:
  - `supabase/migrations/0007_phase_2f_task_activity.sql`
  - `/api/tasks/[taskId]/activity` GET/POST endpoint
  - `lib/server/tasks/activity-*` repository/schema/mapping modules
  - `lib/tasks/activity-serialization.ts`
  - `lib/data-context.tsx` task activity loading and note persistence with mixed-mode fallback
  - `app/dashboard/tasks/page.tsx` persisted notes plus activity history inside task detail
- Evidence gathered:
  - pushed migration `0007_phase_2f_task_activity.sql` to the linked Supabase project
  - used the live local Next dev server at `http://127.0.0.1:3000`
  - created valid Supabase SSR sessions for `ana@noon.app`, `pedro@noon.app`, and `laura@noon.app`
  - confirmed live task `25d532a6-ce53-46db-96b1-8a519768e03b` remained linked to persisted project `2f39ac50-1bce-4364-9133-1317160d8a5a`
  - patched `actualHours` from `8` to `9` and then restored it to `8` through `PATCH /api/tasks/[taskId]`
  - created a persisted task note through `POST /api/tasks/[taskId]/activity` as `ana@noon.app`
  - verified persisted task activity through `GET /api/tasks/[taskId]/activity`
  - confirmed assigned developer `pedro@noon.app` could read and create task activity on that task
  - confirmed unrelated developer `laura@noon.app` could not read or write that task activity because RLS filtered the task out and the route returned `Task not found.`
- Validation outcome:
  - the persisted task-activity/comments slice is runtime-validated in the active local environment
  - the existing task update path remained stable after the slice was added
  - negative permission behavior is enforced, but the observed denial surface is `404` from RLS visibility rather than the route's explicit `403` branch
- Docs updated:
  - `project.context.core.md`
  - `project.context.full.md`
  - `project.context.history.md`
- Completion status:
  - runtime validation closed for the persisted `/dashboard/tasks` task-activity slice

### Session 014
- Date: 2026-03-18
- Route used: system-backend -> system-frontend -> system-docs
- Objective: implement the next delivery slice after persisted task activity by showing a read-only project-side timeline in `/dashboard/projects` using existing task activity data
- Implemented:
  - `lib/types.ts` now defines `ProjectTaskActivity` as the UI/data contract for project-level rollups over task activity
  - `lib/data-context.tsx` now exposes `getProjectActivity(projectId)` that aggregates existing per-task activity, enriches each entry with task title, and sorts by recency
  - `app/dashboard/projects/page.tsx` now passes that project activity contract into the project detail dialog
  - `app/dashboard/projects/page.tsx` now renders a PM/admin-only `Historial de actividad` section with loading, empty, error, and populated states
  - the project detail rollup remains read-only and does not add any migration, table, endpoint, or permission change
- Scope boundary kept:
  - included task title, actor, timestamp, and note ordered by recency inside project detail
  - excluded `project_activities`, project-native comments, `/api/projects/[projectId]/activity`, permission expansion for developers, subtasks, payments, Maxwell, and Phase 3
- Validation outcome:
  - runtime validation is still pending for this slice
  - attempted local static validation, but the current shell could not resolve repo-local `eslint`, `tsc`, or `git`
  - code review of the changed files was completed manually in-session after patching
- Docs updated:
  - `project.context.core.md`
  - `project.context.full.md`
  - `project.context.history.md`
- Completion status:
  - implementation complete
  - runtime validation pending

### Session 015
- Date: 2026-03-18
- Route used: system-testing -> system-docs
- Objective: runtime-validate the new project-side task-activity rollup in `/dashboard/projects`
- Evidence gathered:
  - used the live local Next dev server at `http://127.0.0.1:3000`
  - created valid Supabase SSR sessions for `ana@noon.app`, `pedro@noon.app`, and `laura@noon.app`
  - confirmed persisted project `2f39ac50-1bce-4364-9133-1317160d8a5a` was visible to PM `ana@noon.app`
  - confirmed persisted task `25d532a6-ce53-46db-96b1-8a519768e03b` remained the only real task under that project for this slice
  - confirmed `GET /api/tasks/[taskId]/activity` still returned the two persisted validation notes for that task and that the project-side aggregation sorted them by recency
  - confirmed a no-op `PATCH /api/projects/[projectId]` with the current persisted values still returned `200`, so the rollup slice did not regress the existing project edit path
  - in the live browser runtime as `ana@noon.app`, opened the real project detail in `/dashboard/projects` and observed `Historial de actividad` with task title, actor, timestamp, and note matching the persisted task activity
  - in the live browser runtime, validated the rollup loading state by delaying `/api/tasks/[taskId]/activity` responses and observing skeletons
  - in the live browser runtime, validated the rollup empty state by overriding task-activity responses to `{ data: [] }`
  - in the live browser runtime, validated the rollup error state by overriding task-activity responses to `500` and observing the retry affordance
  - `pedro@noon.app` and `laura@noon.app` did not see the project activity panel in `/dashboard/projects`, but the developer runtime still surfaced mock-filtered project cards instead of the validated real project detail
- Validation outcome:
  - the project-side task-activity rollup is runtime-validated for the intended PM/admin first-cut path
  - loading, empty, and error UI states were validated through browser-side fault injection without changing server contracts
  - the pre-existing mixed-mode risk remains visible on developer project boards, so negative visibility evidence for developers is indirect rather than a real-project detail check
- Docs updated:
  - `project.context.core.md`
  - `project.context.full.md`
  - `project.context.history.md`
- Completion status:
  - runtime validation closed for the project-side task-activity rollup slice

### Session 016
- Date: 2026-03-18
- Route used: system-backend -> system-frontend -> system-testing
- Objective: align developer project visibility in `/dashboard/projects` with real persisted project/task visibility without reopening Phase 2E/2F or Phase 3
- Implemented:
  - `supabase/migrations/0008_phase_2g_project_visibility_alignment.sql`
  - `supabase/migrations/0009_phase_2g_tasks_rls_recursion_fix.sql`
  - `app/api/projects/route.ts` now limits `GET /api/projects` to delivery roles (`admin`, `pm`, `developer`)
  - `lib/data-context.tsx` now tracks persisted projects separately from mixed-mode project state and exposes `projectBoardProjects` so developers in Supabase mode do not inherit `mockProjects` on `/dashboard/projects`
  - `app/dashboard/projects/page.tsx` now consumes `projectBoardProjects` for list, kanban, stats, empty state, and detail selection
- Validation outcome:
  - `node_modules\\.bin\\tsc.cmd --noEmit` still fails only on pre-existing workspace issues in `profiles`, `supabase`, `middleware`, and seed scripts
  - pushing `0008` first exposed a real RLS recursion between `projects` and `tasks`; `0009` was added and pushed as the bounded corrective migration
  - runtime validation against the linked Supabase project confirmed:
    - `ana@noon.app` can read persisted project `2f39ac50-1bce-4364-9133-1317160d8a5a`
    - `pedro@noon.app` can now also read that same project and its assigned persisted task `25d532a6-ce53-46db-96b1-8a519768e03b`
    - `laura@noon.app` sees zero visible projects and zero visible tasks for that project
  - direct live browser revalidation of the updated `/dashboard/projects` board is still pending
- Docs updated:
  - `project.context.core.md`
  - `project.context.full.md`
  - `project.context.history.md`
- Completion status:
  - implementation complete
  - runtime validation complete at the RLS/API contract layer
  - browser-level board validation pending

### Session 017
- Date: 2026-03-18
- Route used: system-testing -> system-docs
- Objective: close the remaining browser-level validation for the developer project-visibility slice in `/dashboard/projects`
- Evidence gathered:
  - launched local Edge in headless DevTools mode against the live app runtime at `http://127.0.0.1:3000`
  - signed in through the real login UI as `ana@noon.app`, `pedro@noon.app`, and `laura@noon.app`
  - confirmed the persisted target project name is `Propuesta - Finance Group MX`
  - as `ana@noon.app`, confirmed the mixed PM board still shows the real project and that opening its detail still exposes the PM/admin `Historial de actividad` panel
  - as `pedro@noon.app`, confirmed `/dashboard/projects` shows only one project card for `Propuesta - Finance Group MX`, that the detail dialog opens, and that the PM/admin `Historial de actividad` panel is absent
  - as `laura@noon.app`, confirmed `/dashboard/projects` shows zero visible projects across the board columns
- Validation outcome:
  - the developer visibility alignment slice is now runtime-validated end-to-end in the browser
  - list/kanban/detail are aligned for the validated real project path
  - the PM/admin rollup remained stable while developer visibility was tightened
- Docs updated:
  - `project.context.core.md`
  - `project.context.full.md`
  - `project.context.history.md`
- Completion status:
  - runtime validation fully closed for the developer project visibility alignment slice

### Session 018
- Date: 2026-03-18
- Route used: system-frontend -> system-testing -> system-docs
- Objective: align developer task visibility in `/dashboard/tasks` and the delivery summary on `/dashboard` with the same persisted truth already established for developer project visibility
- Implemented:
  - `lib/data-context.tsx` now tracks `persistedTasks` separately from mixed-mode `tasks` and exposes `taskBoardTasks`
  - `app/dashboard/tasks/page.tsx` now consumes `taskBoardTasks` plus `projectBoardProjects` for developer-visible task list, stats, detail selection, and project-name lookup
  - `app/dashboard/page.tsx` now computes delivery summary from `projectBoardProjects` and `taskBoardTasks`
- Validation outcome:
  - `node_modules\\.bin\\tsc.cmd --noEmit` still fails only on pre-existing workspace issues in `profiles`, `supabase`, `middleware`, and seed scripts
  - live browser runtime confirmed:
    - `pedro@noon.app` now sees only one persisted task in `/dashboard/tasks`, under `Propuesta - Finance Group MX`
    - `pedro@noon.app` no longer sees mock tasks from `EduLearn LMS Platform` or `HealthTech Telemedicina`
    - `laura@noon.app` now sees an empty `/dashboard/tasks` board
    - the delivery summary on `/dashboard` no longer counts mock pending/in-progress tasks for developers
- Docs updated:
  - `project.context.core.md`
  - `project.context.full.md`
  - `project.context.history.md`
- Completion status:
  - runtime validation closed for the developer task visibility alignment slice

### Session 019
- Date: 2026-03-18
- Route used: system-frontend -> system-testing -> system-docs
- Objective: align developer delivery reporting in `/dashboard/reports` with the same visible project/task truth already used by `/dashboard`, `/dashboard/projects`, and `/dashboard/tasks`
- Implemented:
  - `app/dashboard/reports/page.tsx` now consumes `projectBoardProjects` and `taskBoardTasks` from `useData()` instead of raw mixed-mode `projects` and `tasks`
- Validation outcome:
  - live browser runtime confirmed that `pedro@noon.app` now sees `0` active projects and `0` completed tasks in `/dashboard/reports`
  - live browser runtime confirmed that `laura@noon.app` also sees `0` active projects and `0` completed tasks in `/dashboard/reports`
  - these KPIs no longer reflect prior mock delivery contamination for developers
- Docs updated:
  - `project.context.core.md`
  - `project.context.full.md`
  - `project.context.history.md`
- Completion status:
  - runtime validation closed for the developer delivery reporting alignment slice

### Session 020
- Date: 2026-03-18
- Route used: system-analysis -> system-frontend -> system-testing -> system-docs
- Objective: align analytics realism in `/dashboard/reports` without reopening the already-closed visibility alignment slices
- Implemented:
  - `lib/data-context.tsx` now exposes `persistedProjects` and `persistedTasks` so reports can consume persisted delivery truth directly in Supabase mode without a broader refactor
  - `lib/dashboard-selectors.ts` no longer hardcodes the monthly `Sep/Oct/Nov/Dic/Ene/Feb` reporting series and now derives a real 6-month lead trend from visible lead `createdAt`
  - `lib/dashboard-selectors.ts` now marks whether a real recent lead trend exists so the UI can render an honest empty state instead of synthetic points
  - `app/dashboard/reports/page.tsx` now uses role-appropriate persisted delivery inputs in Supabase mode, keeps monthly revenue/ventas explicitly disabled until a real close-date source exists, and renders explicit empty states for `Ventas`, `Pipeline`, `Fuentes`, and `Proyectos` when visible real data is insufficient
- Validation outcome:
  - `node_modules\\.bin\\tsc.cmd --noEmit` still fails only on pre-existing workspace issues in `profiles`, `supabase`, `middleware`, and seed scripts
  - no new TypeScript failures were surfaced in the changed reports files
  - browser-level runtime validation was executed against `http://127.0.0.1:3000` through headless Edge + CDP automation using real Supabase login for `ana@noon.app`, `pedro@noon.app`, and `laura@noon.app`
  - `pedro@noon.app` and `laura@noon.app` both show honest empty states for `Ventas`, `Pipeline`, and `Fuentes`, and no longer see demo monthly series presented as real data
  - `ana@noon.app` and `pedro@noon.app` both show the persisted `Revision` project-status chart in the `Proyectos` tab
  - `laura@noon.app` shows the explicit `Sin proyectos visibles` empty state in the `Proyectos` tab
- Docs updated:
  - `project.context.core.md`
  - `project.context.full.md`
  - `project.context.history.md`
- Completion status:
  - runtime validation closed for the reports analytics realism slice

## Historical decisions
- Decision: keep `project.context.core.md` concise and operational
  - Why: day-to-day sessions need short trusted context
  - Impact: deeper architecture/risk truth belongs in `project.context.full.md`
- Decision: separate confirmed truth from hypotheses and recommendations
  - Why: this repo is evolving from demo-first to hybrid real/mock and can be overstated in either direction
  - Impact: future sessions should preserve evidence strength instead of flattening everything into "facts"
- Decision: do not automatically advance to Phase 3 proximity work while Phase 2 commercial persistence is still open
  - Why: the PDFs and the repo both indicate that real commercial flow is the blocker before higher-order seller enhancements
  - Impact: future implementation should start with leads/pipeline persistence, not geospatial polish

## Deferred work log
- Item: implement a real commercial persistence slice for leads/pipeline
  - Reason deferred: this session corrected scope and roadmap first
  - Risk level: high
  - Recommended next route: system-backend
- Item: decide ownership/RLS strategy for leads and future commercial entities
  - Reason deferred: requires explicit contract design before migration work
  - Risk level: medium
  - Recommended next route: system-architecture or system-backend
- Item: audit Maxwell against the updated mixed real/mock state
  - Reason deferred: Maxwell remains out of scope until commercial context becomes real
  - Risk level: medium
  - Recommended next route: system-analysis

## Notes for future sessions
- Treat Session 002 as historically useful but stale on auth reality.
- Treat Session 004 as the current repo-backed implementation baseline for leads persistence.
- If future code adds real persistence for leads/projects/tasks, update the corrected roadmap immediately so the next phase choice stays accurate.
