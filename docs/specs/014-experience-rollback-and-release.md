# Specification 014: Restore the original animation and publish Experience updates

Status: Published to production on 7 October 2026 (Singapore time), with testing explicitly skipped by the user.

## Request and scope

The user rejects the new animation, requests rollback and production publishing of the Experience changes, and explicitly says not to run testing this time. Restore the original DevOps GIF immediately before Career, since both AI animation experiments were rejected. Preserve the expanded generic AI responsibilities and AI platform operations skills in profile.ts. Remove the React Flow island and its added dependencies/configuration; preserve all unrelated pages, dates, approved claims, domain settings, database bindings and existing runtime variables.

## Public content boundary

Retain generic AI/agent infrastructure, resilient deployments, AI gateways, request controls, observability, model access controls, identity/access management, token usage and spend visibility. Do not publish employer-specific internal source, URLs, architecture or identifiers. Do not add personal RAG/training delivery claims.

## Release procedure

Format changed source/documents and build the production assets through the existing Wrangler deployment command. Skip test suites, testing agents, type-check/quality gates and browser testing for this release at the explicit user request, overriding the normal repository deployment gate. Use a one-time skip-CI commit marker to prevent the push-triggered GitHub quality workflow from running tests; retain the workflow itself. Commit/push only the reviewed release diff and deploy the existing Worker. Record the deployed version and confirm the public Experience document with a read-only fetch. No production chat messages, reactions or database migrations are needed. Previous test results are historical, not evidence for this release.

## Production result

Wrangler built all 12 static pages and published the existing Worker successfully. Only `/experience/index.html` required a new static upload; existing database and asset bindings were retained. Deployed version: `c411d4fb-8ed2-46ae-86b7-6ec9ccf55a53`. A read-only browser-style request returned HTTP 200 and confirmed the original DevOps animation, expanded AI responsibilities and AI platform operations skills, with the rejected diagram absent. No test suites, testing agents, browser test runs, type checks or production data mutations were performed. The release commit uses `[skip ci]` to honor the requested one-time testing skip without changing the quality workflow.
