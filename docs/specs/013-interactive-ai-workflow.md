# Specification 013: Interactive AI workflow from open-source components

Status: Withdrawn on 7 October 2026 (Singapore time), superseded by Specification 014. The user rejected this local preview; the React Flow island, integration and dependencies are removed. Historical requirements and local review evidence below describe the rejected experiment, which was never published.

## Requirements

The user rejects the row-based animation and asks for an online-sourced visual with icons and interaction, placed immediately before Career on Experience. Use React Flow's public interactive/animated-edge examples as references and its actual open-source package, together with Lucide icons. Bundle locally rather than embedding a third-party editor or loading assets from a remote CDN.

## Acceptance criteria

- Replace the prior visual with a compact interactive node graph, recognizable icons and animated connections. Provide CI/CD, RAG and optional training scenario controls and explanations when selecting nodes.
- Place the widget after the Experience introduction and immediately before Career, as explicitly requested.
- Provide zoom/pan/fit controls, keyboard-operable scenario selection and node detail access, pause/resume and reduced-motion support.
- Use both existing site themes and responsive mobile/desktop layouts; preserve legible text rather than fitting a wide diagram into unreadable tiny nodes.
- Keep all content illustrative and generic. No internal architecture, identities, URLs or configurations; RAG context retrieval remains separate from model-weight training.
- Render an accessible static fallback when JavaScript is disabled; hide the widget when printing the resume. Do not claim live execution or show invented metrics.
- Load the React island only for this component. Add compatible pinned dependencies and retain upstream licensing/attribution. Preserve the static Astro site and all other functionality.
- Format changed files and rebuild the local preview. Full suites/testing agents and publishing remain deferred until a deployment request. Before publishing, update old GIF/row-animation tests to the new graph contracts.

## Online sources

- [React Flow interactive overview](https://reactflow.dev/examples/overview).
- [React Flow animated edges](https://reactflow.dev/examples/edges/animating-edges).
- [React Flow MIT license](https://github.com/xyflow/xyflow/blob/main/LICENSE).
- [Lucide licenses](https://lucide.dev/license).
- [Official Astro React integration](https://docs.astro.build/en/guides/integrations-guide/react/).

## Ownership

Design agent: AIWorkflow.tsx, its stylesheet, AIInfraAnimation.astro and Experience placement. Root: dependencies/lockfile, integration configuration, specifications, attribution and local visual review. Preserve Specification 012's profile edits. No remote mutations or deployments.

## Dependencies and notices

React Flow 12.12.0, Lucide React 1.52.0 and React/React DOM 19.3.0 are pinned, with Astro React integration 7.0.0 and matching React types. The island imports React Flow CSS and adapts the site tokens for both palettes. Upstream license text for the client libraries and their runtime dependencies is distributed at `/licenses/ai-workflow.txt`; React Flow attribution remains visible.

## Local review evidence

Astro built all 12 pages successfully. Local Chrome review confirmed six icon nodes with visible animated arrows, CI/CD/RAG/Training switching, keyboard stage selection, pause/resume, zoom/fit controls, reduced-motion stopping and print exclusion. JavaScript-disabled visitors receive the semantic overview. Charcoal and Ocean desktop captures and the final 375px mobile capture are under `/private/tmp/vipul-spec013-preview/`. The widget precedes Career; the mobile document remains 375px wide. A scoped SVG override prevents global image sizing from clipping React Flow edges; horizontal mobile controls sit below the final node row. No browser errors were observed during review.

This is a local review, not the full deployment gate. No suites, axe scans, testing agent, commit, push or deployment were run. Before publishing, update the obsolete animation selectors, then run the quality gates recorded in AGENTS.md.
