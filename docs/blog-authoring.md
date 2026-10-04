# Adding a blog post or article

Tech and Journal use separate Markdown collections. Tech holds professional
writing, community participation and learning milestones. Journal holds personal
writing: Thoughts & Conversations, Life Notes, What If and Humour. My Space is
the separate hub for Travel, Photos and Memories, linking to the existing public
photo gallery. There is no browser admin panel or CMS yet.
Write an article in the repository, review it locally, then publish through the
existing GitHub-to-Cloudflare deployment when approved.

## 1. Create a Markdown file

For a personal post, create `src/content/journal/my-first-note.md`. For a
professional post, create `src/content/tech/my-first-note.md`, which becomes
`/tech/my-first-note/`. Use a descriptive lowercase name
with hyphens and no spaces. The resulting URL is `/journal/my-first-note/`.
Folders are supported: `life/my-first-note.md` becomes
`/journal/life/my-first-note/`. Keep the filename stable after publication;
renaming it changes the URL and existing shared links need a redirect.

Copy this starter into the file and replace every placeholder with your own
content. It stays a draft until you explicitly choose to preview it as published:

```markdown
---
title: 'Your article title'
description: 'A short, accurate introduction to your article.'
publishedAt: '2026-10-04'
category: 'life-notes'
draft: true
---

Your opening paragraph goes here.

## A section heading

Write your story, then add supporting details, images or links.
```

Journal categories are `thoughts-conversations` (Thoughts & Conversations),
`life-notes` (Life Notes), `what-if` (What If), and `humour` (Humour). What If can
include imaginative scenarios and speculative essays. The shared definition
lives in `src/data/journalCategories.ts`. Category changes do not change article
URLs; the filename determines the URL. Tech categories are
`engineering`, `community`, and `learning`; use one of those when adding a Tech
article. For example, change the starter's category from `life-notes` to `engineering`.
Descriptions must be between
1 and 240 characters. The article title is already the page's single `h1`, so
start body headings with `##`, then use `###` for subsections.

## 2. Add public images, if needed

Put approved, resized public images in `public/images/`. Reference them from
Markdown using an absolute site path and an accurate text description:

```markdown
![Describe the scene accurately](/images/your-photo.webp)
```

For an optional cover image, add both fields to the frontmatter:

```yaml
coverImage: '/images/your-photo.webp'
coverAlt: 'An accurate description of the photograph'
```

Cover paths must be local and contain only letters, numbers, hyphens, underscores
and directory separators, ending in a supported image extension. Supported
formats: AVIF, WebP, PNG, JPEG, GIF, SVG. Remote cover URLs are rejected. Ensure
the file exists; use only images you have chosen to make public. Do not put
private photos, credentials or the original resume in this folder.

## 3. Review locally

Install dependencies once with `npm ci`, then start `npm run dev` and open the
local address shown in your terminal for writing and layout review. Shared
reactions and chat require the full local Worker/database preview:

```sh
npm run preview:full
```

This builds the site, applies local-only database migrations and serves the full
site at `http://127.0.0.1:4321`. It does not publish or create a remote database.
Stop any existing preview using port 4321 first. Astro's standalone development
or preview server does not provide the interaction APIs; an unavailable reaction
message there is expected. See [interaction setup](interaction-setup.md) for details.

Drafts are deliberately omitted from all
routes, even locally. To review an article page, temporarily set `draft: false`
and ensure its `publishedAt` is not in the future, keeping the changes local.
Visit `/journal/` or `/tech/` and click the article, or open its URL directly. Restore
`draft: true` after review if the article is not ready to publish.

Check wording, image descriptions, mobile layout, category filtering, dates and
the article's sharing controls. The page supports headings, lists, quotes,
links, images, code blocks and tables. Long code and tables scroll within the
article on narrow screens. Avoid raw HTML unless it is necessary and reviewed.

## 4. Choose the publication date

`publishedAt` accepts an ISO date or timestamp. A date such as `"2026-10-04"`
starts at midnight UTC (08:00 Singapore time). For exact timing, supply an offset,
for example `"2026-10-04T09:00:00+08:00"`. Dates shown to readers use Singapore
time.

For a milestone article, the publication date is the date the article is added
to the website. Mention the actual event or course date separately only when it
is verified. Do not infer an event year from the website publication date. Link
the original source and keep personal takeaways, quotes and results factual.

Every build includes only entries with `draft: false` and a publication time at
or before the build. Future entries are excluded from cards, article pages and
the sitemap. A later build is required to publish them after their date; there
is no automatic scheduling service. Draft status is an editorial control, not
confidential storage: source files can remain visible in repositories, CI
artifacts or earlier deployments. Never use drafts to store private material.

## 5. Validate and publish when approved

When the article is ready, set `draft: false`, run the project quality gates:

```sh
npm run check
npm run format:check
npm run build
npm test
```

Review the local production preview with `npm run preview`. After publication is
approved, commit and push the content and images through the normal GitHub
workflow. Cloudflare will rebuild the website using the connected repository.
Check that deployment succeeded, then verify the public article URL and sharing
links. Local changes alone do not publish anything.

## What is automatic

Published entries appear newest first within their collection. Tech articles
also populate the homepage's recent-posts section. Category controls update
the visible articles, result count and URL hash; browser Back/Forward restores
the selection. Without JavaScript, all published cards remain readable. Each
article has its own canonical URL, social metadata, category/date, article body
and sharing controls. Published article URLs are included in the XML sitemap.

The same shared article presentation, sharing controls and server-backed
reactions serve Tech and Journal, while their content remains separate. This
workflow supports professional posts and broad personal writing; My Space holds
the travel, photos and memories hub. A future
CMS can make authoring available in a browser without changing article URLs.
