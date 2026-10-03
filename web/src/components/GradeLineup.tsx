import { useApp } from "../app/AppState";
import { Shelf } from "./Shelf";

/** Every grade, grouped into Bento's lines: the same shelf as the contents. */
export function GradeLineup({ onPick }: { onPick: (grade: number) => void }) {
  const { progress } = useApp();
  return <Shelf current={progress.grade} onPick={onPick} />;
}
