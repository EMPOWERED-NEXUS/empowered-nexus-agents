# Nexus Passport Bridge Readiness

Phase A6 MVP for **empowered-nexus-agents** — prepares validated EduBox evidence for future verified learning proof in the Nexus Passport ecosystem.

**Important:** Phase A6 is **readiness only**. No live Passport connection. No real credentials, certificates, badges, or entitlements are created.

## Purpose

Nexus Passport is the identity, verification, certificate, badge, entitlement, audit trail, and learning proof layer. This bridge:

1. Assesses what aggregate EduBox evidence could support future Passport proof
2. Lists missing requirements before real sync
3. Defines privacy boundaries for proof payloads
4. Recommends next actions for operators and programme staff
5. Previews proof categories without minting anything

## EduBox → Agents → Passport ecosystem flow

```text
┌─────────────┐   evidence-package.json   ┌─────────────────────────┐
│   EduBox    │ ────────────────────────► │ empowered-nexus-agents  │
│  (offline)  │   paste / upload          │  validate + agent MVPs  │
└─────────────┘                           └───────────┬─────────────┘
                                                      │
                    Phase A6 readiness preview ───────┤
                    (no live connection)              │
                                                      ▼
                              ┌───────────────────────────────────┐
                              │ Nexus Passport (future)           │
                              │ proof · certs · badges · audit    │
                              └───────────────────────────────────┘
                                      ▲
                                      │ future signed bridge
                              ┌───────┴────────┐
                              │ Nexus Learn OS │
                              │ (online LMS)   │
                              └────────────────┘
```

| Layer | Role in A6 |
|-------|------------|
| **EduBox Device** | Exports aggregate evidence — offline content, quiz totals, sync flags |
| **Empowered Nexus Agents** | Validates evidence; generates Passport bridge readiness (this phase) |
| **Nexus Learn OS** | Future online LMS — not connected in A6 |
| **Nexus Passport** | Future proof layer — readiness preview only |

## Future proof categories

| Category | Readiness signal from evidence |
|----------|-------------------------------|
| Student learning proof | Aggregate quiz attempts |
| Lesson completion proof | Lesson progress completed/total |
| Quiz attempt proof | Attempt count and average score |
| Course participation proof | Published course count |
| Teacher activity proof | Quiz sessions recorded flag |
| School deployment proof | Content + device initialized |
| Device usage proof | Sync log count, device label |
| Resource rights proof | Rights metadata, pending review |
| Certificate readiness proof | Courses + quiz activity |
| Badge readiness proof | Quiz milestone signals |

All categories show **partial**, **missing**, or **setup** — never live proof.

## Certificate readiness

- Evaluates whether aggregate course and quiz data could template a future certificate
- **Create certificate draft** is disabled — no certificates issued in A6

## Badge readiness

- Evaluates quiz activity for future milestone badges
- **Create learning badge draft** is disabled — no badges minted in A6

## Entitlement readiness

- Uses resource-rights metadata and pending review counts
- Subscription checks require future Passport commerce bridge

## School / device verification readiness

- Content loaded, device initialized, course counts
- **Verify school/device record** is disabled — no live verification in A6

## Passport readiness modes

| Mode | ID | Focus |
|------|-----|-------|
| Student Passport | `student_passport` | Learning proof |
| Teacher Passport | `teacher_passport` | Activity proof without PII |
| School Passport | `school_passport` | Institutional verification |
| NGO Impact Passport | `ngo_impact_passport` | Programme attestation |
| Device Deployment Passport | `device_deployment_passport` | Fleet / QA deployment |
| Subscription & entitlement | `subscription_entitlement` | Resource rights and entitlements |

## Privacy boundaries

- Aggregate evidence only — no individual learner records
- No passwords, tokens, emails, API keys, secrets, raw media
- No real credentials created in browser
- Admin-approved backend required for live Passport sync (future)
- Forbidden fields stripped during A1 validation before readiness runs

## Forbidden data

Same guardrails as Phases A1–A5. Never ingested: `password`, `email`, `token`, `secret`, `api_key`, `private_learner_records`, `service_credentials`, etc.

## Manual test steps

1. `npm run dev` → `/edubox-evidence`
2. **Load sample package** → **Validate package**
3. Scroll to **Nexus Passport Bridge Readiness**
4. Confirm setup-state banner: real Passport **NOT connected**
5. Switch modes — intro and section emphasis change
6. Review 10 future proof categories with level badges
7. Review missing requirements and privacy boundaries
8. **Copy Passport readiness plan** / **Download .txt**
9. Confirm all Send/Create/Verify buttons are disabled
10. Minimal package → missing levels and expanded required fields list

## Future live Passport integration plan

| Phase | Work |
|-------|------|
| B1 | Secure Passport API bridge (server-side only) |
| B2 | Redacted proof payload schema and admin approval |
| B3 | Certificate and badge draft workflows (server minting) |
| B4 | School/device verification with institutional binding |
| B5 | Entitlement and subscription checks |
| B6 | Learner consent and identity binding (no browser secrets) |

## Implementation files

- `src/lib/passportBridgeReadiness.ts` — generator, modes, proof categories, text export
- `src/lib/passportBridgeReadiness.test.ts` — unit tests
- `src/routes/edubox-evidence.tsx` — UI section and export panel

## Tests

```bash
npm run test
npx vitest run src/lib/passportBridgeReadiness.test.ts
```
