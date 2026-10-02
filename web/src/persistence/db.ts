// Local-first storage on IndexedDB. One database, three stores:
//   progress  key "main" → Progress (scores, XP, streak, the run in progress)
//   reports   key report key → SessionReport (written when a run finishes)
//   meta      key "schema" → schema version and migration notes
import type { Progress } from "../engine/mastery/progress";
import type { SessionReport } from "../engine/session/types";

export const DB_NAME = "bento";
export const DB_VERSION = 1;
export const OPEN_TIMEOUT_MS = 2000;

function request<T>(r: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

function done(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

/** Opens the database, creating or upgrading stores. Each schema version adds its steps here. */
export function openDb(factory: IDBFactory = indexedDB, name = DB_NAME, timeoutMs = OPEN_TIMEOUT_MS): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    // some embedded or private browsers never answer; the app then runs without saving instead of waiting forever
    const timer = setTimeout(() => reject(new Error("storage did not open")), timeoutMs);
    const r = factory.open(name, DB_VERSION);
    r.onupgradeneeded = () => {
      const db = r.result;
      // version 1
      if (!db.objectStoreNames.contains("progress")) db.createObjectStore("progress");
      if (!db.objectStoreNames.contains("reports")) db.createObjectStore("reports");
      if (!db.objectStoreNames.contains("meta")) db.createObjectStore("meta");
    };
    r.onsuccess = () => { clearTimeout(timer); resolve(r.result); };
    r.onerror = () => reject(r.error);
    r.onblocked = () => reject(new Error("database upgrade blocked by another open tab"));
  });
}

export class Store {
  constructor(private db: IDBDatabase) {}

  async getProgress(): Promise<Progress | undefined> {
    return request(this.db.transaction("progress").objectStore("progress").get("main"));
  }

  async putProgress(p: Progress): Promise<void> {
    const tx = this.db.transaction("progress", "readwrite");
    tx.objectStore("progress").put(p, "main");
    return done(tx);
  }

  async getReports(): Promise<Record<string, SessionReport>> {
    const tx = this.db.transaction("reports");
    const store = tx.objectStore("reports");
    const [keys, values] = await Promise.all([request(store.getAllKeys()), request(store.getAll())]);
    return Object.fromEntries(keys.map((k, i) => [String(k), values[i] as SessionReport]));
  }

  async putReport(r: SessionReport): Promise<void> {
    const tx = this.db.transaction("reports", "readwrite");
    tx.objectStore("reports").put(r, r.key);
    return done(tx);
  }

  async getMeta<T>(key: string): Promise<T | undefined> {
    return request(this.db.transaction("meta").objectStore("meta").get(key));
  }

  async putMeta(key: string, value: unknown): Promise<void> {
    const tx = this.db.transaction("meta", "readwrite");
    tx.objectStore("meta").put(value, key);
    return done(tx);
  }

  /** Replaces everything (used by restore from a backup). */
  async replaceAll(progress: Progress, reports: Record<string, SessionReport>): Promise<void> {
    const tx = this.db.transaction(["progress", "reports"], "readwrite");
    tx.objectStore("progress").put(progress, "main");
    const rs = tx.objectStore("reports");
    rs.clear();
    for (const [k, r] of Object.entries(reports)) rs.put(r, k);
    return done(tx);
  }

  close() { this.db.close(); }
}
