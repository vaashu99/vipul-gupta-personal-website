# Image assets for specification 006

Mode: built-in `image_gen.imagegen`; no CLI/API fallback.

The user approved the aquarium portrait for the home page and supplied the cyan infinity image for a decorative background. Both local edit targets were inspected before using the built-in image tool. Original source files remain outside the public website.

## Selected assets

All paths below are relative to the repository root. WebP files are opaque RGB copies, encoded without EXIF, GPS, XMP or generation metadata.

| Asset                                       | Dimensions  | Size            | Source and selection                                              |
| ------------------------------------------- | ----------- | --------------- | ----------------------------------------------------------------- |
| `public/images/portrait-enhanced-600.webp`  | 600 × 436   | 89,952 bytes    | Original approved portrait, high-quality responsive encoding      |
| `public/images/portrait-enhanced-1200.webp` | 1200 × 872  | 268,518 bytes   | Original approved portrait, high-quality responsive encoding      |
| `public/images/portrait-enhanced-2400.webp` | 2400 × 1745 | 900,082 bytes   | Original approved portrait, high-quality responsive encoding      |
| `public/images/portrait-enhanced-full.webp` | 3891 × 2829 | 1,859,530 bytes | Original approved portrait, full-resolution zoom encoding         |
| `public/images/devops-infinity.webp`        | 2172 × 724  | 217,230 bytes   | Selected built-in enhancement of the supplied infinity background |

The portrait derivatives preserve the original image boundaries, aspect ratio, identity and composition. Responsive variants use Lanczos resizing and WebP quality 95; the full-resolution copy does not resize. These are higher-resolution and higher-quality encodings, not an AI reconstruction of the face. Native source blur cannot be recovered by simply increasing display size.

The infinity background is an AI-enhanced interpretation of the supplied decorative image, preserving its cyan network loop and dark navy appearance. The generated output is 3:1 rather than the source's approximately 3.82:1; use it decoratively with a responsive background treatment. Individual node connections are reconstructed and should not be treated as an exact technical diagram. The selected output was converted to WebP quality 92 without further creative editing.

## Inputs and generated output provenance

- Portrait input: `/Users/vipul.gupta/Downloads/IMG_3888.jpeg`, 3891 × 2829.
- Infinity input: `/Users/vipul.gupta/Downloads/IMG_5539.jpg`, 1284 × 336.
- Portrait tool output: `/Users/vipul.gupta/.codex/generated_images/01a10732-714c-7761-bf20-9efefe9dda22/exec-1a909514-b437-4282-937c-dc67aa56451d.png`, 1471 × 1069. Rejected because it was lower resolution than the source and subtly redrew face and scene details. This generated portrait is not used or copied into the public website.
- Infinity tool output: `/Users/vipul.gupta/.codex/generated_images/01a10732-714c-7761-bf20-9efefe9dda22/exec-19c42646-fa05-4549-9f78-e72039b90297.png`, 2172 × 724. Selected and copied into the repository as the optimized WebP above.

## Exact portrait prompt

```text
Use case: identity-preserve
Asset type: personal website portrait photograph, full-resolution zoom view and responsive derivatives.
Input image: the supplied aquarium portrait is the sole edit target.
Primary request: conservatively improve fine detail and clarity/deblur, especially hair, beard, eyes, shirt texture and existing aquarium detail. Produce the highest practical resolution, ideally at least the input's 3891 by 2829 pixels. Retain the exact original full image boundaries and aspect ratio.
Constraints: the person's exact facial identity, face geometry, expression, skin tone, natural skin texture, hair, beard, body proportions, pose, clothing, placement and all aquarium objects must stay unchanged. Preserve original lighting, colors, framing and depth of field. Improve sharpness subtly and naturally only. No skin retouching or smoothing, no beauty filter, no new or removed fish or objects, no face/body reconstruction, no crop, no composition change, no text, no watermark. Do not invent fine facial details that cannot be recovered.
```

## Exact infinity prompt

```text
Use case: precise-object-edit
Asset type: wide decorative website background.
Input image: the supplied cyan network infinity loop against navy is the sole edit target.
Primary request: enhance clarity, upscale to approximately 2400 pixels wide while keeping the original wide 1284:336 aspect ratio; make the existing cyan nodes and connecting lines cleaner and crisper, reduce compression blur.
Constraints: preserve the same cyan infinity loop shape, scale, position, network style, dark navy background and original composition. Retain the full image bounds without crop. Opaque background. No new symbols, objects, text, labels, logos or watermark. Preserve its original simple digital network appearance.
```

## Review scope

Both generated results were visually inspected for the requested edit and preservation constraints. Image format, dimensions and metadata were inspected as part of asset delivery. No browser tests, test agents, build or deployment were run for these local asset changes; deployment validation remains deferred per the user's instruction.
