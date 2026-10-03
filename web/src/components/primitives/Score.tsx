import { LEVEL_XP, LEVELS, type Level } from "../../engine/mastery/levels";
import { gradeOf, tintStyle } from "../../curriculum/grades";
import type { CSSProperties } from "react";

export function ScoreChip({ n, words = false }: { n: Level | null | undefined; words?: boolean }) {
  if (n == null) return null;
  return <span className={`score s${n}`} title={`${n}: ${LEVELS[n]}`}><b>{n}</b>{words && <span>{LEVELS[n]}</span>}</span>;
}

/** Progress ring; frac is 0–1. */
export function RingSvg({ frac, r = 24 }: { frac: number; r?: number }) {
  const c = r + 2;
  return (
    <svg viewBox={`0 0 ${2 * r + 4} ${2 * r + 4}`} aria-hidden="true">
      <circle className="trk" cx={c} cy={c} r={r} />
      {frac > 0 && <circle className="val" cx={c} cy={c} r={r} pathLength={1} style={{ strokeDasharray: 1, strokeDashoffset: (1 - frac).toFixed(3) }} />}
    </svg>
  );
}

export function BigRing({ frac, label, small = false }: { frac: number; label: string | number; small?: boolean }) {
  return (
    <div className={`ring${small ? " sm" : ""}`}>
      <svg viewBox="0 0 92 92" aria-hidden="true">
        <circle className="trk" cx="46" cy="46" r="40" />
        <circle className="val" cx="46" cy="46" r="40" pathLength={1} style={{ strokeDasharray: 1, strokeDashoffset: (1 - frac).toFixed(3) }} />
      </svg>
      <b>{label}</b>
    </div>
  );
}

export const gradeLevel = (gxp: number) => ({ lvl: Math.floor(gxp / LEVEL_XP) + 1, into: gxp % LEVEL_XP });

export function GradeBadge({ grade, gxp }: { grade: number; gxp: number }) {
  const g = gradeOf(grade), { into } = gradeLevel(gxp);
  return <span className="gbadge" style={tintStyle(g) as CSSProperties}><RingSvg frac={into / LEVEL_XP} /><b>{g.short}</b></span>;
}
