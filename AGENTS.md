# Project conventions

Read docs/specs/001-personal-website.md and docs/architecture.md before implementing changes. Keep requirements and evidence aligned with the implementation.

Use Astro static output, strict TypeScript, two-space indentation and Prettier. Reusable presentation lives in src/components and src/layouts; structured professional content in src/data; routes in src/pages; Markdown collections in src/content. Keep page scripts small and avoid unnecessary dependencies.

Use semantic HTML, one h1, meaningful links, keyboard access, visible focus and reduced-motion handling. Test mobile layouts and production output. Do not fabricate resume or personal content.

Never place the original resume, credentials or private photos in public/ or dist/. Do not commit/push/deploy for a local-preview request.

The user defers full testing and testing agents until deployment. During local iterations, format edited files and build only as needed to update the preview; do not run test suites, axe scans or full quality gates on every edit. Before deployment, validate with npm run check, npm run format:check, npm run build and npm test, including the journal suite, npm run test:interactions, and new Tech/theme coverage. Functional and accessibility tests should target behavior and acceptance criteria, not mirror component implementation.

For delegated work, use explicit file ownership; do not edit another agent's files. Testing agents may inspect all files and own tests/ and their reports. Report issues with concrete reproduction steps.
