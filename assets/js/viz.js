/* Ollie Learning – visualisation kit.
   Each visualisation is a definition object registered with OL.defineViz(id, def) and mounted with OL.mountViz(host, id).

   def = {
     title, hint,                      // heading and one-line instruction
     height: number | (width) => px,   // canvas height
     controls: [{k,label,min,max,step,val,fmt}],   // sliders -> params p[k]
     toggles:  [{k,label,val}],                    // checkboxes -> params p[k]
     buttons:  [{label, fn(api)}],                 // extra buttons
     player: true|false,               // play / scrub bar (default true)
     model(p, st) -> m                 // recomputed when a parameter changes; m.T = timeline length in seconds
     rate(m) -> sim seconds per real second (default 1)
     startAt(m) -> initial timeline position (default 0)
     draw(g, W, H, p, m, t, st)        // paint one frame
     readouts(p, m, t, st) -> [[label, value], ...]
     note(p, m, t, st) -> html string
     onEnd(api)                        // called when playback reaches the end
   }
   Nothing plays until the student presses Play, so the page stays calm and works with reduced-motion settings. */
(function () {
  'use strict';
  const OL = window.OL, el = OL.el;

  const C = (OL.C = {
    bg: '#0b1322', grid: '#1c2942', axis: '#5d6f8f', text: '#c6d4ea', dim: '#7f91ad',
    cyan: '#67e8f9', amber: '#fbbf24', red: '#fb7185', green: '#4ade80', violet: '#a78bfa', white: '#f4f8ff',
    track: '#1f2b45', trackEdge: '#3a4a6b'
  });
  const V = (OL.V = {});
  const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

  V.clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  V.niceStep = function (range, n) {
    const raw = range / Math.max(1, n), p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p;
    return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p;
  };
  V.niceCeil = function (x) { const s = V.niceStep(x, 4); return Math.ceil(x / s - 1e-9) * s; };
  function tick(v, step) {
    const d = Math.max(0, -Math.floor(Math.log10(step) + 1e-9));
    return (Math.abs(v) < 1e-9 ? 0 : v).toFixed(d);
  }
  V.rr = function (g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r);
    g.lineTo(x + w, y + h - r); g.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r);
    g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y); g.closePath();
  };

  /* Draw axes with grid and tick labels inside rect r = {x,y,w,h}. Returns mapping functions. */
  V.axes = function (g, r, o) {
    const X = (v) => r.x + ((v - o.x0) / (o.x1 - o.x0)) * r.w;
    const Y = (v) => r.y + r.h - ((v - o.y0) / (o.y1 - o.y0)) * r.h;
    g.save();
    g.lineWidth = 1; g.font = '11px ' + FONT;
    const xs = V.niceStep(o.x1 - o.x0, Math.max(3, r.w / 80)), ys = V.niceStep(o.y1 - o.y0, Math.max(2, r.h / 30));
    g.strokeStyle = C.grid; g.fillStyle = C.dim; g.textAlign = 'center'; g.textBaseline = 'top';
    for (let v = Math.ceil(o.x0 / xs - 1e-9) * xs; v <= o.x1 + 1e-9; v += xs) {
      const px = Math.round(X(v)) + 0.5;
      g.beginPath(); g.moveTo(px, r.y); g.lineTo(px, r.y + r.h); g.stroke();
      if (!o.noXNumbers) g.fillText(tick(v, xs), px, r.y + r.h + 5);
    }
    g.textAlign = 'right'; g.textBaseline = 'middle';
    for (let v = Math.ceil(o.y0 / ys - 1e-9) * ys; v <= o.y1 + 1e-9; v += ys) {
      const py = Math.round(Y(v)) + 0.5;
      g.beginPath(); g.moveTo(r.x, py); g.lineTo(r.x + r.w, py); g.stroke();
      g.fillText(tick(v, ys), r.x - 6, py);
    }
    g.strokeStyle = C.axis;
    const zy = Math.round(Y(V.clamp(0, o.y0, o.y1))) + 0.5;
    g.beginPath(); g.moveTo(r.x + 0.5, r.y); g.lineTo(r.x + 0.5, r.y + r.h); g.moveTo(r.x, zy); g.lineTo(r.x + r.w, zy); g.stroke();
    g.fillStyle = C.text; g.font = '600 11.5px ' + FONT;
    if (o.yl) { g.textAlign = 'left'; g.textBaseline = 'bottom'; g.fillText(o.yl, r.x, r.y - 5); }
    if (o.xl) { g.textAlign = 'right'; g.textBaseline = 'top'; g.fillText(o.xl, r.x + r.w, r.y + r.h + (o.noXNumbers ? 5 : 19)); }
    g.restore();
    return { X: X, Y: Y };
  };

  V.poly = function (g, pts, color, lw, dash) {
    if (pts.length < 2) return;
    g.save();
    g.strokeStyle = color; g.lineWidth = lw || 2; g.lineJoin = 'round'; g.lineCap = 'round';
    if (dash) g.setLineDash(dash);
    g.beginPath();
    for (let i = 0; i < pts.length; i++) i ? g.lineTo(pts[i][0], pts[i][1]) : g.moveTo(pts[i][0], pts[i][1]);
    g.stroke(); g.restore();
  };
  V.line = function (g, x1, y1, x2, y2, color, lw, dash) { V.poly(g, [[x1, y1], [x2, y2]], color, lw, dash); };
  V.dot = function (g, x, y, r, color, ring) {
    g.save(); g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2);
    if (ring) { g.strokeStyle = color; g.lineWidth = 2; g.stroke(); } else { g.fillStyle = color; g.fill(); }
    g.restore();
  };
  V.arrow = function (g, x1, y1, x2, y2, color, lw) {
    const L = Math.hypot(x2 - x1, y2 - y1);
    if (L < 3) return;
    const a = Math.atan2(y2 - y1, x2 - x1), h = Math.min(10, L * 0.55);
    g.save(); g.strokeStyle = g.fillStyle = color; g.lineWidth = lw || 2.5; g.lineCap = 'round';
    g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2 - Math.cos(a) * h * 0.8, y2 - Math.sin(a) * h * 0.8); g.stroke();
    g.beginPath(); g.moveTo(x2, y2);
    g.lineTo(x2 - h * Math.cos(a - 0.42), y2 - h * Math.sin(a - 0.42));
    g.lineTo(x2 - h * Math.cos(a + 0.42), y2 - h * Math.sin(a + 0.42));
    g.closePath(); g.fill(); g.restore();
  };
  /* Text on a dark pill. o: {color, align:'left'|'center'|'right', size, bold, maxX, minX} */
  V.label = function (g, text, x, y, o) {
    o = o || {};
    const size = o.size || 12;
    g.save();
    g.font = (o.bold ? '700 ' : '500 ') + size + 'px ' + FONT;
    const w = g.measureText(text).width, pad = 6, h = size + 9;
    let bx = o.align === 'right' ? x - w - pad * 2 : o.align === 'center' ? x - w / 2 - pad : x;
    if (o.maxX != null) bx = Math.min(bx, o.maxX - w - pad * 2);
    if (o.minX != null) bx = Math.max(bx, o.minX);
    g.fillStyle = 'rgba(8,14,28,.88)'; V.rr(g, bx, y - h / 2, w + pad * 2, h, 5); g.fill();
    g.fillStyle = o.color || C.text; g.textBaseline = 'middle'; g.textAlign = 'left';
    g.fillText(text, bx + pad, y + 0.5);
    g.restore();
  };
  V.text = function (g, text, x, y, color, align, size, bold) {
    g.save(); g.font = (bold ? '700 ' : '500 ') + (size || 12) + 'px ' + FONT; g.fillStyle = color || C.text;
    g.textAlign = align || 'left'; g.textBaseline = 'middle'; g.fillText(text, x, y); g.restore();
  };

  /* ---- cars (generic shapes, no real liveries) ---- */
  function wheel(g, x, y, r) {
    g.fillStyle = '#0a0d14'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
    g.fillStyle = '#56627a'; g.beginPath(); g.arc(x, y, r * 0.42, 0, 7); g.fill();
  }
  /* Open-wheel racing car, side view, facing right. (x, y) is the point on the ground under the middle of the car. */
  V.carF1 = function (g, x, y, s, color, braking) {
    g.save(); g.translate(x, y); g.scale(s, s);
    g.fillStyle = color || C.cyan;
    g.beginPath();
    [[52, -7], [30, -11], [13, -13], [9, -18], [-4, -19], [-10, -25], [-16, -24], [-38, -13], [-44, -12], [-44, -5], [46, -5]].forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
    g.closePath(); g.fill();
    g.fillStyle = '#dbe6f6'; g.fillRect(-52, -29, 13, 4); g.fillRect(-47, -27, 3, 16);   // rear wing
    g.fillRect(46, -6, 10, 3);                                                              // front wing
    g.strokeStyle = '#0a0d14'; g.lineWidth = 2; g.beginPath(); g.moveTo(-3, -19); g.quadraticCurveTo(6, -24, 12, -14); g.stroke(); // halo
    if (braking) { g.fillStyle = '#ff3b4f'; g.fillRect(-47, -15, 4, 5); }
    wheel(g, -30, -9, 9); wheel(g, 32, -9, 9);
    g.restore();
  };
  /* Rally hatchback, side view, facing right, optionally rotated about its centre. (x, y) is the car's centre. */
  V.carRally = function (g, x, y, s, angle, color) {
    g.save(); g.translate(x, y); g.rotate(angle || 0); g.scale(s, s); g.translate(0, 18);
    g.fillStyle = color || C.cyan;
    g.beginPath();
    [[-46, -8], [-46, -21], [-39, -31], [-4, -32], [13, -22], [40, -19], [48, -14], [48, -8]].forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
    g.closePath(); g.fill();
    g.fillStyle = '#0d1a2e';
    g.beginPath(); [[-36, -28], [-6, -29], [8, -22], [-40, -22]].forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); g.fill();
    g.fillStyle = '#dbe6f6'; g.fillRect(-50, -35, 12, 3);
    wheel(g, -28, -9, 10); wheel(g, 30, -9, 10);
    g.restore();
  };
  /* Car seen from above, pointing along angle a. */
  V.carTop = function (g, x, y, a, s, color) {
    g.save(); g.translate(x, y); g.rotate(a); g.scale(s, s);
    g.fillStyle = '#0a0d14'; [[-7, -6], [-7, 3], [5, -6], [5, 3]].forEach((p) => g.fillRect(p[0], p[1], 5, 3));
    g.fillStyle = color || C.cyan; V.rr(g, -9, -3, 20, 6, 2.5); g.fill();
    g.fillStyle = '#dbe6f6'; g.fillRect(-11, -5, 2.5, 10); g.fillRect(10, -4.5, 2, 9);
    g.restore();
  };

  /* ---- mount ---- */
  OL.mountViz = function (host, id) {
    const d = OL.vizDefs[id];
    host.classList.add('viz');
    host.innerHTML = '';
    if (!d) { host.textContent = 'This visualisation could not be loaded.'; return null; }

    const p = {}, st = {};
    (d.controls || []).forEach((c) => (p[c.k] = c.val));
    (d.toggles || []).forEach((c) => (p[c.k] = c.val));
    let m = d.model(p, st);
    let t = d.startAt ? d.startAt(m) : 0;
    let playing = false, last = 0, W = 0, H = 0, raf = 0, noteHtml = null;

    host.append(el('div', { class: 'viz-head' }, el('span', { class: 'viz-tag' }, 'Interactive'), el('strong', null, d.title)));
    if (d.hint) host.append(el('p', { class: 'viz-hint' }, d.hint));
    const cv = el('canvas', { role: 'img', 'aria-label': d.title + '. The values are repeated in text below the picture.' });
    const wrap = el('div', { class: 'viz-canvas' }, cv);
    host.append(wrap);
    const g = cv.getContext('2d');

    const api = {
      p: p, st: st,
      get m() { return m; },
      get t() { return t; },
      setT: function (v) { t = V.clamp(v, 0, m.T || 0); draw(); },
      play: function () { if (t >= (m.T || 0) - 1e-6) t = 0; setPlaying(true); },
      stop: function () { setPlaying(false); },
      remodel: function () { m = d.model(p, st); t = V.clamp(t, 0, m.T || 0); draw(); },
      redraw: function () { draw(); }
    };

    // player
    let playBtn = null, scrub = null;
    if (d.player !== false) {
      playBtn = el('button', { class: 'btn small', type: 'button', onclick: function () { playing ? api.stop() : api.play(); } }, '▶ Play');
      scrub = el('input', { type: 'range', min: 0, max: 1000, value: 0, 'aria-label': 'Time', oninput: function () { setPlaying(false); t = (scrub.value / 1000) * (m.T || 0); draw(true); } });
      host.append(el('div', { class: 'viz-player' }, playBtn, scrub));
    }
    // sliders
    if (d.controls && d.controls.length) {
      const box = el('div', { class: 'viz-controls' });
      d.controls.forEach(function (c) {
        const out = el('output', null, c.fmt ? c.fmt(c.val) : String(c.val));
        const inp = el('input', { type: 'range', min: c.min, max: c.max, step: c.step || 1, value: c.val, 'aria-label': c.label });
        inp.addEventListener('input', function () {
          const frac = m.T ? t / m.T : 0;
          p[c.k] = parseFloat(inp.value);
          out.textContent = c.fmt ? c.fmt(p[c.k]) : String(p[c.k]);
          m = d.model(p, st);
          t = d.keepTime ? V.clamp(t, 0, m.T || 0) : frac * (m.T || 0);
          draw();
        });
        box.append(el('label', { class: 'ctl' }, el('span', null, c.label), out, inp));
      });
      host.append(box);
    }
    if (d.toggles && d.toggles.length) {
      const box = el('div', { class: 'viz-toggles' });
      d.toggles.forEach(function (c) {
        const inp = el('input', { type: 'checkbox' });
        inp.checked = !!c.val;
        inp.addEventListener('change', function () { p[c.k] = inp.checked; if (c.onChange) c.onChange(api); m = d.model(p, st); t = V.clamp(t, 0, m.T || 0); draw(); });
        box.append(el('label', null, inp, c.label));
      });
      host.append(box);
    }
    if (d.buttons && d.buttons.length) {
      const box = el('div', { class: 'viz-buttons' });
      d.buttons.forEach(function (b) { box.append(el('button', { class: 'btn small' + (b.ghost ? ' ghost' : ''), type: 'button', onclick: function () { b.fn(api); } }, b.label)); });
      host.append(box);
    }
    // readouts + note
    const tiles = [];
    const readBox = el('div', { class: 'viz-read' });
    if (d.readouts) {
      d.readouts(p, m, t, st).forEach(function (r) {
        const b = el('b', null, r[1]);
        tiles.push(b);
        readBox.append(el('div', { class: 'tile' }, el('span', null, r[0]), b));
      });
      host.append(readBox);
    }
    const note = el('p', { class: 'viz-note', 'aria-live': 'off' });
    if (d.note) host.append(note);

    function setPlaying(on) {
      playing = on;
      if (playBtn) playBtn.textContent = on ? '❚❚ Pause' : '▶ Play';
      cancelAnimationFrame(raf);
      if (on) { last = 0; raf = requestAnimationFrame(frame); }
    }
    function frame(now) {
      if (!playing) return;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      t += dt * (d.rate ? d.rate(m) : 1);
      if (t >= (m.T || 0)) {
        t = m.T || 0; setPlaying(false); draw();
        if (d.onEnd) d.onEnd(api);
        return;
      }
      draw();
      raf = requestAnimationFrame(frame);
    }
    function draw(fromScrub) {
      if (!W) return;
      g.clearRect(0, 0, W, H);
      d.draw(g, W, H, p, m, t, st);
      if (d.readouts) d.readouts(p, m, t, st).forEach(function (r, i) { if (tiles[i] && tiles[i].textContent !== r[1]) tiles[i].textContent = r[1]; });
      if (d.note) { const h = d.note(p, m, t, st); if (h !== noteHtml) { noteHtml = h; note.innerHTML = h; } }
      if (scrub && !fromScrub) scrub.value = m.T ? Math.round((t / m.T) * 1000) : 0;
    }
    function fit() {
      const w = wrap.clientWidth;
      if (!w) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = w; H = typeof d.height === 'function' ? d.height(W) : d.height;
      cv.style.height = H + 'px';
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }
    if (window.ResizeObserver) new ResizeObserver(fit).observe(wrap); else window.addEventListener('resize', fit);
    fit();
    return api;
  };
})();
