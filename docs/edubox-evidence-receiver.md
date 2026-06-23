# EduBox Evidence Package Receiver

Phase A1 MVP for **empowered-nexus-agents** — a safe, browser-local receiver for EduBox agent evidence packages.

## Purpose

EduBox devices export aggregate operational evidence from `/agent-bridge/evidence-package.json`. This receiver lets Super Admins and authorized testers:

1. Paste or upload a JSON package
2. Validate shape and strip forbidden fields
3. Preview package summary and run multiple agent workflows
4. Copy or download plain-text exports (setup-state)

No packages are persisted. No AI providers are called from the browser.

## Supported agents (Phases A1–A5)

After validation, the receiver drives these deterministic agent previews:

| Agent | Phase | Output | Doc |
|-------|-------|--------|-----|
| **Evidence Agent** | A2 | Impact report (school, NGO, internal, community modes) | `docs/evidence-agent-report-generator.md` |
| **LessonCraft Agent** | A3 | Content and teaching recommendations | `docs/lessoncraft-recommendations.md` |
| **Teacher Support Agent** | A4 | Classroom action plan (7-day, prompts, quiz review) | `docs/teacher-support-action-plan.md` |
| **Sync Operations Agent** | A5 | Device health, sync readiness, launch checklist | `docs/sync-operations-device-health.md` |
| **ExamShield Agent** | Future | Assessment integrity (not yet implemented) | — |
| **Nexus Passport Bridge** | Future | Learning proof and credentials (readiness preview only in A5) | `docs/sync-operations-device-health.md` |

All live send buttons (Nexus Learn OS, Passport, AI agents) remain **disabled** until secure backend integration exists.

## Architecture: EduBox → Agents

```text
┌─────────────────────┐     evidence-package.json      ┌──────────────────────────┐
│  EduBox (offline)   │  ───────────────────────────►  │  empowered-nexus-agents  │
│  Django device      │     paste / upload (manual)    │  Evidence Receiver       │
└─────────────────────┘                                └────────────┬─────────────┘
                                                                    │
         Evidence · LessonCraft · Teacher Support · Sync Ops ───────┤
         Future: Passport proof · Learn OS sync · ExamShield ───────┘
```

| Layer | Role |
|-------|------|
| EduBox | Generates `edubox_agent_evidence_package` JSON with aggregate counts and summaries |
| Agents app | Validates untrusted input, previews reports and plans, maps to agent workflows |
| Nexus Learn OS | Future online LMS handoff (setup-state) |
| Nexus Passport | Future identity and learning proof (readiness preview only) |
| Future backend | Signed upload, admin approval, agent orchestration (no browser AI keys) |

## Accepted package shape

Required:

- `package_type`: `"edubox_agent_evidence_package"`
- `generated_at`: ISO timestamp string

Expected fields (optional with safe defaults):

| Field | Type |
|-------|------|
| `device_label` | string |
| `course_count`, `lesson_count`, `resource_count` | number |
| `offline_allowed_resource_count`, `online_only_resource_count` | number |
| `quiz_attempt_count`, `sync_log_count` | number |
| `average_score_percent` | number or null |
| `readiness_flags` | object (boolean / number / string values) |
| `content_summary`, `quiz_summary`, `resource_rights_summary`, `device_health_summary` | object |
| `recommended_agent_actions` | string array |
| `privacy_note` | string |

Schema reference: `edubox-agent-evidence/0.1` (EduBox Phase 12 — `agent_package_utils.py`).

## Privacy boundaries

**Included (aggregate only):**

- Course/lesson/resource counts and sample titles
- Quiz attempt totals and averages
- Sync log counts and readiness flags
- Device label (non-secret preview label)

**Never ingested for preview (stripped + warning):**

- `password`, `passwords`, `raw_password`
- `secret`, `token`, `api_key`, `service_credentials`
- `email`, `emails`
- `raw_media`, `media_file`
- `private_learner_records`
- Additional EduBox guardrails: `username`, `full_name`, `device_token`, etc.

Packages are treated as **untrusted input**. Validation runs before any preview render. Text is rendered as React text nodes only (no `dangerouslySetInnerHTML`).

## Manual test steps

1. Start EduBox (optional): `http://127.0.0.1:8000/agent-bridge/evidence-package.json`
2. Start agents app: `npm run dev`
3. Open `/edubox-evidence` (nav: **Evidence Receiver**)
4. Click **Load sample package** → **Validate package**
5. Scroll through: Evidence report, LessonCraft, Teacher Support, Sync Operations sections
6. Test copy/download on each agent export panel
7. Paste JSON with forbidden field → warning, excluded from previews
8. Confirm all **Send to …** and **Generate with AI** buttons are disabled

## Future live integration plan

| Phase | Work |
|-------|------|
| A2 | Evidence Agent report — done |
| A3 | LessonCraft recommendations — done |
| A4 | Teacher Support action plan — done |
| A5 | Sync Operations and device health — done |
| A6 | Secure backend endpoint; admin auth |
| B1 | Nexus Passport bridge |
| B2 | Nexus Learn OS signed sync |
| B3 | ExamShield assessment integrity |
| B4 | Server-side AI (optional; never browser keys) |

## Implementation files

- `src/lib/eduboxEvidence.ts` — validator, sanitizer, sample package
- `src/lib/evidenceReport.ts` — Evidence Agent (A2)
- `src/lib/lessonCraftRecommendations.ts` — LessonCraft (A3)
- `src/lib/teacherSupportPlan.ts` — Teacher Support (A4)
- `src/lib/syncOperationsPlan.ts` — Sync Operations (A5)
- `src/routes/edubox-evidence.tsx` — receiver page
- `src/lib/*.test.ts` — unit tests
- `docs/*.md` — agent documentation
