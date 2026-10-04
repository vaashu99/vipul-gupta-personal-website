# Specification 005: Separate Lead SRE experience and refreshed homepage photo

Status: Implemented for local review. No commit, push or deployment performed.

## User-confirmed changes

Give Lead SRE Engineer a separate career entry, matching the existing separate Xylem DevOps and Senior DevOps entries. The user authorizes moving suitable existing GXS responsibilities into the Lead entry and confirms additional work driving infrastructure-operations automation, building infrastructure for AI solutions, and governance standards. Rephrase professionally without inventing tools, outcomes, metrics, team sizes or promotion months.

Replace the previous homepage photograph with the user-supplied `/Users/vipul.gupta/Downloads/IMG_3888.jpeg`. The user reports the prior photograph was misaligned. Use the new centered photograph without intentional cropping or stretching, with optimized public derivatives and no embedded metadata.

This specification supersedes the combined GXS entry/role-history presentation in Specification 004 and the photograph selection in Specification 003. Other requirements remain applicable. The ambient LinkedIn browser URL is not a request to import an event or announcement.

## Acceptance criteria

- CE01 GXS has two independent entries: Lead SRE Engineer, 2025–present, then Senior SRE Engineer, March 2022–2025. Each has its own responsibilities, dates and employer. Preserve chronology and avoid inventing a month in 2025.
- CE02 Lead responsibilities cover driving automation initiatives, AI infrastructure and governance standards. Move relevant existing leadership responsibilities here. Retain technical responsibilities and the source-supported 25 percent AWS cost reduction in the preceding role without duplicating them.
- CE03 Current title remains consistent across Home, About, metadata and printed resume. NUS learning, dated Red Hat credentials, education and other employers remain unchanged.
- CE04 Homepage uses IMG_3888 derivatives with accurate intrinsic dimensions and responsive sources. The new image stays centered, keeps its source proportions and fits desktop/mobile layouts. Preserve the source outside the repository and omit metadata from derivatives.
- CE05 Type checks, formatting, production build, browser tests and accessibility pass. Review refreshed Home on desktop/mobile, Experience and each printed resume page for readable pagination and no clipped content.
- CE06 Keep changes in the local preview; no remote publishing or profile mutation.

## Validation

Strict Astro checks and the production build pass. Lead and Senior GXS roles are separate entries with distinct responsibilities. Metadata-free WebP derivatives measure 600 × 436 and 1200 × 872 pixels; the original remains outside the repository. Desktop/mobile Home and the complete Experience page were visually approved. All three A4 print pages were reviewed: both GXS roles fit together on page one, earlier roles on page two, and skills/credentials on page three, with no clipping or orphaned headings. See `docs/test-report.md` for browser, responsive and accessibility acceptance results. The review preview remains available on port 4321.
