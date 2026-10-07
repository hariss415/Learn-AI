# Deploy LEARN AI for the UBL panel

This ZIP contains the complete portable prototype, plus the original Sites source. Deploy `frontend/` and `backend/`. The original snapshot is reference material; it still depends on Sites hosting and ChatGPT authentication.

## Fastest deployment order

### 1. Upload the project to GitHub

Extract this ZIP. Create a new GitHub repository. Upload the contents of `LEARN_AI_Deployable` so `frontend`, `backend`, and `render.yaml` are at the repository root. Do not upload `.env`, `node_modules`, `.next`, or real passwords/API keys.

You can upload through GitHub's website, or use a terminal in this folder:

```sh
git init
git add .
git commit -m "Deploy LEARN AI prototype"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

Replace the example GitHub URL with your actual empty repository URL.

### 2. Deploy the frontend on Vercel first

1. Open https://vercel.com/new and import the GitHub repository.
2. Select **Next.js** and set **Root Directory** to `frontend`.
3. Install command: `npm ci`. Build command: `npm run build`. Keep the detected output directory.
4. Deploy. The build does not require a backend connection.
5. Copy the production address, for example `https://your-project.vercel.app`. Use the actual address in the next step. Login will be unavailable until step 4.
6. Use Node.js 22.x and keep Fluid Compute enabled. The API proxy declares a 300-second maximum duration, for slower AI requests.

### 3. Deploy the database and backend on Render

**Blueprint option (recommended):**

1. Open https://dashboard.render.com, choose **New → Blueprint**, and connect the same GitHub repository.
2. Render reads `render.yaml` and creates `learn-ai-db` plus `learn-ai-backend` using free plans.
3. Supply these requested environment values:

| Variable | Value |
|---|---|
| `FRONTEND_URL` | Your actual Vercel production origin, e.g. `https://your-project.vercel.app`; no `/learner` or `/login` suffix |
| `BOOTSTRAP_ADMIN_EMAIL` | The email you want to use for your administrator login |
| `BOOTSTRAP_ADMIN_PASSWORD` | A unique password of at least 12 characters |
| `BOOTSTRAP_LEARNER_EMAIL` | The reviewer login email you will provide to UBL |
| `BOOTSTRAP_LEARNER_PASSWORD` | A different unique password of at least 12 characters |

4. Wait for the backend deployment. Startup creates the PostgreSQL tables and those accounts. Existing accounts are preserved on restarts; changing a bootstrap password variable does not reset an existing password.
5. Copy the backend address, for example `https://learn-ai-backend-xxxx.onrender.com`.
6. Open `https://YOUR_BACKEND.onrender.com/health`. A ready database returns `{"status":"ok"}`.
7. If you have a provider key, add `GEMINI_API_KEY` to the Render backend environment. Set `AI_PROVIDER=gemini`, `GEMINI_MODEL=gemini-2.5-flash` and `GEMINI_EMBEDDING_MODEL=gemini-embedding-2`. These are backend secrets; never put them in a `NEXT_PUBLIC_` variable.

**Manual Render option:**

Create a PostgreSQL database, then a Node Web Service from the same repository. Use:

| Setting | Value |
|---|---|
| Root Directory | `backend` |
| Build Command | `npm ci --include=dev && npm run typecheck` |
| Start Command | `npm start` |
| Health Check Path | `/health` |
| `DATABASE_URL` | The database's internal PostgreSQL connection URL when hosted in the same Render region |
| `NODE_ENV` | `production` |
| `NODE_VERSION` | `22.22.0` |

Add the account and `FRONTEND_URL` variables from the table above. The backend binds to `0.0.0.0` and uses Render's `PORT` value.

### 4. Connect Vercel to Render

1. In Vercel, open **Project → Settings → Environment Variables**.
2. Set the server-only variable `BACKEND_URL` to the actual Render backend origin, e.g. `https://learn-ai-backend-xxxx.onrender.com`.
3. Apply it to Production and redeploy the frontend. Environment changes require a new deployment.
4. Open the production frontend `/login` and use the administrator account.
5. Open `/admin`. The **People** tab can create more reviewer or manager accounts. Managers can see organization reports; learners see their own learning. Do not share the administrator password with the panel.

