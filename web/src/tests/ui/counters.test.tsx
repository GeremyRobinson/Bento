// Early problems show their numbers as counters under the math, like the current app: blocks for 2-digit adding.
import { render } from "@testing-library/react";
import { ProblemView } from "../../components/practice/ProblemView";
import { lessonById } from "../../curriculum/registry";

describe("counters under the problem", () => {
  it("draws 47 + 38 as 4 rods and 7 cubes, then 3 rods and 8 cubes", () => {
    const l = lessonById("g2-regroup")!;
    const { container } = render(<ProblemView lessonId="g2-regroup" problem={l.restore({ a: 47, b: 38 })} story={false} />);
    const groups = [...container.querySelectorAll(".bb")];
    expect(groups.map(g => g.getAttribute("aria-label"))).toEqual(["4 tens and 7 ones", "3 tens and 8 ones"]);
    expect(groups[0]!.querySelectorAll(".rod")).toHaveLength(4);
    expect(groups[1]!.querySelectorAll(".cube")).toHaveLength(8);
  });
});
