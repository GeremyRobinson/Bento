import type { CSSProperties } from "react";
import { useApp } from "../app/AppState";
import { gradeOf } from "../curriculum/grades";
import { LEVEL_XP } from "../engine/mastery/levels";
import { currentItem, lessonOfItem } from "../engine/session/practice";
import { GradeBadge, gradeLevel } from "./primitives/Score";

export function TopBar() {
  const { progress, openSheet, go } = useApp();
  const g = progress.grade ?? 5, gxp = progress.gxp[g] ?? 0, { lvl, into } = gradeLevel(gxp);
  // an unfinished lesson waits here, on every page, instead of taking over a grade's own "up next"
  const run = progress.run, runGrade = run ? gradeOf(lessonOfItem(currentItem(run)).grade) : null;
  return (
    <header className={`top${run ? " has-resume" : ""}`}>
      <button className="brand" onClick={() => go({ name: "welcome" }, "back")} aria-label="Bento home page">Bento</button>
      <button className="gpick" onClick={() => openSheet(true)} aria-label="Change grade">
        <GradeBadge grade={g} gxp={gxp} />
        <span className="gtext"><b>{gradeOf(g).name}</b><small>Level {lvl} · {into}/{LEVEL_XP} XP</small></span>
      </button>
      {run && runGrade && (
        <button className="resume" style={{ "--rtint": runGrade.color } as CSSProperties} onClick={() => go({ name: "practice" }, "fwd")} aria-label={`Resume ${run.title}, ${runGrade.name}, problem ${run.i + 1} of ${run.items.length}`}>
          <span className="rdot" style={{ background: runGrade.color }}>{runGrade.short}</span>
          <span className="rtext"><small>Resume · {runGrade.name}</small><b>{run.title}</b></span>
          <span className="mono rcount">{run.i + 1}/{run.items.length}</span>
          <span className="rshort">Resume ›</span>
        </button>
      )}
      <span className="chip" title="Days in a row"><i>🔥</i><span className="mono">{progress.streak}</span><span className="w">day{progress.streak === 1 ? "" : "s"}</span></span>
      <span className="chip xp" title="All XP"><i>⭐</i><span className="mono">{progress.xp}</span><span className="w">XP</span></span>
    </header>
  );
}
