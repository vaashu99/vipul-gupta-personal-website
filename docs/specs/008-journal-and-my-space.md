# Specification 008: Journal and My Space

Status: Implemented for local review. No publishing requested; full testing remains deferred until deployment.

## User decisions

Keep Journal as the personal writing section. Its categories are Thoughts & Conversations, Life Notes, What If, and Humour. What If replaces the suggested Stories & Fiction category and can contain imaginative scenarios as well as speculative essays. Keep Tech separate for professional articles.

Replace Photos in the main navigation with My Space, a personal hub containing Travel, Photos and Memories. Preserve the existing public photo gallery URL. No personal posts, destinations, memories or photo collections may be invented.

## Implementation contracts

- Journal category IDs: `thoughts-conversations`, `life-notes`, `what-if`, `humour`. Use a shared typed definition for schema validation, listing controls, empty messages and article category labels.
- Keep `/journal/` and `/journal/{id}/` URLs. Preserve draft/future filtering, sharing and shared reactions. No published Journal entries exist, so no real content needs migration.
- Add `/my-space/` with clearly labelled Travel, Photos and Memories sections and working anchor navigation. Connect its Photos area to the existing `/photos/` gallery. These sections explain unpublished content honestly and introduce no pretend albums or trips.
- Keep navigation order Home, Experience, Tech, About, Journal, My Space. Both My Space and Photos URLs activate the My Space item.
- Update homepage personal links, About, footer, sitemap and authoring guidance for the two personal sections. No stale links to the retired Journal category hashes.
- Match Ocean/Charcoal palettes and responsive shared styles. No new dependencies or backend changes needed for this organization.

## Acceptance criteria

JR01 Journal retains its name and displays All plus the four selected category filters, correct category URLs and honest empty states. Long labels wrap on small screens.
JR02 The article schema and renderer use the same categories and labels. The authoring guide supplies a valid Markdown example.
JR03 My Space is discoverable in the main navigation and sitemap, with Travel, Photos and Memories sections. Photos links still reach the existing gallery.
JR04 Homepage, About and footer connect coherently to Journal and My Space without retired category hashes.
JR05 Format edited files and build the local preview. Full functional/accessibility tests and testing agents are deferred until deployment by the user. Update obsolete test expectations before those future checks.
JR06 No commit, push, deploy, external writes, invented personal content or private-media access claims.

## Local readiness evidence

Edited files were formatted. The static build succeeded with 12 pages, including `/my-space/`. The running local Worker preview served Journal and My Space with HTTP 200. These are build/startup checks, not functional or accessibility suite results. Full tests and testing agents remain deferred until deployment; existing tests need their category/navigation expectations updated for this specification. No sample personal content, database changes, publication or remote resource creation occurred.
