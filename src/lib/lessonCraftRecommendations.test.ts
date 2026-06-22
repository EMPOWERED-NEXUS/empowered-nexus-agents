import { describe, expect, it } from "vitest";
import {
  RECOMMENDATION_MODES,
  buildLessonCraftRecommendationsText,
  generateLessonCraftRecommendations,
  recommendationsExcludesForbiddenContent,
  tryGenerateLessonCraftRecommendations,
} from "./lessonCraftRecommendations";
import {
  PACKAGE_TYPE,
  SAMPLE_EVIDENCE_PACKAGE,
  validateEduboxEvidencePackage,
} from "./eduboxEvidence";

describe("generateLessonCraftRecommendations", () => {
  it("generates valid recommendations from sample package", () => {
    const rec = generateLessonCraftRecommendations(SAMPLE_EVIDENCE_PACKAGE, "teacher_support");
    expect(rec.title).toContain("Teacher Support");
    expect(rec.followUpLessons.items.length).toBeGreaterThan(0);
    expect(rec.teacherActions.items.length).toBeGreaterThan(0);
    expect(rec.quizImprovementIdeas.items.length).toBeGreaterThan(0);
    expect(rec.resourceRightsActions.items.length).toBeGreaterThan(0);
    expect(rec.offlinePackageSuggestions.items.length).toBeGreaterThan(0);
  });

  it("excludes forbidden content from recommendation text", () => {
    const polluted = {
      ...SAMPLE_EVIDENCE_PACKAGE,
      email: "teacher@school.org",
      token: "secret-token",
    };
    const validation = validateEduboxEvidencePackage(polluted);
    expect(validation.ok).toBe(true);
    if (!validation.ok) return;
    const rec = generateLessonCraftRecommendations(validation.package);
    const text = buildLessonCraftRecommendationsText(rec);
    expect(text).not.toContain("teacher@school.org");
    expect(text).not.toContain("secret-token");
    expect(recommendationsExcludesForbiddenContent(text)).toBe(true);
  });

  it("text export contains expected section headings", () => {
    const rec = generateLessonCraftRecommendations(SAMPLE_EVIDENCE_PACKAGE);
    const text = buildLessonCraftRecommendationsText(rec);
    expect(text).toContain("Recommended Follow-Up Lessons");
    expect(text).toContain("Teacher Actions");
    expect(text).toContain("Content Package Improvements");
    expect(text).toContain("Quiz Improvement Ideas");
    expect(text).toContain("Resource Rights Actions");
    expect(text).toContain("Offline Learning Package Suggestions");
    expect(text).toContain("Safety Notes");
  });

  it("modes return safe output with distinct titles", () => {
    for (const mode of RECOMMENDATION_MODES) {
      const rec = generateLessonCraftRecommendations(SAMPLE_EVIDENCE_PACKAGE, mode.id);
      expect(rec.mode).toBe(mode.id);
      expect(rec.intro.length).toBeGreaterThan(0);
      expect(rec.teacherActions.items.length).toBeGreaterThan(0);
      const text = buildLessonCraftRecommendationsText(rec);
      expect(recommendationsExcludesForbiddenContent(text)).toBe(true);
    }
  });

  it("returns safe fallbacks for empty or partial package", () => {
    const minimal = validateEduboxEvidencePackage({
      package_type: PACKAGE_TYPE,
      generated_at: "2026-01-01T00:00:00Z",
    });
    expect(minimal.ok).toBe(true);
    if (!minimal.ok) return;
    const rec = generateLessonCraftRecommendations(minimal.package, "launch_operations");
    expect(rec.followUpLessons.items.length).toBeGreaterThan(0);
    expect(rec.contentPackageImprovements.items.length).toBeGreaterThan(0);
    expect(rec.offlinePackageSuggestions.items.length).toBeGreaterThan(0);
  });

  it("does not generate from invalid validation result", () => {
    const invalid = validateEduboxEvidencePackage({ package_type: "wrong", generated_at: "2026-01-01T00:00:00Z" });
    expect(tryGenerateLessonCraftRecommendations(invalid)).toBeNull();
  });
});
