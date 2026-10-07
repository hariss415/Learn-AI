# LEARN AI — UBL adaptive learning prototype

## Portals and access

- `/learner`: authenticated learner workspace, own saved profile, generated or prepared journeys, browser speech, review reminders and history export.
- `/admin`: server-authorized administrator and manager portal. Administrators manage shared defaults, roles, departments and published content. Managers read aggregate reports and export filtered outcomes. Learners receive 403 on management APIs.
- Owner administrator is selected by the server-only `ADMIN_EMAILS` allowlist. Other roles are assigned to verified account email addresses in D1. Site sharing is separate and remains private; assigning a role does not invite or grant Site access.

## Implemented

- English prepared phishing and negotiation missions; exact demo-topic matching prevents arbitrary topics being silently replaced by canned examples.
- Topic/document/public-URL live generation plumbing; validated course schema, source chunk quotations checked against extracted document text. Managed web retrieval requires an exact source URL match.
- PDF/DOCX/TXT/Markdown and image extraction with preview without an AI key: 5 MB, 100 PDF pages and 80,000 text characters. Browser OCR supports English/Urdu scans and images using same-origin packaged assets; scanned PDFs are limited to 10 OCR pages. DOCX has an expanded-size guard. Confirm OCR text before generation. Original file bytes are not stored; saved source text is persisted only when requested.
- Adaptive next activity considers concept weakness, difficulty thresholds, mistakes, hints and confidence. Mastery smooths observable accuracy, hint independence and confidence calibration with level-based priors. A missed answer leads to guided practice. Fresh journeys ignore a previous course’s remediation signal.
- XP, session activity budgets, persistent profile, spaced review due dates, configurable in-app reminders. Delayed recall is observed only for a response after a due review date; it is an indicative recall signal, not a validated retention study.
- Shared defaults: audience, tone, level, English/Urdu/mixed language, session budget, review cadence, mastery thresholds, voice and gamification.
- Administrator can publish their tested current journey to a reusable library restricted to All or an exact department. This deliberately shares its extracted source text with eligible Site accounts. Removal blocks new starts; existing learner copies remain saved.
- Actual organization reports: up to 100 most recently active accounts, filters for department/language/content/name/date, sessions, responses, accuracy, hints, mastery, completion, weak areas and delayed recall. CSV export neutralizes leading spreadsheet formula markers. Report projections exclude raw source text and spoken explanations.
- Browser speech synthesis and transcription. Key-gated semantic interpretation of English, Urdu or mixed-language decisions maps intended actions to valid options and asks for clarification when unclear. Interpretation does not use the correct answer as an input. Selected action is scored by the server.
- Persistent optimistic revisions prevent duplicate or conflicting responses. AI requests use saved rate limits, server-only secrets and timeouts. Same-origin checks protect writes.

## Live connection blocker and remaining scope

No `OPENAI_API_KEY` is configured. Prepared demos, extraction, roles, persistence, content library and reports work without it. Arbitrary-input generation, URL retrieval, Urdu generation and semantic speech interpretation are not verified live. Use the OpenAI Developers plugin to configure a key securely; never paste it into a topic or document. Provider billing/rate limits apply. Model defaults to `gpt-4.1-mini` unless `OPENAI_MODEL` is set.

## New capability integrations

- Private persistent source library: up to 10 documents and 1,500 chunks per account, quoted keyword retrieval without AI, optional 256-dimension embeddings and cosine semantic retrieval with AI. This bounded D1 pilot index is not enterprise-scale ANN retrieval. Documents indexed before an AI connection can be re-saved to add embeddings.
- Open-response formative assessment: application, reasoning, source use and safety scored 0–4, verified source quotation, clarification for uncertain responses and continuous rubric evidence in mastery. Requires AI; not a certified assessment instrument or validated automated high-stakes grading system.
- Contextual English/Urdu text conversation and WebRTC audio conversation through a server-authenticated Realtime handshake. Browser microphone permissions and network access are required; voice sessions end after five minutes. No provider secret is returned to the browser. Audio is not persisted by the app; provider processing applies. Browser speech recognition remains an optional fallback.
- Scenario image generation, stored privately in R2 and retrieved through an ownership-checked route. Image output is a learning illustration, not teaching evidence. Default image model: `gpt-image-1` (`IMAGE_MODEL` override); voice: `gpt-realtime` (`REALTIME_MODEL` override).
- Email opt-in, cadence and due-review delivery endpoint with delivery deduplication. Requires server-only `RESEND_API_KEY`, verified `EMAIL_FROM` and a separately activated scheduler. `/api/reminders/run` accepts a signed-in administrator with same-origin protection or server Bearer `REMINDER_JOB_SECRET`. At most 10 deliveries per invocation. Configure `SITE_ORIGIN` if moved. No schedule is active and no live email has been sent. Preferences can be saved before connection.
- Admin connection dashboard exposes prerequisites and allows authorized manual email job runs after connection.

No generated video, push reminders or password-reset email was added. Corporate SSO remains pending: this hosted Site uses native ChatGPT authentication, and UBL identity-provider details and a supported external authentication hosting path are required. Do not mistake Site access or department roles for corporate SSO.

AI integrations are implemented but unverified against live services because no AI key is configured. Urdu OCR accuracy, real conversational bilingual audio quality and browser interactions are unverified. Review sensitive UBL document handling with the selected providers before a real-data rollout. Remaining broader assignment scope includes varied simulation/puzzle mechanics, comprehensive cost instrumentation and submission presentation materials. Session minutes are an activity budget; mastery is a provisional recorded-response signal.

## Validation

- `node node_modules/typescript/bin/tsc --noEmit`
- `node scripts/check-learning.mjs`: schema, scoring, replay rejection, smoothing, remediation, level entry, session budget, no silent prepared fallback, fresh-course isolation, delayed-only recall.
- `node scripts/check-access.mjs`: anonymous/learner denial, manager read-only, owner allowlist, invalid role rejection, origin check, empty-course publishing rejection, department library enforcement. Uses injected request identities and D1 mocks.
- `node scripts/check-documents.mjs <wellbeing-policy.pdf>`: real unrelated-policy PDF extraction, source chunk/evidence validation and malformed inputs.
- `node scripts/check-advanced.mjs`: real SQLite migrations and owner isolation, keyword retrieval, mocked rubric/source checks, reminder opt-in/due-date/deduplication checks.
- `node scripts/check-ingestion.mjs`: actual DOCX extraction and English OCR using local test fixtures.
- `node scripts/prepare-ocr-assets.mjs`: rebuild packaged worker, WASM and language assets after OCR dependencies change.
- Sites production Worker build. Browser interaction and actual provider generation remain untested in this environment.

## 5–10 minute demo

Start a prepared phishing mission, inspect a sender, make a mistake or use a hint, observe changed difficulty and feedback, then show saved progress. Open `/admin`, show real filtered reports, export evidence, configure defaults, publish a tested journey and demonstrate role boundaries. After connecting AI, run the panel’s unknown-input challenge with a fresh unrelated PDF, inspect extraction and source evidence, then try Urdu, URL retrieval and spoken decision interpretation. Keep connection-dependent and remaining capabilities explicit.
