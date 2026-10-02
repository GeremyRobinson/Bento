import { useEffect } from "react";
import { bandOf } from "../curriculum/grades";
import { lessonById, lessonsInGrade } from "../curriculum/registry";
import { currentItem } from "../engine/session/practice";
import { GradeSheet } from "../components/GradeSheet";
import { Home } from "../screens/Home";
import { Learn } from "../screens/Learn";
import { Parent } from "../screens/Parent";
import { Practice } from "../screens/Practice";
import { ReportScreen, Results } from "../screens/Results";
import { Welcome } from "../screens/Welcome";
import { useApp } from "./AppState";
import { isTopLevel } from "./routes";
import { canCrossFade } from "./transition";

/** Picks the screen for the route and sets the grade band and tint the styles key off. */
export function App() {
  const { route, progress, reports, lastReport, sheetOpen } = useApp();
  const chosenGrade = progress.grade ?? 5;

  // the lesson whose look the screen takes: the one being learned or practiced, or the one a report is about
  let lessonId: string | null = null;
  let testGrade: number | null = null;
  if (route.name === "learn") lessonId = route.lessonId;
  else if (route.name === "practice" && progress.run) lessonId = currentItem(progress.run).lessonId;
  else if (route.name === "results" || route.name === "report") {
    const rep = route.name === "results" ? lastReport : reports[route.key];
    if (rep) {
      if (lessonById(rep.key)) lessonId = rep.key;
      else {
        const last = rep.probs[rep.probs.length - 1];
        if (last && lessonById(last.lessonId)) lessonId = last.lessonId;
        if (rep.mode === "test") testGrade = Number(rep.key.split(":")[1]);
      }
    }
  }
  const lesson = lessonId ? lessonById(lessonId) : undefined;
  const top = isTopLevel(route);
  const grade = top ? chosenGrade : testGrade ?? lesson?.grade ?? chosenGrade;
  const tint = top || !lesson ? 0 : lessonsInGrade(lesson.grade).indexOf(lesson) % 3;

  useEffect(() => {
    document.title = route.name === "learn" && lesson ? `${lesson.title} · Bento` : "Bento";
  }, [route.name, lesson]);

  let screen;
  switch (route.name) {
    case "welcome": screen = <Welcome />; break;
    case "learn": screen = lessonById(route.lessonId) ? <Learn lessonId={route.lessonId} /> : <Home />; break;
    case "practice": screen = <Practice />; break;
    case "results": screen = <Results />; break;
    case "report": screen = <ReportScreen rep={reports[route.key]} />; break;
    case "parent": screen = <Parent />; break;
    default: screen = <Home />;
  }
  // a new screen (or a new grade on a top-level screen) re-enters; with view transitions the browser cross-fades instead
  const viewKey = [route.name, route.name === "learn" ? route.lessonId : route.name === "report" ? route.key : "", top ? chosenGrade : ""].join("|");
  return (
    <main id="app" className={`wrap t${tint}${canCrossFade() ? "" : " fresh"}`} data-band={bandOf(grade)} data-grade={grade} key={viewKey}>
      {screen}
      {sheetOpen && <GradeSheet />}
    </main>
  );
}
