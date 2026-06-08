import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { generateLessonPack, setCurrentPack, type LessonInput } from "@/lib/lesson";
import { Sparkles, Loader2 } from "lucide-react";

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [
      { title: "Create Lesson Pack — EduBox Agent Studio" },
      { name: "description", content: "Generate a complete EduBox-ready lesson pack with AI." },
    ],
  }),
  component: CreatePage,
});

const OTHER = "Other";

const COUNTRIES = [
  "Cameroon",
  "Nigeria",
  "Ghana",
  "Kenya",
  "Uganda",
  "Tanzania",
  "Rwanda",
  "South Africa",
  "Ethiopia",
  "Zambia",
  "Zimbabwe",
  "Sierra Leone",
  "Liberia",
  "The Gambia",
  "Senegal",
  "Côte d’Ivoire",
  "Democratic Republic of Congo",
  "Republic of Congo",
  "Gabon",
  "Equatorial Guinea",
  "Chad",
  "Central African Republic",
  "Benin",
  "Togo",
  "Burkina Faso",
  "Mali",
  "Niger",
  "Egypt",
  "Morocco",
  "Algeria",
  "Tunisia",
  "Sudan",
  "South Sudan",
  "Somalia",
  "Botswana",
  "Namibia",
  "Malawi",
  "Mozambique",
  "Angola",
  "African international school",
  "Cambridge curriculum",
  "IB curriculum",
  "French curriculum",
  "British curriculum",
  "American curriculum",
] as const;

const SUBJECTS = [
  "English Language",
  "French",
  "Mathematics",
  "Further Mathematics",
  "Biology",
  "Chemistry",
  "Physics",
  "Integrated Science",
  "Basic Science",
  "Agricultural Science",
  "Computer Science",
  "ICT",
  "Data Processing",
  "Geography",
  "History",
  "Citizenship Education",
  "Civic Education",
  "Economics",
  "Commerce",
  "Accounting",
  "Business Studies",
  "Entrepreneurship",
  "Literature in English",
  "Religious Studies",
  "Moral Education",
  "Social Studies",
  "Environmental Science",
  "Health Education",
  "Physical Education",
  "Home Economics",
  "Food and Nutrition",
  "Technical Drawing",
  "Engineering Science",
  "Building Construction",
  "Electricity",
  "Electronics",
  "Woodwork",
  "Metalwork",
  "Auto Mechanics",
  "Fashion and Design",
  "Fine Arts",
  "Music",
  "Drama",
  "Local Language",
] as const;

const BASE_GRADES = [
  "Nursery 1",
  "Nursery 2",
  "Kindergarten",
  "Primary 1",
  "Primary 2",
  "Primary 3",
  "Primary 4",
  "Primary 5",
  "Primary 6",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Junior Secondary 1",
  "Junior Secondary 2",
  "Junior Secondary 3",
  "Senior Secondary 1",
  "Senior Secondary 2",
  "Senior Secondary 3",
  "Form 1",
  "Form 2",
  "Form 3",
  "Form 4",
  "Form 5",
  "Lower Sixth",
  "Upper Sixth",
  "Year 1",
  "Year 2",
  "Year 3",
  "Year 4",
  "Year 5",
  "Year 6",
  "TVET Level 1",
  "TVET Level 2",
  "TVET Level 3",
  "Adult Literacy",
  "Teacher Training",
  "Remedial Class",
  "Exam Revision Class",
] as const;

// Country-aware grade suggestions surfaced at the top of the dropdown.
const GRADE_SUGGESTIONS: Record<string, string[]> = {
  Cameroon: [
    "Nursery 1",
    "Nursery 2",
    "Primary 1",
    "Primary 2",
    "Primary 3",
    "Primary 4",
    "Primary 5",
    "Primary 6",
    "Form 1",
    "Form 2",
    "Form 3",
    "Form 4",
    "Form 5",
    "Lower Sixth",
    "Upper Sixth",
    "TVET Level 1",
    "TVET Level 2",
    "TVET Level 3",
    "GCE Ordinary Level",
    "GCE Advanced Level",
  ],
  Nigeria: [
    "Primary 1",
    "Primary 2",
    "Primary 3",
    "Primary 4",
    "Primary 5",
    "Primary 6",
    "Junior Secondary 1",
    "Junior Secondary 2",
    "Junior Secondary 3",
    "Senior Secondary 1",
    "Senior Secondary 2",
    "Senior Secondary 3",
    "WAEC",
    "NECO",
    "JAMB",
  ],
  Ghana: [
    "Basic 1",
    "Basic 2",
    "Basic 3",
    "Basic 4",
    "Basic 5",
    "Basic 6",
    "Basic 7",
    "Basic 8",
    "Basic 9",
    "SHS 1",
    "SHS 2",
    "SHS 3",
    "WASSCE",
  ],
  Kenya: [
    "Grade 1",
    "Grade 2",
    "Grade 3",
    "Grade 4",
    "Grade 5",
    "Grade 6",
    "Grade 7",
    "Grade 8",
    "Grade 9",
    "Form 1",
    "Form 2",
    "Form 3",
    "Form 4",
    "KCSE",
  ],
  "South Africa": [
    "Grade R",
    "Grade 1",
    "Grade 2",
    "Grade 3",
    "Grade 4",
    "Grade 5",
    "Grade 6",
    "Grade 7",
    "Grade 8",
    "Grade 9",
    "Grade 10",
    "Grade 11",
    "Grade 12",
    "NSC",
  ],
};

