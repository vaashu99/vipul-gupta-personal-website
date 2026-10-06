# Architecture and decisions

ADR-001: Astro static generation with strict TypeScript. Portfolio and editorial pages need little JavaScript; generate HTML at build time. No Cloudflare adapter is needed. Specification 007 adds a separate Worker for dynamic APIs while keeping pages statically generated.

ADR-002: Structured professional data in src/data/profile.ts. Presentations reuse the same source. Journal entries live in a typed Astro content collection and can be authored in Markdown.

ADR-003: Public and private media are separate. v1 ships no private photos or Drive integration. Future private gallery should use a separate authenticated subdomain and a backend checking every media request.

ADR-004: Local review precedes publishing. Cloudflare Worker name and domain ownership are retained. Wrangler's custom build runs npm run build so the existing npx wrangler deploy command remains valid even with an empty dashboard build command.

ADR-005: Public HTML resume replaces publishing the supplied PDF. Personal identifiers are omitted from public source and build output.

ADR-006: Journal publishing uses build-time Markdown content collections. Draft and future-dated entries have no generated routes or sitemap entries. Each public article has metadata, native sharing when supported, clipboard sharing and plain external share links. No CMS, backend or sharing SDK is required. Draft exclusion is editorial filtering, not access control: never store confidential content in the repository or public assets.

ADR-007: Dark screen theme uses shared, high-contrast color tokens; print switches the same tokens to light backgrounds and dark text. A local looping DevOps GIF is an illustrative animation with a static reduced-motion/print alternative and a keyboard pause control. The homepage uses optimized, metadata-free copies of the user-approved aquarium photo.

ADR-008: Tech and Journal use independent Markdown content collections with common article presentation and sharing. Home derives recent professional posts from published Tech entries; draft/future gates apply to listings, routes and sitemap.

ADR-009: Specification 010 makes Charcoal the default screen palette, with Ocean and Charcoal choices saved in guarded local storage. Earlier default/invalid preference behaviour from Specification 007 is superseded; explicit saved Ocean is preserved, while absent, Warm or invalid values use Charcoal. Shared tokens and prepaint initialization apply across routes. Print always uses light paper variables. Full regression and accessibility suites are deferred until deployment by user instruction; local build updates the preview.

ADR-010: Built-in asynchronous chat and shared article reactions use a Worker and D1. An HTTP-only anonymous browser cookie scopes conversations and one reaction per published article; changing browsers or clearing cookies changes identity. Specification 010 adds a required self-reported sender name and either email or phone for chat, stored privately on existing conversation threads through an additive migration. Reactions remain anonymous. Messages are plain text, bounded and stored through parameterized queries. No email or push notification service is implied. The private inbox checks a signed Cloudflare Access JWT and exact configured owner email before serving either HTML or APIs.

ADR-011: All requests run the Worker before static assets so encoded or normalized inbox paths cannot bypass authorization. This trades static asset routing efficiency for a simple authorization boundary; review Worker request limits before publishing. The explicit local configuration uses only local D1 and a loopback-only owner preview flag. Production has no local bypass flag; Specification 009 records the dedicated D1 database deployed for chat and reactions. See [interaction setup](interaction-setup.md).

ADR-012: Journal is the broad personal writing collection, organized by shared typed categories Thoughts & Conversations, Life Notes, What If and Humour. My Space is a separate personal hub for Travel, Photos and Memories. The existing Photos route remains available and activates My Space navigation. Personal content stays honestly unpublished until supplied; this revision introduces no additional collection or backend.

ADR-013 (local experiment, withdrawn by ADR-015): Specification 012 replaces the Experience GIF with a local semantic HTML/CSS AI lifecycle illustration. CI/CD delivery, RAG context retrieval and optional model training are separate lanes; observability provides feedback. The drawing is generic and does not disclose an employer architecture or establish resume claims. Static first paint, no-JavaScript support, keyboard pause/resume, reduced-motion updates and print exclusion remain required. The old animation assets are retained; DevOps-specific tests are updated before the next publication.

ADR-014 (local experiment, withdrawn by ADR-015): Specification 013 uses React Flow and Lucide icons for a compact interactive AI workflow immediately before Career. React is loaded only by the Experience illustration island; the rest of the site stays static Astro. Locally bundled icons and animated edges support CI/CD, RAG and optional training scenarios, selectable details, drag, zoom, fit and pause controls. A semantic static fallback covers JavaScript-disabled visitors; reduced motion stops animation and print omits the widget. Retain upstream notices in public/licenses/ai-workflow.txt and graph attribution. No third-party iframe or runtime CDN is required. Generic illustrative content retains Specification 012 privacy boundaries; full regression tests are deferred until publication.

ADR-015: Specification 014 restores the original DevOps GIF immediately before Career and removes the rejected local AI illustration and React Flow dependencies. Retain the public-safe AI responsibilities and skill group from Specification 012. The user explicitly authorizes production publishing and skips testing for this release; only formatting and the required production asset build run. Historical test results do not validate this release.
