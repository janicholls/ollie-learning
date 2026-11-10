/* Topic page: Key concepts tab and Quiz tab. Usage: topic.html?t=3.1 (optional &s=physics) */
(function () {
  'use strict';
  const OL = window.OL, el = OL.el;
  const params = new URLSearchParams(location.search);
  const subject = params.get('s') || 'physics', tid = params.get('t') || '';
  const found = OL.findTopic(subject, tid);
  const app = document.getElementById('app');
  const key = subject + '/' + tid;
  let topic = null;

  const fmtRef = (r) => r.replace(/^([\d.]+)([a-z])(\(.+\))?$/, '$1($2)$3');
  const pct = (a, b) => (b ? Math.round((100 * a) / b) : 0);

  function loadScript(src) {
    return new Promise(function (res, rej) {
      const s = document.createElement('script');
      s.src = src; s.onload = res; s.onerror = function () { rej(new Error('Could not load ' + src)); };
      document.head.append(s);
    });
  }

  if (!found || !found.topic.live) {
    app.append(el('p', { class: 'crumb' }, el('a', { href: 'index.html' }, '← Syllabus')),
      el('h1', null, found ? found.topic.id + ' ' + found.topic.title : 'Topic not found'),
      el('p', { class: 'lede' }, found ? 'This topic has not been written yet. It will appear here when it is ready.' : 'There is no topic with that number in the syllabus.'));
    return;
  }
  loadScript('content/' + subject + '/' + tid + '.viz.js').catch(function () {})
    .then(function () { return loadScript('content/' + subject + '/' + tid + '.js'); })
    .then(init)
    .catch(function () { app.append(el('p', { class: 'lede' }, 'Sorry, this topic could not be loaded. Check your connection and refresh the page.')); });

  /* ------------------------------------------------------------ page shell */
  let conceptsEl, quizEl, tabC, tabQ;
  function init() {
    topic = OL.topics[key];
    const T = found.topic, M = found.module;
    document.title = T.id + ' ' + T.title + ' | Ollie’s A-level Physics';
    tabC = el('button', { class: 'tab', role: 'tab', type: 'button', onclick: function () { show('concepts', true); } }, 'Key concepts');
    tabQ = el('button', { class: 'tab', role: 'tab', type: 'button', onclick: function () { show('quiz', true); } }, 'Quiz');
    conceptsEl = el('div', { role: 'tabpanel' });
    quizEl = el('div', { role: 'tabpanel' });
    app.append(
      el('p', { class: 'crumb' }, el('a', { href: 'index.html' }, '← Syllabus')),
      el('div', { class: 'tag' }, 'Module ' + M.n + ' · ' + M.title),
      el('h1', null, T.id + ' ' + T.title),
      el('p', { class: 'muted' }, found.subject.spec + ' · ' + T.subs.map(function (s) { return s[0] + ' ' + s[1]; }).join(' · ')),
      el('div', { class: 'tabs', role: 'tablist' }, tabC, tabQ), conceptsEl, quizEl);
    renderConcepts();
    quizIntro();
    show(location.hash === '#quiz' ? 'quiz' : 'concepts', false);
  }
  function show(which, push) {
    const q = which === 'quiz';
    conceptsEl.classList.toggle('hidden', q); quizEl.classList.toggle('hidden', !q);
    tabC.setAttribute('aria-selected', String(!q)); tabQ.setAttribute('aria-selected', String(q));
    if (push) { try { history.replaceState(null, '', q ? '#quiz' : location.pathname + location.search); } catch (e) { /* file:// in some browsers */ } }
  }
  function refChips(refs) {
    return el.apply(null, ['div', { class: 'refs' }].concat(refs.map(function (r) { return el('span', { class: 'ref', title: topic.statements[r] }, fmtRef(r)); })));
  }

  /* ------------------------------------------------------------ key concepts */
  function renderConcepts() {
    conceptsEl.append(el.apply(null, ['nav', { class: 'subnav', 'aria-label': 'Sub-topics' }].concat(topic.sections.map(function (s) {
      return el('a', { href: '#s-' + s.id, html: '<b>' + s.id + '</b> ' + s.title });
    }))));
    topic.sections.forEach(function (sec) {
      const s = el('section', { class: 'section' }, el('h2', { id: 's-' + sec.id, html: '<span>' + sec.id + '</span>' + sec.title }));
      sec.blocks.forEach(function (b) {
        const art = el('article', { class: 'block', id: 'b-' + b.id }, el('h3', null, b.title), refChips(b.refs));
        art.append(el('details', { class: 'spec' }, el('summary', null, 'What the specification says'),
          el.apply(null, ['ul', null].concat(b.refs.map(function (r) { return el('li', null, fmtRef(r) + ' ' + topic.statements[r]); })))));
        art.append(el('div', { html: b.html }));
        if (b.viz) { const v = el('div'); art.append(v); OL.mountViz(v, b.viz); }
        if (b.example) art.append(el('div', { class: 'example', html: '<h4>Worked example</h4>' + b.example }));
        if (b.traps && b.traps.length) art.append(el('div', { class: 'traps', html: '<h4>Watch out</h4><ul>' + b.traps.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul>' }));
        s.append(art);
      });
      conceptsEl.append(s);
    });
    const cb = el('input', { type: 'checkbox' });
    cb.checked = !!OL.store.get(key).read;
    cb.addEventListener('change', function () { OL.store.patch(key, { read: cb.checked }); });
    conceptsEl.append(el('div', { class: 'done-bar' }, el('label', null, cb, 'I have worked through these key concepts'),
      el('button', { class: 'btn', type: 'button', onclick: function () { show('quiz', true); window.scrollTo(0, 0); } }, 'Take the quiz →')));
  }

  /* ------------------------------------------------------------ quiz */
  let items = [], idx = 0, R = null;
  const KIND = { mc: 'Multiple choice', num: 'Calculation', written: 'Exam-style, you mark it' };

  function quizIntro() {
    const rec = OL.store.get(key), n = topic.quiz.questions.length;
    quizEl.innerHTML = '';
    quizEl.append(el('div', { class: 'quiz-panel' },
      el('h2', { style: 'margin-top:0' }, n + ' questions on ' + found.topic.id + ' ' + found.topic.title),
      el('p', null, topic.quiz.intro),
      rec.attempts ? el('p', { class: 'muted' }, 'Attempts so far: ' + rec.attempts + '. Best score ' + rec.best + '%, last score ' + rec.last + '%.') : null,
      el('p', { class: 'muted' }, 'The numbers in the calculation questions change every time you take the quiz.'),
      el('button', { class: 'btn', type: 'button', onclick: start }, 'Start quiz →')));
  }
  function build(q) {
    if (q.type === 'mc') {
      const order = R.shuffle(q.options.map(function (_, k) { return k; }));
      return { q: q, type: 'mc', text: q.q, fig: typeof q.fig === 'function' ? q.fig() : q.fig, options: order.map(function (k) { return q.options[k]; }), correct: order.indexOf(q.answer), max: 1 };
    }
    if (q.type === 'num') { const v = q.make(R); return { q: q, type: 'num', text: v.q, fig: v.fig, ans: v.ans, unit: v.unit, sol: v.sol, max: 1 }; }
    return { q: q, type: 'written', text: q.q, max: q.marks };
  }
  function start() {
    R = OL.rng((Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0);
    items = topic.quiz.questions.map(build);
    idx = 0;
    renderQ();
    window.scrollTo(0, 0);
  }
  function parseNum(s) {
    s = String(s).trim().replace(/,/g, '').replace(/\s+/g, '').replace(/−/g, '-').replace(/[×x*]10\^?\(?([+-]?\d+)\)?/i, 'e$1');
    return /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(s) ? parseFloat(s) : NaN;
  }

  function renderQ() {
    const it = items[idx], n = items.length;
    const got = items.slice(0, idx).reduce(function (a, x) { return a + (x.score || 0); }, 0);
    quizEl.innerHTML = '';
    quizEl.append(el('div', { class: 'quiz-top' }, el('span', null, 'Question ' + (idx + 1) + ' of ' + n), el('span', null, 'Marks so far: ' + got)),
      el('div', { class: 'progress' }, el('div', { style: 'width:' + (idx / n) * 100 + '%' })));
    const panel = el('section', { class: 'quiz-panel' });
    panel.append(el('div', { class: 'q-meta' }, el('span', { class: 'q-kind' }, KIND[it.type] + ' · ' + it.max + (it.max === 1 ? ' mark' : ' marks')), refChips(it.q.refs)));
    panel.append(el('div', { class: 'q-text', html: it.text }));
    if (it.fig) panel.append(el('div', { class: 'q-fig', html: it.fig }));
    const fb = el('div', { 'aria-live': 'polite' });
    const actions = el('div', { class: 'q-actions' });
    const nextBtn = el('button', { class: 'btn', type: 'button', onclick: function () { idx++; idx < n ? renderQ() : results(); window.scrollTo(0, 0); } }, idx === n - 1 ? 'See results →' : 'Next question →');
    const feedback = function (ok, title, body) { fb.innerHTML = ''; fb.append(el('div', { class: 'feedback ' + (ok ? 'ok' : 'no'), html: '<h4>' + title + '</h4>' + body })); };

    if (it.type === 'mc') {
      let chosen = -1;
      const check = el('button', { class: 'btn', type: 'button', disabled: true }, 'Check answer');
      const btns = it.options.map(function (o, k) {
        const b = el('button', { class: 'opt', type: 'button', html: '<b>' + 'ABCD'[k] + '.</b> ' + o });
        b.addEventListener('click', function () { chosen = k; btns.forEach(function (x) { x.classList.remove('sel'); }); b.classList.add('sel'); check.disabled = false; });
        panel.append(b);
        return b;
      });
      check.addEventListener('click', function () {
        const ok = chosen === it.correct;
        it.score = ok ? 1 : 0; it.given = it.options[chosen]; it.right = it.options[it.correct];
        btns.forEach(function (b, k) { b.disabled = true; if (k === it.correct) b.classList.add('right'); else if (k === chosen) b.classList.add('wrong'); });
        feedback(ok, ok ? '✓ Correct' : '✗ Not this time', '<p>' + it.q.why + '</p>');
        check.replaceWith(nextBtn); nextBtn.focus();
      });
      actions.append(check);
    } else if (it.type === 'num') {
      const inp = el('input', { type: 'text', inputmode: 'decimal', autocomplete: 'off', 'aria-label': 'Your answer in ' + it.unit });
      const check = el('button', { class: 'btn', type: 'button' }, 'Check answer');
      const warn = el('span', { class: 'muted' });
      panel.append(el('div', { class: 'num-row' }, inp, el('span', { class: 'unit' }, it.unit)), el('p', { class: 'muted' }, 'Give your answer to 3 significant figures.'));
      const mark = function () {
        const x = parseNum(inp.value);
        if (isNaN(x)) { warn.textContent = 'Type your answer as a number first.'; return; }
        const ok = Math.abs(x - it.ans) <= 0.011 * Math.abs(it.ans);
        it.score = ok ? 1 : 0; it.given = inp.value.trim() + ' ' + it.unit; it.right = OL.sf(it.ans) + ' ' + it.unit;
        inp.disabled = true; warn.textContent = '';
        feedback(ok, ok ? '✓ Correct' : '✗ The answer is ' + it.right, '<p>' + it.sol + '</p>');
        check.replaceWith(nextBtn); nextBtn.focus();
      };
      check.addEventListener('click', mark);
      // preventDefault stops the same key press from also activating the Next button once it takes focus
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !inp.disabled) { e.preventDefault(); mark(); } });
      actions.append(check, warn);
    } else {
      const ta = el('textarea', { 'aria-label': 'Your answer', placeholder: 'Write your answer here or on paper, then reveal the mark scheme.' });
      const reveal = el('button', { class: 'btn', type: 'button' }, 'Show mark scheme');
      panel.append(el('div', { class: 'written' }, ta));
      reveal.addEventListener('click', function () {
        const count = el('b', null, '0');
        const list = el('ul', { class: 'scheme' });
        const upd = function () {
          const ticked = list.querySelectorAll('input:checked').length;
          it.score = Math.min(it.max, ticked); count.textContent = String(it.score);
        };
        it.q.scheme.forEach(function (pt, k) {
          const id = 'mk' + idx + '_' + k, cb = el('input', { type: 'checkbox', id: id });
          cb.addEventListener('change', upd);
          list.append(el('li', null, cb, el('label', { for: id }, pt)));
        });
        it.score = 0; it.given = ta.value.trim();
        fb.innerHTML = '';
        fb.append(el('div', { class: 'feedback' }, el('h4', null, 'Mark scheme: tick each point you made'), list,
          el('p', null, 'Marks awarded: ', count, ' / ' + it.max), it.q.tip ? el('p', { class: 'muted' }, 'Examiner tip: ' + it.q.tip) : null));
        reveal.replaceWith(nextBtn);
      });
      actions.append(reveal);
    }
    panel.append(fb, actions);
    quizEl.append(panel);
  }

  function results() {
    const sum = function (arr, f) { return arr.reduce(function (a, x) { return a + f(x); }, 0); };
    const got = sum(items, function (x) { return x.score || 0; }), max = sum(items, function (x) { return x.max; }), score = pct(got, max);
    const rec = OL.store.get(key);
    const saved = OL.store.patch(key, { last: score, best: Math.max(score, rec.best || 0), attempts: (rec.attempts || 0) + 1, when: new Date().toISOString().slice(0, 10) });
    const groups = [];
    const add = function (label, list) { if (list.length) groups.push([label, sum(list, function (x) { return x.score || 0; }), sum(list, function (x) { return x.max; })]); };
    add('Marked for you', items.filter(function (x) { return x.type !== 'written'; }));
    add('Exam-style', items.filter(function (x) { return x.type === 'written'; }));
    topic.sections.forEach(function (s) { add(s.id + ' ' + s.title, items.filter(function (x) { return x.q.refs[0].indexOf(s.id) === 0; })); });

    quizEl.innerHTML = '';
    const panel = el('div', { class: 'quiz-panel' });
    panel.append(el('div', { class: 'tag' }, 'Result'), el('div', { class: 'score-big' }, score + '%'), el('p', null, got + ' of ' + max + ' marks. ' +
      (score >= 85 ? 'Excellent. You have this topic under control.' : score >= 65 ? 'A solid run. Look at the bars below to see where the marks went.' : 'This one needs another look. Go back through the key concepts for the weakest bar below, then try again.')));
    if (!saved) panel.append(el('p', { class: 'muted' }, 'Your score could not be saved in this browser.'));
    const bars = el('div', { class: 'bars' });
    groups.forEach(function (gp) {
      bars.append(el('div', { class: 'bar-row' }, el('span', null, gp[0]), el('div', { class: 'track' }, el('div', { style: 'width:' + pct(gp[1], gp[2]) + '%' })), el('span', { class: 'num' }, gp[1] + ' / ' + gp[2])));
    });
    panel.append(bars);
    panel.append(el('div', { class: 'q-actions' },
      el('button', { class: 'btn', type: 'button', onclick: start }, 'Try again with new numbers ↻'),
      el('button', { class: 'btn ghost', type: 'button', onclick: function () { quizIntro(); show('concepts', true); window.scrollTo(0, 0); } }, 'Back to key concepts'),
      el('a', { class: 'btn ghost', href: 'index.html' }, 'Syllabus')));
    panel.append(el('h3', { style: 'margin-top:26px' }, 'Question review'));
    items.forEach(function (it, k) {
      const d = el('details', { class: 'review' }, el('summary', null, (it.score === it.max ? '✓ ' : it.score ? '◐ ' : '✗ ') + 'Q' + (k + 1) + ' · ' + KIND[it.type] + ' ', el('span', { class: 'mark' }, (it.score || 0) + ' / ' + it.max)));
      d.append(el('div', { class: 'q-text', style: 'font-size:16px;margin-top:10px', html: it.text }));
      if (it.fig) d.append(el('div', { class: 'q-fig', html: it.fig }));
      if (it.type === 'written') {
        if (it.given) d.append(el('p', null, 'Your answer: ' + it.given));
        d.append(el('ul', { html: it.q.scheme.map(function (s) { return '<li>' + s + '</li>'; }).join('') }));
      } else {
        d.append(el('p', { html: 'Your answer: ' + (it.given || '–') + '<br>Correct answer: ' + it.right }), el('p', { html: it.type === 'mc' ? it.q.why : it.sol }));
      }
      panel.append(d);
    });
    quizEl.append(panel);
  }
})();
