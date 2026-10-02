import type { Feedback } from "../../engine/session/types";

const DOT = { good: "ok", bad: "err", hint: "busy" } as const;

export function FeedbackBox({ fb, enter }: { fb: Feedback; enter: boolean }) {
  return (
    <div className={`feedback fb-${fb.type}${enter ? " enter" : ""}`} role="status">
      <span className={`dot ${DOT[fb.type]}`} />
      <span>
        {fb.pop === "big" && <><span className="pop big" aria-hidden="true">🎉</span> </>}
        {fb.pop === "star" && <><span className="pop" aria-hidden="true">⭐</span> </>}
        {fb.strong && <strong>{fb.strong}</strong>}{fb.strong && fb.text ? " " : ""}{fb.text}
        {fb.lines?.map((l, i) => <span key={i}><br />{l}</span>)}
      </span>
    </div>
  );
}
