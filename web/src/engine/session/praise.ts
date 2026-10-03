import type { Band } from "../../curriculum/grades";

export const PRAISE: Record<Band, string[]> = {
  little: ["Yes!", "That's it!", "You got it!", "Nice!", "Right!"],
  kid: ["Nice!", "Yes.", "That's it.", "You got it.", "Right."],
  middle: ["Correct.", "Right.", "Good.", "Yes.", "That's it."],
  high: ["Correct.", "Right.", "Good.", "Yes.", "✓"],
};
