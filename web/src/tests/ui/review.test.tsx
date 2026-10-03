// Today's review needs at least two scored lessons that exist. While only one lesson may be rebuilt, this file
// registers a twin of g5-mult2 under another id, so the review flow is tested whatever has been ported.
import { fireEvent, screen } from "@testing-library/react";
import { vi } from "vitest";
import type { AnyLesson } from "../../curriculum/schemas/lesson";
import { renderApp, solveRun, tap } from "./helpers";

vi.mock("../../curriculum/registry", async importOriginal => {
  const real = await importOriginal<typeof import("../../curriculum/registry")>();
  const base = real.lessonById("g5-mult2")!;
  const twin: AnyLesson = { ...base, id: "review-twin", title: "Twin of two-digit multiplying" };
  const LESSONS = [...real.LESSONS, twin];
  const lessonById = (id: string) => (id === twin.id ? twin : real.lessonById(id));
  return {
    ...real, LESSONS, lessonById,
    requireLesson: (id: string) => { const l = lessonById(id); if (!l) throw new Error(`no lesson ${id}`); return l; },
    lessonsInGrade: (g: number) => LESSONS.filter(l => l.grade === g),
  };
});

const day = 864e5, t = Date.UTC(2026, 9, 1, 15);
const scored = (last: 0 | 1 | 2 | 3 | 4) => ({ last, best: last, pct: last / 4, date: t - 3 * day, mastered: false });

describe("today's review", () => {
  it("mixes problems from scored lessons, has no practice-again, and shows as done on home", () => {
    renderApp({ grade: 5, chosen: true, done: 2, lessons: { "g5-mult2": 1, "review-twin": 1 },
      scores: { "g5-mult2": scored(1), "review-twin": scored(3) }, seen: { "g5-mult2": t - 3 * day, "review-twin": t - day } });
    const tile = screen.getByRole("button", { name: /Today's review/ });
    expect(tile).toHaveTextContent("about 8");
    fireEvent.click(tile);
    // a mixed run: Quit rather than Lesson, and each problem names its lesson
    expect(screen.getByRole("button", { name: "Quit" })).toBeInTheDocument();
    expect(document.querySelector(".split .card .label")!.textContent).toMatch(/Multiply two-digit numbers|Twin of two-digit multiplying/);
    expect(screen.getByRole("button", { name: /Hints?$/ })).toHaveTextContent("4");
    expect(solveRun()).toBe(8);
    expect(screen.getByRole("navigation", { name: "You are here" })).toHaveTextContent("LessonsToday's reviewDone");
    expect(screen.queryByRole("button", { name: "Practice again" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Take it again" })).toBeNull();
    tap("All lessons");
    const done = screen.getByRole("button", { name: /Today's review: done/ });
    expect(done.querySelector(".score b")!.textContent).toBe("4");
  });
});
