import type { CSSProperties } from "react";
import { useApp } from "../app/AppState";
import type { Route } from "../app/routes";
import { gradeOf } from "../curriculum/grades";
import { lessonById } from "../curriculum/registry";
import { LEVEL_XP } from "../engine/mastery/levels";
import { currentItem, lessonOfItem } from "../engine/session/practice";
import { GradeBadge, gradeLevel } from "./primitives/Score";
import { Chevron } from "./primitives/icons";

/** A simple person: a head and shoulders. */
const MeIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8.5" r="3.6" /><path d="M5 20c1.2-3.6 4-5.4 7-5.4s5.8 1.8 7 5.4" /></svg>
);

type Crumb = { label: string; to?: Route };

/** Where you are, as a short trail from the top, and which part of the app that is (lessons, learn, practice, you). */
function placeOf(route: Route, app: ReturnType<typeof useApp>): { trail: Crumb[]; lit: number | null } {
  const lessons: Crumb = { label: "Lessons", to: { name: "home" } }, me: Crumb = { label: "Me", to: { name: "me" } };
  switch (route.name) {
    case "home": return { trail: [], lit: 0 };
    case "intro": return { trail: [lessons, { label: "This year" }], lit: 0 };
    case "learn": return { trail: [lessons, { label: lessonById(route.lessonId)?.title ?? "Lesson" }], lit: 1 };
    case "practice": {
      const run = app.progress.run;
      if (!run) return { trail: [lessons], lit: 2 };
      if (run.mode !== "practice") return { trail: [lessons, { label: run.title }], lit: 2 };
      const l = lessonOfItem(currentItem(run));
      return { trail: [lessons, { label: l.title, to: { name: "learn", lessonId: l.id } }, { label: "Practice" }], lit: 2 };
    }
    case "results": return { trail: [lessons, { label: app.lastReport?.title ?? "Done" }, { label: "Done" }], lit: 2 };
    case "report": {
      const rep = app.reports[route.key], l = lessonById(route.key);
      return l
        ? { trail: [lessons, { label: l.title, to: { name: "learn", lessonId: l.id } }, { label: "Report" }], lit: 2 }
        : { trail: [me, { label: "For the grown-up", to: { name: "parent" } }, { label: rep?.title ?? "Report" }], lit: 3 };
    }
    case "parent": return { trail: [me, { label: "For the grown-up" }], lit: 3 };
    case "me": return { trail: [{ label: "Me" }], lit: 3 };
    default: return { trail: [], lit: null };
  }
}

/**
 * The one navigation bar. It sits in the same place, at the same size, on every screen: the Bento name (to the
 * front page), your grade (to change it), where you are (tap any step back), anything left unfinished, and you.
 */
export function TopBar({ grade }: { grade: number }) {
  const app = useApp();
  const { progress, openSheet, go, route } = app;
  const welcome = route.name === "welcome";
  const g = grade, gxp = progress.gxp[g] ?? 0, { lvl, into } = gradeLevel(gxp);
  const { trail, lit } = placeOf(route, app);
  const back = [...trail].reverse().find(c => c.to);
  // an unfinished lesson waits here, on every page, instead of taking over a grade's own "up next"
  const run = progress.run, runGrade = run ? gradeOf(lessonOfItem(currentItem(run)).grade) : null;
  const showResume = !!run && !!runGrade && route.name !== "practice";
  return (
    <header className={`top${showResume ? " has-resume" : ""}${welcome ? " guest" : ""}`}>
      <button className="brand" onClick={() => go({ name: "welcome" }, "back")} aria-label="Bento home page">
        <span>Bento</span>
      </button>
      {welcome ? <span className="grow" /> : <>
        <button className={`gpick${trail.length ? " slim" : ""}`} onClick={() => openSheet(true)} aria-label="Change grade">
          <GradeBadge grade={g} gxp={gxp} />
          {!trail.length && <span className="gtext"><b>{gradeOf(g).name}</b><small>Level {lvl} · {into}/{LEVEL_XP} XP</small></span>}
        </button>
        {trail.length > 0 && (
          <nav className="trail" aria-label="You are here">
            {back && <button className="tback" onClick={() => go(back.to!, "back")} aria-label={`Back to ${back.label}`}><Chevron dir="left" /></button>}
            <ol>{trail.map((c, i) => (
              <li key={i} aria-current={i === trail.length - 1 ? "page" : undefined}>
                {c.to && i < trail.length - 1 ? <button onClick={() => go(c.to!, "back")}>{c.label}</button> : <span>{c.label}</span>}
              </li>
            ))}</ol>
          </nav>
        )}
      </>}
      {showResume && (
        <button className="resume" style={{ "--rtint": runGrade!.color } as CSSProperties} onClick={() => go({ name: "practice" }, "fwd")} aria-label={`Resume ${run!.title}, ${runGrade!.name}, problem ${run!.i + 1} of ${run!.items.length}`}>
          <span className="rdot" style={{ background: runGrade!.color }}>{runGrade!.short}</span>
          <span className="rtext"><small>Resume · {runGrade!.name}</small><b>{run!.title}</b></span>
          <span className="mono rcount">{run!.i + 1}/{run!.items.length}</span>
          <span className="rshort">Resume ›</span>
        </button>
      )}
      {welcome
        ? progress.chosen
          ? <button className="lback" onClick={() => go({ name: "home" }, "fwd")}>My lessons ›</button>
          : <span className="tnote">Kindergarten to 12th grade</span>
        : (
          <button className={`mebtn${lit === 3 ? " on" : ""}`} onClick={() => go({ name: "me" }, "fwd")} aria-label={`Me: ${progress.streak} day streak, ${progress.xp} XP`}>
            <span className="mestat"><i aria-hidden>🔥</i><span className="mono">{progress.streak}</span></span>
            <span className="mestat"><i aria-hidden>⭐</i><span className="mono">{progress.xp}</span></span>
            <span className="meav" aria-hidden><MeIcon /></span>
          </button>
        )}
    </header>
  );
}
