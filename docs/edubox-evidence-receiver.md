# EduBox Evidence Package Receiver

Phase A1 MVP for **empowered-nexus-agents** — a safe, browser-local receiver for EduBox agent evidence packages.

## Purpose

EduBox devices export aggregate operational evidence from `/agent-bridge/evidence-package.json`. This receiver lets Super Admins and authorized testers:

1. Paste or upload a JSON package
2. Validate shape and strip forbidden fields
3. Preview package summary, evidence report, and agent recommendations
4. Copy or download a plain-text report (setup-state)

No packages are persisted. No AI providers are called from the browser.

## Architecture: EduBox → Agents

```text
┌─────────────────────┐     evidence-package.json      ┌──────────────────────────┐
│  EduBox (offline)   │  ───────────────────────────►  │  empowered-nexus-agents  │
│  Django device      │     paste / upload (manual)    │  Evidence Receiver MVP   │
└─────────────────────┘                                └────────────┬─────────────┘
                                                                    │
                    Future: admin-approved secure ingest ───────────┘
                    Evidence · LessonCraft · Teacher Support ·
                    Sync Ops · ExamShield agents
```

| Layer          | Role                                                                               |
| -------------- | ---------------------------------------------------------------------------------- |
| EduBox         | Generates `edubox_agent_evidence_package` JSON with aggregate counts and summaries |
| Agents app     | Validates untrusted input, previews reports, maps to agent workflows               |
| Future backend | Signed upload, admin approval, agent orchestration (no browser AI keys)            |

## Accepted package shape

Required:

- `package_type`: `"edubox_agent_evidence_package"`
- `generated_at`: ISO timestamp string

Expected fields (optional with safe defaults):

| Field                                                                                 | Type                                      |
| ------------------------------------------------------------------------------------- | ----------------------------------------- |
| `device_label`                                                                        | string                                    |
| `course_count`, `lesson_count`, `resource_count`                                      | number                                    |
| `offline_allowed_resource_count`, `online_only_resource_count`                        | number                                    |
| `quiz_attempt_count`, `sync_log_count`                                                | number                                    |
| `average_score_percent`                                                               | number or null                            |
| `readiness_flags`                                                                     | object (boolean / number / string values) |
| `content_summary`, `quiz_summary`, `resource_rights_summary`, `device_health_summary` | object                                    |
| `recommended_agent_actions`                                                           | string array                              |
| `privacy_note`                                                                        | string                                    |

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
4. Click **Load sample package** → validation succeeds, previews appear
5. Click **Copy evidence summary** → plain text in clipboard
6. Click **Download report .txt** → file downloads
7. Paste real EduBox export → counts and summaries match device
8. Paste JSON with `"email": "test@example.com"` → warning, field excluded from preview
9. Paste `{ "package_type": "wrong" }` → validation error
10. Confirm disabled buttons: PDF export, Send to Nexus Learn OS, Send to EduBox Agents

## Future live integration plan

| Phase | Work                                                               |
| ----- | ------------------------------------------------------------------ |
| A2    | Evidence Agent deterministic report generator (see `docs/evidence-agent-report-generator.md`) |
| A3    | Secure backend endpoint; package size limits; admin auth           |
| A4    | Server-side AI narrative (optional); PDF export                    |
| A5    | LessonCraft / Teacher Support — gap analysis from summaries        |
| A6    | Sync Ops — scheduled handoff to Nexus Learn OS when online         |
| A7    | ExamShield — aggregate quiz integrity signals                      |

Live send buttons in the UI remain disabled until backend ingestion and admin approval exist.

## Implementation files

- `src/lib/eduboxEvidence.ts` — validator, sanitizer, sample package
- `src/lib/evidenceReport.ts` — Evidence Agent report generator (Phase A2)
- `src/routes/edubox-evidence.tsx` — receiver page
- `src/lib/eduboxEvidence.test.ts` — validation unit tests
- `src/lib/evidenceReport.test.ts` — report generator tests
- `docs/evidence-agent-report-generator.md` — A2 documentation
