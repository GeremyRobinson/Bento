# Step-by-Step Math: plan

A Duolingo-style math app for a 5th grader, built around solving problems one step at a time instead of on paper.

## 1. Platform: start as a web app, not Python or Swift

| Option | Runs on iPad? | What you need | Verdict |
|---|---|---|---|
| **Web app (HTML + JavaScript)** | Yes, in Safari. "Add to Home Screen" makes it look like an app | Any computer, or nothing at all | **Start here** |
| Swift / SwiftUI native app | Yes, best feel | A Mac with Xcode, an Apple developer account ($99/yr) or re-installing every 7 days with a free account | Good later, if the web version proves itself |
| Python | Not really. Python doesn't run as an iPad app without workarounds | A computer | Good for generating worksheets, not for the app she taps on |

Why web first: it runs on the iPad today, you can change a problem and she sees it on reload, and the same code works on a laptop or phone. Randomized problems are just as easy in JavaScript as in Python. If you later want a "real" App Store-style app, the lesson design and problem logic carry straight over to Swift.

## 2. Structure: units, lessons, steps (the Duolingo part)

- **Units** follow the 5th grade standards (list below).
- Each unit has **3–5 short lessons** (5–10 minutes).
- Each lesson = **a short "learn" intro** (2–3 cards with a picture) **then 5–8 practice problems**.
- **Unlock** the next lesson when she finishes one. A lesson she struggled with comes back as review later.
- Rewards kids like without punishing mistakes: XP per problem, a bonus for no-mistake problems, a daily streak. (Skip Duolingo's "hearts". Losing lives for wrong answers teaches kids to fear mistakes, and mistakes are where the explaining happens.)

### Suggested 5th grade units

1. Adding and subtracting fractions with unlike denominators *(prototype covers lesson 1)*
2. Multiplying multi-digit whole numbers
3. Long division (up to 4-digit ÷ 2-digit)
4. Decimals: place value to thousandths, comparing, rounding
5. Adding, subtracting, multiplying, dividing decimals
6. Multiplying fractions and mixed numbers
7. Dividing with unit fractions
8. Volume of rectangular prisms
9. Order of operations and simple expressions
10. Coordinate plane and patterns

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

1. ✅ Prototype: Unit 1 lessons 1–3 (adding, subtracting, mixed) with all of the above. Every lesson is open, so she can skip ahead or go back, and each lesson's intro can be skipped. Styled as a kid-friendly System One: same pills and thin lines, but bigger text and buttons, rounder type, and one soft colour per lesson. Follows the iPad's light or dark setting automatically.
2. Try it with her for a week. Note where she gets stuck or bored.
3. Add the rest of Unit 1 (subtracting, mixed numbers), reusing the same step engine.
4. Add Unit 2 (multi-digit multiplication with partial products as the steps).
5. Save progress across devices (needs a small backend) only if you need it; until then progress stays on the iPad.
6. Optional: move to Swift once the lessons are settled.
