# Specification 002: Journal publishing and article sharing

Status: Implemented and verified locally. Local review only. No commit, push or deployment requested.

## Purpose

Let Vipul add real blogs, articles and photo essays through a documented Markdown
workflow. Provide readable article pages and visitor sharing controls without a
CMS, login or tracking dependency.

## Content model

`src/content/journal/**/*.md` is a typed Astro collection. README files are
excluded. Required fields: nonempty `title`, `description` (maximum 240
characters), `publishedAt` (ISO date/timestamp), and `category` (`travel`,
`notes`, `photo-essays`). `draft` defaults to true. Optional local `coverImage`
requires nonempty, accurate `coverAlt`. Filenames and directory names are
lowercase hyphenated words; nested slugs are supported.

## Publishing behavior

Only entries with `draft: false` and publication time at or before build time
appear in the listing, static article routes and sitemap. A future date requires
a subsequent build; it is not a scheduling service. Draft exclusion is editorial
behavior, not privacy protection. No fabricated personal articles are included.

## Acceptance criteria

- JP01 Published Markdown renders a journal card, `/journal/<id>/` page and
  escaped sitemap URL; newest entries appear first.
- JP02 Draft and future entries are absent from the listing and sitemap, and
  have no generated article route. Nested slugs work.
- JP03 All, Travel, Notes and Photo essays buttons filter cards, update
  `aria-pressed`, announce result counts or category empty states, and preserve
  category hash links and Back/Forward behavior. With JavaScript disabled, all
  published articles remain accessible and inert filter controls are hidden.
- JP04 No-content empty states remain honest and preserve version 1 wording.
- JP05 Article pages have one h1, category, Singapore-formatted date, author,
  backlink, canonical URL, description and article social metadata. Body content
  supports headings, lists, links, quotes, images, code blocks and tables without
  page overflow at 375, 768 and 1440 pixels.
- JP06 Article sharing supports copy link, native sharing when available, and
  external share links without loading third-party widgets or trackers.
  Failure or cancellation is handled without a false success message.
- JP07 Invalid covers and missing cover descriptions fail schema validation.
  No private photo storage, credentials or original resume is introduced.
- JP08 Document creation, local draft review, ISO date semantics, validation and
  approved GitHub/Cloudflare publication. No public test fixtures remain.

## Validation

Run strict Astro checks, formatting, production build and behavioral tests with
temporary, clearly marked test fixtures. Verify filtering, Markdown rendering,
draft/future exclusion, nested routes, sitemap, sharing, no-JavaScript reading,
mobile layouts and accessibility. Remove fixtures and rebuild the honest empty
production preview after testing. Tests and evidence belong in the testing
agent's report.

## Deferred

Browser authoring/CMS, scheduled rebuilds, RSS, comments, authenticated albums,
Drive-backed media and redirects for renamed articles.
