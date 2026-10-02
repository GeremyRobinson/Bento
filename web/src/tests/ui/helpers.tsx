// Shared helpers for the UI flow tests: start the app on a given save, and solve whatever is on screen like a student.
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { App } from "../../app/App";
import { AppProvider } from "../../app/AppState";
import { createRng } from "../../curriculum/generators/rng";
import { emptyProgress, type Progress } from "../../engine/mastery/progress";
import type { SessionReport } from "../../engine/session/types";

export const clock = { t: Date.UTC(2026, 9, 2, 15) };
const now = () => (clock.t += 3000);

export function renderApp(progress: Partial<Progress> = { grade: 5, chosen: true }, reports: Record<string, SessionReport> = {}, hash = "#/") {
  history.replaceState(null, "", hash);
  clock.t = Date.UTC(2026, 9, 2, 15);
  return render(
    <AppProvider initial={{ progress: { ...emptyProgress(), ...progress }, reports }} store={null} now={now} rng={createRng(42)}>
      <App />
    </AppProvider>,
  );
}

const pad = () => document.querySelector(".tray") as HTMLElement;
const tap = (name: string | RegExp) => fireEvent.click(screen.getByRole("button", { name }));

/** Works out the answer from the step on screen (a × b, or a sum), like the existing lesson-flow test. */
export function answerOnScreen(): string {
  let ask = document.querySelector(".ask .mline")!.getAttribute("data-plain")!.replace(/−/g, "-");
  // "Final answer only": the answer to the whole problem shown above the step
  if (ask === "blank") ask = `${document.querySelector(".split .math .mline")!.getAttribute("data-plain")} = blank`;
  const m = ask.match(/^(-?\d+) ([×+]) (-?\d+)(?: \+ (-?\d+))? = blank$/);
  if (!m) throw new Error(`can't read step: ${ask}`);
  const nums = [m[1], m[3], m[4]].filter(Boolean).map(Number);
  return String(m[2] === "×" ? nums[0]! * nums[1]! : nums.reduce((a, b) => a + b, 0));
}

const FINISH = /^(Next problem|Finish lesson|Finish test|Finish review)$/;

/** Solves every problem of the run on screen and presses the finish button. Returns how many problems were solved. */
export function solveRun(): number {
  let solved = 0;
  for (let guard = 0; guard < 400; guard++) {
    const next = screen.queryByRole("button", { name: FINISH });
    if (next) {
      const last = next.textContent !== "Next problem";
      solved++;
      fireEvent.click(next);
      if (last) return solved;
      continue;
    }
    // a word problem starts with "which operation?": every story here is equal groups, so multiply
    const multiply = screen.queryByRole("button", { name: "× Multiply" });
    if (multiply) { fireEvent.click(multiply); continue; }
    // planning (help tier 1): the right next step is the one whose name matches the step after it; not used at these scores
    for (let i = 0; i < 9; i++) fireEvent.click(within(pad()).getByRole("button", { name: "Erase" }));
    for (const d of answerOnScreen()) fireEvent.click(within(pad()).getByRole("button", { name: d }));
    tap("Check");
  }
  throw new Error("the run never finished");
}

/** Gets every step wrong until "Show me" opens, then uses it: the lowest possible score. */
export function failRun(): void {
  for (let guard = 0; guard < 800; guard++) {
    const next = screen.queryByRole("button", { name: FINISH });
    if (next) {
      const last = next.textContent !== "Next problem";
      fireEvent.click(next);
      if (last) return;
      continue;
    }
    const show = screen.queryByRole("button", { name: "Show me" });
    if (show) { fireEvent.click(show); continue; }
    const add = screen.queryByRole("button", { name: "+ Add" });
    if (add) { fireEvent.click(add); act(() => { clock.t += 10000; }); continue; }
    for (let i = 0; i < 9; i++) fireEvent.click(within(pad()).getByRole("button", { name: "Erase" }));
    fireEvent.click(within(pad()).getByRole("button", { name: "1" }));
    tap("Check");
    act(() => { clock.t += 10000; });
  }
  throw new Error("the run never finished");
}

export { tap };
