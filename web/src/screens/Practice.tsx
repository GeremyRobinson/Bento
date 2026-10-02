import { useEffect } from "react";
import { useApp } from "../app/AppState";
import { HomeIcon } from "../components/primitives/icons";
import { MathLine, Rich } from "../components/primitives/MathLine";
import { ProblemView } from "../components/practice/ProblemView";
import { FeedbackBox } from "../components/practice/FeedbackBox";
import { Keypad } from "../components/practice/Keypad";
import {
  bandOfSession, check, choose, currentItem, currentStep, focusSlot, hint, isLastProblem, lessonOfItem, nextProblem,
  pickPlan, pressKey, problemOf, showMe, showMeAvailable, skipAvailable, toggleSkip,
} from "../engine/session/practice";

/** One problem at a time: the problem and the finished lines on one side, the step, feedback and keypad on the other. */
export function Practice() {
  const { progress, go, act, finish } = useApp();
  const s = progress.run;

  // a physical keyboard works too: digits, minus, point, Backspace, Tab for the next box, Enter to check
  useEffect(() => {
    if (!s) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const map: Record<string, string> = { Backspace: "back", "-": "−", ".": ".", Tab: "next" };
      const key = /^\d$/.test(e.key) ? e.key : map[e.key];
      if (key) { e.preventDefault(); act(st => pressKey(st, key)); }
      else if (e.key === "Enter") {
        e.preventDefault();
        if (s.solved) onNext(); else act((st, p, d) => check(st, p, d));
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  });

  if (!s) {
    return (
      <section className="panel"><p className="empty">No lesson in progress.</p>
        <div className="actions"><button className="ctl go" onClick={() => go({ name: "home" })}>All lessons</button></div></section>
    );
  }

  const it = currentItem(s), lesson = lessonOfItem(it), step = currentStep(s), fb = s.feedback, n = s.items.length;
  const test = s.mode === "test", mixed = s.mode !== "practice", band = bandOfSession(s);
  const tapOnly = !!s.pick || !!step?.choices;
  function onNext() {
    if (s && isLastProblem(s)) finish();
    else act((st, p, d) => nextProblem(st, p, d));
  }

  return (
    <>
      <div className="bar">
        <button className="ctl circ" onClick={() => go({ name: "home" })} aria-label="Home"><HomeIcon /></button>
        <button className="ctl" onClick={() => go(mixed ? { name: "home" } : { name: "learn", lessonId: lesson.id })}
          aria-label={mixed ? "Quit" : "Back to the lesson"}>{mixed ? "Quit" : "Lesson"}</button>
        <span className="steps" aria-label={`Problem ${s.i + 1} of ${n}`}>
          {s.items.map((_, i) => <span key={i} className={`dot ${i < s.i ? "ok" : i === s.i ? "busy" : ""}`} />)}
        </span>
        <span className="ctl badged"><span className="badge on">{s.i + 1}</span>of <span className="mono">{n}</span></span>
      </div>
      {test && <div className="bar"><span className="grow" style={{ textAlign: "center" }}>{s.title}: no hints, one try per step</span></div>}
      <section className="panel split">
        <div className="col">
          <div className="card">
            {mixed && <div className="label">{lesson.title}</div>}
            <ProblemView lessonId={it.lessonId} problem={problemOf(it)} story={!!it.story} />
            <div className="work">
              {s.work.map((w, k) => (
                <div key={k} className={`workline${w.shown ? " shown" : ""}${s.fx === "line" && k === s.work.length - 1 ? " enter" : ""}`}>
                  <span className="k">Step {k + 1}</span><span className="wl"><MathLine math={w.math} /></span>
                </div>
              ))}
            </div>
          </div>
          {step && (
            <div key={`${s.i}-${s.step}-${s.collapsed}-${s.mistakes.length}`} className={`card${s.fx === "shake" ? " shake" : ""}${s.fx === "line" ? " enter" : ""}`}>
              {s.pick ? (
                <>
                  <div className="label">Step {s.step + 1} · What comes next?</div>
                  <div className="choices">{s.pick.options.map((o, i) => <button key={o} className="choice" onClick={() => act(st => pickPlan(st, i))}>{o}</button>)}</div>
                </>
              ) : (
                <>
                  <div className="label">{step.label}</div>
                  <div className="ask">
                    {step.question && <span className="q"><Rich text={step.question} /></span>}
                    <MathLine math={step.prompt} values={s.values} active={s.active} onSlot={id => act(st => focusSlot(st, id))} />
                  </div>
                  {step.choices && (
                    <div className="choices">{step.choices.map((o, i) => <button key={o} className="choice" onClick={() => act((st, p, d) => choose(st, i, p, d))}>{o}</button>)}</div>
                  )}
                  {step.note && <div className="note"><Rich text={step.note} /></div>}
                </>
              )}
            </div>
          )}
        </div>
        <div className="col">
          {fb && <FeedbackBox key={`${s.i}-${s.step}-${s.mistakes.length}-${s.hints}-${fb.strong}-${fb.text}`} fb={fb} enter={s.fx != null} />}
          {step && tapOnly && <div className="tapnote muted">{s.pick ? "You plan this one: tap the step that comes next." : "Tap your answer."}</div>}
          {step && !tapOnly && <Keypad band={band} onKey={key => act(st => pressKey(st, key))} />}
          {step ? (
            <div className="actions">
              {!test && (
                <button className="ctl badged" disabled={!(s.hintsLeft || s.hinted) || !!s.pick} onClick={() => act((st, _p, d) => hint(st, d))}>
                  <span className="badge">{s.hintsLeft}</span>Hint{s.hintsLeft === 1 ? "" : "s"}
                </button>
              )}
              {showMeAvailable(s) && <button className="ctl" onClick={() => act((st, p, d) => showMe(st, p, d))}>Show me</button>}
              {skipAvailable(s) && <button className="ctl" onClick={() => act((st, _p, d) => toggleSkip(st, d))}>{s.skip ? "Show steps" : "Final answer only"}</button>}
              {!tapOnly && <button className="ctl go" onClick={() => act((st, p, d) => check(st, p, d))}>Check</button>}
            </div>
          ) : (
            <div className="actions">
              <button className="ctl go" onClick={onNext}>
                {s.i < n - 1 ? "Next problem" : test ? "Finish test" : s.mode === "review" ? "Finish review" : "Finish lesson"}
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
