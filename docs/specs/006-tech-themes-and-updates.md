# Specification 006: Tech writing, themes, achievements and richer imagery

Status: Implemented for local preview. Full tests and testing agents deferred until deployment, per the user's latest instruction.

## Requested changes and evidence

The user confirms exact GXS periods: Senior SRE Engineer March 2022–March 2025; Lead SRE Engineer April 2025–present. These supersede the year-only dates in Specifications 004/005. Preserve separate roles and their responsibilities.

Navigation order: Home, Experience, Tech, About, Journal, Photos. Tech contains professional writing and milestones; Journal remains personal. Add real Markdown posts for the user-confirmed GitLab panel participation and July 2026 NUS credential, with a homepage latest-posts section. Public indexed LinkedIn evidence identifies GitLab After Dark Singapore and discussion of DevSecOps foundations, AI readiness and governance. The event year is not securely verified; do not invent an event year or a personal takeaway. Publication dates are website publication dates, distinct from event or credential dates.

Source links: https://www.linkedin.com/posts/vivianwongrobertson_everyone-wants-ai-ready-engineering-activity-7505590913033846784-YJmr and https://sg.linkedin.com/in/vipul-gupta-tech. User statements establish participation and authorize the posts. Keep copy concise, factual and editable, without fabricated quotes, outcomes or speaker photographs.

Add warm light (default), ocean and charcoal themes using shared tokens, a labelled keyboard-accessible chooser, saved preference with safe storage fallback, and a stable light print theme. No remote fonts, tracking or libraries.

Enhance the homepage IMG_3888 portrait for zoom detail while preserving identity, pose, clothing and aquarium setting. Use high-quality responsive derivatives and a larger image view with intrinsic proportions. Keep enhancement edits conservative and document provenance. The supplied IMG_5539 infinity artwork should become a tasteful local decorative background with readable foreground content; enhance clarity if needed without changing the infinity design. Original uploads remain outside public assets, and public derivatives omit embedded metadata.

## Acceptance requirements

- UX01 Exact GXS dates and April 2025 lead start are consistent in data, Home and About.
- UX02 All six requested tabs navigate to real routes in the requested order, with active state for article routes and a usable mobile menu.
- UX03 Tech collection and article routes support Markdown, publish gates (draft/future), metadata, sitemap and existing sharing controls. Personal Journal remains separate.
- UX04 Homepage derives recent published posts from Tech content and links to the GitLab/NUS milestone articles. New content dates use Asia/Singapore. No invented event year or unsourced story details.
- UX05 Three selectable themes work across routes, default to warm light and retain preference. Storage failure leaves a usable chooser. Print remains light under every choice. Maintain readable text and focus indicators.
- UX06 Portrait has responsive high-quality assets plus a higher-resolution view; any AI enhancement preserves appearance and is documented. Image proportions and centered composition remain intact.
- UX07 Attached infinity artwork is used locally as a decorative background with sufficient overlay to keep text readable. No fake live telemetry, remote image embedding or private metadata.
- UX08 Format edited files and build the preview as needed to display changes. Do not run testing agents, browser suites, axe scans or full quality gates during this iteration; complete those before a future deployment. Do not represent earlier test results as covering this revision.
- UX09 Local review only: no commit, push, deployment or LinkedIn mutations.

## Validation

The local static build completed and generated the Tech listing and both article routes. Warm light Home, the recent-posts section and an Ocean preview were visually reviewed. No testing agents, automated test suites, axe scans, strict diagnostic checks or formatting checks were run for this revision; edited files were formatted. Full regression, responsive, theme, sharing and accessibility verification is required before deployment. Existing tests need updated exact date expectations, Tech route coverage and all theme options before that run.

The portrait AI edit was rejected because it reduced resolution and changed facial details. Public portrait exports preserve the original image at up to 3891 × 2829 pixels, with a separate full-resolution view loaded on request. Original camera blur may remain. The selected infinity image is an AI-enhanced decorative version of the supplied artwork; exact network connections are illustrative. See `docs/image-enhancements.md` for exact prompts, output paths, encoding and provenance. All changes remain local, with no commit, push or deployment.
