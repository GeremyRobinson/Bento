import type { Band } from "../../curriculum/grades";

/** The number pad. K–2 gets no minus or decimal keys, like the current app. */
export function Keypad({ band, onKey }: { band: Band; onKey: (key: string) => void }) {
  const b = (key: string, label: string = key, extra: { className?: string; "aria-label"?: string } = {}) =>
    <button key={key} type="button" data-key={key} onClick={() => onKey(key)} {...extra}>{label}</button>;
  return (
    <div className="tray">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => b(String(n)))}
      {band === "little"
        ? [<span key="l" />, b("0"), <span key="r" />]
        : [b("−", "−", { "aria-label": "Negative" }), b("0"), b(".", ".", { "aria-label": "Decimal point" })]}
      {b("next", "Next box ⇥", { className: "wide", "aria-label": "Next box" })}
      {b("back", "⌫", { "aria-label": "Erase" })}
    </div>
  );
}
