# project.context.core.md

## Project identity
- Project: `nooncode-app`
- Product name in UI: `NoonApp`
- Type: Next.js web application
- Primary repo path: `C:\Users\melan\Downloads\nooncode-app`
- Current stage: hybrid MVP under active migration from demo data to real auth/runtime

## Primary purpose
- Confirmed: the app is a role-based sales-to-delivery workspace that combines lead management, delivery/project tracking, personal earnings/rewards, reporting, and an embedded AI copilot.

## Confirmed module map
- Public/login surface: `/`
- Dashboard home: `/dashboard`
- Sales modules: `/dashboard/leads`, `/dashboard/pipeline`
- Delivery modules: `/dashboard/projects`, `/dashboard/tasks`
- Finance/personal modules: `/dashboard/earnings`, `/dashboard/rewards`, `/dashboard/reports`
- Admin module: `/dashboard/settings`
- AI assistant surface: dashboard-mounted Maxwell chat backed by `/api/maxwell`

## Confirmed stack snapshot
- Framework: Next.js 16 App Router
- Language: TypeScript
- UI runtime: React 19
- Package manager: pnpm
- Styling: Tailwind CSS v4 plus local shadcn/Radix-style component stack
- Auth/runtime dependency now present: Supabase SSR + Supabase JS

## Confirmed architecture shape
- Root layout resolves initial auth state server-side in `app/layout.tsx`.
- `AuthProvider` supports two modes: `supabase` when env is enabled and configured, `mock` as fallback.
- Dashboard route protection now exists at both middleware and client shell layers.
- Business-domain data for leads, projects, tasks, rewards, users, and points still lives in `lib/data-context.tsx`.
- `lib/dashboard-selectors.ts` remains the main selector/view-model layer over client data.

## Confirmed auth and data reality
- Supabase auth/session has been implemented for the active real-auth path.
- `middleware.ts` blocks unauthenticated or unauthorized `/dashboard` access using Supabase session plus `user_profiles`.
- `lib/server/auth/session.ts` resolves current session/user/profile/principal server-side.
- `supabase/migrations/0001_phase_1a_auth_profiles.sql` defines `public.user_profiles` with role and active-state control.
- `scripts/seed-phase-1a-users.ts` seeds auth users and linked profile rows.
- Delivery user directory now has a real read path for delivery surfaces:
  - `/api/users/delivery`
  - `lib/server/profiles/repository.ts` lists active `admin|pm|developer` profiles from `user_profiles`
  - `lib/data-context.tsx` now loads `deliveryUsers` from that route in `supabase` mode
  - `/dashboard/projects` and `/dashboard/tasks` now resolve PM/developer selectors from the persisted delivery directory instead of `mockUsers`
- Settings user directory now has a real read path for admin surfaces:
  - `/api/users/admin`
  - `lib/server/profiles/repository.ts` now lists full admin-visible directory rows from `user_profiles`
  - `lib/data-context.tsx` now loads `settingsUsers` from that route in `supabase` mode for `admin`
  - `/dashboard/settings` now renders real `Estado`, `Ultimo acceso`, and `Fecha Registro` columns instead of mock `Balance`/`Puntos`
  - `/dashboard/settings` now keeps demo role switching honest in `supabase` mode by removing the fake switcher affordance
- Leads now have a real persistence path:
  - `supabase/migrations/0002_phase_2a_leads.sql`
  - `/api/leads`
  - `lib/server/leads/*`
  - `lib/data-context.tsx` fetch/mutate leads through the API in `supabase` mode
- Lead follow-up now has a real code path:
  - `supabase/migrations/0003_phase_2b_lead_activity.sql`
  - `/api/leads/[leadId]/activity`
  - durable timeline entries for notes, updates, and status changes
  - `components/lead-detail.tsx` now reads/writes persisted follow-up activity
- Lead proposals/hand-off now have a real code path:
  - `supabase/migrations/0004_phase_2c_lead_proposals.sql`
  - `/api/leads/[leadId]/proposals`
  - `/api/leads/[leadId]/proposals/[proposalId]`
  - durable proposal records linked to leads with `handoff_ready` state
  - `components/lead-detail.tsx` now saves and tracks commercial proposals
- Lead assignment locking/release/claim now has a real code path:
  - `supabase/migrations/0010_phase_2h_lead_locking.sql`
  - `supabase/migrations/0011_phase_2h_lead_assignment_policy_fix.sql`
  - `/api/leads/[leadId]/release`
  - `/api/leads/[leadId]/claim`
  - proposal send now locks the lead, release exposes it to other sellers, and claim reassigns ownership with explicit assignment state in the UI
- Lead follow-up scheduling now has a real code path:
  - `supabase/migrations/0012_phase_2i_lead_follow_up.sql`
  - `next_follow_up_at` persisted on `public.leads`
  - `/api/leads/[leadId]` now accepts persisted follow-up scheduling updates
  - `components/lead-detail.tsx` now edits and clears the next follow-up datetime
  - `components/lead-card.tsx` now surfaces scheduled/today/overdue follow-up state
