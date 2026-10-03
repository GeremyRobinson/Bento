import { useApp } from "../app/AppState";
import { doneCount, entriesInGrade, gradeAverage, isReady, testKey, testReady, unitsInGrade, type Entry } from "../app/curriculum";
import { COMING_SOON } from "../curriculum/catalog";
import { gradeOf } from "../curriculum/grades";
import { todayPlan, upNext, type TodayItem } from "../app/today";
import { placeKey } from "../engine/session/practice";
import { Check } from "../components/primitives/icons";
import { lastScore, timesDone } from "../engine/mastery/progress";
import { BigRing, ScoreChip } from "../components/primitives/Score";


const KIND = { lesson: "Up next", review: "Review", test: "Unit test" } as const;

/**
 * Home: today's short plan first (one tap starts it), how the year is going beside it, then every unit of the grade.
 * Lessons still being rebuilt show as "soon".
 */
export function Home() {
  const { progress, go, startLesson, startTest, startReview, canReview, deps } = useApp();
  const g = progress.grade ?? 5, grade = gradeOf(g), list = entriesInGrade(g), units = unitsInGrade(g);
  const isDone = (id: string) => timesDone(progress, id) > 0;
  const next = upNext(progress, g);
  const plan = todayPlan(progress, g, deps().now, canReview());
  const first = plan.find(i => !i.done);
  const done = doneCount(progress, list), avg = gradeAverage(progress, g);
  const weak = list.filter(c => { const s = lastScore(progress, c.id); return s != null && s <= 1; });
  const gt = progress.tests[testKey(g)];
  const open = (c: Entry) => go({ name: "learn", lessonId: c.id });
  const run = (i: TodayItem) => i.kind === "lesson" ? (i.done ? startLesson(i.id) : go({ name: "learn", lessonId: i.id }))
    : i.kind === "review" ? startReview() : startTest(i.key);
  const doneScore = (i: TodayItem) => i.kind === "review" ? progress.reviews[new Date(deps().now).toDateString()]
    : i.kind === "lesson" ? lastScore(progress, i.id) : progress.tests[i.key]?.last;
  const minutes = plan.filter(i => !i.done).reduce((m, i) => m + i.minutes, 0);

  let k = 0;
  return (
    <>
      <div className={`bhome${weak.length ? " tall" : ""}`}>
        <section className="tile today">
          <button className="yearlink" onClick={() => go({ name: "intro" }, "fwd")} aria-label={`See the year: ${grade.name}`}>{grade.name}<span aria-hidden> ›</span></button>
          <h1>Today</h1>
          <p className="sub">{!plan.length ? "New lessons for this grade are almost ready." : first ? `About ${minutes} minutes.` : "All done for today. Nicely done."}</p>
          {plan.length > 0 && (
            <ol className="plan">{plan.map(i => (
              <li key={i.kind}>
                <button className={`pitem${i.done ? " done" : ""}${i === first ? " now" : ""}`} onClick={() => run(i)}
                  aria-label={i.kind === "review" ? (i.done ? "Today's review: done" : "Today's review") : i.kind === "lesson" && !i.done ? `${i.again ? "Practice" : "Up next"}: ${i.title}` : undefined}>
                  <span className="pmark" aria-hidden>{i.done ? <Check /> : null}</span>
                  <span className="ptext"><small>{i.kind === "lesson" && i.again ? "Practice" : KIND[i.kind]}</small><b>{i.title}</b></span>
                  {i === first ? <span className="ctl go">Start</span> : i.done ? <ScoreChip n={doneScore(i)} /> : <span className="pmin">{i.minutes} min</span>}
                </button>
              </li>
            ))}</ol>
          )}
          {!progress.log.length && <button className="tlink" onClick={() => startTest(placeKey(g))}>Not sure this is your grade? Find my level ›</button>}
        </section>
        <section className="tile b-stats">
          <BigRing frac={list.length ? done / list.length : 0} label={done} />
          <p><b>of {list.length}</b> lessons done{avg != null && <><br /><span className="muted">Average score {avg.toFixed(1)} of 4</span></>}</p>
          {gt && <p className="muted gtline">Grade check-up <ScoreChip n={gt.last} /></p>}
          {testReady(g) && <button className="ctl" onClick={() => startTest(testKey(g))}>Grade check-up</button>}
        </section>
        {weak.length > 0 && (
          <section className="tile b-weak"><h3>Practice again</h3>
            <div className="lessons">{weak.slice(0, 3).map(c => (
              <button key={c.id} className="lesson" disabled={!isReady(c.id)} onClick={() => open(c)}><ScoreChip n={lastScore(progress, c.id)} /><span className="name">{c.title}</span></button>
            ))}</div>
          </section>
        )}
      </div>
      <div className="units">
        {units.map(u => {
          const tk = testKey(g, u.name), t = progress.tests[tk];
          return (
            <section className="panel" key={u.name}>
              {(units.length > 1 || u.name !== "Skills") && (
                <div className="unit"><h3>{u.name}</h3>
                  {testReady(g, u.name) && <button className={`ctl${t ? " badged" : ""}`} onClick={() => startTest(tk)}>{t && <ScoreChip n={t.last} />}Unit test</button>}
                </div>
              )}
              <div className="lessons">{u.entries.map(c => {
                const sc = lastScore(progress, c.id), live = isReady(c.id); k++;
                return (
                  <button key={c.id} className={`lesson t${(k - 1) % 3}${live ? "" : " soon"}`} disabled={!live} onClick={() => open(c)}
                    aria-label={live ? undefined : `${c.title}, coming soon`}>
                    <span className={`badge${isDone(c.id) ? " on" : ""}`}>{k}</span><span className="name">{c.title}</span>
                    {sc != null ? <ScoreChip n={sc} /> : c === next?.entry ? <span className="dot busy" aria-label="up next" /> : live ? <span className="dot" /> : <span className="muted">soon</span>}
                  </button>
                );
              })}</div>
            </section>
          );
        })}
        {g < 5 && COMING_SOON[g] && (
          <section className="panel"><div className="unit"><h3>Coming soon</h3></div>
            <div className="facts">{COMING_SOON[g]!.map(t => <div key={t}><span>{t}</span><span className="k">soon</span></div>)}</div>
          </section>
        )}
      </div>
    </>
  );
}


