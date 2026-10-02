import type { CounterGroup, Counters } from "../../curriculum/schemas/lesson";

/** Dots, ten frames and base-ten blocks, as the current app draws them under early problems. */
function Group({ g }: { g: CounterGroup }) {
  if (g.kind === "dots") return <span className="dots" aria-label={`${g.value} dots`}>{Array(g.value).fill("●").join(" ")}</span>;
  if (g.kind === "tenFrame") {
    return <span className="tf" aria-label={`${g.value} in a ten frame`}>{Array.from({ length: 10 }, (_, i) => <i key={i} className={i < g.value ? "on" : ""} />)}</span>;
  }
  const tens = Math.floor(g.value / 10), ones = g.value % 10;
  return (
    <span className="bb" aria-label={`${tens} tens and ${ones} ones`}>
      {Array.from({ length: tens }, (_, i) => <i key={`r${i}`} className="rod" />)}
      {Array.from({ length: ones }, (_, i) => <i key={`c${i}`} className="cube" />)}
    </span>
  );
}

export function CounterRow({ counters }: { counters: Counters }) {
  return (
    <div className="dotrow">
      {counters.groups.map((g, i) => <span key={i} style={{ display: "contents" }}>{i > 0 && <span>{counters.op}</span>}<Group g={g} /></span>)}
    </div>
  );
}
