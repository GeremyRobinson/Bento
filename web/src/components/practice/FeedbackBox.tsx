import { Rich } from "../primitives/MathLine";
import type { Feedback } from "../../engine/session/types";

const DOT = { good: "ok", bad: "err", hint: "busy" } as const;

/** Bento's own little celebration: a burst of short rays (bigger for a whole problem done), in place of an emoji. */
const Burst = ({ big }: { big?: boolean }) => (
  <svg className={`pop${big ? " big" : ""}`} viewBox="0 0 24 24" width={big ? 26 : 20} height={big ? 26 : 20} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
    {Array.from({ length: big ? 8 : 6 }, (_, i) => { const a = (i / (big ? 8 : 6)) * Math.PI * 2; return <line key={i} x1={12 + Math.cos(a) * 5} y1={12 + Math.sin(a) * 5} x2={12 + Math.cos(a) * 10} y2={12 + Math.sin(a) * 10} />; })}
  </svg>
);

export function FeedbackBox({ fb, enter }: { fb: Feedback; enter: boolean }) {
  return (
    <div className={`feedback fb-${fb.type}${enter ? " enter" : ""}`} role="status">
      <span className={`dot ${DOT[fb.type]}`} />
      <span>
        {fb.pop === "big" && <><Burst big /> </>}
        {fb.pop === "star" && <><Burst /> </>}
        {fb.strong && <strong><Rich text={fb.strong} /></strong>}{fb.strong && fb.text ? " " : ""}{fb.text && <Rich text={fb.text} />}
        {fb.lines?.map((l, i) => <span key={i}><br /><Rich text={l} /></span>)}
      </span>
    </div>
  );
}
