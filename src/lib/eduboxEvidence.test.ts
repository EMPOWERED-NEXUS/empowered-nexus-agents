import { describe, expect, it } from "vitest";
import {
  PACKAGE_TYPE,
  SAMPLE_EVIDENCE_PACKAGE,
  stripForbiddenFields,
  validateEduboxEvidencePackage,
} from "./eduboxEvidence";

describe("validateEduboxEvidencePackage", () => {
  it("accepts a valid sample package", () => {
    const result = validateEduboxEvidencePackage(SAMPLE_EVIDENCE_PACKAGE);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.package.package_type).toBe(PACKAGE_TYPE);
    expect(result.package.course_count).toBe(2);
    expect(result.package.recommended_agent_actions.length).toBeGreaterThan(0);
    expect(result.warnings).toHaveLength(0);
  });

  it("warns and strips forbidden fields", () => {
    const polluted = {
      ...SAMPLE_EVIDENCE_PACKAGE,
      email: "secret@school.org",
      nested: { token: "abc123" },
    };
    const result = validateEduboxEvidencePackage(polluted);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.forbiddenKeysFound).toContain("email");
    expect(result.forbiddenKeysFound).toContain("nested.token");
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(JSON.stringify(result.package)).not.toContain("secret@school.org");
  });

  it("rejects invalid package_type", () => {
    const result = validateEduboxEvidencePackage({
      package_type: "wrong_type",
      generated_at: "2026-01-01T00:00:00Z",
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0]).toContain("Invalid package_type");
  });

  it("handles missing optional fields with safe defaults", () => {
    const minimal = {
      package_type: PACKAGE_TYPE,
      generated_at: "2026-01-01T00:00:00Z",
    };
    const result = validateEduboxEvidencePackage(minimal);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.package.course_count).toBe(0);
    expect(result.package.lesson_count).toBe(0);
    expect(result.package.content_summary).toEqual({
      published_course_count: 0,
      sample_course_titles: [],
      sample_lesson_titles: [],
      category_labels: [],
      has_demo_content: false,
    });
    expect(result.package.recommended_agent_actions).toEqual([]);
  });
});

describe("stripForbiddenFields", () => {
  it("collects nested forbidden key paths", () => {
    const { forbiddenKeysFound } = stripForbiddenFields({
      ok: true,
      private_learner_records: [{ id: 1 }],
    });
    expect(forbiddenKeysFound).toContain("private_learner_records");
  });
});
