import { useEffect, useRef, type CSSProperties } from "react";
import { useApp } from "../app/AppState";
import { GRADES } from "../curriculum/grades";
import { lessonsInGrade } from "../curriculum/registry";
import { timesDone } from "../engine/mastery/progress";
import { GradeBadge, gradeLevel } from "./primitives/Score";

/** "Choose your grade": the same window the header badge opens in the current app. */
export function GradeSheet() {
  const { progress, chooseGrade, openSheet } = useApp();
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    panel.current?.querySelector<HTMLButtonElement>(".gcell.on, .gcell")?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") openSheet(false); };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [openSheet]);
  return (
    <div className="sheet" onClick={e => { if (e.target === e.currentTarget) openSheet(false); }}>
      <div className="panel" role="dialog" aria-modal="true" aria-label="Choose your grade" ref={panel}>
        <div className="head"><h2>Choose your grade</h2><button className="ctl" onClick={() => openSheet(false)}>Done</button></div>
        <div className="gradegrid">
          {GRADES.map(g => {
            const list = lessonsInGrade(g.grade), done = list.filter(l => timesDone(progress, l.id) > 0).length;
            const gxp = progress.gxp[g.grade] ?? 0;
            return (
              <button key={g.grade} className={`gcell${g.grade === progress.grade ? " on" : ""}`} style={{ "--tint": g.color } as CSSProperties}
                onClick={() => chooseGrade(g.grade)}>
                <GradeBadge grade={g.grade} gxp={gxp} />
                <span className="gtext"><b>{g.name.replace(" grade", "")}</b><small>Lv {gradeLevel(gxp).lvl} · {done}/{list.length}</small></span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
