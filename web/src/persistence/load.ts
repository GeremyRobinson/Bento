import { emptyProgress, type Progress } from "../engine/mastery/progress";
import { canResume } from "../engine/session/practice";
import type { SessionReport } from "../engine/session/types";
import { openDb, Store } from "./db";
import { fromLegacyReports, fromLegacySave, migrateProgress } from "./migrations";

export const LEGACY_KEYS = { save: "stepmath", reports: "stepmath-reports" } as const;

/**
 * Opens storage and returns what's saved. On the first run it imports the current app's
 * localStorage save (same site, so progress carries over), and keeps the old keys untouched.
 */
export async function loadAll(opts: { factory?: IDBFactory; storage?: Storage | null; name?: string } = {}):
  Promise<{ store: Store | null; progress: Progress; reports: Record<string, SessionReport>; imported: boolean }> {
  const storage = opts.storage === undefined ? safeLocalStorage() : opts.storage;
  let store: Store | null = null;
  try {
    store = new Store(await openDb(opts.factory ?? indexedDB, opts.name));
  } catch {
    store = null; // private browsing or storage blocked: the app still runs, nothing is saved
  }
  const saved = store ? await store.getProgress() : undefined;
  if (saved) {
    const progress = migrateProgress(saved);
    if (!canResume(progress.run)) progress.run = null;
    return { store, progress, reports: store ? await store.getReports() : {}, imported: false };
  }
  const legacy = readJson(storage, LEGACY_KEYS.save);
  if (legacy) {
    const progress = fromLegacySave(legacy);
    const reports = fromLegacyReports(readJson(storage, LEGACY_KEYS.reports) ?? (legacy as { reports?: unknown }).reports);
    if (store) {
      await store.replaceAll(progress, reports);
      await store.putMeta("importedLegacy", Date.now());
    }
    return { store, progress, reports, imported: true };
  }
  return { store, progress: emptyProgress(), reports: {}, imported: false };
}

function safeLocalStorage(): Storage | null {
  try { return typeof localStorage === "undefined" ? null : localStorage; } catch { return null; }
}

function readJson(storage: Storage | null, key: string): unknown {
  if (!storage) return null;
  try { const s = storage.getItem(key); return s ? JSON.parse(s) : null; } catch { return null; }
}
