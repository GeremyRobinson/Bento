# Mathbook

A Duolingo-style math app for kindergarten through 12th grade, built for an iPad. She solves each problem one step at a time instead of on paper, and the app explains the specific mistake when a step is wrong.

## What's in it

- **Grades K–12** with a grade picker. Each grade has a playable lesson (5th grade has three fraction lessons), plus a "Coming next" list. Any lesson can be picked, so she can skip ahead or go back.
- **Works upright or sideways.** Turned sideways, the iPad shows the problem and the number pad side by side.
- **Short intro cards, then 5 random problems.** The numbers change every time.
- **Solve by steps:** find the least common denominator, rewrite each fraction, add or subtract, simplify. Finished steps stay on screen like written work.
- **Mistake explanations** for the common wrong answers in each lesson (adding the denominators, forgetting the carried ten, squaring as times 2, and so on). After two misses, "Show me" walks through the step.
- **Saved on the device:** XP, the daily streak, finished lessons, and a lesson left halfway (a "Keep going" card on the home screen).
- **For the grown-up:** a list of which mistakes came up at the end of each lesson.

## Running it

It's a single file, `index.html`, with no build step. Open it in any browser.

To use it on the iPad, turn on GitHub Pages for this repo (Settings → Pages → deploy from the `main` branch, root folder), open the Pages link in Safari, then tap Share → Add to Home Screen.

## Plan

See [docs/plan.md](docs/plan.md) for the K–12 curriculum map and the build order.
