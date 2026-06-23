# EduBox Evidence Package Receiver

Phase A1 MVP for **empowered-nexus-agents** — a safe, browser-local receiver for EduBox agent evidence packages.

## Purpose

EduBox devices export aggregate operational evidence from `/agent-bridge/evidence-package.json`. This receiver lets Super Admins and authorized testers:

1. Paste or upload a JSON package
2. Validate shape and strip forbidden fields
3. Preview package summary and run multiple agent workflows
4. Copy or download plain-text exports (setup-state)

No packages are persisted. No AI providers are called from the browser.

## Complete EmpowerEd Nexus ecosystem

Phase A6 adds Passport bridge **readiness only** — not a live Passport connection.

```text
┌──────────────────┐
│  EduBox Device   │  Offline micro-cloud: courses, lessons, quizzes, sync logs
│  (offline layer) │
└────────┬─────────┘
         │ evidence-package.json (manual paste/upload)
         ▼
┌──────────────────────────┐
│  Empowered Nexus Agents  │  Intelligence layer: validate, report, recommend,
│  (this app)              │  plan, ops guidance, Passport readiness preview
└────────┬─────────────────┘
         │ future secure bridges (setup-state today)
         ├──────────────────────┐
         ▼                      ▼
┌──────────────────┐   ┌──────────────────┐
│  Nexus Learn OS  │   │  Nexus Passport  │
│  (online LMS)    │   │  (proof layer)   │
└──────────────────┘   └──────────────────┘
   School management      Identity, verification,
   online handoff         certificates, badges,
                          entitlements, audit trail
```

| Layer | Role | A6 status |
|-------|------|-----------|
| **EduBox Device** | Offline content delivery and local evidence export | Active — source of packages |
| **Empowered Nexus Agents** | Validate evidence; run agent MVPs; Passport readiness | Active — Phases A1–A6 |
| **Nexus Learn OS** | Online learning and school management | Not connected — setup-state send |
| **Nexus Passport** | Learning proof, credentials, entitlements | **Readiness preview only** — no live sync |

## Supported agents (Phases A1–A6)

| Agent | Phase | Output | Doc |
|-------|-------|--------|-----|
| **Evidence Agent** | A2 | Impact report | `docs/evidence-agent-report-generator.md` |
| **LessonCraft Agent** | A3 | Content recommendations | `docs/lessoncraft-recommendations.md` |
| **Teacher Support Agent** | A4 | Classroom action plan | `docs/teacher-support-action-plan.md` |
| **Sync Operations Agent** | A5 | Device health and sync ops | `docs/sync-operations-device-health.md` |
| **Nexus Passport Bridge** | A6 | Proof readiness preview | `docs/nexus-passport-bridge-readiness.md` |
| **ExamShield Agent** | Future | Assessment integrity | — |

All live send buttons (Passport, Learn OS, AI agents, certificate/badge minting) remain **disabled**.

## Architecture: EduBox → Agents

```text
EduBox JSON → validate → Evidence · LessonCraft · Teacher Support · Sync Ops · Passport readiness
```

## Accepted package shape

Required: `package_type` = `edubox_agent_evidence_package`, `generated_at` (ISO string).

See EduBox Phase 12 (`agent_package_utils.py`) for full schema.

## Privacy boundaries

Aggregate counts and sample titles only. Forbidden fields stripped with warnings. React text rendering only.

## Manual test steps

1. `npm run dev` → `/edubox-evidence`
2. **Load sample package** → **Validate**
3. Walk all agent sections including **Nexus Passport Bridge Readiness**
4. Confirm setup-state banners and disabled send/create buttons
5. Export copy/download for each agent panel

## Future integration plan

| Phase | Work |
|-------|------|
| A1–A6 | Receiver and agent MVPs — **done** |
| B1 | Secure backend ingest; admin auth |
| B2 | Nexus Passport live bridge (server-side) |
| B3 | Nexus Learn OS signed sync |
| B4 | ExamShield assessment integrity |
| B5 | Server-side AI (optional; never browser keys) |

## Implementation files

- `src/lib/eduboxEvidence.ts` — validator (A1)
- `src/lib/evidenceReport.ts` — Evidence Agent (A2)
- `src/lib/lessonCraftRecommendations.ts` — LessonCraft (A3)
- `src/lib/teacherSupportPlan.ts` — Teacher Support (A4)
- `src/lib/syncOperationsPlan.ts` — Sync Operations (A5)
- `src/lib/passportBridgeReadiness.ts` — Passport Bridge (A6)
- `src/routes/edubox-evidence.tsx` — receiver UI
- `src/lib/*.test.ts` — unit tests
- `docs/*.md` — documentation
