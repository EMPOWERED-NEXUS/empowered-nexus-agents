import { describe, expect, it } from "vitest";
import {
  OPERATIONS_MODES,
  PASSPORT_BRIDGE_PREVIEW,
  buildSyncOperationsPlanText,
  generateSyncOperationsPlan,
  isPassportIntegrationSetupStateOnly,
  syncPlanExcludesForbiddenContent,
  tryGenerateSyncOperationsPlan,
} from "./syncOperationsPlan";
import {
  PACKAGE_TYPE,
  SAMPLE_EVIDENCE_PACKAGE,
  validateEduboxEvidencePackage,
} from "./eduboxEvidence";

describe("generateSyncOperationsPlan", () => {
  it("generates a valid sync operations plan from sample package", () => {
    const plan = generateSyncOperationsPlan(SAMPLE_EVIDENCE_PACKAGE, "device_operator");
    expect(plan.title).toContain("Device Operator");
    expect(plan.deviceStatus.items.length).toBeGreaterThan(0);
    expect(plan.syncStatus.items.length).toBeGreaterThan(0);
    expect(plan.launchReadiness.items.length).toBeGreaterThan(0);
    expect(plan.supportChecklist.items.length).toBeGreaterThan(0);
    expect(plan.passportBridgePreview.length).toBe(PASSPORT_BRIDGE_PREVIEW.length);
  });

  it("excludes forbidden content from plan text", () => {
    const polluted = {
      ...SAMPLE_EVIDENCE_PACKAGE,
      api_key: "sk-live-bad",
      service_credentials: { user: "admin" },
    };
    const validation = validateEduboxEvidencePackage(polluted);
    expect(validation.ok).toBe(true);
    if (!validation.ok) return;
    const plan = generateSyncOperationsPlan(validation.package);
    const text = buildSyncOperationsPlanText(plan);
    expect(text).not.toContain("sk-live-bad");
    expect(syncPlanExcludesForbiddenContent(text)).toBe(true);
  });

  it("text export contains expected section headings", () => {
    const plan = generateSyncOperationsPlan(SAMPLE_EVIDENCE_PACKAGE);
    const text = buildSyncOperationsPlanText(plan);
    expect(text).toContain("Device Status");
    expect(text).toContain("Sync Status");
    expect(text).toContain("Storage and Offline Readiness");
    expect(text).toContain("Content Package Readiness");
    expect(text).toContain("Quiz and Progress Sync Readiness");
    expect(text).toContain("Resource Rights Warnings");
    expect(text).toContain("Launch Readiness");
    expect(text).toContain("Support Checklist");
    expect(text).toContain("Recommended Next Sync Actions");
    expect(text).toContain("Nexus Passport Proof Readiness Notes");
    expect(text).toContain("Nexus Passport Bridge Preview");
    expect(text).toContain("Safety Notes");
  });

  it("all modes return safe output", () => {
    for (const mode of OPERATIONS_MODES) {
      const plan = generateSyncOperationsPlan(SAMPLE_EVIDENCE_PACKAGE, mode.id);
      expect(plan.mode).toBe(mode.id);
      expect(plan.supportChecklist.items.length).toBeGreaterThan(0);
      const text = buildSyncOperationsPlanText(plan);
      expect(syncPlanExcludesForbiddenContent(text)).toBe(true);
    }
  });

  it("returns safe fallbacks for empty or partial package", () => {
    const minimal = validateEduboxEvidencePackage({
      package_type: PACKAGE_TYPE,
      generated_at: "2026-01-01T00:00:00Z",
    });
    expect(minimal.ok).toBe(true);
    if (!minimal.ok) return;
    const plan = generateSyncOperationsPlan(minimal.package, "nexus_support");
    expect(plan.deviceStatus.items.length).toBeGreaterThan(0);
    expect(plan.recommendedNextSyncActions.items.length).toBeGreaterThan(0);
    expect(plan.contentPackageReadiness.status).toBe("alert");
  });

  it("Passport readiness is setup-state only", () => {
    const plan = generateSyncOperationsPlan(SAMPLE_EVIDENCE_PACKAGE);
    expect(isPassportIntegrationSetupStateOnly(plan)).toBe(true);
    expect(plan.passportBridgePreview.every((p) => p.status === "Setup-state")).toBe(true);
    const text = buildSyncOperationsPlanText(plan);
    expect(text).toContain("NOT connected");
  });

  it("does not generate from invalid validation result", () => {
    const invalid = validateEduboxEvidencePackage({ package_type: "wrong", generated_at: "2026-01-01T00:00:00Z" });
    expect(tryGenerateSyncOperationsPlan(invalid)).toBeNull();
  });
});
