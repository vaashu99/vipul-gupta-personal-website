# Specification 011: NUS course article and certificate

Status: Implemented, visually reviewed and validated for the user-authorized publication through the connected production branch. Live deployment and delivery are verified separately after the push.

## Scope and evidence

Expand the existing second Tech article at `/tech/nus-ai-solutions/` using Vipul's publicly indexed LinkedIn learning update, the official NUS-ISS curriculum and the supplied certificate. The user explicitly requests certificate publication and a push to make the update live. Retain the original article title, route, category and website publication date; distinguish those from the course dates.

The certificate confirms **Deploying and Operating AI Solutions**, NUS-ISS, **6–8 July 2026**, and a **Certificate of Completion**. Do not imply completion of a graduate certificate or degree. The official course outline describes MLOps/LLMOps, deployment pipelines, operational data and cloud scaling. Vipul's LinkedIn update supports hands-on local models, containerised APIs, LLMSecOps testing for toxicity/bias/hallucinations, observability/tracing and token/latency tracking. Direct LinkedIn profile retrieval is blocked; the indexed correct profile exposes the post, so link to that profile without inventing a standalone post URL.

## Acceptance criteria

- NUS01 Expand the post with readable first-person learning reflections grounded in the three supplied/verified sources. Distinguish personal reported learning from the current curriculum and future interests. Do not fabricate technologies, projects, outcomes, quotes or production implementations.
- NUS02 Keep source-derived paraphrases within source word limits and include accessible links to the official curriculum and the existing LinkedIn update/profile.
- NUS03 Publish the explicitly approved certificate at original 1284×1812 resolution in a lossless PNG with no EXIF/ICC/XMP metadata. Preserve all printed certificate contents; this explicit publication request supersedes the general omission of certificate identifiers from resume assets. Do not publish the resume or other private attachments.
- NUS04 Render the complete certificate without cropping, stretching or horizontal overflow. Provide descriptive alt text, intrinsic dimensions, a caption with course dates, and a link to the full-size asset. Retain sharing/reactions and both themes.
- NUS05 Run required project checks and dedicated predeployment verification. Remove temporary article fixtures before publication. No production sample messages or reactions.
- NUS06 Push the tested release to the connected production branch, verify GitHub and Cloudflare builds, and check live article/certificate delivery. No database, DNS or owner-access changes are required.

## Sources

- User attachment: `/Users/vipul.gupta/Downloads/CERTIFICATE.png`.
- [Official NUS-ISS course outline](https://www.iss.nus.edu.sg/executive-education/course/detail/deploying-and-operating-ai-solutions/artificial-intelligence).
- [Vipul's LinkedIn profile and indexed learning update](https://sg.linkedin.com/in/vipul-gupta-tech).

## Predeployment evidence

Strict Astro checks passed for 38 files with zero errors, warnings or hints; full formatting passed; the normal 12-page build succeeded. Dedicated testing agents verified 109 website cases and 47 article cases with retries disabled, plus 65 accessibility scans with zero violations. The isolated real Worker/D1 runner passed 25 backend cases. Temporary fixtures were removed, real content hashes preserved and the local review on port 4321 retained.

The parent visually approved the complete certificate on 375px and 1440px previews, rendered without cropping or stretching and linked to the original-resolution public image. Captures: `/private/tmp/vipul-spec011-preview/certificate-375.png` and `certificate-1440.png`. See the current test report and source notes for detailed evidence. The connected Cloudflare build is the publication mechanism; no migrations, DNS changes or additional infrastructure are needed.
