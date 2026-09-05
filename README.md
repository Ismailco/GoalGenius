# GoalGenius

GoalGenius is an open-source beta for turning long-term goals into weekly actions and measurable progress.

The core loop is: **Goal → Milestone → Task → Completion → Check-in → Review → Adjust**.

## Status

GoalGenius is currently a focused beta. Goals, milestones, tasks, check-ins, notes, offline caching, recurring task history, task reminders, export, and Better Auth are implemented. Calendar synchronization, analytics, and team features are intentionally not presented as finished features.

## Features

- Goal planning with category, timeframe, target date, status, and progress.
- Goal execution pages with milestones, actionable tasks, and recent check-ins.
- Fast task completion with optional due dates and priorities.
- Daily, weekly, and monthly recurring tasks with preserved completion history.
- Task reminder configuration with in-app due/overdue surfacing; external delivery is not implemented yet.
- Concise historical check-ins for progress, blockers, and next focus.
- Notes, offline cache, and a user-scoped JSON export.
- Server-side Better Auth sessions and user-scoped D1 queries.

## Stack and architecture

- Next.js 16.2.12 App Router and React 19.
- TypeScript and Tailwind CSS 4.
- Better Auth for email/password and social authentication.
- Drizzle ORM over Cloudflare D1 (SQLite).
- OpenNext for Cloudflare Workers deployment.

The App Router provides the pages and route handlers. Client storage in `lib/storage.ts` keeps the existing offline-first behavior and synchronizes mutations through the authenticated `/api/*` routes. Database definitions and forward-only migrations live in `lib/db/schema.ts` and `drizzle/`.

## Local development

Prerequisites: Node.js 24 (see `.nvmrc`) and pnpm 11.

```bash
pnpm install
cp .env.example .dev.vars
cp .env.example .env.local
pnpm db:migrate:local
pnpm dev
```

Use `http://localhost:3000` for `pnpm dev`. Use `http://localhost:8787` for the OpenNext/Workers preview path. Put local-only values in `.env.local` and `.dev.vars`; neither should contain committed secrets.

Required authentication values are documented in the example files. `BETTER_AUTH_SECRET` must be a long random value outside test fixtures. Google/GitHub credentials are optional unless those providers are enabled for local testing.

## Commands

```bash
pnpm dev                 # Next development server
pnpm lint                # ESLint
pnpm exec tsc --noEmit   # TypeScript
pnpm build               # Production Next build
pnpm db:migrate:local    # Apply D1 migrations locally
pnpm db:migrate:prod     # Apply D1 migrations remotely
pnpm test                # Unit and API/database integration tests
pnpm test:e2e            # Critical browser journey and viewport smoke test
pnpm cf:preview          # OpenNext Cloudflare preview
pnpm cf:deploy           # Build and deploy the Worker
```

## Database and deployment

Create or select a D1 database, set its ID in `wrangler.jsonc`, then apply the migrations. Never edit a migration that may already have been applied; add a new migration instead. This project deploys to Cloudflare Workers through OpenNext, not Cloudflare Pages.

Remote deployment requires authenticated Wrangler access and the configured Worker secrets. A successful local build does not prove a live deployment. External reminder delivery requires a future scheduler and notification provider; this beta stores reminder configuration only.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Keep changes focused on the goal execution loop, add behavior tests for security-critical changes, and run lint, typecheck, tests, and the production build before submitting.

## License

GoalGenius is licensed under the GNU Affero General Public License v3.0. See [LICENSE](LICENSE).
