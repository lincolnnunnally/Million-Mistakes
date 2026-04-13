# plan.md — 10 Million Mistakes (Updated)

## 1. Objectives
- **Status:** Phase 1 (Core POC) ✅ complete; Phase 2 (MVP) ✅ complete; Phase 3 (Enhanced Features) ✅ complete.
- Deliver a stable, delightful **core loop** that users can repeat daily:
  - onboard → get daily AI challenge → log reflection → celebrate → review vault/progress/mantras.
- Expand the app into a **movement + community** while keeping it safe:
  - Pattern visibility that helps users see recurring walls.
  - Community sharing and connection (Stories + Buddies + Mentorship).
  - Curated video library for learning.
  - **Moderation-first** approach for anything public.
- Ensure the app remains **safe, resilient, and manageable**:
  - AI challenge generation uses structured JSON with fallbacks.
  - Data persists reliably in MongoDB.
  - Role-based access protects the **Admin Dashboard**.
  - Admin can manage/manipulate content and community (moderation + connections) without engineering help.
- Transition focus from “building features” to **hardening, scale, and operating the app** (Phase 4).

---

## 2. Implementation Steps

### Phase 1 — Core POC (Isolation): AI Daily Challenge + Safety + Persistence ✅ COMPLETED
**User stories**
1. As a user, I want a daily micro-challenge tailored to my stage and chosen domain so it targets my real avoidance.
2. As a user, I want the challenge to feel encouraging (not shaming) so I’m willing to try.
3. As a user, I want challenges to be safe and appropriate so I can trust the app.
4. As a builder, I want deterministic metadata (domain, difficulty) so the UI and analytics can rely on it.
5. As a builder, I want fallbacks when OpenAI fails so the home screen never breaks.

**What was built**
- POC script + tests validating:
  - Structured JSON generation for multiple stage/domain combinations.
  - Fallback system reliability.
  - MongoDB persistence.

**Success criteria (Phase 1) results**
- ✅ 100% pass on POC test suite (AI generation, multi-combo, fallback, Mongo persistence).

---

### Phase 2 — MVP Build: Auth + Core App + Admin Dashboard ✅ COMPLETED
> Note: The original plan said “no auth initially,” but the shipped MVP includes **JWT email/password auth** and an **admin role**, since admin dashboard access requires it.

**User stories (implemented)**
1. As a user, I can register/login so my journal and progress are private.
2. As a user, I can complete 5-minute onboarding (welcome → quiz → domains).
3. As a user, I receive 1 daily micro-challenge (AI-generated with fallback).
4. As a user, I can log a 4-question reflection and receive celebration feedback (confetti + encouragement).
5. As a user, I can view my **Victory Vault** (lessons saved from reflections).
6. As a user, I can browse **Mantras** and save/unsave favorites.
7. As a user, I can see **Progress**: streak, levels/badges, lifetime mistakes counter.
8. As an admin, I can view app stats, users, reflections; manage mantras (CRUD).

