/* Content checker. Run from the repo root with:  node tools/check.mjs
   It loads the same files the site uses and fails (exit code 1) if anything is wrong:
   - every live topic has a content file with concepts and at least 15 questions
   - every block and question is tagged with real specification statements
   - every specification statement is covered by a concept block and by a question
   - multiple-choice questions have four different options and a valid answer
   - calculation questions give sensible answers for many random sets of numbers,
     and each answer agrees with a second, independent calculation
   - every number quoted in the worked examples and mark schemes is recalculated */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const win = {};
win.window = win;
win.localStorage = { getItem: () => null, setItem: () => {} };
const ctx = vm.createContext(win);
const run = (f) => vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
['assets/js/core.js', 'assets/js/syllabus.js'].forEach(run);
const OL = win.OL;
OL.V = {}; OL.C = {};   // the drawing kit is not needed here

let errors = 0, notes = [];
const fail = (msg) => { errors++; console.log('  FAIL  ' + msg); };

for (const [subject, S] of Object.entries(OL.syllabus)) {
  const topics = S.modules.flatMap((m) => m.topics);
  const subs = topics.reduce((a, t) => a + t.subs.length, 0);
  console.log(`${S.spec}: ${S.modules.length} modules, ${topics.length} topics, ${subs} sub-topics, ${topics.filter((t) => t.live).length} live`);

  for (const t of topics.filter((x) => x.live)) {
    const id = subject + '/' + t.id;
    console.log(`\n${id} ${t.title}`);
    const viz = `content/${subject}/${t.id}.viz.js`;
    if (fs.existsSync(path.join(root, viz))) run(viz);
    try { run(`content/${subject}/${t.id}.js`); } catch (e) { fail('content file did not load: ' + e.message); continue; }
    const T = OL.topics[id];
    if (!T) { fail('content file did not register the topic'); continue; }
    const stm = Object.keys(T.statements);
    const blocks = T.sections.flatMap((s) => s.blocks), qs = T.quiz.questions;

    // sections match the syllabus sub-topics
    const want = t.subs.map((s) => s[0]).join(','), have = T.sections.map((s) => s.id).join(',');
    if (want !== have) fail(`sections ${have} do not match syllabus sub-topics ${want}`);

    // tags and coverage
    const used = (list) => new Set(list.flatMap((x) => x.refs));
    for (const x of [...blocks, ...qs]) for (const r of x.refs) if (!T.statements[r]) fail(`${x.id} is tagged with unknown statement ${r}`);
    const cb = used(blocks), cq = used(qs);
    for (const s of stm) { if (!cb.has(s)) fail(`statement ${s} has no concept block`); if (!cq.has(s)) fail(`statement ${s} has no question`); }
    for (const b of blocks) if (b.viz && !OL.vizDefs[b.viz]) fail(`block ${b.id} uses missing visualisation "${b.viz}"`);
    if (qs.length < 15) fail(`only ${qs.length} questions`);
    if (new Set(qs.map((q) => q.id)).size !== qs.length) fail('duplicate question ids');

    // questions
    let marks = 0;
    for (const q of qs) {
      if (q.type === 'mc') {
        marks += 1;
        if (q.options.length !== 4 || new Set(q.options).size !== 4) fail(`${q.id}: needs four different options`);
        if (!(q.answer >= 0 && q.answer < q.options.length)) fail(`${q.id}: bad answer index`);
        if (!q.why) fail(`${q.id}: no explanation`);
        if (typeof q.fig === 'function' && !q.fig().startsWith('<svg')) fail(`${q.id}: figure is not SVG`);
      } else if (q.type === 'num') {
        marks += 1;
        const seen = new Set();
        for (let seed = 1; seed <= 400; seed++) {
          const v = q.make(OL.rng(seed));
          seen.add(OL.sf(v.ans));
          if (!isFinite(v.ans) || v.ans <= 0) { fail(`${q.id}: answer ${v.ans} (seed ${seed})`); break; }
          const tol = v.checkTol || 1e-9;
          if (Math.abs(v.check - v.ans) > tol * Math.abs(v.ans)) { fail(`${q.id}: answer ${v.ans} disagrees with independent check ${v.check} (seed ${seed})`); break; }
          if (!v.sol.includes(OL.sf(v.ans))) { fail(`${q.id}: worked solution does not show the answer ${OL.sf(v.ans)} (seed ${seed})`); break; }
          if (!v.unit || !v.q) { fail(`${q.id}: missing unit or question text`); break; }
        }
        notes.push(`${q.id}: ${seen.size} different answers across 400 runs`);
      } else if (q.type === 'written') {
        marks += q.marks;
        if (q.scheme.length < q.marks) fail(`${q.id}: ${q.scheme.length} marking points for ${q.marks} marks`);
      } else fail(`${q.id}: unknown type ${q.type}`);
    }

    // quoted numbers
    for (const [label, stated, calc] of T.checks || []) {
      const real = calc(), digits = String(stated).replace(/^-?0\.0*|[-.]/g, '').length;
      const rounded = Number(real.toPrecision(Math.max(digits, 2)));
      if (Math.abs(rounded - stated) > 1e-9 * Math.max(1, Math.abs(stated))) fail(`quoted number "${label}": page says ${stated}, calculation gives ${real}`);
    }
    const kinds = (k) => qs.filter((q) => q.type === k).length;
    console.log(`  ${blocks.length} concept blocks, ${blocks.filter((b) => b.viz).length} visualisations, ${stm.length} spec statements all covered`);
    console.log(`  ${qs.length} questions: ${kinds('mc')} multiple choice, ${kinds('num')} calculation, ${kinds('written')} exam-style; ${marks} marks`);
    console.log(`  ${(T.checks || []).length} quoted numbers recalculated`);
  }
}
console.log('\n' + notes.join('\n'));
console.log(errors ? `\n${errors} problem(s) found` : '\nAll checks passed');
process.exit(errors ? 1 : 0);
