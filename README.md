# Rungset

**A focused, open-source goal-planning app for turning long-term intent into meaningful weekly progress.**

[Website](https://rungset.com) · [Open the app](https://app.rungset.com) · [Website repository](https://github.com/Ismailco/Rungset-website) · [AGPL-3.0](LICENSE)

Rungset gives goals a practical rhythm: define the outcome, break it into milestones, turn those milestones into tasks, then reflect and adjust as the work evolves.

> **Goal → Milestone → Task → Completion → Check-in → Review → Adjust**

## What Rungset includes

- Goal planning with categories, timeframes, target dates, statuses, and progress.
- Goal workspaces that bring milestones, tasks, and recent check-ins together.
- Focused task management with priorities, due dates, recurring schedules, and completion history.
- Check-ins for recording progress, blockers, and the next area of focus.
- Notes, user-scoped JSON export, and offline caching for continuity between connections.
- Email/password and social sign-in through Better Auth, with user-scoped data access.

## Product scope

Rungset is a focused beta. Calendar synchronization, analytics, team features, and external reminder delivery are deliberately not presented as finished capabilities. Reminder configuration currently supports in-app due and overdue guidance only.

## Architecture

Rungset is built as a Next.js App Router application and deployed to Cloudflare Workers through OpenNext.

- Next.js 16 and React 19
- TypeScript and Tailwind CSS 4
- Better Auth for authentication
- Drizzle ORM with Cloudflare D1 (SQLite)
- OpenNext and Wrangler for Cloudflare Workers

Client storage preserves the existing offline-first experience and synchronizes changes through authenticated `/api/*` routes. Database definitions and forward-only migrations live in `lib/db/schema.ts` and `drizzle/`.

## Run locally

**Prerequisites:** Node.js 24 (see `.nvmrc`) and pnpm 11.

```bash
pnpm install
cp .env.example .dev.vars
cp .env.example .env.local
pnpm db:migrate:local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). For the Cloudflare Workers preview path, use `pnpm cf:preview` and open [http://localhost:8787](http://localhost:8787).

Keep local-only values in `.env.local` and `.dev.vars`; neither file should contain committed secrets. `BETTER_AUTH_SECRET` must be a strong, unique value outside test fixtures. Google and GitHub credentials are optional unless those sign-in providers are enabled locally.

## Quality checks and delivery

```bash
pnpm lint              # ESLint
pnpm typecheck         # Generate Next types and run TypeScript
pnpm test              # Unit and integration coverage
pnpm test:e2e          # Critical browser journeys
pnpm build             # Production Next build
pnpm cf:preview        # OpenNext Cloudflare preview
pnpm cf:deploy         # Build and deploy the Worker
```

## Data and deployment

Create or select a Cloudflare D1 database, configure its ID in `wrangler.jsonc`, then apply migrations with `pnpm db:migrate:local` or `pnpm db:migrate:prod`. Never modify a migration that may already have run; create a new forward-only migration instead.

Production deployment requires authenticated Wrangler access and the configured Worker secrets. A successful local build is source evidence, not proof that a live deployment is healthy.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Keep changes focused, protect user data, add coverage where behavior changes, and run the relevant checks before submitting.

## License

Rungset is licensed under the [GNU Affero General Public License v3.0](LICENSE).
