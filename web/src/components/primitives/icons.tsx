// Same strokes as the current app's icons.
export const HomeIcon = () => (
  <svg viewBox="2.5 2.5 19 19" aria-hidden="true"><path d="M4 11.2 12 4.5l8 6.7M6.5 9.5V19h4v-5h3v5h4V9.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
export const Chevron = ({ dir }: { dir: "left" | "right" }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d={dir === "left" ? "M14.5 6l-6 6 6 6" : "M9.5 6l6 6-6 6"} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
