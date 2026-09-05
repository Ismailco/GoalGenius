# Changelog

All notable changes to GoalGenius are documented here.

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

## Unreleased

No unreleased changes.
