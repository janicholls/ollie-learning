/* Home page: the whole syllabus with progress for each topic. */
(function () {
  'use strict';
  const OL = window.OL, el = OL.el;
  const subject = 'physics', S = OL.syllabus[subject];
  const all = OL.store.all();
  let total = 0, live = 0, read = 0, taken = 0, bestSum = 0;

  const host = document.getElementById('syllabus');
  S.modules.forEach(function (mod) {
    const grid = el('div', { class: 'topics' });
    mod.topics.forEach(function (t) {
      total++;
      const rec = all[subject + '/' + t.id] || {};
      let pill;
      if (!t.live) pill = el('span', { class: 'pill' }, 'Coming soon');
      else {
        live++;
        if (rec.read) read++;
        if (rec.attempts) { taken++; bestSum += rec.best || 0; pill = el('span', { class: 'pill done' }, 'Best ' + rec.best + '%'); }
        else if (rec.read) pill = el('span', { class: 'pill read' }, 'Concepts done');
        else pill = el('span', { class: 'pill new' }, 'Ready');
      }
      const body = [
        el('div', { class: 'topic-top' }, el('span', { class: 'topic-num' }, t.id), pill),
        el('h3', null, t.title),
        el.apply(null, ['ul', null].concat(t.subs.map(function (s) { return el('li', null, el('b', null, s[0]), s[1]); })))
      ];
      if (t.live) body.push(el('div', { class: 'topic-foot' }, 'Key concepts and quiz →'));
      grid.append(el.apply(null, [t.live ? 'a' : 'div', { class: 'topic ' + (t.live ? 'live' : 'soon'), href: t.live ? 'topic.html?t=' + t.id : null }].concat(body)));
    });
    host.append(el('section', { class: 'module' },
      el('div', { class: 'module-head' }, el('h2', { html: '<span>Module ' + mod.n + '</span>' + mod.title }), el('small', null, mod.papers)), grid));
  });

  const stat = function (value, label) { return el('div', { class: 'stat' }, el('b', null, value), el('span', null, label)); };
  document.getElementById('summary').append(
    stat(live + ' / ' + total, 'topics ready'),
    stat(read + ' / ' + live, 'key concepts worked through'),
    stat(taken + ' / ' + live, 'quizzes taken'),
    stat(taken ? Math.round(bestSum / taken) + '%' : '–', 'average best score'));
})();
