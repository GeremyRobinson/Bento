// Hash routes, so the app works from any folder on GitHub Pages and offline.
export type Route =
  | { name: "home" }
  | { name: "learn"; lessonId: string }
  | { name: "practice" }
  | { name: "results" }
  | { name: "report"; key: string };

export function parseRoute(hash: string): Route {
  const parts = hash.replace(/^#\/?/, "").split("/").filter(Boolean).map(decodeURIComponent);
  switch (parts[0]) {
    case "learn": return parts[1] ? { name: "learn", lessonId: parts[1] } : { name: "home" };
    case "practice": return { name: "practice" };
    case "results": return { name: "results" };
    case "report": return parts[1] ? { name: "report", key: parts[1] } : { name: "home" };
    default: return { name: "home" };
  }
}

export function routeHash(r: Route): string {
  switch (r.name) {
    case "home": return "#/";
    case "learn": return `#/learn/${encodeURIComponent(r.lessonId)}`;
    case "practice": return "#/practice";
    case "results": return "#/results";
    case "report": return `#/report/${encodeURIComponent(r.key)}`;
  }
}
