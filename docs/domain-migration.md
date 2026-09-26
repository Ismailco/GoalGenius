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

The marketing site was deployed to Pages as deployment
`0daa9c7d.goalgenius-website.pages.dev`. The application Worker was deployed
with version `4aa4b27b-bae4-4282-8097-330ed456d5e0`; the immediately previous
production version was `d37eb9ee-a620-4c88-bc3a-cab19c929634`.

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

## Authentication and email

The new sign-in page, Better Auth session endpoint, and Google/GitHub social
sign-in initiation endpoints respond successfully on `app.rungset.com`. The
application still retains the old app origins for transition compatibility.

The current repository does not contain a transactional email provider,
sender configuration, verification-email hook, or password-reset email hook.
No email sender migration was attempted, and no email delivery claim should be
made until an email provider is explicitly configured and tested.

Provider-dashboard verification remains required for the exact Google and
GitHub callback allowlists. The runtime callback base is the new app origin and
the old origin remains available for rollback/transition purposes.

## Redirect verification

Browser verification passed for:

- `goalgenius.online/docs?source=migration` ->
  `rungset.com/docs/?source=migration`.
- `www.goalgenius.online/privacy?source=migration` ->
  `rungset.com/privacy/?source=migration`.
- `app.goalgenius.online/auth/signin?source=migration` ->
  `app.rungset.com/auth/signin?source=migration`.
- `www.app.goalgenius.online/goals/example?source=migration` ->
  `app.rungset.com/auth/signin?callbackUrl=%2Fgoals%2Fexample%3Fsource%3Dmigration`.
- `www.rungset.com/terms?source=check` ->
  `rungset.com/terms/?source=check`.

The trailing slash on static marketing routes is the normal static-export
normalization and does not remove the query string.

## Cloudflare security

The new Pages custom domains are active with SSL, and the app custom domain is
active on the existing Worker. The WAF policy was not applied because the
available authenticated session does not include the required Zone WAF Edit
permission and no scoped WAF token was available.

The local WAF configuration script was corrected and committed so its intended
allowlist covers dynamic goal pages, `/api/export`, `/api/todo-occurrences`,
and the dynamic goal, milestone, note, todo, and check-in API prefixes. The
policy must still be reviewed and applied with a properly scoped token or from
the Cloudflare dashboard.

## Feedback Worker

The public feedback form still uses the existing endpoint
`goalgenius-feedback-form.soultware.workers.dev`. Its Worker source/configuration
was not present in either GoalGenius repository, so it was not renamed or
repointed without a verified replacement. The endpoint remains a known
legacy-branded external dependency and should be migrated only after its owning
Worker source, bindings, and delivery behavior are identified.

## Analytics and search

No analytics provider or measurement ID is present in the marketing-site
source, so no analytics property was changed. Search Console was not changed
because no authenticated Search Console session was available. The deployed
marketing site should be added to Search Console and its sitemap submitted
manually when access is available.

## Rollback notes

- Cloudflare Worker rollback target: version
  `d37eb9ee-a620-4c88-bc3a-cab19c929634`.
- The old app and marketing custom domains remain attached, so redirects can
  be disabled or adjusted without deleting DNS records.
- Pages deployment history remains available in Cloudflare Pages for restoring
  the previous marketing deployment.
- Do not remove legacy OAuth callback entries or old domains until the new
  provider callbacks, email links, and active-session behavior are confirmed.

## Remaining manual actions

1. Verify/add Google OAuth origins and callback URLs for `app.rungset.com`.
2. Verify/update the GitHub OAuth callback URL for `app.rungset.com`.
3. Configure and test a transactional email provider if verification or reset
   emails are required.
4. Apply the reviewed WAF rules with Zone WAF Edit access.
5. Identify and migrate the external feedback Worker behind a Rungset-facing
   hostname, preserving the old endpoint during transition.
6. Add `rungset.com` to Search Console and submit its sitemap.
7. Update any external analytics, repository metadata, or official social/listing
   profiles when authenticated access is available.
