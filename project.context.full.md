# project.context.full.md

## Purpose
This file stores deeper repository truth for architecture, module boundaries, runtime reality, risks, and unresolved questions.
It should reflect only what is confirmed or clearly labeled from repo evidence.

## Project identity
- Project: `nooncode-app`
- Product name in the UI: `NoonApp`
- Repo path: `C:\Users\melan\Downloads\nooncode-app`
- Application type: Next.js App Router web application
- Current observed stage: MVP/demo with active feature iteration, not production-hardened

## Confirmed product truth
- Confirmed product purpose:
  - A role-based operational workspace that spans sales pipeline work, delivery/project execution, personal earnings and rewards, reporting, and an AI copilot named Maxwell.
- Confirmed primary roles in the product:
  - `admin`
  - `sales_manager`
  - `sales`
  - `pm`
  - `developer`
- Confirmed user-facing module inventory from routed surfaces and sidebar navigation:
  - Login/demo account selection
  - Dashboard summary
  - Leads
  - Pipeline
  - Projects
  - Tasks
  - Earnings
  - Rewards
  - Reports
  - Settings
  - Maxwell chat/copilot
- Confirmed product narrative from UI copy:
  - "Gestiona ventas y proyectos en un solo lugar"
  - sales-to-delivery handoff
  - commissions and rewards
  - AI-assisted work for sellers, PMs, and developers

## Supported hypotheses about product
- Hypothesis: the product is aimed at an internal services team or software agency rather than a public SaaS self-serve audience.
  - Evidence: role model, lead-to-project flow, project delivery modules, earnings/rewards, and handoff language.
- Hypothesis: the target working language/locale is Spanish-speaking and likely Mexico-oriented.
  - Evidence: Spanish UI copy, `es-MX` date formatting, and sample phone numbers/company naming.
- Hypothesis: the current repo represents a demoable prototype intended to validate workflows before real backend integration.
  - Evidence: comprehensive mock data, client-only auth, missing persistence layer, and real-looking but minimal AI route.

## Architecture overview
- Confirmed app shell:
  - `app/layout.tsx` is the root shell.
  - `app/page.tsx` is a client-rendered login/demo landing screen.
  - `app/dashboard/layout.tsx` is a client-side protected shell that mounts sidebar, shared data context, and Maxwell.
- Confirmed state and data flow:
  - `AuthProvider` in `lib/auth-context.tsx` owns in-memory user session state.
  - `DataProvider` in `lib/data-context.tsx` owns in-memory business datasets and CRUD mutations.
  - Dashboard pages consume raw context data and/or selector-derived view models.
  - `lib/dashboard-selectors.ts` is a pure derivation layer for dashboard/report/reward/settings display models.
- Confirmed server/API shape:
  - Only one repo-local API route was found: `app/api/maxwell/route.ts`.
  - No CRUD API routes for leads, projects, tasks, rewards, earnings, or users were found.
- Confirmed component boundaries:
  - `components/app-sidebar.tsx` maps navigation by role.
  - `components/maxwell-fab.tsx` and `components/maxwell-chat.tsx` surface the AI assistant across the dashboard.

## Confirmed functional modules actually present
- Auth/login demo surface
  - Demo account picker with email autofill
  - Login success redirects to `/dashboard`
- Role-aware dashboard shell
  - Sidebar sections vary by sales/delivery/admin helpers
  - Unauthorized dashboard routes redirect back to `/dashboard`
- Sales surfaces
  - Leads and pipeline routes exist and are navigable for sales-capable roles
- Delivery surfaces
  - Projects and tasks routes exist and are navigable for delivery-capable roles
- Finance/personal surfaces
  - Earnings, rewards, and reports routes exist in finance navigation for all authenticated users
- Admin surface
  - Settings route exists and is shown only for admin in the sidebar
- AI assistant
  - Maxwell chat is mounted globally inside dashboard layout and posts to `/api/maxwell`

## Confirmed auth model reality
- Auth implementation is client-side and mock-backed.
- `login(email, password)` in `lib/auth-context.tsx`:
  - waits 800ms to simulate API latency
  - matches user by email against `mockUsers`
  - ignores the password value
- Auth state:
  - stored in React state only
  - not persisted across reloads
  - no cookies, JWTs, localStorage session restore, or server verification were found in inspected files
- Authorization model:
  - helper-based role checks (`canAccessSales`, `canAccessDelivery`, `canAccessAdmin`, `canManageTeam`, `canViewAllStats`)
  - route access rules live in `lib/auth-context.tsx`
  - dashboard shell enforces redirects in `app/dashboard/layout.tsx`
- Confirmed access rule coverage:
  - `/dashboard/settings` -> admin
  - `/dashboard/leads` and `/dashboard/pipeline` -> sales access
  - `/dashboard/projects` and `/dashboard/tasks` -> delivery access
  - routes not listed fall back to authenticated-only access

