# Chat and shared reactions

The public site remains static HTML. A small Cloudflare Worker handles visitor chat, shared article reactions and the private owner inbox, using D1 for persistent storage. The public website is deployed at https://vipulgupta.tech with a dedicated production D1 database; owner inbox sign-in still requires the exact owner email and Cloudflare Access setup.

## Local review

Use a supported Node version and install dependencies with `npm ci`. Stop any existing preview on port 4321, then run:

```sh
npm run preview:full
```

This builds the pages, applies both migrations to the local database, and starts Wrangler on loopback HTTP. Local data is stored under ignored `.wrangler/state/`; it is separate from any Cloudflare database. The local configuration contains a placeholder database ID and must never be used for deployment.

- Home: http://127.0.0.1:4321/
- Visitor conversation: http://127.0.0.1:4321/chat/
- Owner inbox: http://127.0.0.1:4321/inbox/
- Article with reactions: http://127.0.0.1:4321/tech/nus-ai-solutions/

Send a message as a visitor, open the owner inbox to select the conversation and reply, then return to the visitor page. Replies refresh while the conversation is focused and visible, or through Refresh replies. The local owner preview requires an explicit flag and a loopback HTTP address. It is intended for review on your computer.

`npm run dev` and `npm run preview` serve only static pages. Their chat and reaction controls show unavailable errors because those servers do not implement the APIs.

## Visitor behavior and privacy

Chat is asynchronous: there is no online status, guaranteed response time, email delivery or push notification. Visitors need no account. Before sending an identified message, they supply a name and either email or telephone. These details are self-reported and are visible only within their own browser-scoped conversation and the authenticated owner inbox; they do not verify identity or send email/SMS. Existing unidentified conversations are retained and can add details on their next message. An HTTP-only, same-site browser cookie connects visitors to their own conversation. Clearing cookies or using another browser starts a new identity and loses access to the previous conversation. The cookie lasts 180 days; messages currently have no automatic deletion schedule. The owner can read visitor messages in the private inbox. Set an appropriate message retention/deletion policy before public launch.

Each browser identity can choose one of Like, Helpful or Insightful per published article. Choosing another reaction replaces the previous vote; choosing the selected reaction removes it. Counts are shared through the database. Browser identity is a modest participation limit, not a verified person: clearing cookies permits another identity. Draft, future and unknown article routes are not eligible.

Requests use bounded plain-text input, parameterized database queries, same-origin write checks and modest burst guards. Burst guards are per Worker isolate, not a global spam-prevention service. IP addresses are not persisted; transient network buckets use a salted hash. Reactions require no names or contact details. Chat sender details are stored privately on the thread, alongside bounded plain-text messages, and are not placed in URLs, local storage or public listings. Message contents and names are displayed as text.

## Production configuration

Initial publication is complete. Owner inbox setup remains pending:

1. Production D1 `vipul-personal-website` is created and bound as `SITE_DB` in `wrangler.jsonc`. Both SQL migrations have been applied remotely. For future schema changes, apply the reviewed migration explicitly with `npx wrangler d1 migrations apply vipul-personal-website --remote`. The local database and messages are never automatically uploaded.
2. Follow [the owner inbox setup guide](owner-inbox-setup.md). Configure Cloudflare Access for the owner page and inbox API paths, including `/inbox`, `/inbox/*`, `/inbox.html` and `/api/inbox/*`. Use an application audience shared by the protected paths. Restrict the allow policy to your specific owner email.
3. Set `CF_ACCESS_TEAM_DOMAIN` to the team's `*.cloudflareaccess.com` hostname, `CF_ACCESS_AUD` to the application's audience and `OWNER_EMAIL` to that exact email in Worker configuration/secrets. Keep these out of public assets. The Worker independently checks the signed JWT, issuer, audience, expiry and email. “Any”, missing configuration and unverified identity fail closed.
4. Never set `LOCAL_OWNER_PREVIEW` in production and never deploy with `wrangler.local.jsonc`.
5. Review retention, abuse controls and platform usage limits, then update and run the deferred functional, privacy, authorization and accessibility checks. Verify visitor isolation, reaction persistence/toggling, cross-origin rejection, owner JWT handling and encoded inbox paths before deployment.
6. Publish only after local approval and explicitly requested deployment, then verify HTTPS, Access sign-in, inbox protection, chat replies and shared counts on the live domain.

All requests currently run the Worker before assets to authorize every private inbox URL variant before static serving. This includes public page requests, so review Workers request limits for the chosen plan before publishing. Chat polling also uses Worker and database reads. Missing production storage returns an unavailable response rather than invented counts or successful delivery; missing owner authorization keeps the inbox closed.

Cloudflare references: [local D1 development](https://developers.cloudflare.com/d1/best-practices/local-development/), [D1 migrations](https://developers.cloudflare.com/d1/reference/migrations/), [static asset binding and routing](https://developers.cloudflare.com/workers/static-assets/binding/), and [Access JWT validation](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/).
