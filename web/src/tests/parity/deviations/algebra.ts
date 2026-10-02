// Intentional differences in the algebra lessons (balance, pairs and equation-chain pictures).
// tests/diagrams/algebra.test.ts still replays every recorded try for these lessons and allows only the change named here.
export const deviations: Record<string, Partial<Record<string, string>>> = {
  "g8-exp": {
    checks: "For x^(a+b) ÷ x^b the current app used −1 as a stand-in slip when (a+b) ÷ b isn't whole, so typing −1 said \"Divided the exponents\". The rebuild only names that slip when dividing the exponents really gives a whole number; −1 now gets the ordinary \"Not quite\" hint. Every other try is judged the same.",
  },
  "g11-ratexp": {
    checks: "The \"Divided by the bottom\" message showed a superscript 1/n (\"^(1/2) is a root\"); messages are plain text here, so it reads \"A power of 1/2 is a root, not dividing by 2.\" Same slip, same kind, same verdicts.",
  },
};
