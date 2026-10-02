import type { GradeNumber } from "../schemas/lesson";

export type Band = "little" | "kid" | "middle" | "high";

export interface GradeDefinition {
  grade: GradeNumber;
  /** short label on the grade circle */
  short: string;
  name: string;
  subtitle: string;
  color: string;
}

// Same names, colours and subtitles as the current app.
export const GRADES: GradeDefinition[] = [
  { grade: 0, short: "K", name: "Kindergarten", subtitle: "Counting and adding", color: "#f59e0b" },
  { grade: 1, short: "1", name: "1st grade", subtitle: "Tens and ones", color: "#16a34a" },
  { grade: 2, short: "2", name: "2nd grade", subtitle: "Adding with regrouping", color: "#0891b2" },
  { grade: 3, short: "3", name: "3rd grade", subtitle: "Multiplying", color: "#db2777" },
  { grade: 4, short: "4", name: "4th grade", subtitle: "Division, fractions and decimals", color: "#2563eb" },
  { grade: 5, short: "5", name: "5th grade", subtitle: "Fractions and decimals", color: "#3b82f6" },
  { grade: 6, short: "6", name: "6th grade", subtitle: "Ratios and equations", color: "#0f766e" },
  { grade: 7, short: "7", name: "7th grade", subtitle: "Proportions and integers", color: "#4f46e5" },
  { grade: 8, short: "8", name: "8th grade", subtitle: "Functions and right triangles", color: "#ea580c" },
  { grade: 9, short: "9", name: "9th grade · Algebra 1", subtitle: "Algebra 1", color: "#2563eb" },
  { grade: 10, short: "10", name: "10th grade · Geometry", subtitle: "Geometry", color: "#0369a1" },
  { grade: 11, short: "11", name: "11th grade · Algebra 2", subtitle: "Algebra 2", color: "#7c3aed" },
  { grade: 12, short: "12", name: "12th grade · Precalc & Calculus", subtitle: "Precalculus and calculus", color: "#6b7280" },
];

export const bandOf = (g: number): Band => (g <= 2 ? "little" : g <= 5 ? "kid" : g <= 8 ? "middle" : "high");
export const gradeOf = (g: number): GradeDefinition => GRADES[g] ?? GRADES[5]!;
