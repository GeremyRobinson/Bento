import { useEffect } from "react";
import { bandOf } from "../curriculum/grades";
import { lessonById, lessonsInGrade } from "../curriculum/registry";
import { currentItem } from "../engine/session/practice";
import { GradeSheet } from "../components/GradeSheet";
import { Home } from "../screens/Home";
import { Learn } from "../screens/Learn";
import { Practice } from "../screens/Practice";
import { ReportScreen, Results } from "../screens/Results";
import { useApp } from "./AppState";

/** Picks the screen for the route and sets the grade band and tint the styles key off. */
export function App() {
  const { route, progress, reports, sheetOpen } = useApp();
  const lessonId = route.name === "learn" ? route.lessonId : route.name === "practice" && progress.run ? currentItem(progress.run).lessonId : null;
  const lesson = lessonId ? lessonById(lessonId) : undefined;
  const grade = lesson?.grade ?? progress.grade ?? 5;

  useEffect(() => {
    document.title = lesson ? `${lesson.title} · Bento` : "Bento";
  }, [lesson]);

  let screen;
  switch (route.name) {
    case "learn": screen = lessonById(route.lessonId) ? <Learn lessonId={route.lessonId} /> : <Home />; break;
    case "practice": screen = <Practice />; break;
    case "results": screen = <Results />; break;
    case "report": screen = <ReportScreen rep={reports[route.key]} />; break;
    default: screen = <Home />;
  }
  return (
    <main id="app" className={`wrap t${lesson ? lessonsInGrade(lesson.grade).indexOf(lesson) % 3 : 0}`} data-band={bandOf(grade)} data-grade={grade} key={route.name + (lessonId ?? "")}>
      {screen}
      {sheetOpen && <GradeSheet />}
    </main>
  );
}
