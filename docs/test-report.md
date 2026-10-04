# Website verification

Status: Deployment preparation for Specifications 006, 007 and 008. Full frontend verification is authorized by the user's deployment request. These results verify local production output; they do not establish a successful deployment, DNS change or production authorization.

## Results

- Website acceptance: **88/88 tests passed** in 1.2 minutes on isolated port 4323, without retries. The combined frontend result is **135 passing cases** (88 website plus 47 article fixtures).
- Journal and Tech publishing/sharing: **47/47 tests passed** in 19.7 seconds against an isolated fixture build on port 4322, without retries. Both independent collections, every current Journal category, nested slugs, newest-first sorting, default drafts, explicit drafts and future publication gates are covered. Existing real Tech content hashes stayed unchanged.
- Accessibility: the article fixture suite completed **12 axe scans with zero violations** across both themes, desktop/mobile layouts and loaded reaction controls. The website suite completed **53 additional zero-violation scans**: 12 routes across two themes and mobile/desktop widths, one printed resume, and four loaded chat/inbox presentations. **65 scans total** passed. Scans check WCAG A/AA and best practices at every severity.
- Exact career dates: GXS Lead SRE Engineer begins **April 2025**; preceding Senior role runs **March 2022 through March 2025**. Independent entries retain role-specific responsibilities and a single 25 percent AWS cost achievement. NUS and historical Red Hat credential dates remain explicit.
- Theme coverage: Ocean is the default; Ocean and Charcoal are the only choices. Selection survives navigation/reloads, warm and invalid saved values migrate to Ocean, and blocked local storage leaves controls usable. Contrast checks wait for actual CSS transitions to finish before measuring the selected palette.
- Imagery/motion: responsive portrait derivatives and full-size image decode without crop or viewport clipping. Public WebP metadata is checked for EXIF, XMP and ICC chunks. DevOps is a real multi-frame GIF with keyboard pause/resume and correct reduced-motion/no-JavaScript fallback; print omits the GIF and decorative infinity background.
- Navigation/content: Tech, the revised Journal categories, My Space anchors and preserved Photos gallery are covered. Existing professional posts distinguish website publication from July 2026 course completion. My Space and Journal remain honestly unpublished.
- Dynamic UI contracts: mocked chat/inbox responses test literal message rendering, composer access, mobile fit and both-theme accessibility. Mocked reaction responses test keyboard vote/remove requests, returned counts, save errors, retry and invalid data. These browser mocks prove presentation behavior, not D1 persistence or authorization. The separate real Worker/D1 runner owns those guarantees.
- Backend verification: the separate source-level Worker/D1 runner passed **19 integration cases**. This evidence is separate from the 135 frontend cases and mocked browser API contracts. Production Cloudflare Access authorization and deployment remain parent workflow gates.
- Sharing: native share success/cancellation/failure, clipboard success/denial/unavailability and no-JavaScript manual links are covered. Canonical LinkedIn/email links remain; dedicated WhatsApp markup is absent. Native device interfaces and browser permission dialogs are simulated.
- Honest API errors: static preview cannot claim delivered messages or invent shared counts when APIs are absent; articles show an unavailable/retry state instead.
- Fixture cleanup: exclusive marked fixtures and temporary output are removed in `finally`; normal 12-page output is rebuilt and scanned for QA strings/routes. Real content SHA-256 hashes are verified unchanged. Review preview on port 4321 is preserved.
- Source defects corrected before final verification: homepage recent-posts used the infinity artwork/dark overrides despite the required theme palette; root restored shared tokens. Floating chat lacked a landmark; root added labelled contact navigation. No accessibility rules were suppressed.
- Visual evidence: refreshed Ocean/Charcoal Home (desktop/mobile), Experience, My Space and the real NUS article were captured locally. The diagnostic resume remains **three A4 pages**; the testing agent inspected every page and found no clipping, overlap or orphan headings. Both GXS roles occupy page one, previous employers page two and skills/education/credentials page three. The parent approved Ocean desktop, My Space, both-theme QA articles, Experience, all print pages and independently scrolled fresh mobile captures. One full-page mobile capture produced compositor repetition after resizing a desktop page; that capture is excluded. Fresh mobile contexts show a single correct layout and a fully decoded portrait. Approved mobile evidence is `home-{ocean,charcoal}-mobile-{top,portrait,focus,personal}.png` and fresh full-page captures.

## Reproduction

Use an isolated preview so the full local review Worker on port 4321 remains available:

```sh
npm run check
npm run format:check
npm run build
CI=1 PLAYWRIGHT_PORT=4323 PLAYWRIGHT_BROWSER_CHANNEL=chrome npm test
CI=1 PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:journal
```

The normal suite starts and stops Astro preview in the foreground using `--ignore-lock`. Fixture tests use portable operating-system temporary output, port 4322 and guaranteed cleanup/restoration. `PLAYWRIGHT_BROWSER_CHANNEL=chrome` selects installed Chrome; CI may use the default Playwright Chromium after installing its browser.

Evidence logs are `/private/tmp/vipul-website-deployment-final-tests.log` and `/private/tmp/vipul-article-final-tests.log`. Screenshots and the diagnostic `resume-deployment-print.pdf` are under `/private/tmp/vipul-site-review/`; these artifacts are outside public build output.

The browser suite scans 12 routes (including both actual professional articles, chat/inbox presentation and a true 404), checks metadata/canonical URLs and tests responsive overflow at 375, 768 and 1440 pixels in both themes. Mobile keyboard navigation, Escape/focus restoration, skip links, print controls, private-asset labels and tracker/font-provider exclusion remain covered.

## Limits

Automated axe scans do not replace assistive-technology testing. Static inbox markup scans do not prove inbox authorization; the Worker must protect both the document and APIs before publishing. Native sharing, clipboard outcomes and frontend API success/error responses are simulated. No messages or votes were sent to a live service by these frontend tests. Production deployment, D1 provisioning, Cloudflare Access and public smoke checks belong to the parent deployment workflow.

## Production smoke verification

The parent published the tested release to https://vipulgupta.tech on 5 October 2026 (Singapore time), using a new dedicated D1 database with both migrations. Live HTTPS checks passed for all ten public pages, approved images/animation, sitemap, real reaction-count reads, empty visitor chat reads, secure cookie flags and true unknown-route 404s. All checked private inbox routes/API/encoded aliases returned a no-store denial without exposing inbox HTML. No production test messages or votes were created. Exact owner email and Cloudflare Access configuration remain pending; owner sign-in and replies have not been live-verified. See specification 009 for deployment evidence.
