# project.context.core.md

## Project identity
- Project: `nooncode-app`
- Product name in UI: `NoonApp`
- Type: Next.js web application
- Primary repo path: `C:\Users\melan\Downloads\nooncode-app`
- Current stage: mock-first MVP/demo under active iteration

## Primary purpose
- Confirmed: the app is a role-based sales-to-delivery workspace that combines lead management, delivery/project tracking, personal earnings/rewards, reporting, and an embedded AI copilot.
- Confirmed evidence:
  - login/marketing copy in `app/page.tsx`
  - dashboard route inventory under `app/dashboard/`
  - role model in `lib/types.ts`
  - Maxwell AI route in `app/api/maxwell/route.ts`

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
- Styling: Tailwind CSS v4 plus shadcn/Radix-style component stack
- Charts/visualization: Recharts
- AI/chat libraries: `ai` and `@ai-sdk/react`
- Analytics library present: `@vercel/analytics`

## Confirmed architecture shape
- Root layout wraps the app in a client-side `AuthProvider`.
- Dashboard layout performs client-side redirect/authorization checks and mounts a dashboard-local `DataProvider`.
- Business data is held in React context state seeded from `lib/mock-data.ts`.
- `lib/dashboard-selectors.ts` acts as a view-model/selector layer over raw context data.
- The only confirmed server route is `app/api/maxwell/route.ts`.

## Confirmed auth and data reality
- Auth is mock and client-side only.
- Login checks email against `mockUsers`; the password argument is ignored.
- Auth state is in memory only; no persistence, cookies, JWTs, or backend auth calls were found in inspected files.
- Dashboard route authorization is helper-driven in `lib/auth-context.tsx` and enforced in `app/dashboard/layout.tsx`.
- Leads, projects, tasks, rewards, users, and points all originate from `lib/mock-data.ts` and are mutated in memory inside `lib/data-context.tsx`.

## Confirmed product/data posture
- The app is mock-first overall.
- Core business flows are not backed by a confirmed database or CRUD API.
- One server-side AI chat endpoint exists, but its runtime credentials/configuration were not proven from the repo.

## Active risks
- Auth and authorization are client-side and in-memory.
- Passwords are not validated.
- App state resets on reload because business data lives in React state seeded from mocks.
- `next.config.mjs` ignores TypeScript build errors.
- No repo-local automated test suite was found.
- Reports still contain mixed derived/static analytics behavior through selector-provided hardcoded monthly values.

## Supported hypotheses
- Likely intended audience: an internal services/agency-style team spanning sales, PM, and developer roles.
- Likely intended locale: Spanish-speaking or Mexico-based team, based on Spanish UI copy, `es-MX` formatting, and sample data.
- Likely intended deployment path: Vercel-hosted Next app, based on `@vercel/analytics` and `metadata.generator = 'v0.app'`, but this is not confirmed.

## Unresolved unknowns
- Whether Maxwell is configured with working provider credentials in real environments
- Whether a real backend/data store exists outside this repo
- Whether deployment is actually on Vercel or only scaffolded for it
- Whether the current mock-first model is temporary prototype scaffolding or the intended long-term architecture

## Operating rules
- Treat mock/business data and auth as demo-state unless stronger evidence appears.
- Do not claim server persistence, secure auth, or production readiness without new proof.
- Keep this file concise; put deeper detail in `project.context.full.md`.