**Backend (FastAPI + MongoDB) — delivered**
- Auth:
  - `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
  - JWT token; admin role gating on `/api/admin/*`.
- Onboarding:
  - `GET /api/onboarding/quiz` (8 questions, stage descriptions, domains)
  - `POST /api/onboarding/complete` (stage scoring + domain selection)
- Daily challenges:
  - `GET /api/challenge/today` (create-if-missing)
  - `POST /api/challenge/swap`
  - AI-driven generation with prewritten fallback library.
- Reflection journal:
  - `POST /api/reflections`, `GET /api/reflections`
- Victory Vault:
  - `GET /api/vault`
- Progress:
  - `GET /api/progress` (mistakes, streak, level, breakdown)
- Mantras:
  - `GET /api/mantras`, `POST /api/mantras/{id}/save`, `GET /api/mantras/saved`
- Admin dashboard:
  - `GET /api/admin/stats`
  - `GET /api/admin/users`, `GET /api/admin/users/{id}`
  - `GET/POST/PUT/DELETE /api/admin/mantras`
  - `GET /api/admin/reflections`

**Frontend (React + shadcn/ui + Tailwind) — delivered**
- Pages:
  - Welcome, Register, Login
  - Onboarding (quiz + domain selection + stage result)
  - Home (daily challenge + swap + quick stats + mantra teaser)
  - Reflection flow (4 questions) + celebration screen
  - Victory Vault
  - Mantras (discover + saved; save/unsave)
  - Progress (lifetime counter, streak, level progression)
  - Admin Dashboard (overview, users, mantras CRUD, reflection monitoring)
- UX:
  - Confetti + count-up animations with reduced-motion consideration.
  - Mobile-friendly bottom navigation.

**Seed content (implemented)**
- 8-question stage quiz + scoring.
- ~30 mantras seeded.
- Fallback challenge library for each (stage × domain) plus generic fallback.
- Celebration/encouragement lines.

**Testing (end of Phase 2) results**
- ✅ E2E test run completed.
- Backend pass rate: **96%**.
- Frontend pass rate: **95%**.
- Only minor issues noted.

**Success criteria (Phase 2) results**
- ✅ Daily challenge always available (AI or fallback).
- ✅ Reflections persist; counters/streaks/levels update.
- ✅ Admin can manage mantras and inspect users/reflections.

---

### Phase 3 — Enhanced Features: Patterns, Stories, Buddies, Video, Mentorship ✅ COMPLETED
**Goal:** Expand from solo habit + journaling into deeper pattern visibility + community connection + content library, while preserving safety and moderation.

#### 3.1 Pattern Discovery Dashboard ✅
**User stories (implemented)**
1. As a user, I want insights so I can see repeating walls (fear of judgment, avoidance, etc.).
2. As a user, I want a “Pattern Breaker” suggestion that helps me take a next step.

**Build (delivered)**
- Rules-based pattern tagging across reflections (8 obstacle themes):
  - fear_of_judgment, perfectionism, avoidance, fear_of_rejection, self_doubt, people_pleasing, comfort_zone, overthinking.
- Insights returned by `GET /api/patterns`:
  - Top patterns list (counts + percentage)
  - Courage rate (pushed-through + tried-and-failed)
  - Trend analysis (improving/steady/starting)
  - Pattern-breaker suggestion + micro-action
  - Optional AI weekly summary (OpenAI) when enough data exists
- Frontend `PatternsPage`:
  - Empty state (“needs data”)
  - Insight cards + recurring walls + pattern breaker

**Testing results**
- ✅ Phase 3 test run: Backend **98%**, Frontend **95%**.

#### 3.2 Mistake Stories Feed (Optional Anonymity + Moderation) ✅
**User stories (implemented)**
1. As a user, I can share a mistake story (optionally anonymous) to inspire others.
2. As an admin, I can moderate and approve/deny posts.
3. As a user, I can like stories in the community feed.

**Build (delivered)**
- Stories workflow:
  - Share from **Victory Vault** via “Share” button (dialog includes title + anonymous toggle)
  - Story is created as `pending` and requires admin approval
- Backend endpoints:
  - `POST /api/stories` (creates pending story from reflection)
  - `GET /api/stories` (approved stories feed)
  - `GET /api/stories/mine` (user’s submissions + statuses)
  - `POST /api/stories/{id}/like` (like/unlike)
- Admin moderation:
  - `GET /api/admin/stories`
  - `PUT /api/admin/stories/{id}/moderate` (approve/reject)
- Frontend `StoriesPage`:
  - Community Feed tab + My Stories tab

**Safety notes**
- ✅ Nothing appears publicly without admin approval.

#### 3.3 Mistake Buddies + Mentorship Hub ✅
**User stories (implemented)**
1. As a user, I can request a buddy match by stage/domain.
2. As a user, I can create mentor/mentee offers and browse offers.
3. As an admin, I can manually connect pairs for mentorship.

**Build (delivered)**
- Buddy matching:
  - `POST /api/buddies/request` (creates request; attempts auto-match)
  - `GET /api/buddies/request/status`, `DELETE /api/buddies/request`
  - `GET /api/buddies/connections`
  - Connection objects stored as `connections` (type: buddy/mentorship)
- Mentorship offers:
  - `POST /api/mentorship/offer`
  - `GET /api/mentorship/offers` (browse)
  - `GET /api/mentorship/mine`, `DELETE /api/mentorship/offer/{id}`
- Admin community management:
  - `GET /api/admin/buddy-requests`
  - `GET /api/admin/connections`
  - `GET /api/admin/mentor-offers`
  - `POST /api/admin/mentor-match` (manual match)
- Frontend `BuddiesPage`:
  - Tabs: Connections, Find a Buddy, Mentorship

**Notes / scope decisions**
- Messaging/chat is intentionally deferred; current model focuses on matching + admin oversight.

#### 3.4 Video Content Library ✅
**User stories (implemented)**
1. As a user, I can browse and watch videos curated for my stage/domains.
2. As an admin, I can add/edit/remove video entries.

**Build (delivered)**
- User video library:
  - `GET /api/videos` (filters: domain, stage)
  - `GET /api/videos/{id}` (increments views)
  - Frontend `VideosPage` with:
    - Domain filter
    - Embedded playback (YouTube/Vimeo parsing)
    - Empty state when none exist
- Admin video management:
  - `GET /api/admin/videos`
  - `POST /api/admin/videos`
  - `PUT /api/admin/videos/{id}`
  - `DELETE /api/admin/videos/{id}`

#### Admin Dashboard Enhancements ✅
- Upgraded to **7 tabs**:
  - Overview, Users, Mantras, Reflections, Stories, Videos, Community
- Extended stats endpoint:
  - `GET /api/admin/stats/extended` (stories pending/approved, connections, buddy requests, videos, mentor offers)

**Phase 3 success criteria — achieved**
- ✅ Pattern insights generate reliably and feel aligned with reflections.
- ✅ Stories feed is moderation-first.
- ✅ Buddy/mentor matching works with admin oversight.
- ✅ Video library is manageable via admin dashboard.

---

### Phase 4 — Hardening + Scale + Safety Controls (Next)
**Focus areas**
- Production readiness:
  - Rate limiting + abuse prevention (especially stories/likes/buddy requests)
  - Logging, monitoring, alerting
  - Backups and data retention policies
  - Environment secrets hardening (JWT secret, API keys)
- AI safety and reliability:
  - Optional content filtering for user-generated text before story submission
  - Prompt/versioning for AI generation and summaries
  - Track AI success rate + fallback rate
- Admin power tools:
  - Search/filter users, stories, reflections, videos
  - Flags and reporting workflow (future)
  - Analytics dashboard (DAU, reflections/day, retention cohorts)
- Account lifecycle:
  - Password reset, email verification (optional)
  - GDPR-style export/delete (data portability)
- Community evolution (optional future):
  - In-app messaging (with moderation tooling)
  - Group circles / events / seasonal journeys
  - User-uploaded video pipeline + moderation (if desired)

---

## 3. Next Actions
Now that Phases 1–3 are complete, recommended next actions are operational + hardening:
1. **Decide Phase 4 priorities** (security + safety + scaling) and target launch environment.
2. Add **rate limiting** and **basic abuse prevention** for community endpoints.
3. Add **monitoring/analytics** (errors, latency, AI usage/fallback, daily active users).
4. Add **admin search + filtering** to make moderation and user support faster.
5. Run a final **full regression E2E** before production launch.

---

## 4. Success Criteria (Overall)
- Core loop delight remains stable and repeatable daily.
- AI features remain safe, structured, and resilient to outages.
- Admin can manage content, moderate public posts, and inspect activity without engineering help.
- Community features add connection **without** increasing harm risk.
- Each phase ends with a complete E2E test run and bug-fix pass before moving on.
