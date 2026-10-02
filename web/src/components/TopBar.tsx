import { useApp } from "../app/AppState";
import { gradeOf } from "../curriculum/grades";
import { LEVEL_XP } from "../engine/mastery/levels";
import { GradeBadge, gradeLevel } from "./primitives/Score";

export function TopBar() {
  const { progress, openSheet, go } = useApp();
  const g = progress.grade ?? 5, gxp = progress.gxp[g] ?? 0, { lvl, into } = gradeLevel(gxp);
  return (
    <header className="top">
      <button className="brand" onClick={() => go({ name: "home" })} aria-label="Bento home">Bento</button>
      <button className="gpick" onClick={() => openSheet(true)} aria-label="Change grade">
        <GradeBadge grade={g} gxp={gxp} />
        <span className="gtext"><b>{gradeOf(g).name}</b><small>Level {lvl} · {into}/{LEVEL_XP} XP</small></span>
      </button>
      <span className="chip" title="Days in a row"><i>🔥</i><span className="mono">{progress.streak}</span><span className="w">day{progress.streak === 1 ? "" : "s"}</span></span>
      <span className="chip" title="All XP"><i>⭐</i><span className="mono">{progress.xp}</span><span className="w">XP</span></span>
    </header>
  );
}
