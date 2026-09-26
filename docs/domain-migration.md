# Rungset domain migration

## Actual production state

The public Rungset topology is now:

- `https://rungset.com` — marketing website on the Cloudflare Pages project
  `goalgenius-website`.
- `https://www.rungset.com` — active custom domain with a permanent redirect to
  `https://rungset.com`, preserving the path and query string.
- `https://app.rungset.com` — hosted application on the existing Cloudflare
  Worker `goalgenius`.
- `www.app.rungset.com` — intentionally not created.

The old custom domains remain attached and operational while the migration is
being observed:

- `goalgenius.online` -> `https://rungset.com` with path and query preserved.
- `www.goalgenius.online` -> `https://rungset.com` with path and query preserved.
- `app.goalgenius.online` -> `https://app.rungset.com` with path and query preserved.
- `www.app.goalgenius.online` -> `https://app.rungset.com` with path and query preserved.

The previously verified Pages deployment was
`0daa9c7d.goalgenius-website.pages.dev`. The feedback-hostname source change
was pushed as commit `e79ef3f` and Cloudflare Pages created deployment
`a9f56abe-b403-4c16-895d-d849e4fc5ce9` from that commit. The application
Worker production version is `4aa4b27b-bae4-4282-8097-330ed456d5e0`; the
rollback target is `d37eb9ee-a620-4c88-bc3a-cab19c929634`.

## Application configuration

The application production configuration now contains the following public
origins:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_BETTER_AUTH_URL`
- `NEXT_PUBLIC_SITE_URL`

The Better Auth production URL secret was updated to the new app origin. The
existing D1 binding, Worker name, package identifiers, storage identifiers, and
legacy compatibility origins were preserved.

The Worker was deployed with `--keep-vars`, so existing secrets and unrelated
production variables were retained. A fresh production build was used because
the public Next.js values are build-time inputs.

## OAuth and authentication

The exact production Better Auth callbacks captured from the live provider
requests are:

- Google: `https://app.rungset.com/api/auth/callback/google`
- GitHub: `https://app.rungset.com/api/auth/callback/github`

Google’s matching production Web client now contains the Rungset JavaScript
origin and callback while retaining localhost and the old GoalGenius values
for transition. A full Google flow completed through the callback and opened
an authenticated Rungset dashboard session.

The matching GitHub OAuth App was updated to application name `Rungset`,
homepage `https://rungset.com`, and callback
`https://app.rungset.com/api/auth/callback/github`. A full GitHub flow
completed through the callback and opened an authenticated Rungset dashboard
session. The old single GitHub callback is no longer the active callback.

The current repository does not contain a transactional email provider,
sender configuration, verification-email hook, or password-reset email hook.
No email sender migration was attempted, and no email delivery claim should be
made until an email provider is explicitly configured and tested.

The runtime callback base is the new app origin. The old Google callback and
localhost values remain available for transition; GitHub’s single callback was
switched to the production Rungset callback.

## Redirect verification

Browser verification passed for:

- `goalgenius.online/docs?source=stabilization` ->
  `rungset.com/docs/?source=stabilization`.
- `www.goalgenius.online/privacy?source=stabilization` ->
  `rungset.com/privacy/?source=stabilization`.
- `app.goalgenius.online/auth/signin?source=stabilization` ->
  `app.rungset.com/auth/signin?source=stabilization`.
- `www.app.goalgenius.online/goals/redirect-check-rungset-20260926?source=stabilization` ->
  `app.rungset.com/auth/signin?callbackUrl=%2Fgoals%2Fredirect-check-rungset-20260926%3Fsource%3Dstabilization`.
- `www.rungset.com/terms?source=stabilization` ->
  `rungset.com/terms/?source=stabilization`.

The trailing slash on static marketing routes is the normal static-export
normalization and does not remove the query string.

## Cloudflare security

Cloudflare dashboard verification shows two active custom rules: the narrow
Rungset application-surface rule and a managed challenge rule for suspicious
automated clients. One active authentication-write rate-limit rule covers the
Better Auth email/social sign-in and sign-up write endpoints.

The application-surface rule covers dynamic `/goals/*`, `/api/export`,
`/api/todo-occurrences`, Better Auth, and the dynamic goal, milestone, note,
todo, and check-in API prefixes. WAF was not disabled globally.

## Feedback Worker

The existing Worker `goalgenius-feedback-form` now has the custom domain
`https://feedback.rungset.com`. The original
`goalgenius-feedback-form.soultware.workers.dev` endpoint remains attached.

The public marketing form now targets `https://feedback.rungset.com`. The
Worker’s legacy CORS-only response was found and corrected in Cloudflare Quick
Edit. The deployed allowlist accepts `rungset.com`,
`www.rungset.com`, and the legacy GoalGenius marketing origins; active Worker
version `d7be61fd` reports no editor problems.

The new hostname responds to the Worker contract (`GET` is rejected with
`405`; `POST` and `OPTIONS` are allowed). A synthetic feedback POST was
not submitted during this pass, so delivery to the configured mailbox remains
the only unconfirmed feedback check.

## Analytics and search

No analytics provider or measurement ID is present in the marketing-site
source, so no analytics property was changed. The `rungset.com` Domain
property was verified in Google Search Console using Cloudflare DNS
authorization, and `https://rungset.com/sitemap.xml` was submitted
successfully. Existing GoalGenius properties were not removed.

The live app manifest reports `Rungset` for both `name` and `short_name`,
with `start_url: "/"` and standalone display. The live service worker is
version `v5`, uses Rungset cache names, and removes old `goalgenius-*` and
stale Rungset caches. Browser verification observed successful
service-worker registration at the app origin and no app-specific console
errors in the captured app logs.

Local app typecheck, tests, and production build passed. The marketing lint
and static export build passed, including generated `robots.txt` and
`sitemap.xml` routes.

## Rollback notes

- Cloudflare Worker rollback target: version
  `d37eb9ee-a620-4c88-bc3a-cab19c929634`.
- Current application Worker version:
  `4aa4b27b-bae4-4282-8097-330ed456d5e0`.
- Feedback Worker corrected active version: `d7be61fd`.
- The old app and marketing custom domains remain attached, so redirects can
  be disabled or adjusted without deleting DNS records.
- Pages deployment history remains available in Cloudflare Pages for restoring
  the previous marketing deployment.
- Legacy domains, old Google OAuth entries where supported, and the original
  feedback workers.dev hostname remain available for transition.

## Authenticated smoke-test boundary

The dashboard was reached through completed Google and GitHub OAuth sessions,
and signed-in navigation and existing goal data rendered. A full destructive
CRUD pass against a temporary goal, milestone, task, recurrence, check-in,
export, and logout cycle was not completed in this pass. No real user content
was modified or deleted.

The existing migration commits are pushed to their existing `main` branches:

- App: `c0c0de6`, `808301b`, and prior rebrand commit `67e4c33`.
- Marketing: `279b66b` and feedback-hostname commit `e79ef3f`.

No repository slug was renamed, no force push was used, and optional GitHub
repository metadata was not changed.

## Remaining blockers

1. Run the full authenticated CRUD/export/check-in/logout regression with a
   disposable test goal.
2. Submit one synthetic feedback form and confirm the Worker delivery result.
3. Configure transactional email only if email verification or password-reset
   flows are required.
