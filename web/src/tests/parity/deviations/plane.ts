// Coordinate plane lessons: where the rebuild intentionally differs from the current app, and why.
export const deviations: Record<string, Partial<Record<string, string>>> = {
  "g12-defint": {
    show: "For n = 1 the current app writes 6x<sup></sup> dx: an empty superscript that shows nothing. The rebuild writes plain 6x dx, which looks the same on screen; the recorded text keeps the empty ^() and so can't match. Every other problem shows the same.",
  },
};