- Lead-to-project conversion now has a real code path:
  - `supabase/migrations/0005_phase_2d_projects.sql`
  - `/api/projects`
  - `/api/projects/[projectId]`
  - `/api/leads/[leadId]/proposals/[proposalId]/project`
  - durable `projects` records created from `handoff_ready` proposals
  - `lib/data-context.tsx` now merges persisted projects with mock delivery data in Supabase mode
  - real UUID-backed projects now support persisted metadata updates for delivery management fields
- Tasks now have a real code path for persisted delivery work:
  - `supabase/migrations/0006_phase_2e_tasks.sql`
  - `/api/tasks`
  - `/api/tasks/[taskId]`
  - durable task records linked to real projects
  - `lib/data-context.tsx` now merges persisted tasks with mock delivery data in Supabase mode
- Task activity/comments now have a real code path for persisted delivery follow-up:
  - `supabase/migrations/0007_phase_2f_task_activity.sql`
  - `/api/tasks/[taskId]/activity`
  - durable task notes linked to persisted tasks
  - `lib/data-context.tsx` now loads and writes persisted task activity for real UUID-backed tasks
- Project-side history rollup now has a local code path:
  - `/dashboard/projects`
  - `lib/data-context.tsx` now aggregates task activity by project using the existing task activity route
  - PM/admin project detail now shows a read-only cross-task timeline with task, actor, timestamp, and note
  - no new migration, table, endpoint, or permission change was introduced in this slice
- Rewards, earnings, and points are still mock-first in `lib/data-context.tsx`.
- Global `users` remains mock-backed for demo-only surfaces, but `/dashboard/settings` now has a separate real `settingsUsers` directory in `supabase` mode.

## Confirmed product/data posture
- Auth/session is partially real.
- Leads/pipeline have runtime validation in the active local flow.
- Lead follow-up/activity has runtime validation in the active local flow.
- Lead proposals/hand-off have runtime validation in the active local flow.
- Lead assignment locking/release/claim has runtime validation in the active local flow.
- Projects are now mixed-mode: persisted creation/list/status plus delivery metadata updates for real hand-off projects.
- Tasks are now mixed-mode: persisted list/create/update plus persisted activity notes for real projects, with mock fallback still present for demo projects.
- Runtime evidence now also exists for the project-side task-activity rollup in `/dashboard/projects`: PM `ana@noon.app` could open persisted project `2f39ac50-1bce-4364-9133-1317160d8a5a` and see aggregated task activity with task, actor, timestamp, and note ordered by recency.
- Phase 2E runtime evidence now exists in the linked Supabase project: persisted project `2f39ac50-1bce-4364-9133-1317160d8a5a` with persisted task `25d532a6-ce53-46db-96b1-8a519768e03b` derives to `review` at `85%` progress using the same `/dashboard/projects` logic.
- Runtime evidence now also exists for persisted project delivery metadata updates: the local app runtime accepted and reflected `budget`, `pmId`, `teamIds`, `startDate`, `endDate`, and `description` updates on project `2f39ac50-1bce-4364-9133-1317160d8a5a`, then those values were restored.
- Runtime evidence now also exists for persisted task activity: the local app runtime accepted `POST /api/tasks/25d532a6-ce53-46db-96b1-8a519768e03b/activity` from PM `ana@noon.app` and assigned developer `pedro@noon.app`, `GET /api/tasks/[taskId]/activity` reflected the persisted notes, and unrelated developer `laura@noon.app` could not read or write that task activity because the task was filtered out by RLS.
- Runtime evidence now also exists for developer task visibility alignment: in `/dashboard/tasks`, developer `pedro@noon.app` now sees only his persisted task under project `2f39ac50-1bce-4364-9133-1317160d8a5a`, while unrelated developer `laura@noon.app` sees an empty task board.
- The delivery summary on `/dashboard` is now aligned with the same developer-visible project/task truth used by `/dashboard/projects` and `/dashboard/tasks`.
- Runtime evidence now also exists for developer reporting alignment: `/dashboard/reports` now shows `0` active projects and `0` completed tasks for both `pedro@noon.app` and `laura@noon.app`, instead of deriving mock delivery metrics.
- Runtime evidence now also exists for reports analytics realism in `/dashboard/reports`: the sales tab no longer uses hardcoded demo month series, monthly revenue remains explicitly disabled until a real close-date source exists, `ana@noon.app` and `pedro@noon.app` now see the real persisted project-status chart, and `laura@noon.app` sees an honest empty project state.
- Runtime evidence now also exists for lead assignment locking/release/claim: in the local app runtime on `http://127.0.0.1:3000`, seller `juan@noon.app` could send a proposal and lock a persisted lead, unrelated seller `qa.sales2@noon.app` could not see that lead until it was released, then could claim it, and the original seller received an explicit `403` when attempting to mutate the claimed lead without reclaiming it.
- The new project rollup loading, empty, and error states were validated in the live browser runtime by delaying, emptying, and failing task-activity fetches in-page without changing server contracts.
- Runtime evidence now exists for the developer project-visibility contract behind `/dashboard/projects`: after corrective migrations `0008_phase_2g_project_visibility_alignment.sql` and `0009_phase_2g_tasks_rls_recursion_fix.sql`, PM `ana@noon.app` and developer `pedro@noon.app` can read persisted project `2f39ac50-1bce-4364-9133-1317160d8a5a`, while unrelated developer `laura@noon.app` sees no visible projects or tasks for that project.
- Browser-level runtime validation now also exists for the updated `/dashboard/projects` board: `ana@noon.app` sees the mixed PM board with the real project and activity panel, `pedro@noon.app` sees only the persisted real project on his board and can open its detail without the PM/admin activity panel, and `laura@noon.app` sees an empty developer board.
- Runtime evidence now also exists for delivery user directory alignment: in browser runtime as `ana@noon.app`, both `/dashboard/projects` and `/dashboard/tasks` fetched `/api/users/delivery`, the project edit PM selector rendered names from the real delivery directory, and the task create assignee selector rendered the real developer directory.
- Runtime evidence now also exists for settings user directory alignment: in browser runtime as `admin@noon.app`, `/dashboard/settings` fetched `/api/users/admin`, the `Usuarios` tab rendered the real profile directory with `Estado`, `Ultimo acceso`, and `Fecha Registro`, and the `Roles y Permisos` tab no longer presented the demo role switcher in `supabase` mode.
- Remaining non-project commercial and delivery domain data is still demo-state.
- Maxwell has a real route shape but still lacks confirmed real business context wiring.
- Leads support Gmail compose shortcuts from card/detail UI and now have a server-backed persistence path.
- Runtime evidence now also exists for manual lead follow-up scheduling: migration `0012_phase_2i_lead_follow_up.sql` is applied to the linked Supabase project, app-route validation already confirmed schedule/reschedule/clear/readback plus activity logging for `nextFollowUpAt`, and browser-level validation now also confirms that `/dashboard/leads` cards and lead detail render the persisted `scheduled`, `Vence hoy`, and `Atrasado` follow-up states and keep them after reload.

