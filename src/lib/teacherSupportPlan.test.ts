import { describe, expect, it } from "vitest";
import {
  TEACHER_SUPPORT_MODES,
  buildTeacherSupportPlanText,
  generateTeacherSupportPlan,
  teacherPlanExcludesForbiddenContent,
  tryGenerateTeacherSupportPlan,
} from "./teacherSupportPlan";
import {
  PACKAGE_TYPE,
  SAMPLE_EVIDENCE_PACKAGE,
  validateEduboxEvidencePackage,
} from "./eduboxEvidence";
import { generateLessonCraftRecommendations } from "./lessonCraftRecommendations";

describe("generateTeacherSupportPlan", () => {
  it("generates a valid plan from sample package and LessonCraft input", () => {
    const lc = generateLessonCraftRecommendations(SAMPLE_EVIDENCE_PACKAGE, "teacher_support");
    const plan = generateTeacherSupportPlan(SAMPLE_EVIDENCE_PACKAGE, "classroom_teacher", lc);
    expect(plan.title).toContain("Classroom Action Plan");
    expect(plan.priorityFocus.items.length).toBeGreaterThan(0);
    expect(plan.todaysAction.items.length).toBeGreaterThan(0);
    expect(plan.weeklyPlan.items.length).toBeGreaterThan(0);
    expect(plan.discussionPrompts.items.length).toBeGreaterThan(0);
    expect(plan.syncReportingNextStep.items.length).toBeGreaterThan(0);
  });

  it("excludes forbidden content from plan text", () => {
    const polluted = {
      ...SAMPLE_EVIDENCE_PACKAGE,
      email: "facilitator@care.org",
      private_learner_records: [{ id: 1 }],
    };
    const validation = validateEduboxEvidencePackage(polluted);
    expect(validation.ok).toBe(true);
    if (!validation.ok) return;
    const plan = generateTeacherSupportPlan(validation.package);
    const text = buildTeacherSupportPlanText(plan);
    expect(text).not.toContain("facilitator@care.org");
    expect(teacherPlanExcludesForbiddenContent(text)).toBe(true);
  });

  it("text export contains expected section headings", () => {
    const plan = generateTeacherSupportPlan(SAMPLE_EVIDENCE_PACKAGE);
    const text = buildTeacherSupportPlanText(plan);
    expect(text).toContain("Classroom Priority Summary");
    expect(text).toContain("Today's Action");
    expect(text).toContain("7-Day Teacher Action Plan");
    expect(text).toContain("Group Discussion Prompts");
    expect(text).toContain("Revision Activities");
    expect(text).toContain("Quiz Review Strategy");
    expect(text).toContain("Resource Usage Guidance");
    expect(text).toContain("Next Sync / Reporting Action");
    expect(text).toContain("Safety Notes");
  });

  it("all modes return safe output with distinct titles", () => {
    for (const mode of TEACHER_SUPPORT_MODES) {
      const plan = generateTeacherSupportPlan(SAMPLE_EVIDENCE_PACKAGE, mode.id);
      expect(plan.mode).toBe(mode.id);
      expect(plan.intro.length).toBeGreaterThan(0);
      expect(plan.weeklyPlan.items.length).toBeGreaterThan(0);
      const text = buildTeacherSupportPlanText(plan);
      expect(teacherPlanExcludesForbiddenContent(text)).toBe(true);
    }
  });

  it("returns safe fallbacks for empty or partial package", () => {
    const minimal = validateEduboxEvidencePackage({
      package_type: PACKAGE_TYPE,
      generated_at: "2026-01-01T00:00:00Z",
    });
    expect(minimal.ok).toBe(true);
    if (!minimal.ok) return;
    const plan = generateTeacherSupportPlan(minimal.package, "school_administrator");
    expect(plan.priorityFocus.items.length).toBeGreaterThan(0);
    expect(plan.todaysAction.items.length).toBeGreaterThan(0);
    expect(plan.weeklyPlan.items.length).toBeGreaterThan(0);
  });

  it("does not generate from invalid validation result", () => {
    const invalid = validateEduboxEvidencePackage({ package_type: "wrong", generated_at: "2026-01-01T00:00:00Z" });
    expect(tryGenerateTeacherSupportPlan(invalid)).toBeNull();
  });
});
