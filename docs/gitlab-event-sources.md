# GitLab After Dark article: sources and image provenance

The user approved the four attached event photographs for the website article.
No remote publishing, event-photo download or image generation was performed.

## Editorial grounding

- Event participation is user-confirmed. The supplied `IMG_5499.jpg` poster
  identifies GitLab After Dark Singapore, **24 September 2026**, **Rasa Space,
  Singapore**, and Vipul Gupta in the speaker lineup.
- The supplied stage photographs show the session title **Earning the Right to
  Autonomy**. The date on the article remains **4 October 2026**, its website
  publication date, with an explicit distinction from the event date.
- The referenced chat, **Prepare migration speaking notes** (thread
  `01a0ceb1-c611-7b53-8c5f-58476eb94d41`), and the user's original pasted answers
  ground the high-level themes: representative migration pilots, cutover
  preparation, validating the delivery workflow after transfer, central security
  baselines, controlled automation, AI governance and checking AI assistance.
- The original pasted answers are the primary source for the user's perspective;
  agent suggestions in the chat are preparation advice, not proof of what was
  said on stage. The article explicitly describes a reflection on preparation,
  not a speech transcript. No quotes, exact operational metrics, internal links,
  network design, incident details or suggested criticism of GitLab Professional
  Services are presented as public facts.
- The previously supplied public LinkedIn event post remains the article's
  public source link. Direct LinkedIn retrieval was unavailable in the earlier
  local pass; the article's date, venue and session title now use the supplied
  poster and photographs rather than an inferred event year.

## Derivative images

All derivatives are under `public/images/gitlab-after-dark/`. Processing used
Pillow only: apply the source's orientation, convert any embedded colour profile
to sRGB, resize with Lanczos only when necessary, paste pixels into a clean RGB
image, then encode WebP. This fresh image contains no copied EXIF, GPS, XMP or
embedded profile. No cropping, upscaling, retouching, AI enhancement or changes
to people, stage text or event details were made. The original uploads remain
outside public assets.

| Approved source filename                         | Public derivative   | Dimensions  | WebP quality | File bytes |
| ------------------------------------------------ | ------------------- | ----------- | ------------ | ---------- |
| `23a2c955-07f3-4db7-a84a-29622e8f78e3.JPG`       | `panel-close.webp`  | 1600 × 1450 | 90           | 209920     |
| `IMG_5499.jpg`                                   | `event-poster.webp` | 1270 × 702  | 95           | 216614     |
| `WhatsApp Image 2026-09-25 at 12.58.10 (1).jpeg` | `community.webp`    | 1600 × 1200 | 90           | 286434     |
| `WhatsApp Image 2026-09-25 at 13.25.34.jpeg`     | `panel-stage.webp`  | 2000 × 1500 | 90           | 515338     |

The poster retains its original dimensions and higher encoding quality to
preserve text readability. Every article figure links to its full public
derivative and supplies accurate alt text, intrinsic dimensions, lazy loading,
asynchronous decoding and a caption. Source softness and event lighting are
preserved; derivative encoding cannot create missing photographic detail.

## Review status

Source photographs were visually inspected. Files were generated and the article
formatted. Full functional/accessibility tests and deployment remain deferred
per the user's instruction; no earlier test result validates this article
revision. Shared prose figure/caption styling is handled by the parent agent.
