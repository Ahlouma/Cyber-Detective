# Cyber Detective

A bilingual (English / Arabic, RTL) cybersecurity awareness investigation: 20 scenario-based cases in 4 stages, server-verified scoring, and a live global leaderboard. Plain HTML, CSS and ES-module JavaScript on GitHub Pages, with Supabase (Postgres, anonymous Auth, Edge Function) as the backend.

**Status:** the code is complete, but it has not been run against a live Supabase project (no credentials were available). Until you complete the setup below, the site shows a "Backend not configured" notice on every page that needs the database. Follow the steps and the checklist at the end to verify it.

## 1. Create the Supabase project
1. Sign in at supabase.com, choose **New project**, and wait for it to finish provisioning.
2. **Project Settings -> API**: note the **Project URL** and the **publishable (anon) key**. Never copy the `service_role` / secret key into the frontend.

## 2. Create tables, security rules and questions
1. **SQL Editor -> New query**: paste and run `supabase/schema.sql`.
2. Run `supabase/seed.sql` (20 questions, 80 options, answer keys, categories).
3. `answer_keys`, `attempts` and `attempt_answers` have Row Level Security enabled with **no** policies, so the browser cannot read them. Only the Edge Function (service role) can.

To edit questions, change `tools/questions_data.py`, run `python3 tools/build_seed.py`, and re-run `supabase/seed.sql`.

## 3. Enable anonymous sign-ins
**Authentication -> Providers (or Sign In / Providers) -> Anonymous Sign-Ins -> Enable.** No email or password is used. Anonymous sign-ins are rate limited per IP by Supabase; you can adjust this under **Authentication -> Rate Limits**. Consider enabling CAPTCHA (Authentication -> Attack Protection) for a public launch.

## 4. Deploy the Edge Function
```bash
npm i -g supabase            # or: brew install supabase/tap/supabase
supabase login
supabase link --project-ref <your-project-ref>
supabase functions deploy submit-quiz
```
`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically into Edge Functions. JWT verification stays on. Optionally lock CORS to your site: `supabase secrets set ALLOWED_ORIGIN=https://<user>.github.io`.

## 5. Configure the frontend
Edit `js/config.js`:
```js
SUPABASE_URL: "https://<ref>.supabase.co",
SUPABASE_PUBLISHABLE_KEY: "<publishable / anon key>",
```
The publishable key is meant to be public; data access is protected by RLS and the Edge Function. Serving over GitHub Pages needs no build step.

## 6. Publish on GitHub Pages
1. Push this folder to a GitHub repository.
2. **Settings -> Pages -> Build and deployment**: Source "Deploy from a branch", branch `main`, folder `/ (root)`.
3. Open `https://<user>.github.io/<repo>/`. All paths are relative, so the project subdirectory works.

For local testing use any static server (ES modules do not run from `file://`): `python3 -m http.server 8000`, then open http://localhost:8000.

## How scoring and anti-cheat work
- `start` creates a server-side attempt with its own start time. The browser never sends a score or a time.
- `answer` stores each choice and returns the correct option and the explanation only after the choice is recorded. One answer per question per attempt.
- `finish` requires all 20 answers, computes the score and duration on the server, rejects attempts faster than 2 seconds per question on average, and expires attempts after 2 hours.
- The leaderboard keeps one row per user. `submit_best` replaces it only if the new score is higher, or equal with a shorter time, in a single atomic statement. Rank order: score desc, time asc, earlier timestamp.
- Limits: 15 attempt starts per user per hour. Per-IP limiting is delegated to Supabase Auth's anonymous sign-in limits.

## Known limitations
- Refreshing during a quiz starts a new attempt (the old one is marked abandoned).
- Anonymous users who never register a nickname stay in `auth.users`; clear them periodically if desired.
- Fonts load from Google Fonts. To self-host, put font files in `assets/fonts/` and adjust `@font-face`.

## Verification checklist (do this after setup)
1. Register a nickname; try the same one in another browser (should be rejected, case-insensitive).
2. Complete a run; check the report, rank and the leaderboard row.
3. Retake with a worse score: the leaderboard row must not change. Retake with a better one: it must update.
4. Open the leaderboard in two browsers; finish a run in one and watch the other refresh.
5. Switch to Arabic on every page and confirm RTL layout, no horizontal scroll at 360 px width.
6. In the browser network tab confirm no response before submitting an answer contains the correct option.
