<<<<<<< HEAD
# LEARN AI — Vercel + Render deployment edition

Start with **DEPLOY_FIRST.md**. It contains the exact deployment order and environment variables.

## Contents

- `frontend/`: Next.js frontend, learner and admin portals, account-login screen, server-side backend proxy, document extraction, visual missions, browser speech and progress displays.
- `backend/`: Express/TypeScript backend, PostgreSQL persistence, account authentication, server role checks, shared content, reporting, adaptive learning and Gemini generation and hosted Gemini embeddings.
- `render.yaml`: Render Blueprint for backend plus PostgreSQL.
- `docker-compose.yml`: optional PostgreSQL for local development.
- `original-sites-source/`: exact tracked source snapshot of the existing Sites prototype. It is not the Vercel/Render deployment target.
- `VALIDATION.md`: checks completed and their scope.

No secrets, installed dependencies, build output or learner data are included. Install dependencies with `npm ci` in each application folder. Lockfiles are included.

## Authentication and database changes

The portable edition replaces Cloudflare D1 with PostgreSQL and ChatGPT authentication with administrator-created email/password accounts. Passwords use salted scrypt hashes. Eight-hour sessions use opaque random tokens stored as hashes, with HttpOnly/SameSite cookies; production cookies use Secure. The frontend proxies backend calls so session cookies remain on the frontend's origin. Anonymous/learner management calls are denied; managers are read-only; admins control defaults, members and publication.

The backend seeds administrator/reviewer accounts from server environment variables and never resets existing passwords on startup. There is no public signup, password-reset email or automatic invitation flow. This is panel-demo authentication, not corporate SSO.

The export creates a fresh database. It does not transfer existing Site learner records or modify the live Site.

## Prototype behavior

Learning uses prepared English phishing and negotiation journeys or key-gated live generation. Mastery is a smoothed provisional estimate from accuracy, hints and confidence, with initial level priors. Review dates and in-app nudges support reinforcement; delayed review records an indicative recall signal. Session duration is an activity-count budget rather than an elapsed-time limit. Admin settings include audience/tone/language/difficulty/thresholds/review cadence. Administrators can publish tested journeys to all or a specified department. Publishing shares extracted source text deliberately; reports exclude that text and learner explanations.

PDF/DOCX/TXT/Markdown and image extraction runs in the browser, up to 5 MB, 100 PDF pages and 80,000 characters. Scanned PDF pages and PNG/JPEG/WebP images use bundled English/Urdu OCR assets, with a limit of 10 scanned PDF pages. DOCX text uses Mammoth and an expanded-size guard. Preview and confirm extracted text. Encrypted/malformed files return actionable errors. Original file bytes and audio are not stored.

Live generation validates the course schema and checks quoted document evidence against source chunks. URL retrieval is isolated in the provider's managed web-search service. English/Urdu spoken decisions can be interpreted as an option selection when AI is configured. Ambiguous speech requires clarification. Open responses use a four-criterion formative rubric with source-quotation validation and continuous evidence in mastery. This is not a validated high-stakes grading instrument.

## Validation commands

```sh
cd frontend
npm ci
npm run typecheck
npm run build
```

```sh
cd backend
npm ci
npm run typecheck
npm test
```

The backend tests use PostgreSQL-compatible in-memory SQL and local HTTP requests. They do not require an API key or cloud deployment. Actual provider generation and microphone/browser interaction still need deployment-time verification.

## Updated features

This export includes the latest DOCX/OCR, private source indexing, keyword search, optional embeddings/semantic search, rubric assessment, contextual text/Realtime bilingual conversation, generated scenario images and email opt-in/delivery code. Source retrieval is bounded to 10 documents and 1,500 chunks per account; it is a pilot index, not enterprise ANN retrieval. When the optional image provider is connected, images are stored as private PostgreSQL base64 records (20 illustrations per account) instead of Cloudflare R2, so they survive Render service restarts. No video, push notifications or password-reset email is included. Corporate SSO is not implemented; reviewer accounts use the existing email/password login.

Use **AI_API_KEY_SETUP.md** for exactly where to add the AI secret. Without a key, extraction, OCR, keyword search, prepared journeys, persistence and reporting work. Gemini generation, semantic retrieval and rubric grading require Gemini API access and quota. Images and Realtime audio require a separate optional connection. A ChatGPT Plus subscription does not itself configure or fund this app's API calls. Live provider behavior and Urdu OCR/conversational quality need testing with your account.

Email delivery requires RESEND_API_KEY, a verified EMAIL_FROM, FRONTEND_URL (or SITE_ORIGIN), and a schedule. No external schedule is created by this ZIP. An admin can run due reminders manually from Connections once email is configured. For automatic operation, a server-side scheduler must POST /api/reminders/run on the Render backend with Authorization: Bearer REMINDER_JOB_SECRET and Content-Type: application/json, body {}. Keep this credential outside browser code. Delivery only targets opted-in account emails; due-date/cadence checks, per-day deduplication and a ten-send invocation cap apply.

This is a separate Node/Express export, not the Python/FastAPI project you previously ran. It creates a new PostgreSQL database and does not import existing Site learner records.

## Gemini edition

Default Render Blueprint provider: Gemini. Configure GEMINI_API_KEY on the backend; generation uses gemini-2.5-flash and embeddings use gemini-embedding-2 with 768 dimensions. The OpenAI text adapter remains an explicit fallback. Embedding records include provider/model/dimension identity to prevent incompatible-vector comparisons. Source quotations and course schemas remain checked after either provider responds. See AI_API_KEY_SETUP.md for model/hosting limitations and privacy. The original-sites-source folder is the earlier published Site snapshot, not a Gemini-modified Site.
=======
# Learn-AI
>>>>>>> 4156a4a416cbebf017a8690da6b64e83f726c71c
