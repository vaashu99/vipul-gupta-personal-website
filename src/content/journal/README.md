# Journal authoring

Write real articles as Markdown files in this directory. Published articles
automatically receive a journal card, a static article page and a sitemap entry.
The full workflow and a copyable starter are in
[docs/blog-authoring.md](../../../docs/blog-authoring.md).

Use lowercase hyphenated names, for example `my-first-note.md`. Nested directories
are supported: `life/my-first-note.md` becomes
`/journal/life/my-first-note/`. Do not use `README.md` for an article: README
files are explicitly excluded by the collection loader.

Required frontmatter: `title`, `description`, `publishedAt`, and `category`.
Categories: `thoughts-conversations` (Thoughts & Conversations), `life-notes`
(Life Notes), `what-if` (What If), and `humour` (Humour). Category IDs, labels,
descriptions and empty messages live in `src/data/journalCategories.ts` and are
shared by validation, listing controls and article rendering.
`draft` defaults to `true`.
Optional `coverImage` must point to a local public image and requires an accurate
`coverAlt`. Articles and images are public content only.

Drafts and future-dated entries are omitted from listing, article routes and
sitemap in every build, including local preview. They are not confidential:
repository files, CI artifacts or retained old deployments may still be visible.
Never add private photos or credentials here. Scheduled dates require a new
build after the date; the static website has no automatic publishing scheduler.

No personal stories have been supplied yet, so the journal currently shows its
empty state. Do not publish test fixtures or invented personal experiences.

Journal is the personal writing hub. Travel, Photos and Memories live in
`/my-space/`, with the public photo gallery preserved at `/photos/`. Tech remains
separate for professional writing. Article URLs remain based on filenames,
independent of category; changing a category does not change the article URL.
