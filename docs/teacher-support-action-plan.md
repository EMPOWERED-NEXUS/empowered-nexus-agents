# Teacher Support Action Plan

Phase A4 MVP for **empowered-nexus-agents** — converts validated EduBox evidence and LessonCraft recommendations into a practical classroom action plan for teachers, facilitators, and programme staff.

## Purpose

After Phases A1–A3 validate evidence, generate impact reports, and produce LessonCraft recommendations, the Teacher Support Action Plan:

1. Prioritises what teachers should focus on this week
2. Provides today's action and a 7-day plan
3. Suggests discussion prompts, revision activities, and quiz review strategies
4. Guides resource usage and sync/reporting next steps
5. Exports plain text for WhatsApp, email, print, or future PDF

Deterministic. No live AI coaching. No individual learner records.

## EduBox evidence to teacher support flow

```text
EduBox JSON
    → validateEduboxEvidencePackage()
    → generateLessonCraftRecommendations(teacher_support)
    → generateTeacherSupportPlan(mode)
              ↓
    Teacher Support Action Plan (UI)
              ↓
    buildTeacherSupportPlanText() → copy / .txt
```

| Input signal | Plan output |
|--------------|-------------|
| Zero quiz attempts | First-session actions, quiz onboarding |
| Low aggregate scores | Revision priority, re-teach blocks |
| Pending resource rights | Resource usage warnings |
| Sync not configured | Reporting and sync next steps |
| LessonCraft teacher actions | Woven into priorities and discussion |

## Teacher support modes

| Mode | ID | Audience |
|------|-----|----------|
| Classroom teacher | `classroom_teacher` | Day-to-day offline teaching |
| Orphanage facilitator | `orphanage_facilitator` | Residential care, shared devices |
| School administrator | `school_administrator` | Staff oversight and rollout |
| NGO program officer | `ngo_program_officer` | Programme monitoring and M&E |
| Training center instructor | `training_center_instructor` | Workshop delivery |

Modes adjust intro copy, today's action, and 7-day plan wording. Evidence data is unchanged.

## Plan sections

**UI preview (8 cards):**

- Priority focus (classroom priority summary)
- Today's action
- This week's plan (7-day)
- Discussion prompts
- Revision activities
- Quiz review actions
- Resource usage actions
- Sync/reporting next step

**Full text export also includes:**

- Offline classroom routine
- Learner support strategy (aggregate only)
- Teacher reflection questions
- Safety notes

## Privacy boundaries

- Requires A1-validated package; forbidden fields stripped first
- Aggregate quiz and progress data only — no named learners
- Learner support strategy explicitly avoids individual scores or rankings
- No passwords, emails, tokens, secrets, or raw media
- Browser-local generation — no AI provider calls

## Forbidden data

Same guardrails as A1–A3. Polluted JSON is sanitized before plan generation. Tests verify forbidden content does not appear in exports.

## Manual test steps

1. `npm run dev` → `/edubox-evidence`
2. **Load sample package** → **Validate package**
3. Scroll to **Teacher Support Action Plan** — eight sections populated
4. Switch modes (Classroom teacher → Orphanage facilitator → NGO program officer)
5. **Copy teacher plan** → verify headings in clipboard
6. **Download teacher plan .txt** → `teacher-support-plan-{mode}-{date}.txt`
7. Confirm disabled: Send to Teacher Support Agent, Generate live coaching
8. Minimal package `{ package_type, generated_at }` → fallback plan items appear
9. Change LessonCraft mode — Teacher plan updates when re-validated (uses current LessonCraft output)

## Future live AI integration plan

| Phase | Work |
|-------|------|
| A5 | Secure backend ingest; admin auth; audit log |
| A6 | Server-side live coaching (never from browser API keys) |
| A7 | Sync Operations Agent — device handoff automation |
| A8 | ExamShield — assessment integrity signals |
| A9 | Push approved plans to Teacher Support Agent workspace |

**Generate live coaching** and **Send to Teacher Support Agent** remain disabled until secure backend patterns exist.

## Implementation files

- `src/lib/teacherSupportPlan.ts` — generator, modes, text export
- `src/lib/teacherSupportPlan.test.ts` — unit tests
- `src/routes/edubox-evidence.tsx` — UI section and export panel

## Tests

```bash
npm run test
npx vitest run src/lib/teacherSupportPlan.test.ts
```
