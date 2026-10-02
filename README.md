# Mathbook

A Duolingo-style math app for kindergarten through 12th grade, built for an iPad. She solves each problem one step at a time instead of on paper, and the app explains the specific mistake when a step is wrong.

## What's in it

- **Grades K–12** with a grade picker. Grades 5–12 have the full year: 115 lessons grouped into units (fractions, decimals, ratios, integers, equations, functions, geometry, trig, logs, limits, derivatives, integrals and more). K–4 have one lesson each so far. Any lesson can be picked, so she can skip ahead or go back.
- **A theme for each grade:** every grade has its own colours and background pattern, and a grade badge in the header fills with XP earned in that grade (a level every 300 XP). Tap it to switch grades. Size and tone also change by age: K–2 is the biggest, with ten frames and base-ten blocks; 9–12 is close to plain System One, with "Skip steps" for skills scored 3 or higher.
- **Explain first:** each lesson opens with idea cards and an animated picture (number lines, area models, balances, graphs, triangles and more), then a worked example revealed one step at a time with the reason for each step.
- **Smooth motion:** screens fade and slide into each other, wrong answers shake, results count up. Reduced-motion settings are respected.
- **Works upright or sideways.** Turned sideways, the iPad shows the problem and the number pad side by side.
- **Short intro cards, then 8 random problems.** The numbers change every time. Each problem with a mistake adds one more like it (up to 12), and a lesson she scored low on last time starts with 10.
- **Solve by steps:** every problem is split into the steps a teacher would want on paper. Finished steps stay on screen like written work. The number pad has a minus sign and a decimal point.
- **Mistake explanations** for the common wrong answers in each lesson, plus automatic detection of sign mix-ups, off-by-one, place value and decimal point slips, swapped digits or boxes, flipped fractions, reusing an earlier number, small arithmetic slips and quick guessing.
- **Limited hints:** about one per two problems, and only after a first try. "Show me" opens after two misses.
- **Tests and 0–4 scores:** a unit test for each unit and a grade check-up, with no hints. Lessons and tests are scored 0–4 (4 Advanced, 3 Proficient, 2 Approaching, 1 Beginning, 0 Not yet).
- **Summaries:** after each lesson or test, "What you did" lists every problem and its steps, and "For the grown-up" shows the score, mistake patterns with tips, and every mistake (what was typed and the right answer). A "For the grown-up" page on the home screen shows scores by grade, patterns across sessions, and lessons that need more practice.
- **Saved on the device:** XP, the daily streak, scores, summaries, and a lesson or test left halfway (a "Keep going" card on the home screen).

## Running it

It's a single file, `index.html`, with no build step. Open it in any browser.

To use it on the iPad, turn on GitHub Pages for this repo (Settings → Pages → deploy from the `main` branch, root folder), open the Pages link in Safari, then tap Share → Add to Home Screen. It has its own icon and opens full screen.

## Plan

See [docs/plan.md](docs/plan.md) for the K–12 curriculum map and the build order.
