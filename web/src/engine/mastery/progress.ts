import type { Level } from "./levels";
import type { PracticeSession } from "../session/types";

export interface ScoreRecord {
  last: Level;
  best: Level;
  pct: number;
  date: number;
  /** a 4 earned at the final-answer-only tier */
  mastered: boolean;
}

export interface LogEntry {
  key: string;
  mode: PracticeSession["mode"];
  title: string;
  date: number;
  level: Level;
  total: number;
  hints: number;
  shown: number;
  /** mistake kind → count */
  cats: Record<string, number>;
  rushed: number;
}

/** Everything saved on this device, apart from the per-run reports (stored separately). */
export interface Progress {
  version: 1;
  grade: number | null;
  /** a grade was picked on purpose (first run shows the welcome page until then) */
  chosen: boolean;
  xp: number;
  /** XP earned per grade, for the grade badge ring */
  gxp: Record<number, number>;
  streak: number;
  /** toDateString() of the last practice day */
  last: string;
  /** lessons finished, all time */
  done: number;
  /** lesson id → times finished */
  lessons: Record<string, number>;
  scores: Record<string, ScoreRecord>;
  tests: Record<string, ScoreRecord>;
  log: LogEntry[];
  /** lesson id → last time practiced (for daily review spacing) */
  seen: Record<string, number>;
  /** toDateString() → review level */
  reviews: Record<string, Level>;
  /** the run in progress, so leaving mid-lesson loses nothing */
  run: PracticeSession | null;
  /** grades whose opening page has been shown */
  intros: number[];
}

export const emptyProgress = (): Progress => ({
  version: 1, grade: null, chosen: false, xp: 0, gxp: {}, streak: 0, last: "", done: 0,
  lessons: {}, scores: {}, tests: {}, log: [], seen: {}, reviews: {}, run: null, intros: [],
});

export const lastScore = (p: Progress, id: string) => p.scores[id]?.last ?? null;
export const timesDone = (p: Progress, id: string) => p.lessons[id] ?? 0;
