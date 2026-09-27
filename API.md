# Rungset application API

Rungset's `/api` routes serve the web application. They are not a versioned public API contract; request shapes may evolve with the product.

## Authentication and ownership

All workspace routes require a Better Auth session. The server derives the active user from that session—clients must not send a `userId` query parameter or rely on a `userId` in a request body. Any supplied body `userId` is ignored for ownership. Resource lookups, writes, and goal/milestone relationships are scoped to the signed-in user.

Authentication endpoints are provided by Better Auth under `/api/auth/*`. Email/password is available, with Google and GitHub sign-in available when those providers are configured.

## Conventions

- Requests and successful responses use JSON, except for browser download handling of the workspace export.
- Dates use `YYYY-MM-DD` where a date-only value is accepted.
- Write bodies are limited to 2 MB and validated at the route boundary.
- Collection routes accept `GET`, `POST`, `PUT`, and `DELETE` as listed below. `GET` and `DELETE` are also available through the matching `/:id` alias.

Errors use this shape:

```json
{ "error": "A short explanation" }
```

Validation errors may additionally include `details`. Common status codes are `400` (invalid request), `401` (not signed in), `404` (missing or inaccessible resource), `413` (payload too large), and `500` (unexpected server error).

## Workspace routes

| Resource | Read | Create | Update | Delete |
| --- | --- | --- | --- | --- |
| Goals | `GET /api/goals` or `GET /api/goals/:id` | `POST /api/goals` | `PUT /api/goals` | `DELETE /api/goals?id=:id` or `DELETE /api/goals/:id` |
| Tasks | `GET /api/todos`, `?completed=true|false`, or `GET /api/todos/:id` | `POST /api/todos` | `PUT /api/todos` | `DELETE /api/todos?id=:id` or `DELETE /api/todos/:id` |
| Milestones | `GET /api/milestones`, optional `?goalId=:goalId`, or `GET /api/milestones/:id` | `POST /api/milestones` | `PUT /api/milestones` | `DELETE /api/milestones?id=:id` or `DELETE /api/milestones/:id` |
| Notes | `GET /api/notes` or `GET /api/notes/:id` | `POST /api/notes` | `PUT /api/notes` | `DELETE /api/notes?id=:id` or `DELETE /api/notes/:id` |
| Check-ins | `GET /api/checkins` or `GET /api/checkins/:id` | `POST /api/checkins` | `PUT /api/checkins` | `DELETE /api/checkins?id=:id` or `DELETE /api/checkins/:id` |

Goals require a title, category, timeframe, and status. Tasks require a title and priority; optional `goalId` and `milestoneId` must refer to resources owned by the current user, and a milestone must belong to its supplied goal. Milestones require an owned `goalId`, title, and date. Check-ins accept date, mood, energy, accomplishments, challenges, goals, optional notes, and an optional owned `goalId`.

`GET /api/todo-occurrences` returns completion history for the current user's recurring tasks; pass `?todoId=:id` to narrow it to one task. `GET /api/export` returns the current user's complete workspace export (profile, goals, milestones, tasks, task occurrences, notes, and check-ins).

## Local development

```bash
cp .dev.vars.example .dev.vars
cp .env.local.example .env.local
pnpm dev
```

The development server exposes routes at `http://localhost:3000/api`. For the Cloudflare Worker path, run `pnpm cf:preview` and use `http://localhost:8787/api`.

## Support

See the [README](README.md) for project setup and open a [GitHub issue](https://github.com/Ismailco/Rungset/issues) for reproducible bugs or proposals.
