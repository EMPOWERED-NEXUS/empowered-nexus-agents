import { describe, expect, it } from "vitest";
import {
  buildEvidenceAgentReportText,
  generateEvidenceReport,
  reportExcludesForbiddenContent,
  tryGenerateEvidenceReport,
} from "./evidenceReport";
import {
  PACKAGE_TYPE,
  SAMPLE_EVIDENCE_PACKAGE,
  validateEduboxEvidencePackage,
} from "./eduboxEvidence";

describe("generateEvidenceReport", () => {
  it("generates a valid report from a sanitized package", () => {
    const report = generateEvidenceReport(SAMPLE_EVIDENCE_PACKAGE, "school");
    expect(report.title).toBe("EduBox School Impact Report");
    expect(report.deviceLabel).toBe("EduBox Demo Device");
    expect(report.executiveSummary.paragraphs.length).toBeGreaterThan(0);
    expect(report.recommendedNextActions.length).toBeGreaterThan(0);
    expect(report.safetyNotes.length).toBeGreaterThan(0);
  });

  it("adjusts title by report mode", () => {
    const ngo = generateEvidenceReport(SAMPLE_EVIDENCE_PACKAGE, "ngo");
    const community = generateEvidenceReport(SAMPLE_EVIDENCE_PACKAGE, "community");
    expect(ngo.title).toContain("Deployment Evidence");
    expect(community.title).toContain("Community");
  });

  it("excludes forbidden content from report text", () => {
    const polluted = {
      ...SAMPLE_EVIDENCE_PACKAGE,
      email: "leak@example.com",
      private_learner_records: [{ name: "Student A" }],
    };
    const validation = validateEduboxEvidencePackage(polluted);
    expect(validation.ok).toBe(true);
    if (!validation.ok) return;
    const report = generateEvidenceReport(validation.package);
    const text = buildEvidenceAgentReportText(report);
    expect(text).not.toContain("leak@example.com");
    expect(text).not.toContain("Student A");
    expect(reportExcludesForbiddenContent(text)).toBe(true);
  });

  it("text export contains expected section headings", () => {
    const report = generateEvidenceReport(SAMPLE_EVIDENCE_PACKAGE, "school");
    const text = buildEvidenceAgentReportText(report);
    expect(text).toContain("Executive Summary");
    expect(text).toContain("Learning Activity");
    expect(text).toContain("Content Coverage");
    expect(text).toContain("Quiz and Progress");
    expect(text).toContain("Resource Rights");
    expect(text).toContain("Device Readiness");
    expect(text).toContain("Recommended Next Actions");
    expect(text).toContain("Safety Notes");
  });

  it("does not generate report from invalid validation result", () => {
    const invalid = validateEduboxEvidencePackage({
      package_type: "wrong",
      generated_at: "2026-01-01T00:00:00Z",
    });
    expect(tryGenerateEvidenceReport(invalid)).toBeNull();
  });

  it("generates fallback actions when package has none", () => {
    const minimal = validateEduboxEvidencePackage({
      package_type: PACKAGE_TYPE,
      generated_at: "2026-01-01T00:00:00Z",
    });
    expect(minimal.ok).toBe(true);
    if (!minimal.ok) return;
    const report = generateEvidenceReport(minimal.package);
    expect(report.recommendedNextActions.length).toBeGreaterThan(0);
  });
});
