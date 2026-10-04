# Specification 009: Production deployment

Status: Deployed and live-verified on 5 October 2026 (Singapore time). The user explicitly requested deployment on 4 October 2026 (Singapore time).

## Scope

Publish the approved website to the existing Cloudflare Worker and vipulgupta.tech. Preserve domain/DNS ownership and existing unrelated account configuration. Keep the free plan; do not enable paid upgrades. Use a dedicated production D1 database for chat and shared reactions without uploading local preview data. Keep the private inbox locked until an exact owner email and verified Cloudflare Access configuration are available. Authentication must be completed by the user through the official browser flow if the deployment CLI is not signed in.

## Gates and evidence

Run formatting, strict type checks, production build, updated frontend/Markdown tests, interaction/authorization tests and deployment packaging. Fix substantive defects before publishing. Run checks after relevant source fixes; do not treat historical results as current evidence. Test ports and databases must be isolated from the review preview. Temporary fixture posts must be removed.

Inspect existing Worker bindings, variables, domain assignments and the connected main branch before writes. Provision only missing site resources. Deploy only the tested code/configuration, then verify HTTPS, public routes/assets, API/database readiness and unauthenticated private inbox denial on the live domain. Record the deployment version and material incomplete setup separately from successful publishing.

## Initial checks

The strict Astro check passed with zero errors, warnings or hints. Repository formatting passed. The connected main branch matches the local starting commit. Wrangler is not logged in; its browser authorization flow was opened. Updated feature and backend tests are in progress. Deployment testing found the homepage recent-posts background still using the infinity artwork; it was corrected to shared theme colours, leaving the artwork in the Experience introduction.

## Current release evidence

- Strict Astro check: 38 files, zero errors, warnings or hints. Generated test reports and local Worker state are excluded from source diagnostics.
- Formatting: full repository check passed.
- Frontend acceptance: 88 normal cases and 47 isolated article cases passed; 65 axe scans found zero violations across both themes, mobile/desktop pages, loaded chat/inbox forms, articles and print.
- Backend: 19 isolated integration scenarios passed with real local workerd/D1, including reactions, conversation isolation, owner replies, same-origin writes, private route aliases, verified JWT claims, concurrency and unavailable storage.
- Fixes: homepage recent-posts palette now follows the selected theme; the floating chat link has a labelled navigation landmark; failed chat database results cannot be reported as successful messages. CI now includes the interaction runner.
- Visual review: desktop, fresh mobile, article layouts, My Space, Experience and all three A4 resume pages approved. An earlier malformed Chrome full-page mobile capture was excluded and recaptured correctly. No QA fixtures remain.
- Wrangler deployment dry run passed: 47 public asset files, Worker bundle 20.57 KiB (6.06 KiB compressed). The local package is under `/private/tmp/vipul-site-release`.

## Production result

The user completed official Wrangler device authorization. The existing Worker and apex custom domain were verified before writes. A dedicated production D1 database, `vipul-personal-website`, was created with an Asia Pacific location hint; both migrations were applied remotely. No local preview messages or votes were uploaded. The `SITE_DB` binding and existing custom domain are recorded in `wrangler.jsonc`; existing variables and the live workers.dev/preview settings are preserved. No paid upgrade or unrelated DNS change was made.

Wrangler successfully published 47 public assets and the 20.57 KiB Worker. Initial deployed version: `e360ae3e-b4f2-447f-a8d2-14eee3034df6`. Live HTTPS checks completed at 2026-10-04T16:38:09.097Z: all ten public page routes returned 200 with one h1 and the new page titles; approved media and sitemap returned 200; unknown pages/articles returned 404. Production health confirms storage is configured, both published article reaction endpoints read real shared counts, and a new visitor conversation is empty. Secure, HttpOnly and SameSite cookie flags were verified. No production messages or votes were written by the checks.

The private inbox and API, including encoded and static HTML aliases, deny unauthenticated requests with an unavailable response and no-store caching. Exact owner email and Cloudflare Access setup remain pending, so the owner cannot sign in, read messages or reply yet. Public visitor messages can be stored; this incomplete owner setup is separate from successful website publishing.

The connected production branch is `main`; pushing the approved source can trigger another Cloudflare build. The live result above comes from direct Wrangler deployment. Local quality gates and successful CLI deployment do not prove GitHub Actions or a subsequent connected build passed; those remote results require separate verification.
