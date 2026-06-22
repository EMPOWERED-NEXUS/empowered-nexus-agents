# Evidence Agent Report Generator

Phase A2 MVP for **empowered-nexus-agents** — converts a validated EduBox evidence package into a clear, professional, human-readable impact report.

## Purpose

After Phase A1 validates and sanitizes an EduBox package, the Evidence Agent Report Generator:

1. Builds a structured report object (executive summary, activity, coverage, quiz, rights, readiness, actions, safety)
2. Adapts copy lightly by report mode (school, NGO, internal, community)
3. Exports plain text for email, WhatsApp, or future PDF — **deterministic, no AI**

Reports are generated **only** from `SanitizedEvidencePackage` values produced by `validateEduboxEvidencePackage()`.

## Architecture

```text
EduBox JSON  →  validateEduboxEvidencePackage()  →  generateEvidenceReport(mode)
                                                          ↓
                                              Evidence Agent Report Preview (UI)
                                                          ↓
                                              buildEvidenceAgentReportText() → copy / .txt
```

| Component | File |
|-----------|------|
| Validator (A1) | `src/lib/eduboxEvidence.ts` |
| Report generator (A2) | `src/lib/evidenceReport.ts` |
| Receiver UI | `src/routes/edubox-evidence.tsx` |

## Report modes

| Mode | ID | Audience | Copy emphasis |
|------|-----|----------|---------------|
| School report | `school` | Head teachers, departments | Classroom impact, teaching readiness |
| NGO / donor report | `ngo` | Partners, funders | Deployment reach, evidence of use |
| Internal operations | `internal` | IT, programme ops | Sync, device health, follow-ups |
| Parent / community | `community` | Families, community | Plain language, no jargon |

Modes adjust headings and introductory paragraphs only — underlying data is the same aggregate evidence.

## Report sections

Each generated report includes:

- **Title** and generated date
- **Executive Summary** (or Overview for community mode)
- **Learning Activity**
- **Content Coverage**
- **Quiz and Progress**
- **Resource Rights**
- **Device Readiness**
- **Recommended Next Actions**
- **Safety Notes**
- **Footer** (deterministic MVP disclaimer)

## Privacy boundaries

- Input must pass A1 validation and forbidden-field stripping first
- Report uses aggregate counts and sample titles only
- No individual learner records, passwords, tokens, emails, raw media, or service credentials
- React renders report text as plain nodes — no HTML injection
- No browser calls to AI providers; **Generate with AI Agent** remains disabled (setup-state)

## Forbidden data

If forbidden keys appear in pasted JSON, A1 removes them before A2 runs. Report text is scanned in tests to ensure no forbidden JSON-key patterns appear in output.

Forbidden fields (non-exhaustive): `password`, `email`, `token`, `secret`, `api_key`, `raw_media`, `private_learner_records`, `service_credentials`.

## Manual test steps

1. `npm run dev` → open `/edubox-evidence`
2. **Load sample package** → **Validate package**
3. Scroll to **Evidence Agent Report Preview**
4. Switch report mode (School → NGO → Internal → Community) — headings and intro copy change
5. **Copy report** → paste into Notepad; verify section headings and no HTML
6. **Download .txt report** → file named `evidence-agent-report-{mode}-{date}.txt`
7. Confirm disabled: PDF export, Send to Nexus Learn OS, Generate with AI Agent
8. Paste invalid JSON → no report section appears until validation succeeds
9. Paste package with `"email": "x@y.z"` → warning, report excludes email

## Agent mapping (post-A2)

| Agent | Uses from report / package |
|-------|---------------------------|
| Evidence Agent | Full impact report (this generator) |
| LessonCraft Agent | Content coverage, learning gaps |
| Teacher Support Agent | Recommended next actions |
| Sync Operations Agent | Device readiness section |
| ExamShield Agent | Quiz / assessment readiness (future) |

## Future live AI integration plan

| Phase | Work |
|-------|------|
| A3 | Secure backend ingest; admin auth; audit log |
| A4 | Optional AI-enhanced narrative (server-side only, no browser API keys) |
| A5 | PDF export via server template |
| A6 | Push approved reports to Nexus Learn OS |
| A7 | ExamShield aggregate assessment signals |

Live **Generate with AI Agent** stays disabled until a secure backend pattern exists.

## Tests

```bash
npm run test
# or
npx vitest run src/lib/evidenceReport.test.ts
```

Covers: valid generation, mode titles, forbidden field exclusion, text headings, invalid package guard, fallback actions.
