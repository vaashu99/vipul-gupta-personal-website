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
