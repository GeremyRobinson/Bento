// Records the current app's behaviour for every lesson, as fixtures the rebuilt lessons are checked against.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
// usage: node web/scripts/record-legacy.cjs <path to the original index.html>  (e.g. `git show main:index.html > /tmp/main.html`)
const SRC = path.resolve(process.argv[2] || 'index.html');
const OUT = path.join(__dirname, '../src/tests/fixtures/legacy');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.addInitScript(() => { localStorage.setItem('stepmath', JSON.stringify({ grade: 5, chosen: 1, xp: 10 })); });
  await p.goto('file://' + SRC); await p.waitForTimeout(500);
  const out = await p.evaluate(() => {
    let seed = 12345;
    const rnd = () => { seed = (seed + 0x6d2b79f5) >>> 0; let t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    Math.random = rnd;
    // HTML → comparable text: fractions as (n)/(d), superscripts as ^(x), tags dropped, entities decoded
    const norm = h => { const d = document.createElement('div'); d.innerHTML = h;
      d.querySelectorAll('button.slot').forEach(s => s.replaceWith(`[${s.dataset.slot}]`));
      d.querySelectorAll('.fr').forEach(f => { const [n, dd] = f.children; f.replaceWith(`(${n ? n.textContent : ''})/(${dd ? dd.textContent : ''})`); });
      d.querySelectorAll('sup').forEach(s => s.replaceWith(`^(${s.textContent})`));
      d.querySelectorAll('sub').forEach(s => s.replaceWith(`_(${s.textContent})`));
      return d.textContent.replace(/\s+/g, ' ').trim(); };
    const nums = h => (norm(h).replace(/−/g, '-').match(/-?\d+(\.\d+)?/g) || []).map(Number);
    const res = [];
    for (const l of LESSONS) {
      const meta = { id: l.id, grade: l.grade, unit: l.unit || 'Skills', title: l.title, pre: l.pre || null, story: !!l.story,
        final: FINAL[l.id] || [-1], learn: (l.learn || []).map(c => ({ h: c.h, text: norm(c.body) })) };
      const cases = [];
      for (let i = 0; i < 5; i++) {
        const prob = l.make(i); const sh = l.show(prob); const show = norm(sh);
        const box = document.createElement('div'); box.innerHTML = sh;
        const showMath = [...box.querySelectorAll('.math')].map(e => norm(e.innerHTML)).join(' | ');
        const showNote = [...box.querySelectorAll('.note')].map(e => norm(e.innerHTML)).join(' | ');
        const showStory = [...box.querySelectorAll('.story')].map(e => norm(e.innerHTML)).join(' | ');
        const story = l.story ? { op: l.story(prob).op, text: norm(l.story(prob).text) } : null;
        const steps = l.steps(prob);
        const earlier = [];
        const recSteps = steps.map(s => {
          const ids = Object.keys(s.answer).filter(k => s.answer[k] != null), ask = s.ask();
          const base = { label: s.label.replace(/^Step \d+ · /, ''), ask: norm(ask), note: s.note ? norm(s.note) : '', answer: s.answer,
            hint: norm(s.hint), explain: norm(s.explain), work: norm(s.work()), choices: s.choices || null };
          // probe the check with likely slips: near misses, place shifts, sign, and the numbers on screen
          const seen = new Set(), probes = [];
          const add = v => { const k = JSON.stringify(v); if (!seen.has(k)) { seen.add(k); probes.push(v); } };
          const shown = [...new Set([...nums(ask), ...nums(l.show(prob)), ...earlier])].slice(0, 12);
          const vals = x => [x, x + 1, x - 1, x * 10, x / 10, -x, 0, 2 * x, x + 10, x - 10, x * x, Math.round(x / 2)];
          if (s.choices) { s.choices.forEach((_, c) => add({ c })); }
          else for (const id of ids) {
            const others = Object.fromEntries(ids.filter(k => k !== id).map(k => [k, s.answer[k]]));
            const cand = [...vals(s.answer[id]), ...shown];
            for (const a of shown) for (const c of shown) cand.push(a + c, a - c, a * c);
            for (const v of cand.slice(0, 90)) add({ ...others, [id]: v });
            if (ids.length > 1) add({ ...others, [id]: null });
          }
          if (ids.length === 2) add({ [ids[0]]: s.answer[ids[1]], [ids[1]]: s.answer[ids[0]] });
          const checks = probes.map(v => { const full = Object.fromEntries([...ids, ...(s.choices ? ['c'] : [])].map(k => [k, v[k] === undefined ? null : v[k]]));
            let r; try { r = s.check(full); } catch (e) { r = { error: String(e) }; }
            return { v: full, ok: !!r.ok, soft: !!r.soft, kind: r.kind || null, msg: r.msg ? norm(r.msg) : null, generic: !!r.generic }; });
          ids.forEach(k => earlier.push(s.answer[k]));
          // keep every specific message; generic "Not quite" results only as a sample
          let g = 0; const kept = checks.filter(c => c.ok || c.soft || !c.generic || g++ < 6);
          return { ...base, ids, checks: kept };
        });
        cases.push({ i, p: prob, show, showMath, showNote, story, steps: recSteps });
      }
      res.push({ meta, cases });
    }
    return res;
  });
  for (const l of out) fs.writeFileSync(path.join(OUT, `${l.meta.id}.json`), JSON.stringify(l));
  fs.writeFileSync(path.join(OUT, '_catalog.json'), JSON.stringify(out.map(l => l.meta), null, 1));
  console.log(out.length, 'lessons');
  await b.close();
})();
