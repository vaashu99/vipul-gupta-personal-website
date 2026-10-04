# Specification 010: Sender details, owner inbox and event update

Status: Published to vipulgupta.tech on 5 October 2026 (Singapore time). Sender, theme, social links, homepage and event article changes are live. Exact owner email and Cloudflare Access configuration remain pending; private inbox sign-in is not activated.

## Requirements and source evidence

The user requests a fix for the unconfigured private inbox; chat sender name with either phone or email; Charcoal as the default palette; personal YouTube, X, Instagram and Facebook links in My Space; homepage section 03 changed to Journal with a distinct colour; and four supplied GitLab event photos plus material from the referenced speaking-notes chat.

The four approved event attachments show GitLab After Dark Singapore and the fireside chat Earning the Right to Autonomy. The event poster confirms 24 September 2026 and Rasa Space, Singapore. Article publication date and event date are separate. Public prose should draw on high-level topics from the user's preparation, without treating suggested answers as a verified verbatim transcript or publishing internal links, infrastructure details, incidents or unsupported metrics.

## Acceptance criteria

- SD01 A visitor supplies a bounded name and either email or telephone before sending the first identified message. Both UI and Worker validate input. Contact details are self-reported, not a verified identity; they do not trigger email/SMS delivery.
- SD02 Store sender details on the existing thread using an additive D1 migration. Retain legacy conversations/messages; unidentified threads remain readable and can add identity on their next send. Never infer identity from old content.
- SD03 Details are visible only in the visitor's own browser-scoped conversation and authenticated owner inbox. Reactions remain anonymous. No personal details in URLs, logs, local storage or public listings. Plain text rendering and parameterized SQL remain required.
- SD04 Inbox lists and selected conversations show sender name/contact, with honest unidentified states for legacy threads. Owner replies and visitor isolation continue to work.
- SD05 Production inbox uses Cloudflare Access and an exact owner email; missing configuration continues to deny access. Never enable the local preview bypass in production. Existing Wrangler OAuth lacks Access permissions (read probes returned 403); owner email and permitted Access configuration must be supplied before completing live sign-in.
- SD06 Fresh/no-JavaScript/invalid preferences default to Charcoal. Explicit saved Ocean remains respected. Ocean and Charcoal remain the only options; print stays white.
- SD07 Homepage section 03 becomes Journal and links to Thoughts & Conversations, Life Notes, What If and Humour. Distinct colours remain readable in both palettes.
- SD08 My Space includes the exact user-provided social profile links without embedded third-party SDKs or tracking.
- SD09 GitLab article includes all four approved photos, accurate captions, readable responsive layouts and grounded prose. Strip image metadata; preserve people, composition and factual details without generative alterations.

## API contract

Visitor POST `/api/chat` accepts `{ message, sender: { name, contactType: 'email' | 'phone', contactValue } }`. Sender is required for new or unidentified threads; identified threads may retain their existing details on subsequent messages. Visitor and owner conversation responses include `sender` or null; owner thread listing includes sender. Contact details are never exposed to another visitor. Existing messages and reaction contracts remain unchanged.

## Verification and publishing

During preparation, format changed files and rebuild the local preview; full testing agents and suites stay deferred per the user's preference. Update sender/theme acceptance tests for the next deployment. Before publishing, run the required project gates and test the additive migration, legacy threads, sender validation, private data isolation, both palettes, event gallery and owner authorization. Do not claim inbox sign-in works until exact owner email, Access app/policy and Worker configuration are verified.

## Local readiness

All requested content/design/sender changes are implemented. The additive sender migration was applied only to the local preview, retaining existing messages. Astro built all 12 pages. A fresh browser showed Charcoal by default, four event figures, the new Journal section, all four social profiles and a readable mobile sender form. Read-only local APIs confirmed database readiness and the new empty sender contract. No sample messages or votes were sent. Full suites are now being updated and run as the predeployment gate, rather than on routine edits.

The inbox cannot be activated with the existing Wrangler OAuth scope: organization and application reads returned 403. A concrete owner-only dashboard setup is provided in [owner inbox setup](../owner-inbox-setup.md). Exact owner email and Access team domain/application audience remain required; these values must remain out of public assets and source control.

## Release evidence

Predeployment checks passed: strict Astro checks with zero errors, warnings or hints; repository formatting; 102 website and 47 article browser cases with retries disabled; 65 accessibility scans with zero violations; and 25 real Worker/D1 integration cases. Fixtures were removed and the normal 12-page build restored.

Production migration `0003_chat_sender_details.sql` applied successfully to the existing dedicated D1 database without deleting conversations. Wrangler published Worker version `5538e629-935d-4d5b-8a28-0a5ea8f5a50e`, preserving the custom domain and existing bindings/variables. Sixteen read-only live checks passed for the homepage, chat, My Space, event article, all four WebP assets, database health, visitor chat, reaction counts and protected inbox aliases. No production messages or votes were created. Evidence: `/private/tmp/vipul-spec010-production-smoke.json`. The connected GitHub/Cloudflare pipeline runs independently after saving the release commit.
