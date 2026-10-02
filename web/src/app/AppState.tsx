import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createRng, randomSeed, type Rng } from "../curriculum/generators/rng";
import { emptyProgress, type Progress } from "../engine/mastery/progress";
import { finishRun, startPractice, type Deps } from "../engine/session/practice";
import type { PracticeSession, SessionReport } from "../engine/session/types";
import { makeBackup, readBackup } from "../persistence/backup";
import { loadAll } from "../persistence/load";
import type { Store } from "../persistence/db";
import { parseRoute, routeHash, type Route } from "./routes";

export interface AppData {
  progress: Progress;
  reports: Record<string, SessionReport>;
}

interface AppState extends AppData {
  route: Route;
  /** the report of the run that just finished, for the results screen */
  lastReport: SessionReport | null;
  sheetOpen: boolean;
  go(route: Route): void;
  openSheet(open: boolean): void;
  chooseGrade(grade: number): void;
  startLesson(lessonId: string): void;
  /** apply one engine step to the run in progress */
  act(step: (s: PracticeSession, progress: Progress, deps: Deps) => PracticeSession | null): void;
  finish(): void;
  exportBackup(): string;
  importBackup(json: string): Promise<void>;
  deps(): Deps;
}

const Ctx = createContext<AppState | null>(null);

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp outside AppProvider");
  return v;
}

const SAVE_DELAY_MS = 250;

/**
 * Loads saved data (IndexedDB, or the current app's localStorage save on the first run),
 * holds it in React state, and writes changes back shortly after they happen.
 * Tests pass `initial` and `now`/`rng` to skip storage and control time and randomness.
 */
export function AppProvider(props: { children: ReactNode; initial?: AppData; store?: Store | null; now?: () => number; rng?: Rng }) {
  const [data, setData] = useState<AppData | null>(props.initial ?? null);
  const [route, setRoute] = useState<Route>(() => parseRoute(typeof location === "undefined" ? "" : location.hash));
  const [lastReport, setLastReport] = useState<SessionReport | null>(null);
  const [sheetOpen, openSheet] = useState(false);
  const store = useRef<Store | null>(props.store ?? null);
  const rng = useRef<Rng>(props.rng ?? createRng(randomSeed()));
  const now = props.now ?? Date.now;

  useEffect(() => {
    if (props.initial) return;
    let live = true;
    loadAll().then(r => {
      if (!live) return;
      store.current = r.store;
      setData({ progress: r.progress, reports: r.reports });
    });
    return () => { live = false; };
  }, [props.initial]);

  // save shortly after each change, and right away when the page is hidden
  const pending = useRef<Progress | null>(null);
  const flush = useCallback(() => {
    const p = pending.current;
    pending.current = null;
    if (p && store.current) void store.current.putProgress(p).catch(() => {});
  }, []);
  useEffect(() => {
    if (!data) return;
    pending.current = data.progress;
    const t = setTimeout(flush, SAVE_DELAY_MS);
    return () => clearTimeout(t);
  }, [data?.progress, flush]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const onHide = () => flush();
    addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", onHide);
    return () => { removeEventListener("pagehide", onHide); document.removeEventListener("visibilitychange", onHide); };
  }, [flush]);

  useEffect(() => {
    const onHash = () => setRoute(parseRoute(location.hash));
    addEventListener("hashchange", onHash);
    return () => removeEventListener("hashchange", onHash);
  }, []);

  const go = useCallback((r: Route) => {
    setRoute(r);
    const h = routeHash(r);
    if (location.hash !== h) history.pushState(null, "", h);
    scrollTo?.(0, 0);
  }, []);

  const deps = useCallback((): Deps => ({ now: now(), rng: rng.current }), [now]);

  const setProgress = (f: (p: Progress) => Progress) => setData(d => (d ? { ...d, progress: f(d.progress) } : d));

  const value = useMemo<AppState | null>(() => {
    if (!data) return null;
    return {
      ...data, route, lastReport, sheetOpen, go, openSheet, deps,
      chooseGrade: g => { setProgress(p => ({ ...p, grade: g, chosen: true })); openSheet(false); },
      startLesson: id => {
        setProgress(p => ({ ...p, run: startPractice(id, p, deps()) }));
        go({ name: "practice" });
      },
      act: step => setProgress(p => {
        if (!p.run) return p;
        const next = step(p.run, p, deps());
        return next ? { ...p, run: next } : p;
      }),
      finish: () => {
        const run = data.progress.run;
        if (!run) return;
        const r = finishRun(run, data.progress, now());
        setData(d => (d ? { progress: r.progress, reports: { ...d.reports, [r.report.key]: r.report } } : d));
        void store.current?.putReport(r.report).catch(() => {});
        setLastReport(r.report);
        go({ name: "results" });
      },
      exportBackup: () => JSON.stringify(makeBackup(data.progress, data.reports, now())),
      importBackup: async json => {
        const b = readBackup(json);
        await store.current?.replaceAll(b.progress, b.reports);
        setData({ progress: b.progress, reports: b.reports });
      },
    };
  }, [data, route, lastReport, sheetOpen, go, deps, now]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!value) return null;
  return <Ctx.Provider value={value}>{props.children}</Ctx.Provider>;
}

export const emptyData = (): AppData => ({ progress: emptyProgress(), reports: {} });
