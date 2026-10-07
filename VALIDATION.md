# Validation scope

Completed in the export environment:

- Installed both applications from their package manifests and generated npm lockfiles.
- Frontend and backend TypeScript checks passed.
- Standard Next.js production build passed with webpack. Pages: `/`, `/login`, `/learner`, `/admin`; dynamic proxy `/api/[...path]`.
- Backend integration tests passed using pg-mem's PostgreSQL-compatible SQL and an actual local Express HTTP server: login, invalid credentials, session hashes, anonymous denial, forged ChatGPT-header denial, manager read-only, learner/admin boundaries, saved progress, duplicate-response rejection, source generation blocked without a key, same-origin checks, role-protected account creation, actual report projection, department-restricted content and logout.
- Next.js API proxy handler integration passed against that local HTTP backend: cookie forwarding, Secure/HttpOnly/SameSite cookie propagation, authenticated reporting, prepared generation/resume, route allowlist, origin rejection and logout.
- Earlier source checks validated adaptive remediation, smoothing, level entry, activity budget, fresh-course isolation, delayed-only recall and unrelated-policy PDF extraction/evidence verification. Their scripts remain in `original-sites-source/scripts`.

Two portable integration test groups pass. The proxy test invokes the actual exported Next.js route handler; it is not a browser-driven test. Database tests use in-memory PostgreSQL-compatible SQL, not a live Render PostgreSQL instance.

Not verified: deployment into the user's Vercel/Render accounts, live provider generation/billing, real microphone/browser speech behavior, and real PostgreSQL network connectivity. Complete the deployment checklist before sharing the panel URL. The export contains no secrets or old learner records.

## Updated export checks

Both TypeScript checks and the frontend production build passed after the new integrations were ported. Portable runtime tests now also verify anonymous source access denial, owner-only source indexing/search, DOCX source schema, email opt-in persistence, no-key conversation rejection, learner denial on reminder jobs, missing-email-provider rejection, owner-only generated-image retrieval and lossless binary image forwarding through the actual frontend proxy. PostgreSQL-compatible in-memory SQL is used. The original Site tests also passed real DOCX extraction, English OCR, source quote checking, rubric evaluation with mocked responses and reminder due-date/opt-in/deduplication checks.

No actual email, image-generation, embedding, rubric or Realtime provider call was made. No schedule was activated. Render/Vercel cloud deployment, real PostgreSQL network connectivity, browser interaction and Urdu OCR quality remain unverified.

## Gemini edition validation

Gemini adapter tests use mocked HTTP responses, not a real key. They validate server-only x-goog-api-key headers, JSON request/response handling, rejection of truncated/invalid output and quota errors, course schema and exact document quotation validation, hosted 768-dimension embedding batches, owner-only retrieval, keyword fallback for mismatched embedding models, rubric scores and successful exact-URL metadata requirements. Three integration test groups pass. Both TypeScript checks passed, and the Next.js production build passed. Live Gemini quota/model availability, Urdu response quality and URL retrieval still require testing with the user's key.
