# Vipul Gupta's personal website

A static personal website hosted with Cloudflare Workers Static Assets.

## Website files

`public/index.html` contains the initial coming-soon page, including inline styles
and comments. Only files inside `public/` are published.

## Cloudflare Git deployment

Connect this repository in Workers & Pages and use:

- Production branch: `main`
- Root directory: repository root (leave the default)
- Build command: leave empty
- Deploy command: `npx wrangler deploy`
- Worker name: `vipul-gupta-personal-website`

The `wrangler.jsonc` file configures the Worker name and static asset directory.
Cloudflare's build environment runs Wrangler to upload the assets.

After a successful deployment, test the provided workers.dev URL. Then add
`vipulgupta.tech` as a Custom Domain under the Worker's Settings > Domains & Routes.
Resolve the existing conflicting root A/AAAA records during domain setup. Connect
`www.vipulgupta.tech` as well, and configure a redirect to the primary root domain.
Preserve unrelated TXT records. Verify HTTPS and both hostnames after the change.

Future pushes to the connected production branch trigger a new deployment.
