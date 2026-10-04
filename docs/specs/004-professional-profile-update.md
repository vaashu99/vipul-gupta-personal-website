# Specification 004: Lead SRE designation and professional profile enrichment

Status: Implemented for local review. No commit, push or deployment performed. The combined GXS entry/role-history presentation is superseded by [Specification 005](005-career-entries-and-photo.md); evidence and credential requirements remain applicable.

## Evidence and priority

The user directly confirms Lead SRE Engineer from 2025, overriding the earlier resume's current-title wording. The promotion month is not supplied; use year precision unless the user provides it. Preserve overall GXS employment beginning March 2022, with the previous Senior SRE position represented separately from the current title.

LinkedIn URL: https://www.linkedin.com/in/vipul-gupta-tech/
Publicly indexed regional profile: https://sg.linkedin.com/in/vipul-gupta-tech
Reviewed 4 October 2026. Direct automated reads fail; the indexed profile is partial, not a complete authenticated profile review. Same profile identifier, Singapore location, GXS references and career recommendations establish the relevant source. Do not use results for other people with the same name.

The indexed credential section records the NUS AI deployment/operations program issued July 2026 and the existing Red Hat containers/Kubernetes credential issued September 2021, expired September 2024. Recommendations mention junior-engineer mentoring at Xylem and cross-team collaboration at GXS. Summarize conservatively; no copied testimonials or newly invented outcomes. The original supplied resume remains the source for existing responsibilities, education and the 25 percent AWS cost reduction.

## Acceptance criteria

- PP01 Current role is Lead SRE Engineer throughout the professional data, homepage snapshot/metadata, About content, Experience identity and printed resume.
- PP02 Promotion begins in 2025 with no invented month. GXS company tenure remains March 2022 to present; preceding Senior SRE role and its year-level end are explicit. Shared data supplies current-title text and start-year labels.
- PP03 Include the verified NUS continuing-learning credential with its issue date. Date the Red Hat credential and show its historical expiry so it is not presented as currently valid.
- PP04 About content may add concise mentoring and ongoing-learning context. Existing role responsibilities and professional achievements remain sourced; no fabricated leadership metrics, production AI claims or conference appearances.
- PP05 Credential IDs, private identifiers and the original resume remain outside public source/assets. Do not import education-date differences from ambiguous indexed rows, or attribute liked/reposted content to the user.
- PP06 Strict type checks, formatting, build, production browser checks, responsive layouts and accessibility pass. Review Experience and printed resume for clean pagination after adding role progression and learning details.
- PP07 Changes remain in the local preview. No push, live deployment or LinkedIn profile mutation is requested.

## Source notes

The linked profile's About section is truncated and experience titles are missing from public indexing. The requested current designation/date therefore comes from the user, not from an inferred LinkedIn title. More detailed profile content requires a user-provided export or accessible source.

## Validation

Strict Astro checks and the production build pass. Home, About and Experience use the shared current role. The rendered About paragraph was checked for correct spacing. Desktop Experience and all three A4 print pages were visually reviewed: role progression, company tenure and dated credentials are readable without clipping or orphaned headings. See `docs/test-report.md` for browser, responsive and accessibility results. The review preview remains available on port 4321.
