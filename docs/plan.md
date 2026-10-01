# Step-by-Step Math: plan

A Duolingo-style math app for kindergarten through 12th grade, built around solving problems one step at a time instead of on paper. Her starting point is 5th grade; a grade picker on the home screen switches grades.

## 1. Platform: start as a web app, not Python or Swift

| Option | Runs on iPad? | What you need | Verdict |
|---|---|---|---|
| **Web app (HTML + JavaScript)** | Yes, in Safari. "Add to Home Screen" makes it look like an app | Any computer, or nothing at all | **Start here** |
| Swift / SwiftUI native app | Yes, best feel | A Mac with Xcode, an Apple developer account ($99/yr) or re-installing every 7 days with a free account | Good later, if the web version proves itself |
| Python | Not really. Python doesn't run as an iPad app without workarounds | A computer | Good for generating worksheets, not for the app she taps on |

Why web first: it runs on the iPad today, you can change a problem and she sees it on reload, and the same code works on a laptop or phone. Randomized problems are just as easy in JavaScript as in Python. If you later want a "real" App Store-style app, the lesson design and problem logic carry straight over to Swift.

## 2. Structure: units, lessons, steps (the Duolingo part)

- **Grades K–12**, picked on the home screen. Each grade's units follow its standards (map below).
- Each unit has **3–5 short lessons** (5–10 minutes).
- Each lesson = **a short "learn" intro** (2–3 cards with a picture) **then 5–8 practice problems**.
- **Every lesson is open**, so she can skip ahead or go back. A lesson she struggled with can come back as review later.
- Rewards kids like without punishing mistakes: XP per problem, a bonus for no-mistake problems, a daily streak. (Skip Duolingo's "hearts". Losing lives for wrong answers teaches kids to fear mistakes, and mistakes are where the explaining happens.)

### Curriculum map, K–12

✅ = playable now. The rest show as "Coming next" in the app.

| Grade | Playable now | Coming next |
|---|---|---|
| K | ✅ Adding within 10 (count on) | Counting to 100, comparing numbers, subtracting within 10, shapes |
| 1 | ✅ Make a ten to add | Place value, subtracting within 20, telling time, measuring length |
| 2 | ✅ Adding with regrouping | Subtracting with regrouping, skip counting, money, time to 5 minutes |
| 3 | ✅ Multiply by breaking apart | Division facts, fractions on a number line, area, rounding |
| 4 | ✅ Multiply big numbers (partial products) | Long division, equivalent fractions, decimals, angles |
| 5 | ✅ Adding fractions, ✅ subtracting fractions, ✅ mixed | Mixed numbers, multiplying fractions, decimals, volume, coordinate plane |
| 6 | ✅ Dividing fractions | Ratios and rates, percents, negative numbers, area of triangles |
| 7 | ✅ Two-step equations | Proportions, integers, circles, probability |
| 8 | ✅ Pythagorean theorem | Slope, systems of equations, exponent rules, volume of cones and spheres |
| 9 · Algebra 1 | ✅ Factoring quadratics | Slope-intercept form, systems, exponent rules, quadratic formula |
| 10 · Geometry | ✅ Distance between points | Similar triangles, trig ratios, area of circles, proofs |
| 11 · Algebra 2 | ✅ Arithmetic sequences | Logarithms, complex numbers, polynomial division, geometric sequences |
| 12 · Precalc & Calculus | ✅ Derivatives: power rule | Unit circle, limits, chain rule, integrals |

Adding a lesson means writing three things: a problem generator, its steps (each with the right answer and the common wrong ones), and one or two intro cards. The step engine, number pad, saving and mistake summary are shared.

## 3. Randomized problems

Each lesson has a **problem generator**, not a fixed list. It picks numbers inside rules that keep the problem fair:

- Fractions: denominators 2–12, a common denominator no bigger than 24, numerators already in lowest terms.
- Start easy (one denominator is a multiple of the other), then mix.
- Because the generator knows the numbers, it also knows the right answer for every step, so it can check her work step by step.

## 4. "Show your work" as solve-by-steps

Every problem type is broken into the same steps a teacher would want on paper. She fills in one step at a time; the finished steps stay on screen like written work.

Example, adding fractions:

1. Find the least common denominator.
2. Rewrite the first fraction.
3. Rewrite the second fraction.
4. Add the numerators (the denominator stays the same).
5. Simplify, or write as a mixed number.

Use a **big on-screen number pad** instead of the iPad keyboard. It's faster for a kid and nothing pops up over the problem.

## 5. Explaining mistakes

The key idea: **check each step against the common wrong answers**, not just "right or wrong". Each common mistake has its own explanation. Examples the prototype already catches:

| She enters… | Likely misconception | What the app says |
|---|---|---|
| 4 + 6 = 10 as the common denominator | Adding denominators | "The bottom number is the size of the pieces. We need a number both 4 and 6 go into." |
| 24 for 4 and 6 | Common multiple, not the least | "24 works, but there's a smaller one." |
| 3/4 = 3/12 | Changed the bottom only | "Whatever you multiply the bottom by, multiply the top by too." |
| 9/12 + 2/12 = 11/24 | Adding denominators after rewriting | "Same-size pieces: 9 twelfths + 2 twelfths = 11 twelfths." |
| 6/8 as final | Not simplified | "Same amount, but both numbers divide by 2." |

After two misses on one step, a **"Show me"** button walks through that step so she isn't stuck. At the end, a **"for the grown-up"** list shows which mistakes came up, so you know what to practice together.

## 6. Build order

1. ✅ Prototype: one playable lesson per grade K–12 (three for 5th grade), grade picker, lesson picker, saved progress and resume, a sideways (landscape) iPad layout, and a kid-friendly System One style.
2. Try it with her for a week. Note where she gets stuck or bored.
3. Add the rest of Unit 1 (subtracting, mixed numbers), reusing the same step engine.
4. Add Unit 2 (multi-digit multiplication with partial products as the steps).
5. Save progress across devices (needs a small backend) only if you need it; until then progress stays on the iPad.
6. Optional: move to Swift once the lessons are settled.
