import type { CSSProperties } from "react";
import { useApp } from "../app/AppState";
import { doneCount, entriesInGrade } from "../app/curriculum";
import { LINES, gradeOf } from "../curriculum/grades";
import { GradeBadge, gradeLevel } from "./primitives/Score";

/** Every grade, grouped into Bento's product lines like a lineup; the AP line shows what's coming. */
export function GradeLineup({ onPick }: { onPick: (grade: number) => void }) {
  const { progress } = useApp();
  return (
    <div className="lineup">
      {LINES.map(line => (
        <section key={line.id} className={`line line-${line.id}`} style={{ "--tint": line.color } as CSSProperties}>
          <header><h3>{line.name}</h3><p>{line.tagline}</p></header>
          {line.grades.length > 0 ? (
            <div className="gradegrid">
              {line.grades.map(g => {
                const gd = gradeOf(g), list = entriesInGrade(g), x = progress.gxp[g] ?? 0;
                return (
                  <button key={g} className={`gcell${g === progress.grade ? " on" : ""}`} style={{ "--tint": gd.color } as CSSProperties} onClick={() => onPick(g)}
                    aria-label={gd.name}>
                    <GradeBadge grade={g} gxp={x} />
                    <span className="gtext"><b>{g === 0 ? "K" : gd.name.replace(" grade", "").split(" · ")[0]}</b><small>Lv {gradeLevel(x).lvl} · {doneCount(progress, list)}/{list.length}</small></span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="apsoon">{line.soon?.map(c => <span key={c}>{c}</span>)}<em>Coming soon</em></div>
          )}
        </section>
      ))}
    </div>
  );
}
