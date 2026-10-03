import { useEffect, useRef } from "react";
import { LINES } from "../curriculum/grades";

/** A small moving picture for each Advanced course, drawn in thin light lines on the dark canvas. */
function CoursePic({ id }: { id: string }) {
  switch (id) {
    case "AP Precalculus": // a point travelling the unit circle, its height traced as a sine wave
      return (
        <svg viewBox="0 0 200 110" aria-hidden="true">
          <circle cx="50" cy="55" r="36" className="adv-faint" />
          <line x1="8" y1="55" x2="192" y2="55" className="adv-faint" />
          <path d="M100 55 C 112 19, 128 19, 140 55 S 168 91, 180 55" className="adv-line adv-draw" />
          <g className="adv-spin" style={{ transformOrigin: "50px 55px" }}>
            <line x1="50" y1="55" x2="86" y2="55" className="adv-line" />
            <circle cx="86" cy="55" r="4" className="adv-dot" />
          </g>
        </svg>
      );
    case "AP Calculus AB": // the area under a curve filling in
      return (
        <svg viewBox="0 0 200 110" aria-hidden="true">
          <defs><clipPath id="adv-under"><path d="M20 96 C 60 96, 70 20, 110 30 S 160 70, 184 40 L184 96 Z" /></clipPath></defs>
          <rect x="20" y="10" width="164" height="86" className="adv-fill adv-sweep" clipPath="url(#adv-under)" />
          <path d="M20 96 C 60 96, 70 20, 110 30 S 160 70, 184 40" className="adv-line adv-draw" />
          <line x1="20" y1="96" x2="184" y2="96" className="adv-faint" />
        </svg>
      );
    case "AP Calculus BC": // ½ + ¼ + ⅛ + … closing in on 1
      return (
        <svg viewBox="0 0 200 110" aria-hidden="true">
          <line x1="20" y1="22" x2="184" y2="22" className="adv-faint adv-dash" />
          {[0.5, 0.75, 0.875, 0.9375, 0.96875, 0.984].map((v, i) => (
            <rect key={i} x={24 + i * 27} y={96 - v * 74} width="18" height={v * 74} rx="4" className="adv-fill adv-grow" style={{ animationDelay: `${i * 0.18}s` }} />
          ))}
        </svg>
      );
    default: // AP Statistics: a bell curve settling over its bars
      return (
        <svg viewBox="0 0 200 110" aria-hidden="true">
          {[6, 14, 30, 52, 70, 52, 30, 14, 6].map((h, i) => (
            <rect key={i} x={23 + i * 17.5} y={96 - h} width="13" height={h} rx="3" className="adv-fill adv-grow" style={{ animationDelay: `${Math.abs(i - 4) * 0.12}s` }} />
          ))}
          <path d="M14 94 C 60 94, 74 22, 100 22 S 140 94, 186 94" className="adv-line adv-draw" />
        </svg>
      );
  }
}

/** Bento Advanced on the landing page: the AP courses, introduced like a pro product line. Not in the grade picker. */
export function Advanced() {
  const line = LINES.find(l => l.id === "ap")!;
  // the pictures wait until the section is on screen, then draw themselves once
  const box = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { el.classList.add("in"); return; }
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { el.classList.add("in"); io.disconnect(); } }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <section className="ladv" ref={box} aria-labelledby="adv-title">
      <span className="adv-eyebrow">{line.name}</span>
      <h2 id="adv-title">Go further.</h2>
      <p>AP Precalculus, Calculus AB and BC, and Statistics. The same calm, step-by-step Bento, built for college-level math and the exam at the end of it.</p>
      <div className="adv-courses">
        {line.soon?.map((c, k) => (
          <article key={c} className="adv-course" style={{ animationDelay: `${k * 0.08}s` }}>
            <CoursePic id={c} />
            <h3>{c.replace("AP ", "")}</h3>
            <span>AP</span>
          </article>
        ))}
      </div>
      <span className="adv-soon">Coming soon</span>
    </section>
  );
}