### 5. Verify before sharing

- Sign in as the learner and start the prepared phishing journey.
- Make a choice, refresh, and confirm the saved learning history.
- Try `/admin` as the learner: management data must be denied.
- Sign in as the administrator: inspect actual reports and publish a tested journey from Content to department `All`.
- Sign in as the learner again: confirm that the shared journey appears.
- If AI is connected, test a fresh unrelated document before demonstrating the unknown-input challenge.
- Test the production URL in a private/incognito browser using only the reviewer credentials. If Vercel Deployment Protection is enabled for that deployment, configure access so external reviewers can reach it.

Send UBL the **Vercel frontend link**, reviewer email and reviewer password. They do not need a ChatGPT account. Keep a separate manager account if the panel needs reporting access.

## Free-hosting limits and readiness

Render free web services sleep after 15 minutes without traffic and can take time to wake. Open the application and backend health URL before a scheduled demonstration. Free Render PostgreSQL expires after 30 days; upgrade or export/migrate data before expiration. Hosting/API availability is subject to provider limits, and AI usage can incur charges.

Without an AI key: prepared English missions, document extraction/preview, saved mastery, review dates, shared library, roles and reporting are available. Arbitrary-topic/document generation, public-URL retrieval, Urdu generation and semantic interpretation of spoken decisions require the configured Gemini service. No provider key is bundled.

The updated export includes DOCX/OCR and private keyword search without an API key. Gemini generation, text conversation, semantic retrieval and rubric assessment are implemented but require a Gemini key and live testing. Generated images and realtime audio require a separate optional provider connection. Email opt-in and delivery logic are included; verified sender credentials and a server-side schedule must be configured separately. The private vector index is bounded for a pilot. Corporate SSO remains pending. Generated video, push reminders and password-reset email were deliberately excluded.

Read AI_API_KEY_SETUP.md before entering credentials. Browser microphone features require support, permissions and HTTPS.

## Troubleshooting

| Symptom | Check |
|---|---|
| `Set BACKEND_URL...` | Add `BACKEND_URL` in Vercel and redeploy. |
| Backend waking up/unavailable | Open backend `/health`, wait, and retry. Check Render deployment logs. |
| Invalid request origin | `FRONTEND_URL` must exactly match the production Vercel origin. Preview deployment origins are deliberately not accepted. |
| Login incorrect after changing env password | Bootstrap variables do not reset an existing account. Use the originally configured password or create a new administrator-controlled reviewer account. |
| Backend won't start | Check `DATABASE_URL`, database availability, both bootstrap admin values and password length. |
| New document won't generate | Extraction is separate from generation. Configure an AI key and provider billing, then test. |
| No content in learner library | Publish a tested current journey to `All` or the learner's exact department. |
| Missing old Site data | This export starts with a new PostgreSQL database. Existing Sites learner records are not copied. |

## Local development (Windows PowerShell)

Install Node.js 22.x and use PostgreSQL locally, or start the included database with Docker Desktop:

```powershell
docker compose up -d
```

First terminal:

```powershell
cd backend
Copy-Item .env.example .env
# Edit .env: set your own account emails/passwords; keep FRONTEND_URL=http://localhost:3000.
npm ci
npm run dev
```

Second terminal:

```powershell
cd frontend
Copy-Item .env.example .env.local
npm ci
npm run dev
```

Open http://localhost:3000/login. The backend runs on http://localhost:10000. PostgreSQL stores the learning state; no learning data is stored on Render's temporary filesystem.

## Official hosting references

- https://vercel.com/docs/monorepos
- https://vercel.com/docs/functions/configuring-functions/duration
- https://render.com/docs/deploy-node-express-app
- https://render.com/docs/blueprint-spec
- https://render.com/docs/free
- https://render.com/docs/node-version
