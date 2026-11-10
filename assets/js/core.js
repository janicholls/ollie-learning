/* Ollie Learning – core helpers shared by every page.
   Plain scripts (no modules, no build step) so the site also works when opened straight from disk. */
(function () {
  'use strict';
  const OL = (window.OL = window.OL || {});
  OL.topics = {};
  OL.vizDefs = {};
  OL.G = 9.81; // acceleration of free fall, as in the OCR data booklet

  OL.registerTopic = function (id, topic) { OL.topics[id] = topic; };
  OL.defineViz = function (id, def) { OL.vizDefs[id] = def; };

  /* DOM helper: el('div', {class:'x'}, child, 'text', ...) */
  OL.el = function (tag, attrs) {
    const n = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'html') n.innerHTML = v;
      else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? '' : v);
    }
    for (let i = 2; i < arguments.length; i++) {
      const c = arguments[i];
      if (c == null || c === false) continue;
      n.append(c.nodeType ? c : document.createTextNode(String(c)));
    }
    return n;
  };

  /* Maths markup. m('v^2 = u^2 + 2as') -> italic variables, superscripts, subscripts.
     ^x or ^{..} superscript, _x or _{..} subscript (upright), "text" upright words, - becomes a minus sign. */
  OL.m = function (src) {
    let out = '', i = 0;
    const it = (c) => (/[A-Za-z]/.test(c) ? '<i>' + c + '</i>' : c);
    const group = () => {
      if (src[i] === '{') { const j = src.indexOf('}', i); const s = src.slice(i + 1, j); i = j + 1; return s; }
      return src[i++];
    };
    while (i < src.length) {
      const c = src[i];
      if (c === '"') { const j = src.indexOf('"', i + 1); out += src.slice(i + 1, j); i = j + 1; }
      else if (c === '^') { i++; out += '<sup>' + Array.from(group()).map((x) => (x === '-' ? '−' : it(x))).join('') + '</sup>'; }
      else if (c === '_') { i++; out += '<sub>' + group() + '</sub>'; }
      else if (c === '-') { out += '−'; i++; }
      else { out += it(c); i++; }
    }
    return '<span class="mth">' + out + '</span>';
  };

  /* Round to n significant figures and return a plain decimal string. */
  OL.sf = function (x, n) {
    n = n || 3;
    if (!isFinite(x)) return '–';
    if (x === 0) return '0';
    const r = Number(x.toPrecision(n));
    const p = Math.floor(Math.log10(Math.abs(r)));
    return r.toFixed(Math.max(0, n - 1 - p));
  };

  /* Small seedable random number generator (mulberry32) so quizzes can be re-run and tested. */
  OL.rng = function (seed) {
    let a = seed >>> 0;
    const next = function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    return {
      next: next,
      pick: function (arr) { return arr[Math.floor(next() * arr.length)]; },
      shuffle: function (arr) {
        const a2 = arr.slice();
        for (let i = a2.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); const t = a2[i]; a2[i] = a2[j]; a2[j] = t; }
        return a2;
      }
    };
  };

  /* Progress, saved in this browser only. Every access is guarded: the site must work without storage. */
  const KEY = 'ollie-learning.v1';
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); return true; } catch (e) { return false; } }
  OL.store = {
    all: load,
    get: function (id) { return load()[id] || {}; },
    patch: function (id, obj) { const d = load(); d[id] = Object.assign({}, d[id], obj); return save(d); }
  };

  /* Small SVG graph for quiz questions.
     o: { x1, y1, xstep, ystep, xl, yl, pts:[[x,y],...], numbers:true|false } */
  OL.figGraph = function (o) {
    const W = 440, H = 250, L = 46, R = 16, T = 26, B = 40;
    const pw = W - L - R, ph = H - T - B;
    const X = (v) => L + (v / o.x1) * pw, Y = (v) => T + ph - (v / o.y1) * ph;
    let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + (o.alt || 'Graph') + '" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="11">';
    for (let v = 0; v <= o.x1 + 1e-9; v += o.xstep) {
      s += '<line x1="' + X(v) + '" y1="' + T + '" x2="' + X(v) + '" y2="' + (T + ph) + '" stroke="#24324f"/>';
      if (o.numbers !== false) s += '<text x="' + X(v) + '" y="' + (T + ph + 15) + '" fill="#9fb0c9" text-anchor="middle">' + +v.toFixed(2) + '</text>';
    }
    for (let v = 0; v <= o.y1 + 1e-9; v += o.ystep) {
      s += '<line x1="' + L + '" y1="' + Y(v) + '" x2="' + (L + pw) + '" y2="' + Y(v) + '" stroke="#24324f"/>';
      if (o.numbers !== false) s += '<text x="' + (L - 7) + '" y="' + (Y(v) + 4) + '" fill="#9fb0c9" text-anchor="end">' + +v.toFixed(2) + '</text>';
    }
    s += '<path d="M' + L + ' ' + T + 'V' + (T + ph) + 'H' + (L + pw) + '" fill="none" stroke="#8a9bb8" stroke-width="1.5"/>';
    s += '<text x="' + L + '" y="' + (T - 9) + '" fill="#dbe6f6">' + o.yl + '</text>';
    s += '<text x="' + (L + pw) + '" y="' + (H - 8) + '" fill="#dbe6f6" text-anchor="end">' + o.xl + '</text>';
    s += '<polyline points="' + o.pts.map((p) => X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1)).join(' ') + '" fill="none" stroke="#67e8f9" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>';
    return s + '</svg>';
  };
})();