## Active risks
- Repo is in a mixed real/mock state: auth is real-capable while business data still resets on reload.
- Route access is enforced with real session/profile checks, but broader non-commercial delivery persistence still remains client-side beyond the current project/task base slice.
- `next.config.mjs` still ignores TypeScript build errors.
- No repo-local automated test suite was found.
- Local context files can drift quickly unless updated after each real phase.

## Corrected roadmap status
- Closed: Phase 1A auth/session foundation with Supabase, dashboard middleware protection, anonymous root handling, auth QA checklist.
- Closed: Leads Gmail compose fix.
- Partial: Phase 1 "Base real del sistema" because auth is real, but business entities are still mock-backed.
- Closed in runtime: Phase 2A leads/pipeline persistence foundation.
- Closed in runtime: Phase 2B persistent lead follow-up/activity.
- Closed in runtime: Phase 2C commercial hand-off foundation.
- Closed in runtime: Phase 2H commercial lead locking/release/claim workflow.
- Closed in runtime: Phase 2D explicit lead-to-project conversion.
- Closed in runtime: Phase 2E task persistence foundation.
- Closed in runtime: next delivery slice for persisted project management fields in `/dashboard/projects`.
- Closed in runtime: next delivery slice for persisted task activity/comments in `/dashboard/tasks`.
- Closed in runtime: read-only project-side task-activity rollup in `/dashboard/projects` for PM/admin.
- Closed in runtime: developer project visibility alignment for `/dashboard/projects`.
- Closed in runtime: developer task visibility alignment for `/dashboard/tasks` and developer delivery summary on `/dashboard`.
- Closed in runtime: developer delivery reporting alignment on `/dashboard/reports`.
- Closed in runtime: reports analytics realism alignment on `/dashboard/reports`.
- Closed in runtime: Phase 2I manual lead follow-up scheduling.
- Closed in runtime: delivery user directory alignment for `/dashboard/projects` and `/dashboard/tasks`.
- Closed in runtime: settings user directory alignment for `/dashboard/settings`.
- Partial: Phase 3 "Leads accionables y cercania" because email/phone actions exist, but proximity, location, and WhatsApp are still missing.
- Recommended next execution route: `system-analysis` before choosing the next bounded real-data slice; do not drift into Phase 3 proximity by default.

## Operating rules
- Treat auth/session as repo-proven when Supabase env is enabled.
- Treat leads, hand-off projects, and real-project tasks/activity as real-capable when Supabase env is enabled, but keep rewards, points, and earnings flows as demo-state unless new persistence evidence is added.
- Treat `deliveryUsers` as the real identity source only for `/dashboard/projects` and `/dashboard/tasks` in Supabase mode.
- Treat `settingsUsers` as the real identity source only for `/dashboard/settings` in Supabase mode; do not assume earnings, rewards, or points are already using persisted users.
- Do not mark Phase 1 complete until domain data survives reloads and role-scoped reads are backed by real data.
- Do not start Phase 3 proximity as the primary next phase until the next delivery persistence slice is explicitly chosen.
