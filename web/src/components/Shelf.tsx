import type { CSSProperties } from "react";
import { useApp } from "../app/AppState";
import { doneCount, entriesInGrade } from "../app/curriculum";
import { GRADES, LINES, tintStyle } from "../curriculum/grades";

/** Progress as a fill: the box fills from the bottom in its colour, like a battery charging. frac is 0–1. */
export const Fill = ({ frac }: { frac: number }) => <span className="fill" aria-hidden style={{ "--p": Math.max(0, Math.min(1, frac)) } as CSSProperties} />;

/** "3rd", "12th": a grade's number with its ending, the way every grade is named on a card. */
export function GradeNum({ grade }: { grade: number }) {
  const d = GRADES[grade]!;
  return <span className="gnum" aria-hidden>{d.short}{grade > 0 && <small>{["", "st", "nd", "rd"][grade] ?? "th"}</small>}</span>;
}

/**
 * Every grade as a card, grouped by Bento's lines: the grade's number in its colour, what the year covers, and
 * how much is done as a fill. The same shelf in the contents, the grade picker and the personal hub.
 */
export function Shelf({ current, onPick }: { current: number | null; onPick: (grade: number) => void }) {
  const { progress } = useApp();
  return (
    <div className="shelf">
      {LINES.map(line => (
        <div key={line.id} className="sline">
          <span className="k">{line.name}</span>
          <div className="sbooks">
            {line.grades.length ? line.grades.map(n => {
              const d = GRADES[n]!, list = entriesInGrade(n), done = doneCount(progress, list);
              return (
                <button key={n} className={`book gcell battery${n === current ? " on" : ""}`} style={tintStyle(d) as CSSProperties}
                  onClick={() => onPick(n)} aria-label={`${d.name}: ${done} of ${list.length} lessons done`}>
                  <GradeNum grade={n} />
                  <b>{d.subtitle}</b>
                  <Fill frac={list.length ? done / list.length : 0} />
                  <span className="bcount">{done === 0 ? `${list.length} lesson${list.length === 1 ? "" : "s"}` : done === list.length ? "Finished" : `${done} of ${list.length} done`}</span>
                </button>
              );
            }) : line.soon?.map(c => <span key={c} className="book soon"><span className="gnum">AP</span><b>{c.replace("AP ", "")}</b><span className="bcount">Coming soon</span></span>)}
          </div>
        </div>
      ))}
    </div>
  );
}
