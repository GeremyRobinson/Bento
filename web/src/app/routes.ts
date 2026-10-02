// Hash routes, so the app works from any folder on GitHub Pages and offline.
export type Route =
  | { name: "welcome" }
  | { name: "home" }
  /** the chosen grade's opening page: the year at a glance */
  | { name: "intro" }
  | { name: "learn"; lessonId: string }
  | { name: "practice" }
  | { name: "results" }
  | { name: "report"; key: string }
  | { name: "parent" };

const decode = (s: string) => { try { return decodeURIComponent(s); } catch { return s; } };

export function parseRoute(hash: string): Route {
  const parts = hash.replace(/^#\/?/, "").split("/").filter(Boolean).map(decode);
  switch (parts[0]) {
    case "welcome": return { name: "welcome" };
    case "year": return { name: "intro" };
    case "learn": return parts[1] ? { name: "learn", lessonId: parts[1] } : { name: "home" };
    case "practice": return { name: "practice" };
    case "results": return { name: "results" };
    case "report": return parts[1] ? { name: "report", key: parts[1] } : { name: "home" };
    case "grown-up": return { name: "parent" };
    default: return { name: "home" };
  }
}

export function routeHash(r: Route): string {
  switch (r.name) {
    case "welcome": return "#/welcome";
    case "home": return "#/";
    case "intro": return "#/year";
    case "learn": return `#/learn/${encodeURIComponent(r.lessonId)}`;
    case "practice": return "#/practice";
    case "results": return "#/results";
    case "report": return `#/report/${encodeURIComponent(r.key)}`;
    case "parent": return "#/grown-up";
  }
}

/** Screens that take the chosen grade's look rather than a lesson's (the current app's "home" group). */
export const isTopLevel = (r: Route) => r.name === "welcome" || r.name === "home" || r.name === "intro" || r.name === "parent";
