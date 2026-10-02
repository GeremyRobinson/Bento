import type { MathText } from "../../../curriculum/schemas/math-text";

/** A short chain of math lines, each following from the one above (the current app's "steps" pictures). */
export interface ChainDiagram {
  kind: "chain";
  lines: { math: MathText; /** beat the line appears at */ from: number }[];
  alt: string;
}
