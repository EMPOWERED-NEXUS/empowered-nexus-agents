import { describe, expect, it } from "vitest";
import {
  PASSPORT_BRIDGE_MODES,
  PASSPORT_PROOF_CATEGORIES,
  buildPassportBridgeReadinessText,
  generatePassportBridgeReadiness,
  isPassportSyncSetupStateOnly,
  passportReadinessExcludesForbiddenContent,
  tryGeneratePassportBridgeReadiness,
} from "./passportBridgeReadiness";
import {
  PACKAGE_TYPE,
  SAMPLE_EVIDENCE_PACKAGE,
  validateEduboxEvidencePackage,
} from "./eduboxEvidence";

describe("generatePassportBridgeReadiness", () => {
  it("generates valid Passport readiness from sample package", () => {
    const readiness = generatePassportBridgeReadiness(SAMPLE_EVIDENCE_PACKAGE, "student_passport");
    expect(readiness.title).toContain("Student Readiness");
    expect(readiness.passportBridgeStatus.level).toBe("setup");
    expect(readiness.proofCategories.length).toBe(PASSPORT_PROOF_CATEGORIES.length);
    expect(readiness.requiredMissingFields.length).toBeGreaterThan(0);
    expect(readiness.privacyConstraints.length).toBeGreaterThan(0);
    expect(readiness.recommendedPassportActions.length).toBeGreaterThan(0);
  });

  it("excludes forbidden content from readiness text", () => {
    const polluted = {
      ...SAMPLE_EVIDENCE_PACKAGE,
      email: "student@school.org",
      token: "secret-token-value",
    };
    const validation = validateEduboxEvidencePackage(polluted);
    expect(validation.ok).toBe(true);
    if (!validation.ok) return;
    const readiness = generatePassportBridgeReadiness(validation.package);
    const text = buildPassportBridgeReadinessText(readiness);
    expect(text).not.toContain("student@school.org");
    expect(text).not.toContain("secret-token-value");
    expect(passportReadinessExcludesForbiddenContent(text)).toBe(true);
  });

  it("text export contains expected headings", () => {
    const readiness = generatePassportBridgeReadiness(SAMPLE_EVIDENCE_PACKAGE);
    const text = buildPassportBridgeReadinessText(readiness);
    expect(text).toContain("NOT connected");
    expect(text).toContain("Passport Bridge Status");
    expect(text).toContain("Learning Proof Readiness");
    expect(text).toContain("Certificate Readiness");
    expect(text).toContain("Badge Readiness");
    expect(text).toContain("Entitlement Readiness");
    expect(text).toContain("School Verification Readiness");
    expect(text).toContain("Device Audit Readiness");
    expect(text).toContain("Future Proof Categories");
    expect(text).toContain("Missing Requirements Before Real Passport Sync");
    expect(text).toContain("Privacy Boundaries");
    expect(text).toContain("Recommended Next Actions");
    expect(text).toContain("Safety Notes");
  });

  it("all modes return safe output", () => {
    for (const mode of PASSPORT_BRIDGE_MODES) {
      const readiness = generatePassportBridgeReadiness(SAMPLE_EVIDENCE_PACKAGE, mode.id);
      expect(readiness.mode).toBe(mode.id);
      expect(readiness.learningProofReadiness.items.length).toBeGreaterThan(0);
      const text = buildPassportBridgeReadinessText(readiness);
      expect(passportReadinessExcludesForbiddenContent(text)).toBe(true);
    }
  });

  it("returns safe fallbacks for empty or partial package", () => {
    const minimal = validateEduboxEvidencePackage({
      package_type: PACKAGE_TYPE,
      generated_at: "2026-01-01T00:00:00Z",
    });
    expect(minimal.ok).toBe(true);
    if (!minimal.ok) return;
    const readiness = generatePassportBridgeReadiness(minimal.package, "school_passport");
    expect(readiness.learningProofReadiness.level).toBe("missing");
    expect(readiness.requiredMissingFields.length).toBeGreaterThan(3);
    expect(readiness.recommendedPassportActions.length).toBeGreaterThan(0);
  });

  it("Passport sync remains setup-state only", () => {
    const readiness = generatePassportBridgeReadiness(SAMPLE_EVIDENCE_PACKAGE);
    expect(isPassportSyncSetupStateOnly(readiness)).toBe(true);
    expect(readiness.passportBridgeStatus.summary).toContain("NOT connected");
    const text = buildPassportBridgeReadinessText(readiness);
    expect(text).toContain("NOT connected");
  });

  it("does not generate from invalid validation result", () => {
    const invalid = validateEduboxEvidencePackage({ package_type: "wrong", generated_at: "2026-01-01T00:00:00Z" });
    expect(tryGeneratePassportBridgeReadiness(invalid)).toBeNull();
  });
});
