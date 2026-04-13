# plan.md — 10 Million Mistakes

## 1. Objectives
- Prove the core workflow works end-to-end: **generate a safe, personalized daily micro-challenge via OpenAI** from (stage + domains + recent reflections) and persist it.
- Ship an MVP where users can: onboard → get daily challenge → log reflection → see mistake counter/streaks/vault/mantras.
- Provide an **admin dashboard** to manage content, users, moderation, and manual mentorship connections.
- Incrementally test each phase; do not proceed past core POC until reliable.

---

## 2. Implementation Steps

### Phase 1 — Core POC (Isolation): AI Daily Challenge + Safety + Persistence
**User stories**
1. As a user, I want a daily micro-challenge tailored to my stage and chosen domain so it targets my real avoidance.
2. As a user, I want the challenge to feel encouraging (not shaming) so I’m willing to try.
3. As a user, I want challenges to be safe and appropriate so I can trust the app.
4. As a builder, I want deterministic metadata (domain, difficulty, “avoidance theme”) so the UI and analytics can rely on it.
5. As a builder, I want fallbacks when OpenAI fails so the home screen never breaks.

**Steps**
- Websearch: best practices for **OpenAI structured outputs**, retries/timeouts, and content-safety moderation patterns.
- Write a standalone **Python POC script**:
  - Input: stage (1–4), selected domain, optional “avoidance theme”, last N reflections summary.
  - Output (strict JSON): `{title, challenge, why_this, difficulty(1-5), domain, stage, safety_flags[], coaching_line}`.
  - Validate JSON schema; enforce length limits; prompt for warm, non-preachy tone.
  - Add retries + exponential backoff; handle rate limits.
  - Add safety gate: OpenAI moderation (or rules) + local denylist; if flagged → regenerate or use fallback.
- Minimal FastAPI spike:
  - Endpoint: `POST /poc/generate-challenge` returning the structured JSON.
  - MongoDB write/read for the generated challenge.
- Fix until stable: 50+ sample generations across stages/domains; confirm schema validity and tone.

**Success criteria (Phase 1)**
- ≥95% generations return valid schema on first try; 100% via retry/fallback.
- No obviously unsafe/medical/legal/harassment content in sampled outputs.
- Latency acceptable for MVP (<5s typical; fallback instant).

---

### Phase 2 — V1 App Development (MVP, no auth initially)
**User stories**
1. As a user, I want a 5-minute onboarding (welcome → quiz → domains) so I can start immediately.
2. As a user, I want one daily challenge on the home screen so I always know what to do next.
3. As a user, I want to quickly log a reflection (4 questions) via typing or voice-to-text so journaling is frictionless.
4. As a user, I want a celebration + mistake counter so failure feels rewarding.
5. As a user, I want a Victory Vault of lessons so I can revisit proof of growth.
6. As an admin, I want to add/edit mantras/challenge templates so I can evolve content without redeploys.

**Backend (FastAPI + MongoDB)**
- Data models (MVP):
  - `UserProfile` (anonymous id), `OnboardingResult` (stage, domains), `DailyChallenge`, `ReflectionEntry`, `Mantra`, `BadgeProgress`, `AdminUser` (phase 4 auth).
- Core endpoints:
  - Onboarding: `POST/GET /onboarding` (quiz answers → stage + themes + domains).
  - Daily challenge: `POST /challenge/today` (create if missing), `GET /challenge/today`.
  - Journal: `POST /reflection`, `GET /reflection?range=`.
  - Vault: `GET /vault` (derived from reflections: learned lines).
  - Mantras: `GET /mantras/today`, `POST/PUT/DELETE /admin/mantras`.
  - Admin content: `POST/PUT/DELETE /admin/challenge-seeds` (starter fallback library).
- AI service module (from Phase 1) reused with: caching, retry, safety, fallback templates.

**Frontend (React)**
- Screens:
  - Welcome + onboarding quiz + domain select.
  - Home: today’s challenge card + CTA to log reflection.
  - Reflection form (4 Qs) + confetti + updated counters.
  - Progress: streak, level badge, lifetime mistakes.
  - Victory Vault list.
  - Mantra carousel (save favorites).
  - Admin (basic): content CRUD + user list (anonymous) + challenge/reflection inspection.
