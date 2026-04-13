# plan.md — 10 Million Mistakes (Updated)

## 1. Objectives
- **Status:** Phase 1 (Core POC) ✅ complete; Phase 2 (MVP) ✅ complete.
- Deliver a stable, delightful **core loop** that users can repeat daily:
  - onboard → get daily AI challenge → log reflection → celebrate → review vault/progress/mantras.
- Ensure the app is **safe, resilient, and manageable**:
  - AI challenge generation uses structured JSON with fallbacks.
  - Data persists reliably in MongoDB.
  - Role-based access protects the **Admin Dashboard**.
- Prepare for **Phase 3 growth features** (pattern insights, stories feed, buddy matching, video content, mentorship) without destabilizing the MVP.

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
- Only minor issues noted (e.g., small UI copy mismatch).

**Success criteria (Phase 2) results**
- ✅ Daily challenge always available (AI or fallback).
- ✅ Reflections persist; counters/streaks/levels update.
- ✅ Admin can manage mantras and inspect users/reflections.

---

### Phase 3 — Enhanced Features: Patterns, Stories, Buddies, Video, Mentorship (Next) 🔜
**Goal:** Expand from solo habit + journaling into deeper pattern visibility + community connection + content library, while preserving safety and moderation.

#### 3.1 Pattern Discovery Dashboard
**User stories**
1. As a user, I want weekly insights so I can see repeating walls (fear of judgment, avoidance, etc.).
2. As a user, I want escalating “Pattern Breaker” suggestions that respect my stage.

**Build**
- Start with rules-based tagging from reflections + challenges:
  - Tag obstacles (judgment, rejection, perfectionism, avoidance) from user input and/or lightweight AI classification.
- Weekly summary endpoint + UI panel:
  - “Top 2 patterns this week”
  - “Domains with most attempts”
  - “Suggested next micro-challenge”
- Timeline visualization:
  - Mistakes/day vs streak vs “growth moments” (based on lesson sentiment/keywords).

**Testing**
- Seed reflections → verify weekly insights match the data.

#### 3.2 Mistake Stories Feed (Optional Anonymity + Moderation)
**User stories**
1. As a user, I can share a mistake story (optionally anonymous) to inspire others.
2. As an admin, I can moderate and approve/deny posts.

**Build**
- New model: `StoryPost` sourced from a reflection.
- Workflow:
  - User chooses “Share to Stories” after reflection.
  - Post enters moderation queue.
  - Admin approves → visible in feed.
- Community safety:
  - Reporting + basic rate limits.

#### 3.3 Mistake Buddies + Mentorship Hub (MVP)
**User stories**
1. As a user, I can request a buddy match by stage/domain.
2. As a user, I can request a mentor or offer mentorship.
3. As an admin, I can manually connect pairs and manage safety.

**Build**
- Matching logic:
  - Stage + domain + activity level.
  - Manual override/curation in admin.
- Connection objects:
  - `BuddyRequest`, `MentorshipRequest`, `Connection`.
- Messaging (deferred option):
  - Start with request/accept + “check-in prompts”; add chat later.

#### 3.4 Video Content Library + Moderation
**User stories**
1. As a user, I can browse and watch videos curated for my stage/domains.
2. As an admin, I can add/edit/remove video entries.
3. As an admin, I can moderate user-posted videos (future scope).

**Build**
- MVP: admin-managed library of external video links (YouTube/Vimeo) + metadata.
- Phase 3.5+: user uploads + moderation pipeline.

**Phase 3 success criteria**
- Weekly insights generate reliably and feel aligned with user reflections.
- Stories feed is safe: nothing appears without moderation.
- Buddy/mentor matching works with clear consent and admin oversight.
- Video library is manageable via admin dashboard.

---

### Phase 4 — Hardening + Scale + Safety Controls (Future)
**Focus areas**
- Production readiness:
  - Rate limiting, logging, monitoring, backups.
  - Improved AI safety/moderation and deterministic outputs.
- Admin power tools:
  - User search, flags, analytics (DAU, AI success rate, reflections/day).
- Data export:
  - User export of reflections/vault.
- Optional: password reset, email verification.

---

## 3. Next Actions
1. **Phase 3 kickoff decision**: confirm which Phase 3 module to build first (recommended order: Patterns → Stories → Buddies/Mentorship → Video).
2. Add new DB models + endpoints for the first Phase 3 module.
3. Implement admin moderation queues for any user-generated/community content.
4. Run E2E tests after each Phase 3 module ships.

---

## 4. Success Criteria (Overall)
- Core loop delight remains stable and repeatable daily.
- AI features remain safe, structured, and resilient to outages.
- Admin can manage content and moderate/inspect activity without engineering help.
- Phase 3 adds community + insights **without** increasing user harm risk.
- Each phase ends with a complete E2E test run and bug-fix pass before moving on.
