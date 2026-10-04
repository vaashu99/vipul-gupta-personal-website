# Specification 007: Contact, article reactions and visual refinements

Status: Implemented for local review; full verification deferred until deployment. No publishing or remote resource creation requested. Testing remains deferred until deployment.

## User request

Keep only Ocean and Charcoal themes, with Ocean as the default. Remove Warm light and migrate any saved warm/invalid preference to Ocean. Preserve a light print palette.

Move the user-supplied infinity artwork into the background of the first Experience section, preserving readable heading, summary, identity and print control. Keep the illustration decorative and omit it from print. The recent-posts section should return to theme-based colours.

Add a professional focus item about AI systems in homepage section 01, grounded in the user's confirmed AI infrastructure and governance work. Preserve existing focus items and the existing AWS achievement.

Remove the dedicated WhatsApp sharing option. Keep native sharing, Copy link, LinkedIn and email. The device's native share menu is controlled by the browser/OS.

Visitors should have a prominent way to message the owner. The user selected built-in chat: a visitor conversation and a private owner inbox for replies. LinkedIn remains an alternative. Never publish the private resume's email or telephone by inference; never display a form that pretends to deliver.

Add article reactions for Tech and Journal. The user selected shared counts with server storage. Shared counts must never be faked with local storage. A working local implementation may use Cloudflare Workers/D1 with only local state; remote provisioning and deployment remain separate future work. No hidden collection of names, emails or IP addresses for anonymous reactions.

## Acceptance criteria

- RF01 Only Ocean/Charcoal appear; Ocean is the default and saved Warm light falls back to Ocean consistently in head initialization and chooser logic.
- RF02 Experience intro uses the infinity artwork with readable foreground and a light printable resume; homepage post cards follow the selected theme.
- RF03 Section 01 includes AI systems alongside existing infrastructure, automation and cloud-efficiency items. No fabricated AI outcomes or new metrics.
- RF04 WhatsApp-specific markup and link generation are removed from article sharing.
- RF05 Contact action works through the user-chosen service/destination; wording explains asynchronous replies in the same browser.
- RF06 Both article collections offer accessible reactions with an honest persistence model, toggle states and errors. Shared counts require backend persistence and anonymous voting limits; unavailable backend must not masquerade as zero counts or success.
- RF07 Format edited files and build/update the local preview. No testing agents, full suites or axe scans during this iteration. Before deployment, extend and run coverage for themes, sharing, contact and reactions.
- RF08 No commit, push, deploy, messages sent on behalf of the user, or remote database creation during local preparation.

## Decisions and validation

The user chose built-in chat and shared reactions across visitors. Implement a chat-style visitor conversation and private owner inbox with local D1 persistence; visitors can leave messages and read replies, with no false online/instant-response promise. Use an HTTP-only anonymous visitor cookie to scope conversations and one reaction per article/browser. Production inbox authorization requires verified Cloudflare Access JWT (issuer, audience, expiry and signature). Local owner preview is permitted only with an explicit local-only configuration and loopback origin, never a production bypass. The user answered “any” for the owner email. This does not authorize public access to private messages; a specific owner email remains required before live inbox access and must stay out of public site files. Remote D1 provisioning, Access configuration and production deployment remain future gates.

API contracts: GET/POST `/api/reactions?article=tech/id` returns `{ counts: { like, helpful, insightful }, selected }`; POST body `{ article, reaction }`, reaction null toggles off. GET/POST `/api/chat` returns `{ threadId, messages }` with numeric message IDs, sender visitor/owner, content and createdAt. POST body `{ message }`. GET `/api/inbox/threads` returns `{ threads }`; GET `/api/inbox/messages?thread=UUID` and POST `/api/inbox/messages` body `{ threadId, message }` return `{ threadId, messages }`. All responses are private/no-store and errors are JSON with a user-readable message. Auth helpers and cookie helpers are shared by backend modules. No off-site CORS is opened.

Local database binding name SITE_DB; static assets binding ASSETS. Worker script handles `/api/*` and private `/inbox/*` before assets; other requests serve static HTML. Local-only database/config are separated from production config, and production missing bindings/auth config fail closed for dynamic functionality. Full regression and accessibility checks deferred until deployment. Existing test results do not cover this revision.

## Local readiness evidence

Astro production build succeeded with chat and inbox pages. Both D1 migrations applied to local state. Wrangler started successfully; local `/api/health` reported storage configured and local-preview mode. Reading reactions for the published NUS article returned database-backed counts and no selection. No sample messages or votes were written. This is startup/readiness evidence, not a functional or accessibility test run. Full testing and testing agents remain deferred by user instruction. No Cloudflare resources were provisioned, and no deployment occurred.
