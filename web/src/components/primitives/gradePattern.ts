import { gradeOf } from "../../curriculum/grades";

// A soft repeating pattern for each grade's hero, in that grade's colour (same shapes as the current app).
export function gradePattern(g: number, color?: string): string {
  const c = color ?? gradeOf(g).color, o = .16, sh = [
    `<circle cx="20" cy="24" r="10"/><circle cx="80" cy="70" r="16"/><circle cx="100" cy="16" r="6"/>`,
    `<path d="M20 30h20M30 20v20M80 80h20M90 70v20" stroke="${c}" stroke-width="5" stroke-linecap="round"/>`,
    `<path d="M0 40q15 -14 30 0t30 0t30 0t30 0M0 90q15 -14 30 0t30 0t30 0t30 0" fill="none" stroke="${c}" stroke-width="4"/>`,
    `<path d="M30 14l5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1zM90 70l4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1z"/>`,
    `<circle cx="15" cy="15" r="5"/><circle cx="45" cy="15" r="5"/><circle cx="75" cy="15" r="5"/><circle cx="105" cy="15" r="5"/><circle cx="30" cy="60" r="5"/><circle cx="60" cy="60" r="5"/><circle cx="90" cy="60" r="5"/><circle cx="15" cy="105" r="5"/><circle cx="75" cy="105" r="5"/>`,
    `<rect x="10" y="20" width="44" height="12" rx="6"/><rect x="66" y="20" width="20" height="12" rx="6"/><rect x="30" y="80" width="30" height="12" rx="6"/><rect x="70" y="80" width="40" height="12" rx="6"/>`,
    `<rect x="12" y="12" width="26" height="26" rx="6"/><rect x="72" y="62" width="34" height="34" rx="8"/>`,
    `<path d="M0 60h120M20 52v16M50 52v16M80 52v16M110 52v16" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`,
    `<path d="M0 120L60 0M60 120L120 0" stroke="${c}" stroke-width="5"/>`,
    `<path d="M10 100q30 -120 60 0M70 40q20 60 40 0" fill="none" stroke="${c}" stroke-width="4"/>`,
    `<path d="M10 50l25 -40 25 40zM70 110l25 -40 25 40z" fill="none" stroke="${c}" stroke-width="4" stroke-linejoin="round"/>`,
    `<path d="M0 110C40 110 70 90 120 10" fill="none" stroke="${c}" stroke-width="4"/><circle cx="30" cy="30" r="6"/>`,
    `<path d="M0 60q15 -30 30 0t30 0t30 0t30 0" fill="none" stroke="${c}" stroke-width="3"/>`,
  ][g];
  return `url('data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" fill="${c}" fill-opacity="${o}" stroke-opacity="${o}">${sh}</svg>`)}')`;
}
