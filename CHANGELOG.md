# Changelog 

All notable changes to Rungset are documented here.

## Unreleased

### Added

- Public contributor guidance covering community conduct, security reporting,
  privacy-safe issue reports, and newcomer-friendly issue discovery.
- Documentation for the published Android app and the canonical hosted origins.

### Changed

- Updated the public repository identity and migration documentation for Rungset
  while preserving deployment and data-compatibility identifiers.
- Updated the Next.js, OpenNext, Wrangler, and Workers runtime toolchain and
  migrated request protection to the Next 16 `proxy.ts` convention.
- Clarified the beta scope: Android is available through the hosted workspace;
  iOS, analytics, calendar synchronization, AI, and external reminder delivery
  remain outside the shipped product.

### Fixed

- Removed stale product branding and deployment-specific details from public
  contributor-facing documentation.

## [0.1.0-beta.1] - 2026-09-05

### Added

- Goal execution flow connecting goals, milestones, tasks, completion, check-ins, and review.
- Daily, weekly, and monthly recurring tasks with preserved completion history.
- Task reminder configuration with in-app due and overdue surfacing.
- Progressive first-run onboarding and actionable dashboard focus sections.
- Authenticated, user-scoped JSON data export covering planning and check-in data.
- Responsive and keyboard-accessible workflows for the core beta experience.

### Changed

- Calendar synchronization, analytics, and other unfinished surfaces are no longer presented as finished beta features.
- Documentation now describes the OpenNext/Cloudflare deployment path and local migration workflow.

### Fixed

- Date-only rendering and recurrence boundaries now use deterministic calendar rules.
- Goal, milestone, task, note, and check-in relationships are validated server-side.
- Offline application data is namespaced and cleared across account transitions.

### Security

- Protected operations derive ownership from validated Better Auth sessions.
- Cross-user and cross-goal relationship isolation is covered by integration tests.
