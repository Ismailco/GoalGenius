# Rungset domain migration

This document records the public-domain expectations for the hosted Rungset
application without including account identifiers, deployment IDs, secrets, or
private provider runbooks.

## Current public topology

- `https://rungset.com` is the marketing and documentation website.
- `https://app.rungset.com` is the hosted application.
- `https://feedback.rungset.com` receives website feedback submissions.
- `https://www.rungset.com` redirects permanently to `https://rungset.com`.
- `www.app.rungset.com` is intentionally not used.

The Android app opens the hosted application and uses the same account,
workspace, and API origin.

## Compatibility rules

Legacy domains and internal resource identifiers may remain attached during a
domain migration so that existing links, sessions, cached data, and stored
workspace exports are not broken. Do not rename Worker, D1, cache, storage,
export-format, or OAuth compatibility identifiers without a documented
migration plan and verification of the live redirects.

The canonical public origins used by the application are:

- `NEXT_PUBLIC_APP_URL=https://app.rungset.com`
- `NEXT_PUBLIC_BETTER_AUTH_URL=https://app.rungset.com`
- `NEXT_PUBLIC_SITE_URL=https://rungset.com`

## Verification

Use a browser user agent when checking the public routes:

```bash
curl -I -A 'Mozilla/5.0' https://rungset.com
curl -I -A 'Mozilla/5.0' https://app.rungset.com/auth/signin
curl -I -A 'Mozilla/5.0' https://app.rungset.com/manifest.json
curl -I -A 'Mozilla/5.0' https://app.rungset.com/.well-known/assetlinks.json
```

Expected results:

- The marketing site and sign-in route return successfully.
- The manifest and Android asset-links document return JSON successfully.
- Any retained legacy origin redirects once to its canonical origin while
  preserving the path and query string.

## Maintenance boundary

Keep provider account details, rollback version IDs, OAuth console history,
WAF change records, and deployment-specific evidence in a private operational
runbook. This public document should describe stable behavior and contributor
expectations only.
