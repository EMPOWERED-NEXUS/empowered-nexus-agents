# Sync Operations and Device Health

Phase A5 MVP for **empowered-nexus-agents** — deterministic operational guidance from validated EduBox evidence for device operators, school admins, Nexus support, QA, fleet managers, and NGO deployment staff.

## Purpose

The Sync Operations Agent reads aggregate EduBox evidence and produces:

1. Device and sync readiness summaries
2. Content package and quiz/progress sync health
3. Resource rights risk warnings
4. Launch and support checklists
5. Recommended next sync actions
6. Nexus Passport proof readiness preview (setup-state only — no connection)

No AI. No secrets. No Passport integration in this phase.

## EduBox to Agents operations flow

```text
EduBox (offline device)
    → /agent-bridge/evidence-package.json
    → validateEduboxEvidencePackage()
    → generateSyncOperationsPlan(mode)
              ↓
    Sync Operations and Device Health (UI)
              ↓
    buildSyncOperationsPlanText() → copy / .txt

Future:
    → Nexus Learn OS (online LMS)
    → Nexus Passport (identity, proof, credentials) — Phase B
```

| Layer | Role |
|-------|------|
| EduBox | Offline device, content, sync logs, aggregate evidence |
| empowered-nexus-agents | Validates evidence, generates ops plans |
| Nexus Learn OS | Future online handoff target (setup-state send) |
| Nexus Passport | Future proof/credential layer (readiness preview only) |

## Device health checks

Derived from `device_health_summary` and readiness flags:

- Device initialized and server responding
- Device label and non-secret ID prefix
- Recent sync log count and failure count
- Mode-specific QA or fleet checks

## Sync readiness checks

- Sync endpoint configured (boolean flag only — no URL secrets)
- Sync secret configured flag (value never exported)
- Aggregate `sync_log_count`
- Recommended next sync actions from package and ops logic

## Resource rights checks

- Pending rights review count
- Online-only vs offline-allowed resource counts
- YouTube online-only policy flag
- Alerts when offline classroom use should be blocked

## Nexus Passport readiness relationship

**Not connected in Phase A5.** The UI and text export preview eight future capabilities:

| Capability | Status |
|------------|--------|
| Verified student learning proof | Setup-state |
| Teacher activity proof | Setup-state |
| School deployment proof | Setup-state |
| Device usage proof | Setup-state |
| Certificate readiness | Setup-state |
| Entitlement and subscription checks | Setup-state |
| Audit log readiness | Setup-state |
| Badge or credential generation | Setup-state |

Evidence aggregate signals (quiz counts, content loaded, device init) inform readiness notes only.

## Operations modes

| Mode | ID | Audience |
|------|-----|----------|
| Device operator | `device_operator` | On-site LAN and sync |
| School admin | `school_admin` | School rollout |
| EmpowerEd Nexus support | `nexus_support` | Remote troubleshooting |
| Manufacturer QA | `manufacturer_qa` | Pre-shipment QA |
| Rental fleet manager | `rental_fleet_manager` | Fleet returns/redeploy |
| NGO deployment officer | `ngo_deployment_officer` | Field programme ops |

## Privacy boundaries

- A1 validation required; forbidden fields stripped
- Sync secrets, API keys, tokens, credentials never displayed
- Aggregate quiz/progress only — no individual learner records
- Browser-local deterministic generation
- Passport send disabled — preview only

## Forbidden data

Same guardrails as Phases A1–A4. Never ingested: passwords, emails, tokens, secrets, API keys, raw media, private learner records, service credentials.

## Manual test steps

1. `npm run dev` → `/edubox-evidence`
2. **Load sample package** → **Validate package**
3. Scroll to **Sync Operations and Device Health**
4. Verify status badges on device, sync, and resource sections
5. Review **Nexus Passport Readiness** — all items show Setup-state
6. Switch operations modes — support checklist wording changes
7. **Copy operations plan** / **Download .txt**
8. Confirm disabled: Send to Sync Operations Agent, Nexus Passport, Nexus Learn OS
9. Minimal package → fallback ops items and alert statuses where expected

## Future live AI and Passport integration plan

| Phase | Work |
|-------|------|
| A6 | Secure backend ingest; admin auth |
| B1 | Nexus Passport bridge — redacted proof payloads |
| B2 | Nexus Learn OS signed sync handoff |
| B3 | Server-side AI ops analysis (never browser API keys) |
| A7 | ExamShield assessment integrity signals |

## Implementation files

- `src/lib/syncOperationsPlan.ts` — generator, modes, Passport preview, text export
- `src/lib/syncOperationsPlan.test.ts` — unit tests
- `src/routes/edubox-evidence.tsx` — UI section and export panel

## Tests

```bash
npm run test
npx vitest run src/lib/syncOperationsPlan.test.ts
```
