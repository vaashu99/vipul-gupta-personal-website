# Specification 003: Dark theme, homepage photo and DevOps animation

Status: Implemented and verified for local review. No commit, push or deployment requested.

## User request and design

The initial homepage image was IMG_3889.jpeg; [Specification 005](005-career-entries-and-photo.md) replaces it with the user-supplied IMG_3888.jpeg. Replace the cream theme with a dark charcoal background and clearer, high-contrast off-white text with mint accents. Preserve the responsive editorial layout and existing professional content. Add a real looping GIF illustrating a DevOps workflow on Experience; do not present it as live telemetry.

## Acceptance criteria

- DT01 Homepage displays the supplied aquarium photo with accurate alt text and no intentional crop. Use responsive, optimized public WebP copies with embedded metadata omitted, preserving the original file outside the repository.
- DT02 Shared pages, article pages, navigation, controls, hover and focus states use coherent dark colors and readable WCAG AA text contrast.
- DT03 Experience contains a locally hosted animated GIF with multiple frames, a clearly illustrative caption and an accessible description of Code, Build, Deploy and Observe.
- DT04 A keyboard-operable pause/resume control freezes the illustration by showing a static poster. Reduced-motion preference uses a static poster from the outset, honors preference changes and cannot be overridden by an animation button.
- DT05 Printed resumes retain a white background and dark text. The animation and controls are omitted from print.
- DT06 Main pages and article content fit mobile, tablet and desktop widths; the homepage image loads and the animation maintains its aspect ratio.
- DT07 Strict checks, formatting, production build, meaningful browser tests and axe scans pass. Review new desktop/mobile screenshots and print output.
- DT08 No external GIF service, trackers, new backend, private assets, remote mutations or deployment. Existing blog publishing and sharing behavior remains functional.

## Implementation boundaries

Keep the theme in shared CSS variables, with print-specific light variables. Use a reusable DevOpsAnimation component, local GIF and still assets, and a reproducible drawing script. The GIF demonstrates a general delivery pipeline rather than any employer infrastructure. The supplied photo is approved for this homepage by the user's request.
