# Vipul Gupta's personal website

A minimal personal website with Ocean and Charcoal themes: professional experience alongside space for travel, photography and writing. Built with Astro, strict TypeScript and static HTML for Cloudflare Workers Static Assets, with a small Worker and D1 database for chat and reactions.

## Start locally

Use Node.js 24 (`nvm use` if available), then:

```sh
npm ci
npm run dev
```

Open the URL printed by Astro (normally http://127.0.0.1:4321). This mode previews static pages; chat and reactions need the full local runtime.

Stop any other server on port 4321, then use:

```sh
npm run preview:full
```

This builds the site, applies migrations to a local-only database, and serves it at http://127.0.0.1:4321. Try `/chat/` as a visitor and `/inbox/` to reply as the owner. The local owner preview is restricted to loopback HTTP. See [chat and reactions setup](docs/interaction-setup.md) for production requirements.

## Validate before deployment

Full testing and testing agents are deferred during local edits at the user's request. Format edited files and build the preview as needed. Before deployment, run:

```sh
npm run format:check
npm run check
npm run build
npm run test:interactions
npx playwright install chromium
npm test
npm run test:journal
npm run preview
```

If Google Chrome is installed, use `PLAYWRIGHT_BROWSER_CHANNEL=chrome npm test` instead of downloading Chromium. The browser suite also supports `PLAYWRIGHT_PORT=4322` for an isolated preview port.

The separate `test:journal` command temporarily creates test posts, builds them to an isolated temporary directory, checks article publishing and sharing, then removes the fixtures and restores the normal build.

The browser suite checks production output, mobile/desktop layouts, navigation, keyboard use, journal filters, resume fidelity/privacy, printing, 404s and axe accessibility findings. CI runs these gates; remote CI has not been run for local changes.

## Structure

```text
src/
  components/       Shared navigation, footer, chat entry and article controls
  layouts/          Semantic document shell and metadata
  styles/           Shared visual tokens and responsive styles
  data/             Typed professional profile, derived from the resume
  pages/            Home, Experience, Tech, About, Journal, My Space, Photos, Chat, private Inbox and 404
  content/          Separate Tech/Journal Markdown and authoring guidance
public/             Approved homepage photo, DevOps animation, illustrations and metadata
workers/           API routing, anonymous reactions, chat and owner authorization
migrations/        D1 schema migrations
tests/             Production browser acceptance tests
docs/              Specification, architecture decisions and test results
```

See [the specification](docs/specs/001-personal-website.md), [architecture](docs/architecture.md) and [coding conventions](AGENTS.md). Keep professional facts in `src/data/profile.ts`. Journal uses Thoughts & Conversations, Life Notes, What If and Humour. My Space brings together Travel, Photos and Memories; the existing Photos gallery remains available. These personal sections intentionally contain no invented content.

## Add a blog or article

Follow [the blog authoring guide](docs/blog-authoring.md). Create a Markdown file in `src/content/tech/` for professional posts or `src/content/journal/` for personal posts, write the title, description, date and category in its frontmatter, and preview locally with `npm run dev`. Set `draft: false` when ready; the next build creates its `/tech/filename/` or `/journal/filename/` page, listing and sitemap entry. Published Tech posts also populate the homepage recent-posts section. Posts support native sharing where available, Copy link, LinkedIn and email. Both Tech and Journal articles have Like, Helpful and Insightful reactions backed by shared server counts. A starter template is provided in the authoring guide. Publishing still requires an explicit request because a push can trigger Cloudflare deployment.

## Resume privacy

The original supplied PDF stays outside the repository. It contains personal details that must not be published. The Experience page provides a printable professional resume; print it or use your browser's Save as PDF. The website does not publish phone, address, birth date, nationality, visa details or certificate ID. Public contact links are LinkedIn and GitHub; visitors can also send messages through the website chat without an email account.

## Cloudflare deployment (after local approval)

The existing Worker name is preserved: `vipul-gupta-personal-website`. `wrangler.jsonc` runs `npm run build` and publishes the Worker plus public assets from `dist/`, with real 404 handling. The dashboard deploy command can remain `npx wrangler deploy`; leave the dashboard build command empty to avoid building twice. Its build environment must use a supported Node version, preferably 24.

Astro still generates static HTML; the Worker implements the interactive endpoints without an Astro server adapter. The website is live at https://vipulgupta.tech, with production D1 configured for visitor chat and shared reactions. Cloudflare Access and the exact owner email still need configuration: follow [the setup guide](docs/interaction-setup.md) to enable inbox sign-in and replies. The live inbox stays locked until verified owner authorization is configured. Do not push local changes until publication is requested: the connected production branch may automatically deploy. Future explicit deployment can use `npm run deploy` or the connected Git workflow. DNS/custom-domain ownership is independent of this source update.

## Later features

Photo collections, public case studies and a separately approved downloadable PDF can follow review. Drive integration and private albums require a separate authenticated backend that protects both pages and media requests. No credentials, private images, fake password gates or tracking are included in v1.

## Themes and images

Use the header Theme chooser for Ocean (default) or Charcoal. The preference is saved locally in the browser; print keeps white paper backgrounds. The homepage portrait links to a full-resolution public image. The infinity artwork is a decorative background in the Experience introduction. See [image enhancement provenance and prompts](docs/image-enhancements.md).
