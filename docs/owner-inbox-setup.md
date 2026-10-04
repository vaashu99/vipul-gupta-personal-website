# Enable the private owner inbox

The live inbox currently denies access because the Access team domain, application audience and exact owner email are absent. This is separate from the working production D1 database. The current Wrangler login can deploy the Worker and set Worker secrets, but Cloudflare's Access organization/application APIs returned 403; it cannot create the Access application with this authorization.

## Dashboard setup

1. Open Cloudflare One (Zero Trust) for the same account. If onboarding is needed, select the Free plan; do not accept a paid upgrade for this setup.
2. In Access controls → Applications, create a self-hosted application named **Vipul website inbox**.
3. Add public hostname destinations for `vipulgupta.tech/inbox*` and `vipulgupta.tech/api/inbox*` to the same application. The first covers `/inbox`, `/inbox/`, `/inbox.html` and `/inbox/index.html`; the second covers the owner APIs. Keep the home page, visitor `/chat/` and other public routes outside this application.
4. Add an **Allow** policy named **Website owner**, with **Include → Emails → your exact owner email**. Do not select Everyone or an entire email domain. No Bypass policy is needed.
5. Enable **One-time PIN** (email code) or an existing identity provider you control. A one-time PIN needs no new password for the website. Set the session duration to 8 hours and save the application.
6. Copy the application's **Application Audience (AUD) Tag** from its settings. Find the team's hostname ending in `.cloudflareaccess.com` in Cloudflare One settings. These configuration identifiers are distinct from API tokens or login codes; do not share those credentials in chat.

The Worker requires these three private settings:

| Setting                 | Value                                                                                     |
| ----------------------- | ----------------------------------------------------------------------------------------- |
| `OWNER_EMAIL`           | The exact email in the owner Allow policy                                                 |
| `CF_ACCESS_TEAM_DOMAIN` | The team's hostname, for example `your-team.cloudflareaccess.com` (no `https://` or path) |
| `CF_ACCESS_AUD`         | The application's Audience (AUD) Tag                                                      |

Set these as Worker secrets through the dashboard (Workers & Pages → vipul-gupta-personal-website → Settings → Variables and Secrets) or an authorized Wrangler command. Never add `LOCAL_OWNER_PREVIEW` to production. Do not put the owner email in public assets or commit the values in repository configuration. The production config preserves existing Worker variables and secrets.

## Verify completion

Open https://vipulgupta.tech/inbox/ in a private browser session. It should show Cloudflare's sign-in and accept only the configured owner. After sign-in, the conversation list and reply composer should load. Verify that home, visitor chat and article pages remain public. Check that a separate unauthenticated browser cannot retrieve the inbox document or owner API, including encoded/static HTML aliases. Public workers.dev/preview hostnames also require a valid signed owner JWT inside the Worker and must not expose the inbox without it.

Enabling configuration alone is not proof that browser sign-in succeeds. Record a successful owner session and reply verification separately. There are no automatic email or SMS notifications for chat replies; contact details are self-reported and remain private to the conversation and owner inbox.

References: [Cloudflare self-hosted applications](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/self-hosted-public-app/), [Access policies](https://developers.cloudflare.com/cloudflare-one/access-controls/policies/), [One-time PIN](https://developers.cloudflare.com/cloudflare-one/identity/one-time-pin/), [JWT validation](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/).
