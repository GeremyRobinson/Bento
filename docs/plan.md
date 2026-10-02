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
- Each lesson = **a short "learn" intro** (1–3 cards) **then 8 practice problems**. Each problem with a mistake adds one more, up to 12. A lesson scored 0 or 1 last time starts with 10.
- **Every lesson is open**, so she can skip ahead or go back. A lesson she struggled with can come back as review later.
- Rewards kids like without punishing mistakes: XP per problem, a bonus for no-mistake problems, a daily streak. (Skip Duolingo's "hearts". Losing lives for wrong answers teaches kids to fear mistakes, and mistakes are where the explaining happens.)

### Curriculum map, K–12

**Grades 5–12 have the full year** (115 lessons in all), grouped into units with a unit test each:

| Grade | Units and lessons |
|---|---|
| 5th grade | **Whole numbers:** Multiply two-digit numbers, Long division, Order of operations<br>**Decimals:** Multiply by 10, 100, 1000, Rounding decimals, Adding decimals, Multiplying decimals, Dividing by a decimal<br>**Fractions:** Adding fractions, Subtracting fractions, Adding and subtracting, Multiplying fractions, Mixed numbers to fractions, Fraction of a number, Dividing by a unit fraction<br>**Measurement:** Volume of a box, Converting units |
| 6th grade | **Ratios and percents:** Equivalent ratios, Unit rates, Percent of a number, Find the whole<br>**Number system:** Dividing fractions, Factor out the GCF, Least common multiple, Distance on a number line<br>**Expressions and equations:** Exponents and order, Evaluate expressions, One-step equations<br>**Geometry:** Area of a triangle, Area of a trapezoid<br>**Statistics:** Find the mean |
| 7th grade | **Proportions and percents:** Solve a proportion, Scale drawings, Discounts, tax and tips, Percent change<br>**Integers:** Adding integers, Subtracting integers, Multiplying and dividing integers<br>**Expressions and equations:** Two-step equations, Distribute and combine<br>**Geometry:** Circumference, Area of a circle, Complementary and supplementary<br>**Probability:** Probability |
| 8th grade | **Exponents and roots:** Exponent rules, Scientific notation, Square and cube roots<br>**Linear equations:** Variables on both sides, Systems by substitution<br>**Functions and slope:** Slope from two points, Slope-intercept form, Evaluate a function<br>**Geometry:** Pythagorean theorem, Find a missing leg, Volume of a cylinder, Volume of a cone, Translations, Angles in a triangle |
| 9th grade · Algebra 1 | **Equations:** Multi-step equations, Systems by elimination<br>**Linear functions:** Line through two points<br>**Exponents:** Zero and negative exponents, Exponential growth, Simplify square roots<br>**Polynomials and quadratics:** Factoring quadratics, Add and subtract polynomials, Multiply binomials, Factor out the GCF, Solve by factoring, The quadratic formula<br>**Data:** Find the median |
| 10th grade · Geometry | **Coordinate geometry:** Midpoint, Perpendicular slopes, Distance between points, Equation of a circle<br>**Angles and triangles:** Angles in a polygon, Exterior angle, Similar triangles<br>**Right triangles and trig:** Special right triangles, Sine, cosine and tangent<br>**Circles:** Area of a sector, Arc length<br>**Area and volume:** Surface area of a box, Volume of a pyramid |
| 11th grade · Algebra 2 | **Sequences:** Arithmetic sequences, Geometric sequences<br>**Exponents and logs:** Evaluating logarithms, Exponential equations, Rational exponents<br>**Polynomials:** Evaluate a polynomial, Synthetic division<br>**Functions:** Inverse functions, Composing functions, Vertex of a parabola, Radical equations<br>**Complex numbers:** Multiplying complex numbers<br>**Probability:** Combinations |
| 12th grade · Precalc & Calculus | **Trigonometry:** Degrees to radians, Radians to degrees, Unit circle values<br>**Limits:** Limits by factoring<br>**Derivatives:** Power rule, Derivative of a polynomial, Chain rule, Slope of a tangent line<br>**Integrals:** Antiderivatives, Definite integrals<br>**Vectors and series:** Arithmetic series, Vector length, Dot product |

**K–4** have one playable lesson each so far (adding within 10, make a ten, regrouping, breaking apart, partial products). Their "Coming next" lists: K counting, comparing, subtracting, shapes; 1st place value, subtracting within 20, time, length; 2nd subtracting with regrouping, skip counting, money; 3rd division facts, fractions on a number line, area, rounding; 4th long division, equivalent fractions, decimals, angles.

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

## 6. Hints, scores, tests and reports

- **Hints are limited**: about one per two problems, and a hint opens only after a first try (or 15 seconds). "Show me" opens after two misses, or one miss after a hint.
- **Mistake recognition** beyond each step's known wrong answers: sign mix-ups, off by one, place value or decimal point, digits in the wrong order, reusing an earlier step's number, small arithmetic slips, swapped boxes, flipped fractions, and quick repeat tries that look like guessing.
- **0–4 proficiency score**, like a standards-based report card: 4 Advanced (90%+ of steps right on the first try), 3 Proficient (75%+), 2 Approaching (50%+), 1 Beginning (25%+), 0 Not yet. A step after a hint or one miss counts half; after two misses a quarter; "Show me" counts zero.
- **Tests**: a unit test for every unit (6–10 problems mixed across its lessons) and a grade check-up (12 problems). No hints, one try per step; a miss shows the answer and moves on. Scored 0–4.
- **Summaries**: after every lesson or test, "What you did" lists every problem with the finished steps, and "For the grown-up" shows the score, mistake patterns with a tip for each, and every mistake (what was typed, the right answer, what kind of slip). The last summary for each lesson opens from its intro screen.
- **For the grown-up page** (home screen): scores by grade, mistake patterns across recent sessions, hints used, guessing, lessons that need more practice, and recent sessions.

## 7. Build order

1. ✅ Prototype: grade picker, lesson picker, saved progress and resume, a sideways (landscape) iPad layout, and a kid-friendly System One style.
2. ✅ Full year for grades 5–12, unit tests and grade check-ups, 0–4 scores, limited hints, detailed mistake reports, adaptive practice length.
3. Try it with her for a week. Note where she gets stuck or bored.
4. Fill in the full year for K–4.
5. Save progress across devices (needs a small backend) only if you need it; until then progress stays on the iPad.
6. Optional: move to Swift once the lessons are settled.
