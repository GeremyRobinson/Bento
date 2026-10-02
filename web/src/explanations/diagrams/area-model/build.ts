import { formatNumber } from "../../../curriculum/schemas/math-text";
import type { SplitMultiplicationProblem } from "../../../curriculum/lessons/grade5/split-multiplication/problem";
import { DEFAULT_AREA_LAYOUT, type AreaDiagram, type AreaLayout, type AreaRegion } from "./schema";

/** Rough width of a number label in the app's rounded number font. */
export const labelWidth = (label: string, fontSize: number) => label.length * fontSize * 0.62 + 12;

/**
 * Builds the area model for a split multiplication straight from the canonical problem.
 * One scale for both axes: the rectangle is firstFactor tall and secondFactor wide, in proportion.
 */
export function buildSplitAreaDiagram(p: SplitMultiplicationProblem, layout: AreaLayout = DEFAULT_AREA_LAYOUT): AreaDiagram {
  const { margin, maxWidth, maxHeight, labelFontSize } = layout;
  const unit = Math.min(maxWidth / p.secondFactor, maxHeight / p.firstFactor);
  const totalWidth = p.secondFactor * unit;
  const totalHeight = p.firstFactor * unit;
  const left = margin.left, top = margin.top;

  let x = left;
  const regions: AreaRegion[] = p.parts.map((part, index) => {
    const width = part * unit;
    const productLabel = formatNumber(p.partialProducts[index]!);
    const region: AreaRegion = {
      index,
      part,
      product: p.partialProducts[index]!,
      x,
      y: top,
      width,
      height: totalHeight,
      widthFraction: part / p.secondFactor,
      partLabel: formatNumber(part),
      productLabel,
      labelPlacement: width >= labelWidth(productLabel, labelFontSize) ? "inside" : "below",
      equation: { factors: [p.firstFactor, part], product: p.partialProducts[index]! },
    };
    x += width;
    return region;
  });

  return {
    kind: "areaModel",
    width: left + totalWidth + margin.right,
    height: top + totalHeight + margin.bottom,
    unit,
    vertical: { factor: "first", value: p.firstFactor, label: formatNumber(p.firstFactor), start: top, length: totalHeight },
    horizontal: { factor: "second", value: p.secondFactor, label: formatNumber(p.secondFactor), start: left, length: totalWidth },
    regions,
    splits: regions.slice(1).map(r => r.x),
    total: { terms: [...p.partialProducts], value: p.product },
  };
}