- UX requirements:
  - Offline-ish: if AI fails, show fallback challenge.
  - Clear “Try / Skipped / Tried & failed” capture.

**Seed content creation (initial set)**
- Create: quiz questions + scoring rubric; 30 mantras; 25 encouragement lines per stage; fallback challenge library per (stage × domain) to cover outages.

**Testing (end of Phase 2)**
- One full E2E pass: onboarding → challenge → reflection → counters → vault → admin edits → regenerate.

**Success criteria (Phase 2)**
- New user can complete the core loop in <3 minutes after onboarding.
- Daily challenge always available (AI or fallback).
- Reflections persist; counters/streaks update correctly.
- Admin can change mantras and see impact immediately.

---

### Phase 3 — Enhanced Features (still minimal auth)
**User stories**
1. As a user, I want weekly pattern insights so I can see repeating walls.
2. As a user, I want “Pattern Breaker” suggestions so I know how to escalate safely.
3. As a user, I want a Mistake Stories feed (optional anonymity) so I feel less alone.
4. As a user, I want Mistake Buddy matching so I can practice courage with support.
5. As an admin, I want moderation tools so the community stays safe.

**Build**
- Pattern Discovery:
  - Start rules-based + lightweight AI summarization of the week.
  - Timeline view: reflections/day vs streak vs “growth spikes”.
- Stories feed:
  - Post from reflection (user chooses to share; anonymity toggle).
  - Moderation queue in admin.
- Buddy matching (MVP):
  - Match by stage + selected domain + activity level.
  - Simple request/accept; basic chat can be deferred (use “message request” objects first).
- Video content (admin-uploaded first):
  - Admin uploads links/metadata; user can browse/watch.
  - Moderation framework for future user uploads.

**Testing (end of Phase 3)**
- E2E: generate insights from seeded reflections; post story → moderation approve → visible; buddy request flow.

**Success criteria (Phase 3)**
- Weekly insights generated reliably and feel aligned with reflections.
- Moderation queue prevents unapproved content from appearing.

---

### Phase 4 — Authentication + Roles + Admin Power Tools
**User stories**
1. As a user, I want email/password login so my journal and progress are private.
2. As an admin, I want role-based access so only admins can moderate/manage content.
3. As an admin, I want to inspect a user timeline (stage/domains/challenges/reflections) to provide support.
4. As an admin, I want to manually connect mentor/mentee pairs so I can curate safety and fit.
5. As a user, I want to export my data so I feel ownership of my growth.

**Build**
- Add JWT auth (email/password), password reset, admin role.
- Migrate from anonymous profile → authenticated account (merge flow).
- Admin dashboard upgrades:
  - User search, flags, activity metrics.
  - Manual mentorship matching + connection notes.
  - App health analytics (DAU, reflections/day, AI success rate, top domains/stages).

**Testing (end of Phase 4)**
- E2E: signup/login → core loop → admin moderation + user inspection → export.

**Success criteria (Phase 4)**
- Data isolation correct; admin-only routes protected.
- No regressions in the core daily loop.

---

## 3. Next Actions
1. Run Phase 1 websearch + implement the Python POC script for OpenAI structured challenge generation.
2. Lock the **challenge JSON schema** + safety/fallback rules.
3. Implement minimal FastAPI `generate-challenge` endpoint + Mongo persistence.
4. After Phase 1 passes, start Phase 2 V1 build (React + FastAPI) around the proven AI service.
5. Seed starter content (quiz/mantras/fallback challenges) and do Phase 2 E2E test.

---

## 4. Success Criteria (Overall)
- Core loop delight: onboarding → daily challenge → reflection → celebration is stable and repeatable daily.
- AI features are safe, structured, and resilient to outages.
- Admin can manage content and moderate/inspect user activity without engineering help.
- Each phase ends with at least one complete E2E test run and bug-fix pass before moving on.