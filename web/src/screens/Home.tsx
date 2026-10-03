import { useApp } from "../app/AppState";
import { doneCount, entriesInGrade, gradeAverage, isReady, testKey, testReady, unitsInGrade, type Entry } from "../app/curriculum";
import { COMING_SOON } from "../curriculum/catalog";
import { gradeOf, lineOf } from "../curriculum/grades";
import { lastScore, timesDone } from "../engine/mastery/progress";
import { BigRing, ScoreChip } from "../components/primitives/Score";
import { gradePattern } from "../components/primitives/gradePattern";


/**
 * Home is a bento grid: the big tile is what to do next; review, progress and practice-again sit beside it;
 * units fill the rest. Every lesson of the grade is listed; the ones still being rebuilt show as "soon".
 */
export function Home() {
  const { progress, go, startTest, startReview, canReview, deps } = useApp();
  const g = progress.grade ?? 5, grade = gradeOf(g), list = entriesInGrade(g), units = unitsInGrade(g);
  const isDone = (id: string) => timesDone(progress, id) > 0;
  const ready = list.filter(c => isReady(c.id));
  const next = ready.find(c => !isDone(c.id));
  const pick = next ?? [...ready].sort((a, b) => (lastScore(progress, a.id) ?? 9) - (lastScore(progress, b.id) ?? 9))[0];
  const done = doneCount(progress, list), avg = gradeAverage(progress, g);
  const weak = list.filter(c => { const s = lastScore(progress, c.id); return s != null && s <= 1; });
  const gt = progress.tests[testKey(g)];
  const hasReview = canReview(), rd = progress.reviews[new Date(deps().now).toDateString()];
  const open = (c: Entry) => go({ name: "learn", lessonId: c.id });

  let k = 0;
  return (
    <>
      <div className={`bhome${weak.length ? " tall" : ""}`}>
        <section className="hero t0 b-hero"><div className="pat" style={{ backgroundImage: gradePattern(g) }} />
          <div><span className="hline">{lineOf(g).name}</span><h1><button className="yearlink" onClick={() => go({ name: "intro" }, "fwd")} title="See the year">{grade.name}<span aria-hidden> ›</span></button></h1><p className="sub">{grade.subtitle} · {list.length} lesson{list.length === 1 ? "" : "s"}</p></div>
          {units.length > 1 && (
            <div className="uprog">{units.map(u => { const d = doneCount(progress, u.entries); return (
              <div key={u.name}><span className="k">{u.name}</span><span className="bar2"><i className={d ? undefined : "zero"} style={{ width: `${(100 * d / u.entries.length).toFixed(1)}%` }} /></span><span className="mono">{d}/{u.entries.length}</span></div>
            ); })}</div>
          )}
          {pick ? (
            <button className="upnext" onClick={() => open(pick)}>
              <span className="k">{next ? "Up next" : "Practice"} · {pick.unit || "Lesson"} · lesson {list.indexOf(pick) + 1}</span><b>{pick.title}</b>
              <span className="row">{lastScore(progress, pick.id) != null ? <ScoreChip n={lastScore(progress, pick.id)} words /> : <span className="muted">Learn it, then practice</span>}<span className="ctl go">Start ›</span></span>
            </button>
          ) : (
            <div className="upnext soonnext">
              <span className="k">On the way</span><b>{list.length ? `${list[0]!.title} and the rest are almost ready` : "New lessons are almost ready"}</b>
              <span className="row"><span className="muted">Pick another grade to keep going.</span></span>
            </div>
          )}
        </section>
        {hasReview && (
          <button className="tile b-review" onClick={startReview}>
            <span className={`badge${rd != null ? " on" : ""}`}>↻</span>
            <span className="name"><b>{rd != null ? "Today's review: done" : "Today's review"}</b><small className="muted">Mixed problems from lessons you've done</small></span>
            {rd != null ? <ScoreChip n={rd} /> : <span className="muted">about 8</span>}
          </button>
        )}
        <section className={`tile b-stats${hasReview ? "" : " solo"}`}>
          <div className="statgrid">
            <div className="st"><BigRing small frac={list.length ? done / list.length : 0} label={done} /><span className="k">of {list.length} lessons done</span></div>
            <div className="st"><span className="v">{avg == null ? "—" : avg.toFixed(1)}</span><span className="k">average score of 4</span></div>
            <div className="st"><span className="v">{gt ? <ScoreChip n={gt.last} /> : "—"}</span><span className="k">grade check-up</span></div>
          </div>
          <div className="actions">
            {testReady(g) && <button className="ctl go" onClick={() => startTest(testKey(g))}>Grade check-up</button>}
          </div>
        </section>
        {weak.length > 0 && (
          <section className="tile b-weak"><div className="unit"><h3>Practice again</h3></div>
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
                    {sc != null ? <ScoreChip n={sc} /> : c === next ? <><span className="muted">up next</span><span className="dot busy" /></> : live ? <span className="dot" /> : <span className="muted">soon</span>}
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