function gradeOptions(country: string): string[] {
  const suggested = GRADE_SUGGESTIONS[country] ?? [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const g of [...suggested, ...BASE_GRADES]) {
    if (!seen.has(g)) {
      seen.add(g);
      out.push(g);
    }
  }
  return out;
}

const LANGUAGES = [
  "English",
  "French",
  "Arabic",
  "Portuguese",
  "Spanish",
  "Swahili",
  "Hausa",
  "Yoruba",
  "Igbo",
  "Amharic",
  "Somali",
  "Kinyarwanda",
  "Lingala",
  "Fulfulde",
  "Pidgin English",
  "Bilingual English and French",
] as const;

const DIFFICULTIES = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Mixed ability",
  "Exam revision",
  "Remedial support",
] as const;

const inputCls =
  "w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-[color:var(--color-brand-blue)] focus:ring-2 focus:ring-[color:var(--color-brand-blue)]/20";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}

function SelectWithOther({
  label,
  value,
  onChange,
  options,
  helper,
  otherPlaceholder,
  otherHelper,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  helper?: string;
  otherPlaceholder?: string;
  otherHelper?: string;
}) {
  const [isOther, setIsOther] = useState(() => value !== "" && !options.includes(value));

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    if (v === OTHER) {
      setIsOther(true);
      onChange("");
    } else {
      setIsOther(false);
      onChange(v);
    }
  };

  return (
    <Field label={label}>
      <select className={inputCls} value={isOther ? OTHER : value} onChange={handleSelect}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
        <option value={OTHER}>Other</option>
      </select>
      {isOther ? (
        <div className="mt-2">
          <input
            className={inputCls}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={otherPlaceholder}
            autoFocus
          />
          {otherHelper && <p className="mt-1 text-xs text-muted-foreground">{otherHelper}</p>}
        </div>
      ) : (
        helper && <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
      )}
    </Field>
  );
}

function CreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<LessonInput>({
    topic: "Photosynthesis",
    subject: "Biology",
    grade: "Form 2",
    country: "Cameroon",
    language: "English",
    difficulty: "Beginner",
    objective: "Students should understand how plants make their own food.",
  });

  const set = (patch: Partial<LessonInput>) => setForm((f) => ({ ...f, ...patch }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.topic.trim()) {
      toast.error("Please enter a topic.");
      return;
    }
    setLoading(true);
    // Simulate agent workflow
    await new Promise((r) => setTimeout(r, 1400));
    const pack = generateLessonPack(form);
    setCurrentPack(pack);
    setLoading(false);
    toast.success("Lesson pack generated by 6 agents.");
    navigate({ to: "/generated" });
  };

  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-5 pt-12 pb-16">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-brand-green" /> Step 1 — Tell the agents about your class
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">Create a Lesson Pack</h1>
          <p className="mt-2 text-muted-foreground">
            Enter your lesson context. Choose the closest country, curriculum, subject, and class
            level. If your school system uses a different name, select Other and type it. The
            Curriculum, Lesson Builder, Quiz, Teacher Support, EduBox Packaging, and Evidence agents
            will assemble a complete offline-ready pack.
          </p>
        </div>

        <form onSubmit={onSubmit} className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <Field label="Topic">
                <input
                  className={inputCls}
                  value={form.topic}
                  onChange={(e) => set({ topic: e.target.value })}
                  placeholder="e.g. Photosynthesis"
                />
              </Field>
            </div>

            <SelectWithOther
              label="Subject"
              value={form.subject}
              onChange={(v) => set({ subject: v })}
              options={SUBJECTS}
              otherPlaceholder="Example: Animal Husbandry, Logic, Philosophy, Life Skills, Vocational Training"
              otherHelper="Enter subject"
            />

            <SelectWithOther
              label="Country or curriculum context"
              value={form.country}
              onChange={(v) => set({ country: v })}
              options={COUNTRIES}
              otherPlaceholder="Example: Cameroon GCE, WAEC, KCSE, Cambridge, IB, school-based curriculum"
              otherHelper="Enter country, exam board, or curriculum context"
            />

            <SelectWithOther
              label="Grade level / class"
              value={form.grade}
              onChange={(v) => set({ grade: v })}
              options={gradeOptions(form.country)}
              helper="Choose the closest level. Select Other if your school system uses a different class name."
              otherPlaceholder="Example: GCE Ordinary Level, JSS2, SSS3, KCSE Form 4, WAEC candidate class"
              otherHelper="Enter grade, form, year, or learner level"
            />

            <SelectWithOther
              label="Language"
              value={form.language}
              onChange={(v) => set({ language: v })}
              options={LANGUAGES}
              otherPlaceholder="Enter lesson language"
              otherHelper="Enter lesson language"
            />

            <Field label="Difficulty level">
              <select
                className={inputCls}
                value={form.difficulty}
                onChange={(e) => set({ difficulty: e.target.value })}
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </Field>

            <div className="md:col-span-2">
              <Field label="Learning objective / teacher note">
                <textarea
                  rows={3}
                  className={inputCls}
                  value={form.objective}
                  onChange={(e) => set({ objective: e.target.value })}
                  placeholder="What should students be able to do at the end of the lesson?"
                />
              </Field>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <p className="text-xs text-muted-foreground">
              Prototype workflow: Generates a structured EduBox-ready lesson pack from the
              selected classroom context.
            </p>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-70 md:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Agents working…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Generate Lesson Pack
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </SiteLayout>
  );
}
