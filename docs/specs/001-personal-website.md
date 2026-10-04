# Specification 001: Personal website, version 1

Status: Implemented for local review. Local preview only; no commit, push, or deployment without a later request.

## Purpose

Introduce Vipul Gupta to professional visitors while providing a home for travel, photos, and personal writing. The initial warm, minimal design is updated by [Specification 003](003-dark-theme-and-motion.md): dark charcoal backgrounds, bright mint accents, serif display type, and clear off-white body text. [Specification 006](006-tech-themes-and-updates.md) adds theme choices. [Specification 007](007-contact-reactions-and-refinements.md) retains Ocean (default) and Charcoal, and adds website chat and shared article reactions.

## Evidence and content

Professional claims initially come from the user-provided 2026 resume. [Specification 004](004-professional-profile-update.md) records the user-confirmed current role: Lead SRE Engineer, GXS Bank (Grab), Singapore, from 2025. [Specification 005](005-career-entries-and-photo.md) presents separate GXS roles: Lead SRE Engineer, 2025–present, and Senior SRE Engineer, March 2022–2025. [Specification 006](006-tech-themes-and-updates.md) refines the user-confirmed dates to April 2025–present and March 2022–March 2025 respectively. The user confirms leadership responsibilities in infrastructure automation, AI infrastructure and governance. Overall GXS employment began March 2022. Previous roles: Xylem Senior DevOps Engineer, September 2019-March 2022, Singapore; Xylem DevOps Engineer, March 2018-September 2019, Bangalore; Onmobile Global Limited Operations Engineer, July 2015-March 2018, Bangalore. Retain the resume's 25 percent AWS infrastructure cost reduction claim without inventing other numbers. User described travel, photography and blogs as personal interests. No invented trips, posts, testimonials or independently named projects.

Do not copy the source PDF into public assets: it contains address, telephone, DOB, visa status, nationality and certificate ID. Professional education/certification titles and public LinkedIn/GitHub links may be shown. A printable HTML resume is the v1 resume feature. The public portrait may be extracted from the supplied resume.

## Scope and routes

- `/`: introduction, professional snapshot, selected focus areas, personal interests, invitations to Experience and Journal.
- `/experience/`: complete career timeline, grouped skills, education and certification, print-resume control.
- `/tech/`: professional Markdown posts, learning and community milestones; shareable article routes at `/tech/{id}/`.
- `/about/`: professional approach and personal interests, contact through LinkedIn and GitHub.
- `/journal/`: accessible category filters (All, Thoughts & Conversations, Life Notes, What If, Humour); honest empty state with no fabricated articles.
- `/my-space/`: personal hub for Travel, Photos and Memories, introduced by [Specification 008](008-journal-and-my-space.md).
- `/photos/`: deliberate empty gallery with explanation that public photo collections will appear here. No fake locked albums.
- `/chat/`: anonymous visitor conversation, with replies read in the same browser.
- `/inbox/`: owner-only inbox; excluded from public navigation and sitemap. Local preview and production authorization are separate.
- `/404.html`: useful navigation back home.

Main navigation: Home, Experience, Tech, About, Journal, My Space. Consistent footer and a skip link. No Projects route until real public case studies are available.

## Acceptance criteria

AC01 All required routes render, with one h1, unique title, canonical URL and meta description.
AC02 Resume employers, dates, education and cost reduction match the source; private details and source PDF are absent from built files.
AC03 Desktop and mobile layouts have no horizontal overflow at 375px, 768px and 1440px.
AC04 Navigation, menu, filters, print and links work with keyboard; visible focus, reduced-motion support and WCAG AA text contrast.
AC05 Empty content is clearly identified; no fabricated destinations, metrics, testimonials or articles.
AC06 Print Experience as a clean resume, omitting navigation, footer and controls.
AC07 Static output builds to dist and Cloudflare Workers serves public files from dist and interactive API responses; unknown routes use an actual 404.
AC08 Before deployment, automated quality gates (deferred during local iterations by the user): Astro strict type checks, Prettier formatting, production build, functional browser tests and axe accessibility checks.
AC09 No tracking, external font requests, Drive credentials, unprotected private images or pretend message-delivery claims. Real chat follows Specification 007.
AC10 Local preview and screenshots provided; no remote mutations or deployment for this request.

## Deferred work

Journal publishing is implemented by [Specification 002](002-journal-publishing.md). Remaining deferred work: Drive-backed album storage, Cloudflare Access, per-album authorization, private image delivery, additional blog content, real travel photographs, a separately approved public PDF and public case studies. Protect both album pages and all media endpoints when private albums are implemented; public Drive links cannot be used for private photos.

## Design contracts

`BaseLayout.astro` props: title:string, description:string. It imports `src/styles/global.css` and supplies Header/Footer. Page content goes in its slot. Shared CSS utilities: container, section, eyebrow, display, lead, button, button--outline, text-link, page-header, card, tag, grid-two, grid-three. Body links are underlined or otherwise identifiable.

`src/data/profile.ts` exports profile, experience, skillGroups, education, certifications, highlights. All strings are renderable content, no HTML. Pages import their data and BaseLayout.

The public original placeholder index.html is removed only after the new build succeeds. Illustrations are explicitly decorative and must not imply real travel photographs.
