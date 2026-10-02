import { formatNumber, toPlainText, type MathText } from "../../curriculum/schemas/math-text";

interface Props {
  math: MathText;
  /** typed text per answer box */
  values?: Record<string, string>;
  /** the box the keypad types into */
  active?: string | null;
  onSlot?: (id: string) => void;
  className?: string;
}

/** Renders MathText. Numbers are formatted in one place; answer boxes become buttons when `onSlot` is given. */
export function MathLine({ math, values = {}, active = null, onSlot, className = "" }: Props) {
  return (
    <span className={`mline ${className}`.trim()}>
      {math.map((tok, i) => {
        switch (tok.t) {
          case "text": return <span key={i} className={tok.v === "(" ? "t lp" : tok.v === ")" ? "t rp" : "t"}>{tok.v}</span>;
          case "num": return <span key={i} className="n">{formatNumber(tok.v)}</span>;
          case "op": return <span key={i} className="o">{tok.v}</span>;
          case "answer": return <b key={i} className="ans">{formatNumber(tok.v)}</b>;
          case "slot": {
            const v = values[tok.id] ?? "", on = active === tok.id;
            return onSlot ? (
              <button key={i} type="button" className={`slot${on ? " active" : ""}`} aria-pressed={on}
                aria-label={`Answer box${v ? `, ${v}` : ", empty"}`} onClick={() => onSlot(tok.id)}>
                {v}{on && <span className="caret" aria-hidden="true" />}
              </button>
            ) : <span key={i} className="slot">{v}</span>;
          }
        }
      })}
      <span className="visually-hidden">{toPlainText(math, "blank")}</span>
    </span>
  );
}
