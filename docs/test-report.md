# Website verification

Status: **Specification 010 predeployment gates passed on 5 October 2026 (Singapore time).** These results cover the new local production build. Publishing this update and its live smoke verification are still pending. The previous release remains live; owner Cloudflare Access setup and successful owner sign-in remain unverified.

## Current results

- Website acceptance: **102/102 cases passed** in 1.0 minute on isolated port 4323 with **retries disabled**. The previous 88 cases were retained and updated where requirements changed; 14 new cases cover Specification 010.
- Journal/Tech articles: **47/47 cases passed** in 18.5 seconds on isolated port 4322 with **retries disabled**, no failures or flaky results. Publishing gates, nested paths, listing filters/order, metadata/sitemaps, sharing fallbacks, no-JavaScript guidance and reaction UI contracts remain covered.
- Combined frontend result: **149 passing cases**, superseding the previous release's 135-case result. Both complete suites were rerun for this revision.
- Accessibility: **65 axe scans passed with zero violations at every severity**. This includes 12 routes at mobile/desktop widths in Ocean and Charcoal (48 scans), printed resume (1), loaded chat/inbox presentations in both themes (4), article layouts (8) and loaded/selected reaction controls (4). No rules were suppressed.
- Separate backend evidence: the parent/backend agent reported **25 passing real Worker/D1 integration cases**, covering the additive sender migration, legacy conversation preservation, sender validation/isolation, authorization and first-thread rollback. These results are separate from mocked frontend API contracts and do not establish production Access sign-in.

## Specification 010 coverage

- Charcoal is the default for fresh visits, no-JavaScript output, invalid/Warm preferences and blocked storage. Explicit Ocean remains saved across navigation and reloads; both palettes retain contrast, focus and responsive checks. Print remains light.
- New chat requires a name and valid email or telephone before posting. Tests verify invalid inputs send no request, contact-field mode changes correctly, the posted sender contract is trimmed, and details do not enter the URL or local storage. Message delivery is explicitly asynchronous in the same browser.
- Legacy chats remain readable without inferred identity. Identified chats prefill saved details. Email/phone drafts, edited sender fields and unsent messages survive manual refresh and clock-driven polling. Failed sends preserve drafts for retry.
- Private inbox renders identified and unidentified labels, contact details and message text safely. Valid contacts use encoded mailto/tel links; synthetic HTML/script contact values stay plain text without generated elements or execution. Browser mocks model the localhost health endpoint as well as inbox APIs, so available-backend scenarios use a complete contract.
- Homepage section 03 is Journal with a distinct, readable palette and links to all four current categories. Section 04 leads to My Space. My Space exposes exactly the supplied YouTube, X/Twitter, Instagram and Facebook destinations, with safe new-tab links and no third-party SDK requests.
- The GitLab article includes exactly four captioned event figures with meaningful alternative text. At 375, 768 and 1440 pixels, assets decode to their declared intrinsic dimensions, retain their proportions and fit the viewport. WebP chunks contain no EXIF, XMP or ICC metadata. Prose and description identify Earning the Right to Autonomy, Rasa Space and **24 September 2026**; the **4 October website publication date** is distinct, and the article explicitly describes prepared reflections rather than a transcript.
- Existing coverage remains: exact April 2025/March 2025 career dates and responsibility ownership; one source-backed AWS cost metric; dated credentials; responsive/full-resolution portrait; real multi-frame GIF with keyboard pause/resume and reduced-motion/no-JavaScript fallback; metadata/canonical URLs; navigation/skip links; genuine 404s; private-asset and tracker/font-provider exclusions.

The parent visually approved the revised Journal section, social profiles, event gallery and mobile sender form before these gates. Current print contrast/visibility checks passed; the previously reviewed three-page resume is historical pagination evidence, with no resume-content change in this revision.

## Reliability and cleanup

The first article attempt had one retry-only pass after navigation consumed its test budget; no POST occurred in that failed trace. The mocked reaction test now waits for DOMContentLoaded and explicitly awaits loaded controls, counts, save states, request bodies and accessibility. The clean 47-case rerun disabled retries.

The first website run found a stale chooser-order assertion and three partial inbox-mock races: localhost health returned a static 404 and hid the simulated available inbox. Supported palettes are now checked independent of order and available-inbox mocks include health. All source behavior assertions remain intact; the corrected 102-case rerun disabled retries.

Exclusive marked fixtures and temporary output were removed in `finally`. Real content SHA-256 hashes stayed unchanged, normal 12-page output was restored and QA strings/routes were absent. Ports 4322 and 4323 were stopped; the review preview on port 4321 was preserved. Frontend checks sent no messages or votes to a live service.

## Reproduction

```sh
npm run check
npm run format:check
npm run build
CI=1 PLAYWRIGHT_PORT=4323 PLAYWRIGHT_BROWSER_CHANNEL=chrome npm test -- --retries=0
CI=1 JOURNAL_TEST_RETRIES=0 PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:journal
npm run test:interactions
```

The normal suite starts/stops Astro preview using `--ignore-lock`. Article fixtures use portable temporary output and guaranteed cleanup/restoration. Installed Chrome was selected locally; default CI may use Playwright Chromium after installing its browser. The optional article retry override leaves ordinary CI defaults unchanged.

Final logs: `/private/tmp/vipul-website-spec010-final-tests.log` and `/private/tmp/vipul-article-spec010-final-tests.log`. Fixture article review screenshots were refreshed under `/private/tmp/vipul-site-review/`; these artifacts stay outside public output.

## Limits

Axe does not replace assistive-technology testing. Native sharing/clipboard outcomes and frontend API responses are simulated. Static inbox presentation and browser mocks do not establish authorization or server persistence; the real Worker/D1 suite tests those independently. Production owner access still requires the exact owner email and verified Cloudflare Access issuer/audience/app policy. Do not claim owner sign-in or replies work until that configuration and live workflow are verified. Specification 010 deployment and live smoke checks belong to the parent release workflow.

## Historical production smoke verification — initial release

The parent published the tested release to https://vipulgupta.tech on 5 October 2026 (Singapore time), using a new dedicated D1 database with both migrations. Live HTTPS checks passed for all ten public pages, approved images/animation, sitemap, real reaction-count reads, empty visitor chat reads, secure cookie flags and true unknown-route 404s. All checked private inbox routes/API/encoded aliases returned a no-store denial without exposing inbox HTML. No production test messages or votes were created. Exact owner email and Cloudflare Access configuration remain pending; owner sign-in and replies have not been live-verified. See specification 009 for deployment evidence.

## Production smoke verification — Specification 010

The parent published Specification 010 to https://vipulgupta.tech on 5 October 2026 (Singapore time). Production migration 0003 succeeded and preserved the existing database. Sixteen GET-only live checks passed for Charcoal homepage/Journal sections, required chat sender fields, four exact social links, the expanded GitLab article and four WebP photos, configured database health, empty visitor chat and reaction counts, and no-store denials for five inbox/API/encoded aliases. No messages or votes were written. Owner sign-in/replies remain pending exact email and Cloudflare Access configuration. See Specification 010 for the directly deployed Worker version. The connected source-control pipelines are verified separately by the release workflow.
