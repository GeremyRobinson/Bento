import { requireLesson } from "../../curriculum/registry";
import { MathLine, Rich } from "../primitives/MathLine";
import { CounterRow } from "./CounterRow";

/** The problem as the current app shows it: the story for word problems, otherwise the math, its counters and its note. */
export function ProblemView({ lessonId, problem, story }: { lessonId: string; problem: unknown; story: boolean }) {
  const lesson = requireLesson(lessonId);
  if (story && lesson.story) return <div className="story"><p><Rich text={lesson.story(problem).text} /></p></div>;
  const note = lesson.displayNote?.(problem), counters = lesson.displayCounters?.(problem);
  return (
    <>
      <div className="math"><MathLine math={lesson.display(problem)} /></div>
      {counters && <CounterRow counters={counters} />}
      {note && <p className="note"><Rich text={note} /></p>}
    </>
  );
}
