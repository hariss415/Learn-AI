# Gemini setup for LEARN AI

This edition supports Gemini generation and hosted Gemini embeddings. No secret is included.

## Production: Render backend

1. Create your API key in Google AI Studio: https://aistudio.google.com/apikey
2. Open Render Dashboard → your backend service → Environment.
3. Add:

```dotenv
AI_PROVIDER=gemini
GEMINI_API_KEY=YOUR_ACTUAL_GEMINI_KEY
GEMINI_MODEL=gemini-2.5-flash
GEMINI_EMBEDDING_MODEL=gemini-embedding-2
```

4. Save and redeploy/restart the backend. Never commit the key or put it in a NEXT_PUBLIC_ variable.
5. Check model access and current quotas in Google AI Studio. Free usage is limited; availability varies by project/model. The application never auto-enables billing or changes your Google project.
6. Test a new unrelated topic or sample document through the learner portal. Then test text chat, assessment and Save to my sources → Search. A “key configured” display is not proof of a successful provider request.

Gemini handles topic/document generation, English/Urdu text conversation, rubric evaluation, interpretation of browser-transcribed decisions, managed public URL context and embeddings. URL retrieval must verify a successful exact-URL metadata entry; otherwise upload the document. All generated courses, evidence quotes and scores still pass server validation.

## Vercel frontend

Set BACKEND_URL to your actual Render origin and redeploy. On Render set FRONTEND_URL to the exact Vercel production origin. Vercel does not need the Gemini secret. Follow DEPLOY_FIRST.md for PostgreSQL and bootstrap account settings.

## Local Windows

Copy backend/.env.example to backend/.env and add the four Gemini values above. Configure PostgreSQL and bootstrap account passwords. Restart npm run dev in backend. frontend/.env.local uses BACKEND_URL=http://localhost:10000.

## Search and model changes

Embeddings are requested in groups of at most 20, with 768 dimensions, normalized and tagged with provider/model/dimension identity. The bounded pilot uses PostgreSQL persistence and exact cosine similarity. Existing keyword-only or different-model vectors are not mixed with the active model; re-save the source to create new embeddings. Old untagged OpenAI vectors fall back to keyword search. Limits: 10 sources, 150 chunks per source, 1,500 total chunks per account.

## Capabilities requiring other connections

Gemini text/embeddings do not activate generated images or realtime audio in this edition. Those controls stay disabled without the optional existing OpenAI image/audio connection. Browser speech synthesis/recognition and the original mission visuals remain available where supported. Email reminders require separate Resend sender credentials and a schedule. Corporate SSO remains pending. No video, push notification or password-reset email is added.

## Troubleshooting and privacy

- 429/quota error: wait and check your Google AI Studio model/project limits. The application also caps AI actions at six per five minutes per learner, with a ten-second minimum gap.
- Authorization/model error: check the key and model access. The tested request format targets the defaults above; arbitrary model overrides may differ.
- Invalid/incomplete generation or fabricated source quotation: the app rejects it without saving a learning result. Retry a clearer topic or shorter source.
- Use public or synthetic sample documents for the UBL demo. Google lists free-tier content as usable to improve products; do not send confidential employee or UBL records without an approved arrangement.
- No live provider call was tested without your key. Quotas, bilingual output quality and cloud deployment need validation in your account.

## Optional OpenAI fallback

The earlier text adapter remains available with AI_PROVIDER=openai and OPENAI_API_KEY. Do not substitute one provider key for another. With AI_PROVIDER=gemini, an optional OPENAI_API_KEY only supplies the existing image/realtime integrations.

Official references:
https://ai.google.dev/gemini-api/docs/pricing
https://ai.google.dev/gemini-api/docs/embeddings
https://ai.google.dev/api/generate-content
https://ai.google.dev/gemini-api/docs/generate-content/url-context