## Confirmed data model reality
- Core business entities in `lib/types.ts`:
  - `User`
  - `Lead`
  - `Project`
  - `Task`
  - `Payment`
  - `Commission`
  - `PointEvent`
  - `Reward`
  - `RewardRedemption`
  - `Activity`
- Confirmed ownership/assignment fields already in the model:
  - leads: `assignedTo`
  - projects: `pmId`, `pmName`, `teamIds`
  - tasks: `assignedTo`, `assignedToName`
- Confirmed state source:
  - `mockUsers`
  - `mockLeads`
  - `mockProjects`
  - `mockTasks`
  - `mockRewards`
  - point history is runtime-only state, initially empty
- Confirmed mutation behavior:
  - CRUD-like methods update React state only
  - no persistence layer or server sync exists in inspected files

## Confirmed mock-first vs real integration truth
- Confirmed mock-first areas:
  - auth/users
  - leads
  - projects
  - tasks
  - rewards
  - points history state
  - most dashboard/reporting/finance numbers derived locally from mock/in-memory state
- Confirmed partially real area:
  - Maxwell uses a real server route shape and AI SDK streaming API surface
- Best current classification:
  - the app is mock-first overall, with a partially real AI integration surface

## Stack details
- Confirmed framework/runtime:
  - Next.js `16.0.10`
  - React `19.2.0`
  - TypeScript `^5`
- Confirmed styling/component stack:
  - Tailwind CSS `^4.1.9`
  - Radix UI packages
  - shadcn-style local UI components
- Confirmed feature libraries:
  - `recharts`
  - `@dnd-kit/*`
  - `react-hook-form`
  - `zod`
  - `react-markdown`
  - `sonner`
  - `@ai-sdk/react`
  - `ai`
  - `@vercel/analytics`
- Confirmed scripts:
  - `dev`: `next dev`
  - `build`: `next build`
  - `start`: `next start`
  - `lint`: `eslint .`

## Runtime and deploy truth
- Confirmed runtime assumptions:
  - standard Next.js Node-based local workflow via package scripts
  - root layout includes Vercel Analytics
  - `next.config.mjs` sets `images.unoptimized = true`
  - `next.config.mjs` sets `typescript.ignoreBuildErrors = true`
- Supported deployment hypothesis:
  - likely Vercel-oriented because Vercel Analytics is wired and the metadata generator is `v0.app`
- Unknown runtime/deploy items:
  - no deployment config file was inspected proving hosting target
  - no environment variable usage was found in the inspected repo files
  - no CI/CD definition was inspected

## API and service boundaries
- Confirmed API route inventory:
  - `app/api/maxwell/route.ts`
- Confirmed Maxwell route behavior:
  - accepts chat messages
  - streams responses with AI SDK helpers
  - uses model identifier `openai/gpt-4o-mini`
  - system prompt positions Maxwell as a Spanish-language copilot for sellers, PMs, and developers
- Unknown service reality:
  - whether a provider key/config exists at runtime
  - whether the chosen model/provider configuration is functional in deployed environments

## Important paths
- Core app paths:
  - `app/`
  - `components/`
  - `lib/`
  - `docs/`
  - `hooks/`
  - `public/`
  - `styles/`
- High-signal files inspected in this discovery pass:
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
  - `components/app-sidebar.tsx`
  - `components/maxwell-fab.tsx`
  - `components/maxwell-chat.tsx`
  - `package.json`
  - `next.config.mjs`

## Current risks
- High:
  - auth is mock-only and client-side; passwords are ignored
  - authorization is enforced in client code, not proven at a trusted backend boundary
  - business data is in-memory only and resets on refresh
  - TypeScript build errors are intentionally ignored
- Medium:
  - no repo-local automated tests were found
  - reports analytics mix derived values with hardcoded monthly history in selectors
  - repo docs include session-handoff notes that may lag behind current code reality
- Low/observational:
  - package name remains `my-v0-project`, which suggests scaffold residue
  - some UI strings show mojibake/encoding issues in source text

## Unresolved unknowns
- Whether there is a separate backend or data service outside this repo
- Whether the product has real authentication planned or already exists elsewhere
- Whether Maxwell is expected to be a production feature or demo-only enhancement
- Whether earnings/rewards correspond to real financial workflows or demo abstractions
- Whether deployment target, secrets model, and operational monitoring exist outside the inspected files

## Practical guidance for future sessions
- Treat all business-domain data and auth as demo-state unless stronger repo evidence is added.
- Do not claim persistence, secure auth, or production readiness.
- When changing reports or metrics, check selectors for hardcoded data before assuming charts are fully data-driven.
- When documenting auth or security, distinguish route-level helper checks from true backend enforcement.
