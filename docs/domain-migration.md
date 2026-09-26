# Rungset domain migration

Rungset's canonical public site is `https://rungset.com` and the hosted app is
`https://app.rungset.com`.

During cutover, keep the old public host `goalgenius.online` plus
`app.goalgenius.online` and `www.app.goalgenius.online` available long enough
to preserve existing bookmarks, OAuth returns, password-reset links, and PWA
deep links. Configure permanent redirects at the old public site and app hosts
so each old path maps to the same path on the new host. Do not redirect the
old app host to the marketing site; `/auth/*` and authenticated app routes must
land on `app.rungset.com`.

The repository keeps the legacy app origins in Better Auth trusted origins and
the Worker route list for this transition. Remove those compatibility entries
only after the old DNS, OAuth providers, email links, and active sessions have
been confirmed migrated.

External actions still required are listed in the delivery report: DNS and
Cloudflare custom domains, OAuth callback allowlists, Better Auth production
URL/secrets, email-provider links, analytics properties, and Search Console.
