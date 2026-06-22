# LessonCraft Recommendations

Phase A3 MVP for **empowered-nexus-agents** — deterministic teaching and content recommendations from validated EduBox evidence packages.

## Purpose

After Phase A1 validates an EduBox package and Phase A2 generates an Evidence Agent report, LessonCraft Recommendations:

1. Analyse aggregate content, quiz, and resource-rights signals
2. Suggest follow-up lessons, teacher actions, quiz improvements, and offline packages
3. Warn when resources are online-only or pending rights review
4. Export plain text for teachers, WhatsApp, email, or future PDF

No AI calls. No full lesson content export from EduBox — only counts and sample titles.

## How LessonCraft uses EduBox evidence

```text
EduBox JSON  →  validateEduboxEvidencePackage()  →  generateLessonCraftRecommendations(mode)
                                                          ↓
                                              LessonCraft Recommendations (UI)
                                                          ↓
                                    buildLessonCraftRecommendationsText() → copy / .txt
```

| Signal from package | Recommendation type |
|---------------------|---------------------|
| Low aggregate quiz scores | Weak-topic follow-up lessons, remediation |
| Sample lesson/course titles | Discussion prompts, capstone ideas |
| Resource rights counts | Online-only warnings, rights review actions |
| Offline vs online resources | Offline package bundling suggestions |
| Zero quiz attempts | First-session teacher actions, quiz setup |

## Recommendation modes

| Mode | ID | Focus |
|------|-----|-------|
| Teacher support | `teacher_support` | Classroom actions, discussion prompts |
| Content improvement | `content_improvement` | Lesson gaps, package quality |
| Remediation plan | `remediation_plan` | Revision activities, weak topics |
| Launch operations | `launch_operations` | Rollout checklist, dry-runs |
| NGO impact follow-up | `ngo_impact` | Programme reporting follow-ups |

Modes adjust intro copy and emphasis; underlying evidence stays the same.

## Recommendation sections

Each output includes:

- **Recommended Follow-Up Lessons** (or Weak Topic Follow-Up in remediation mode)
- **Teacher Actions**
- **Content Package Improvements**
- **Quiz Improvement Ideas**
- **Resource Rights Actions**
- **Offline Learning Package Suggestions**
- **Safety Notes**

## Privacy boundaries

- Input must pass A1 validation first
- Aggregate data only — no individual learner records
- Forbidden fields stripped before generation
- Sample titles are non-PII course/lesson names from EduBox export
- React text rendering only; no HTML injection
- No browser calls to AI providers

## Forbidden data

Same guardrails as A1/A2. If pasted JSON contains forbidden keys, they are removed with a warning before recommendations are generated. Tests verify polluted input never appears in export text.

## Manual test steps

1. `npm run dev` → `/edubox-evidence`
2. **Load sample package** → **Validate package**
3. Scroll to **LessonCraft Recommendations** — six sections populated
4. Switch modes (Teacher support → Remediation → Launch operations) — title and items change
5. **Copy recommendations** → verify plain text headings in clipboard
6. **Download recommendations .txt** → `lessoncraft-recommendations-{mode}-{date}.txt`
7. Confirm disabled: Send to LessonCraft Agent, Generate with AI Agent
8. Validate minimal package `{ package_type, generated_at }` → fallback recommendations appear
9. Paste package with `"email": "x@y.z"` → warning; recommendations exclude email

## Future live AI integration plan

| Phase | Work |
|-------|------|
| A4 | Secure backend ingest; admin auth |
| A5 | Server-side AI lesson drafting from recommendations (no browser API keys) |
| A6 | Push approved packages to LessonCraft Agent workspace |
| A7 | Teacher Support Agent — action tracking from recommended next steps |
| A8 | Sync Ops + ExamShield cross-signals |

**Generate with AI Agent** and **Send to LessonCraft Agent** remain disabled until secure backend patterns exist.

## Implementation files

- `src/lib/lessonCraftRecommendations.ts` — generator, modes, text export
- `src/lib/lessonCraftRecommendations.test.ts` — unit tests
- `src/routes/edubox-evidence.tsx` — UI section and export panel

## Tests

```bash
npm run test
npx vitest run src/lib/lessonCraftRecommendations.test.ts
```

Covers: valid generation, forbidden exclusion, text headings, all modes, minimal package fallbacks, invalid input guard.
