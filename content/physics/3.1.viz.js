/* Visualisations for OCR Physics A 3.1 Motion. Uses the kit in assets/js/viz.js. */
(function () {
  'use strict';
  const OL = window.OL, V = OL.V, C = OL.C, G = OL.G;
  const f0 = (x) => x.toFixed(0), f1 = (x) => x.toFixed(1), f2 = (x) => x.toFixed(2), f3 = (x) => x.toFixed(3);
  const MS = ' m s⁻¹', MS2 = ' m s⁻²';

  /* ------------------------------------------------------------------ 1. One lap: distance vs displacement */
  function buildTrack() {
    const P = [[12, 40], [10, 22], [20, 10], [38, 8], [52, 14], [60, 26], [72, 22], [84, 10], [93, 18], [90, 36], [78, 50], [60, 52], [48, 44], [36, 50], [24, 54], [15, 50]];
    const n = P.length, pts = [], SEG = 40;
    for (let i = 0; i < n; i++) {   // closed Catmull-Rom spline through the control points
      const p0 = P[(i - 1 + n) % n], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[(i + 2) % n];
      for (let k = 0; k < SEG; k++) {
        const t = k / SEG, t2 = t * t, t3 = t2 * t;
        pts.push([0, 1].map((d) => 0.5 * (2 * p1[d] + (-p0[d] + p2[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t3)));
      }
    }
    const N = pts.length, seg = [];
    let len = 0;
    for (let i = 0; i < N; i++) { const a = pts[i], b = pts[(i + 1) % N]; seg.push(Math.hypot(b[0] - a[0], b[1] - a[1])); len += seg[i]; }
    const L = 5000, k = L / len;   // a 5.0 km lap; k = metres per drawing unit
    const head = pts.map((a, i) => { const b = pts[(i + 1) % N]; return Math.atan2(b[1] - a[1], b[0] - a[0]); });
    let kap = head.map((h, i) => { let d = head[(i + 1) % N] - h; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return Math.abs(d) / (seg[i] * k); });
    kap = kap.map((_, i) => { let s = 0; for (let j = -4; j <= 4; j++) s += kap[(i + j + N) % N]; return s / 9; });
    // simple lap simulation: cornering grip limit, then braking and acceleration limits
    const VMAX = 85, ALAT = 13, ACC = 8, BRK = 30;
    const v = kap.map((c) => Math.min(VMAX, Math.sqrt(ALAT / Math.max(c, 1e-6))));
    for (let pass = 0; pass < 3; pass++) {
      for (let i = N - 1; i >= 0; i--) { const nx = (i + 1) % N; v[i] = Math.min(v[i], Math.sqrt(v[nx] * v[nx] + 2 * BRK * seg[i] * k)); }
      for (let i = 0; i < N; i++) { const pv = (i - 1 + N) % N; v[i] = Math.min(v[i], Math.sqrt(v[pv] * v[pv] + 2 * ACC * seg[pv] * k)); }
    }
    const T = [0], S = [0];
    for (let i = 0; i < N; i++) { const ds = seg[i] * k; T.push(T[i] + ds / ((v[i] + v[(i + 1) % N]) / 2)); S.push(S[i] + ds); }
    const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
    return { pts: pts, N: N, k: k, v: v, Tt: T, S: S, head: head, T: T[N], L: L, box: [Math.min.apply(0, xs), Math.max.apply(0, xs), Math.min.apply(0, ys), Math.max.apply(0, ys)] };
  }
  let TRACK = null;
  function lapAt(m, t) {
    let lo = 0, hi = m.N;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (m.Tt[mid] <= t) lo = mid; else hi = mid; }
    const i = Math.min(lo, m.N - 1), f = V.clamp((t - m.Tt[i]) / (m.Tt[i + 1] - m.Tt[i]), 0, 1), a = m.pts[i], b = m.pts[(i + 1) % m.N];
    const pos = [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
    return { i: i, pos: pos, s: m.S[i] + f * (m.S[i + 1] - m.S[i]), v: m.v[i] + f * (m.v[(i + 1) % m.N] - m.v[i]), ang: m.head[i], disp: Math.hypot(pos[0] - m.pts[0][0], pos[1] - m.pts[0][1]) * m.k };
  }
  OL.defineViz('lap', {
    title: 'One lap: distance against displacement',
    hint: 'Press Play, or drag the slider, and watch the two numbers part company. The amber arrow is the displacement.',
    height: (W) => Math.round(Math.min(W * 0.6, 310)) + 156,
    model: () => TRACK || (TRACK = buildTrack()),
    rate: (m) => m.T / 11,
    startAt: (m) => m.T * 0.43,
    draw: function (g, W, H, p, m, t) {
      const th = H - 156, b = m.box, bw = b[1] - b[0], bh = b[3] - b[2];
      const sc = Math.min((W - 44) / bw, (th - 34) / bh), ox = (W - bw * sc) / 2 - b[0] * sc, oy = (th - bh * sc) / 2 - b[2] * sc + 6;
      const P = (q) => [ox + q[0] * sc, oy + q[1] * sc];
      const c = lapAt(m, t), all = m.pts.map(P);
      all.push(all[0]);
      V.poly(g, all, C.trackEdge, Math.max(9, sc * 2.6) + 3);
      V.poly(g, all, C.track, Math.max(9, sc * 2.6));
      const s0 = P(m.pts[0]), a0 = m.head[0] + Math.PI / 2, hw = Math.max(6, sc * 1.6);
      V.line(g, s0[0] - Math.cos(a0) * hw, s0[1] - Math.sin(a0) * hw, s0[0] + Math.cos(a0) * hw, s0[1] + Math.sin(a0) * hw, C.white, 3);
      V.text(g, 'START / FINISH', s0[0] + 14, s0[1] + 2, C.dim, 'left', 10.5, true);
      const here = P(c.pos), done = all.slice(0, c.i + 1);
      done.push(here);
      V.poly(g, done, C.cyan, 2.5);
      if (c.disp > 20 && t < m.T - 0.01) {
        V.arrow(g, s0[0], s0[1], here[0], here[1], C.amber, 2.5);
        V.label(g, f0(c.disp) + ' m', (s0[0] + here[0]) / 2, (s0[1] + here[1]) / 2 - 12, { color: C.amber, align: 'center', bold: true, minX: 2, maxX: W - 2 });
      }
      V.carTop(g, here[0], here[1], c.ang, Math.max(1, sc * 0.26), C.cyan);
      // speed trace
      const r = { x: 46, y: th + 30, w: W - 62, h: 156 - 30 - 40 };
      const ax = V.axes(g, r, { x0: 0, x1: m.T, y0: 0, y1: 100, yl: 'speed / m s⁻¹', xl: 't / s' });
      const tr = [], lit = [];
      for (let i = 0; i <= m.N; i += 3) { const q = [ax.X(m.Tt[i]), ax.Y(m.v[i % m.N])]; tr.push(q); if (m.Tt[i] <= t) lit.push(q); }
      lit.push([ax.X(t), ax.Y(c.v)]);
      V.poly(g, tr, '#33425f', 1.5);
      V.poly(g, lit, C.cyan, 2);
      if (t > 1) {
        const avg = c.s / t;
        V.line(g, r.x, ax.Y(avg), ax.X(t), ax.Y(avg), C.green, 1.5, [5, 4]);
        V.text(g, '– –  average speed so far', r.x + r.w, r.y - 11, C.green, 'right', 11, true);
      }
      V.dot(g, ax.X(t), ax.Y(c.v), 4, C.white);
    },
    readouts: function (p, m, t) {
      const c = lapAt(m, t), end = t >= m.T - 0.01, disp = end ? 0 : c.disp;
      return [['Time', f1(t) + ' s'], ['Distance travelled', f0(c.s) + ' m'], ['Displacement from start', f0(disp) + ' m'],
        ['Speed right now', f1(c.v) + MS], ['Average speed', t > 0.2 ? f1(c.s / t) + MS : '–'], ['Average velocity (size)', t > 0.2 ? f1(disp / t) + MS : '–']];
    },
    note: function (p, m, t) {
      return t >= m.T - 0.01
        ? '<b>Lap complete.</b> The car is back where it started, so its displacement is zero and its average velocity for the lap is zero, even though its average speed was ' + f1(m.L / m.T) + MS + '.'
        : 'Distance is how far the tyres have rolled, so it only ever goes up. Displacement is the straight line from the start to the car, with a direction.';
    }
  });

  /* ------------------------------------------------------------------ 2. Motion graphs */
  OL.defineViz('graphs', {
    title: 'Three graphs of one run',
    hint: 'A car accelerates, holds top speed for 2 s, then brakes to a stop. Drag the time slider and read the gradients and the area.',
    height: (W) => (W < 560 ? 540 : 580),
    controls: [
      { k: 'a1', label: 'Acceleration', min: 4, max: 14, step: 0.5, val: 10, fmt: (v) => f1(v) + MS2 },
      { k: 'vm', label: 'Top speed', min: 30, max: 90, step: 5, val: 80, fmt: (v) => v + MS + ' (' + f0(v * 3.6) + ' km/h)' },
      { k: 'a3', label: 'Braking deceleration', min: 10, max: 50, step: 1, val: 40, fmt: (v) => v + MS2 }
    ],
    model: function (p) {
      const t1 = p.vm / p.a1, t2 = 2, t3 = p.vm / p.a3, s1 = 0.5 * p.a1 * t1 * t1, s2 = p.vm * t2;
      const m = { t1: t1, t2: t2, t3: t3, T: t1 + t2 + t3, sTot: s1 + s2 + (p.vm * p.vm) / (2 * p.a3) };
      m.a = (t) => (t < t1 ? p.a1 : t < t1 + t2 ? 0 : -p.a3);
      m.v = (t) => (t < t1 ? p.a1 * t : t < t1 + t2 ? p.vm : Math.max(0, p.vm - p.a3 * (t - t1 - t2)));
      m.s = (t) => { if (t < t1) return 0.5 * p.a1 * t * t; if (t < t1 + t2) return s1 + p.vm * (t - t1); const q = Math.min(t - t1 - t2, t3); return s1 + s2 + p.vm * q - 0.5 * p.a3 * q * q; };
      return m;
    },
    rate: (m) => m.T / 8,
    startAt: (m) => m.t1 * 0.62,
    draw: function (g, W, H, p, m, t) {
      const L = 48, R = 14, pw = W - L - R;
      // the straight
      g.fillStyle = C.track; V.rr(g, L, 36, pw, 34, 6); g.fill();
      for (let i = 0; i <= 10; i++) V.line(g, L + (pw * i) / 10, 65, L + (pw * i) / 10, 70, C.trackEdge, 1);
      V.carF1(g, L + 46 + (m.s(t) / m.sTot) * (pw - 92), 66, 0.8, C.cyan, m.a(t) < 0 && t < m.T);
      V.label(g, f0(m.v(t)) + MS, L + 46 + (m.s(t) / m.sTot) * (pw - 92), 16, { color: C.white, align: 'center', bold: true, minX: L, maxX: W - R });
      // graphs
      const top = 108, gap = 36, gh = (H - top - 40 - 2 * gap) / 3;
      const rs = [0, 1, 2].map((i) => ({ x: L, y: top + i * (gh + gap), w: pw, h: gh }));
      const a0 = -Math.ceil((p.a3 * 1.1) / 10) * 10, a1 = Math.ceil((p.a1 * 1.25) / 5) * 5;
      const A = V.axes(g, rs[0], { x0: 0, x1: m.T, y0: 0, y1: V.niceCeil(m.sTot), yl: 'displacement s / m', noXNumbers: true });
      const B = V.axes(g, rs[1], { x0: 0, x1: m.T, y0: 0, y1: V.niceCeil(p.vm * 1.12), yl: 'velocity v / m s⁻¹', noXNumbers: true });
      const D = V.axes(g, rs[2], { x0: 0, x1: m.T, y0: a0, y1: a1, yl: 'acceleration a / m s⁻²', xl: 't / s' });
      const sAll = [], sLit = [], n = 160;
      for (let i = 0; i <= n; i++) { const tt = (m.T * i) / n, q = [A.X(tt), A.Y(m.s(tt))]; sAll.push(q); if (tt <= t) sLit.push(q); }
      sLit.push([A.X(t), A.Y(m.s(t))]);
      const kn = [0, m.t1, m.t1 + m.t2, m.T];
      const vAll = kn.map((tt) => [B.X(tt), B.Y(m.v(tt))]);
      const vLit = kn.filter((tt) => tt < t).map((tt) => [B.X(tt), B.Y(m.v(tt))]);
      vLit.push([B.X(t), B.Y(m.v(t))]);
      // area under v-t
      g.save(); g.fillStyle = 'rgba(103,232,249,.17)'; g.beginPath(); g.moveTo(B.X(0), B.Y(0));
      vLit.forEach((q) => g.lineTo(q[0], q[1])); g.lineTo(B.X(t), B.Y(0)); g.closePath(); g.fill(); g.restore();
      const aSteps = [[0, p.a1], [m.t1, p.a1], [m.t1, 0], [m.t1 + m.t2, 0], [m.t1 + m.t2, -p.a3], [m.T, -p.a3]];
      const aAll = aSteps.map((q) => [D.X(q[0]), D.Y(q[1])]);
      const aLit = aSteps.filter((q) => q[0] <= t).map((q) => [D.X(q[0]), D.Y(q[1])]);
      aLit.push([D.X(t), D.Y(m.a(Math.min(t, m.T - 1e-6)))]);
      V.poly(g, sAll, '#33425f', 2); V.poly(g, vAll, '#33425f', 2); V.poly(g, aAll, '#33425f', 2);
      V.poly(g, sLit, C.cyan, 2.6); V.poly(g, vLit, C.cyan, 2.6); V.poly(g, aLit, C.violet, 2.6);
      // cursor
      V.line(g, A.X(t), rs[0].y, A.X(t), rs[2].y + rs[2].h, 'rgba(244,248,255,.35)', 1, [4, 4]);
      // tangent on s-t
      const dt = m.T * 0.13, v = m.v(Math.min(t, m.T - 1e-6)), s = m.s(t);
      g.save(); g.beginPath(); g.rect(rs[0].x, rs[0].y, rs[0].w, rs[0].h); g.clip();
      V.line(g, A.X(t - dt), A.Y(s - v * dt), A.X(t + dt), A.Y(s + v * dt), C.amber, 2);
      g.restore();
      V.dot(g, A.X(t), A.Y(s), 4.5, C.white); V.dot(g, B.X(t), B.Y(m.v(t)), 4.5, C.white); V.dot(g, D.X(t), D.Y(m.a(Math.min(t, m.T - 1e-6))), 4.5, C.white);
      const right = t < m.T * 0.55;
      V.label(g, 'gradient of tangent = v = ' + f1(v) + MS, right ? rs[0].x + rs[0].w - 6 : rs[0].x + 8, rs[0].y + (right ? rs[0].h - 14 : 14), { color: C.amber, align: right ? 'right' : 'left', bold: true });
      V.label(g, 'shaded area = s = ' + f0(s) + ' m', right ? rs[1].x + rs[1].w - 6 : rs[1].x + 8, rs[1].y + rs[1].h - 14, { color: C.cyan, align: right ? 'right' : 'left', bold: true });
      V.label(g, 'gradient of v–t = a = ' + f1(m.a(Math.min(t, m.T - 1e-6))) + MS2, rs[2].x + rs[2].w - 6, rs[2].y + 13, { color: C.violet, align: 'right', bold: true });
    },
    readouts: (p, m, t) => [['Time t', f2(t) + ' s'], ['Displacement s', f0(m.s(t)) + ' m'], ['Velocity v', f1(m.v(t)) + MS], ['Acceleration a', f1(m.a(Math.min(t, m.T - 1e-6))) + MS2]],
    note: function (p, m, t) {
      if (t < m.t1) return '<b>Accelerating.</b> The s–t graph curves upwards (its gradient keeps growing) and the v–t graph is a straight line whose gradient is the acceleration.';
      if (t < m.t1 + m.t2) return '<b>Constant velocity.</b> The s–t graph is a straight line, the v–t graph is flat and the acceleration is zero.';
      return '<b>Braking.</b> The s–t graph is still rising but flattening off, and the v–t graph slopes down: a negative gradient means a negative acceleration.';
    }
  });

  /* ------------------------------------------------------------------ 3. Braking zone (suvat) */
  OL.defineViz('braking', {
    title: 'Braking zone explorer',
    hint: 'Set the speed on the straight, the speed the corner allows and how hard the car can brake. The red zone is the braking distance.',
    height: 356,
    controls: [
      { k: 'u', label: 'Speed on the straight, u', min: 40, max: 95, step: 1, val: 88, fmt: (v) => v + MS + ' (' + f0(v * 3.6) + ' km/h)' },
      { k: 'v', label: 'Corner speed, v', min: 15, max: 60, step: 1, val: 25, fmt: (v) => v + MS + ' (' + f0(v * 3.6) + ' km/h)' },
      { k: 'a', label: 'Deceleration', min: 5, max: 50, step: 1, val: 45, fmt: (v) => v + MS2 + ' (' + f1(v / G) + ' g)' }
    ],
    model: function (p) {
      const need = p.u > p.v, s = need ? (p.u * p.u - p.v * p.v) / (2 * p.a) : 0, tb = need ? (p.u - p.v) / p.a : 0;
      const view = Math.max(250, Math.ceil((s + 40) / 50) * 50), t0 = (view - s) / p.u;
      return { need: need, s: s, tb: tb, view: view, t0: t0, T: t0 + tb };
    },
    rate: (m) => m.T / 6,
    startAt: (m) => m.t0 + m.tb * 0.45,
    draw: function (g, W, H, p, m, t) {
      const cy = 128, xl = 0, xr = W - 78, r = 58;
      const X = (d) => xr - (d / m.view) * (xr - xl - 10);
      const road = (w, col) => { g.save(); g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(0, cy); g.lineTo(xr, cy); g.arc(xr, cy - r, r, Math.PI / 2, 0, true); g.lineTo(xr + r, 0); g.stroke(); g.restore(); };
      road(48, C.trackEdge); road(44, C.track);
      if (m.need) {
        const gr = g.createLinearGradient(X(m.s), 0, xr, 0);
        gr.addColorStop(0, 'rgba(251,113,133,.50)'); gr.addColorStop(1, 'rgba(251,113,133,.12)');
        g.fillStyle = gr; g.fillRect(X(m.s), cy - 22, xr - X(m.s), 44);
        V.line(g, X(m.s), cy - 30, X(m.s), cy + 30, C.red, 2);
        V.label(g, 'brake here: ' + f1(m.s) + ' m before the corner', X(m.s), cy + 46, { color: C.red, align: 'center', bold: true, minX: 4, maxX: W - 4 });
      }
      for (let d = 50; d < m.view; d += 50) {
        const x = X(d);
        g.fillStyle = '#e2e8f0'; V.rr(g, x - 15, cy - 56, 30, 17, 3); g.fill();
        V.text(g, String(d), x, cy - 47, '#0a1020', 'center', 11, true);
        V.line(g, x, cy - 39, x, cy - 24, '#8a9bb8', 1.5);
      }
      V.text(g, 'distance to the corner / m', 6, cy - 72, C.dim, 'left', 11);
      let d, v, braking = false;
      if (t < m.t0) { d = m.view - p.u * t; v = p.u; } else { const q = Math.min(t - m.t0, m.tb); v = p.u - p.a * q; d = m.s - (p.u * q - 0.5 * p.a * q * q); braking = m.need && q < m.tb; }
      const cx = V.clamp(X(d), 46, xr);
      V.carF1(g, cx - 8, cy + 15, 0.85, C.cyan, braking);
      V.label(g, f0(v) + MS + '  ·  ' + f0(v * 3.6) + ' km/h', cx, cy - 88, { color: C.white, align: 'center', bold: true, minX: 4, maxX: W - 4 });
      // v-t graph
      const rc = { x: 46, y: 220, w: W - 62, h: H - 220 - 42 };
      const ax = V.axes(g, rc, { x0: 0, x1: m.T, y0: 0, y1: 100, yl: 'v / m s⁻¹', xl: 't / s' });
      const line = [[ax.X(0), ax.Y(p.u)], [ax.X(m.t0), ax.Y(p.u)], [ax.X(m.T), ax.Y(m.need ? p.v : p.u)]];
      if (m.need && t > m.t0) {
        g.save(); g.fillStyle = 'rgba(251,113,133,.25)'; g.beginPath();
        g.moveTo(ax.X(m.t0), ax.Y(0)); g.lineTo(ax.X(m.t0), ax.Y(p.u)); g.lineTo(ax.X(t), ax.Y(v)); g.lineTo(ax.X(t), ax.Y(0)); g.closePath(); g.fill(); g.restore();
      }
      V.poly(g, line, C.cyan, 2.4);
      V.dot(g, ax.X(t), ax.Y(v), 4.5, C.white);
      if (m.need) V.label(g, 'area under the sloping part = braking distance', rc.x + 8, rc.y + rc.h - 13, { color: C.red, size: 11 });
    },
    readouts: (p, m) => [['Braking distance s', m.need ? f1(m.s) + ' m' : '0 m'], ['Braking time t', m.need ? f2(m.tb) + ' s' : '0 s'],
      ['Deceleration', f1(p.a / G) + ' g'], ['A road car at 8 m s⁻² needs', m.need ? f0((p.u * p.u - p.v * p.v) / 16) + ' m' : '0 m']],
    note: function (p, m) {
      if (!m.need) return 'The corner speed is at least the speed on the straight, so there is nothing to brake for.';
      const M = OL.m;
      return 'No time is given, so use ' + M('v^2 = u^2 + 2as') + ' with ' + M('a = -' + p.a) + ': &nbsp; ' + M('s = (v^2 - u^2) / 2a') + ' = (' + p.v + '² − ' + p.u + '²) / (2 × −' + p.a + ') = <b>' + f1(m.s) + ' m</b>';
    }
  });

  /* ------------------------------------------------------------------ 4. Stopping distance */
  OL.defineViz('stopping', {
    title: 'Thinking distance and braking distance',
    hint: 'The driver sees a hazard at the left-hand marker. Change the speed and compare the two rows.',
    height: 268,
    controls: [
      { k: 'u', label: 'Speed', min: 10, max: 40, step: 1, val: 30, fmt: (v) => v + MS + ' (' + f0(v * 2.237) + ' mph)' },
      { k: 'tr', label: 'Reaction time', min: 0.2, max: 2, step: 0.1, val: 0.7, fmt: (v) => f1(v) + ' s' },
      { k: 'a', label: 'Deceleration', min: 3, max: 10, step: 0.5, val: 7.5, fmt: (v) => f1(v) + MS2 + (v <= 4.5 ? ' (wet or worn tyres)' : v >= 7 ? ' (dry road)' : '') }
    ],
    model: function (p) {
      const think = p.u * p.tr, brake = (p.u * p.u) / (2 * p.a);
      return { think: think, brake: brake, total: think + brake, total2: 2 * think + 4 * brake, T: p.tr + p.u / p.a };
    },
    rate: (m) => m.T / 5,
    startAt: (m) => m.T,
    draw: function (g, W, H, p, m, t) {
      const x0 = 18, X = (d) => x0 + (d / (m.total2 * 1.03)) * (W - 2 * x0);
      const seg = (xa, xb, y, h, col, text, tcol) => {
        g.fillStyle = col; g.fillRect(xa, y, Math.max(0, xb - xa), h);
        if (xb - xa > g.measureText(text).width + 24) V.text(g, text, (xa + xb) / 2, y + h / 2, tcol, 'center', 12, true);
      };
      g.font = '700 12px system-ui';
      // row 1: the road, with a dimension bar underneath
      V.text(g, 'At ' + p.u + MS, x0, 16, C.text, 'left', 12.5, true);
      g.fillStyle = C.track; V.rr(g, 4, 58, W - 8, 40, 6); g.fill();
      g.fillStyle = 'rgba(103,232,249,.13)'; g.fillRect(X(0), 58, X(m.think) - X(0), 40);
      g.fillStyle = 'rgba(251,113,133,.16)'; g.fillRect(X(m.think), 58, X(m.total) - X(m.think), 40);
      V.line(g, X(0), 44, X(0), 126, C.amber, 2);
      V.label(g, 'hazard seen', X(0) + 4, 38, { color: C.amber, size: 11, bold: true });
      V.line(g, X(m.total), 50, X(m.total), 126, C.white, 2);
      seg(X(0), X(m.think), 104, 22, 'rgba(103,232,249,.34)', 'thinking ' + f1(m.think) + ' m', C.white);
      seg(X(m.think), X(m.total), 104, 22, 'rgba(251,113,133,.42)', 'braking ' + f1(m.brake) + ' m', C.white);
      V.label(g, 'stopped after ' + f1(m.total) + ' m', X(m.total) + 6, 138, { color: C.white, size: 11.5, bold: true, maxX: W - 4 });
      let d, v;
      if (t < p.tr) { d = p.u * t; v = p.u; } else { const q = Math.min(t - p.tr, p.u / p.a); d = m.think + p.u * q - 0.5 * p.a * q * q; v = p.u - p.a * q; }
      V.carRally(g, X(d) - 26, 80, 0.5, 0, C.cyan);
      if (t >= p.tr && v > 0.05) { g.fillStyle = '#ff3b4f'; g.fillRect(X(d) - 51, 83, 3, 6); }
      V.label(g, t < p.tr ? 'reacting…  ' + f0(v) + MS : f1(v) + MS, X(d) - 26, 38, { color: t < p.tr ? C.cyan : C.red, align: 'center', size: 11.5, bold: true, minX: X(0) + 88, maxX: W - 4 });
      // row 2: double the speed
      V.text(g, 'At double the speed, ' + 2 * p.u + MS, x0, 178, C.text, 'left', 12.5, true);
      seg(X(0), X(2 * m.think), 194, 30, 'rgba(103,232,249,.16)', 'thinking ×2', C.cyan);
      seg(X(2 * m.think), X(m.total2), 194, 30, 'rgba(251,113,133,.20)', 'braking ×4', C.red);
      g.strokeStyle = C.trackEdge; g.lineWidth = 1; g.strokeRect(X(0) + 0.5, 194.5, X(m.total2) - X(0), 30);
      V.label(g, f1(m.total2) + ' m', X(m.total2), 244, { color: C.text, size: 11.5, bold: true, align: 'right' });
    },
    readouts: (p, m) => [['Thinking distance', f1(m.think) + ' m'], ['Braking distance', f1(m.brake) + ' m'], ['Stopping distance', f1(m.total) + ' m'],
      ['At double the speed', f1(m.total2) + ' m (×' + f1(m.total2 / m.total) + ')']],
    note: function (p, m) {
      const M = OL.m;
      return 'stopping distance = thinking distance + braking distance = ' + M('ut_{r} + u^2 / 2a') + ' = ' + f1(m.think) + ' + ' + f1(m.brake) + ' = <b>' + f1(m.total) + ' m</b>';
    }
  });

  /* ------------------------------------------------------------------ 5. Finding g: electromagnet and trapdoor */
  function fitLine(pts) {
    const n = pts.length;
    if (n < 2) return null;
    let sx = 0, sy = 0;
    pts.forEach((q) => { sx += q.t * q.t; sy += q.h; });
    const mx = sx / n, my = sy / n;
    let sxx = 0, sxy = 0;
    pts.forEach((q) => { const dx = q.t * q.t - mx; sxx += dx * dx; sxy += dx * (q.h - my); });
    if (sxx < 1e-9) return null;
    const b = sxy / sxx;
    return { b: b, a: my - b * mx };
  }
  OL.defineViz('freefall', {
    title: 'Measuring g with an electromagnet and trapdoor',
    hint: 'Pick a height, drop the ball and the timer records the fall. Each drop adds a point. Use at least five different heights.',
    height: 340,
    player: false,
    controls: [{ k: 'h', label: 'Drop height, h', min: 0.2, max: 1.5, step: 0.05, val: 1.0, fmt: (v) => f2(v) + ' m' }],
    toggles: [{ k: 'delay', label: 'Electromagnet lets go 0.02 s late (a systematic error)', val: false, onChange: (api) => { api.st.pts = []; api.st.last = null; } }],
    buttons: [
      { label: 'Drop the ball', fn: (api) => { api.setT(0); api.play(); } },
      { label: 'Clear results', ghost: true, fn: (api) => { api.st.pts = []; api.st.last = null; api.setT(0); } }
    ],
    model: function (p, st) {
      if (!st.pts) st.pts = [0.3, 0.9].map((h) => ({ h: h, t: Math.sqrt((2 * h) / G) }));
      const tf = Math.sqrt((2 * p.h) / G);
      return { tf: tf, T: tf };
    },
    rate: () => 0.42,
    onEnd: function (api) {
      const tm = api.m.tf + (api.p.delay ? 0.02 : 0) + (Math.random() - 0.5) * 0.008;
      api.st.pts.push({ h: api.p.h, t: tm });
      api.st.last = tm;
      api.redraw();
    },
    draw: function (g, W, H, p, m, t, st) {
      const lw = V.clamp(W * 0.3, 112, 190), ppm = (H - 146) / 1.5, cx = lw * 0.6, y0 = 36, rod = lw * 0.2;
      // stand
      V.line(g, rod, 14, rod, H - 20, '#8a9bb8', 4); V.line(g, rod - 16, H - 20, lw - 8, H - 20, '#8a9bb8', 4);
      V.line(g, rod, 24, cx, 24, '#8a9bb8', 3);
      g.fillStyle = '#b45309'; V.rr(g, cx - 13, 16, 26, 20, 3); g.fill();
      for (let i = 0; i < 4; i++) V.line(g, cx - 13, 20 + i * 4, cx + 13, 20 + i * 4, '#f59e0b', 1);
      V.text(g, 'electromagnet', cx + 18, 26, C.dim, 'left', 10.5);
      const yT = y0 + 14 + p.h * ppm, fall = Math.min(0.5 * G * t * t, p.h);
      V.line(g, rod, yT + 2, cx - 20, yT + 2, '#8a9bb8', 3);
      V.line(g, cx - 20, yT + 2, cx + 20, yT + (t >= m.T && st.last != null ? 14 : 2), C.amber, 3);
      V.text(g, 'trapdoor', cx + 26, yT + 3, C.dim, 'left', 10.5);
      V.line(g, cx + 30, y0 + 14, cx + 30, yT - 4, C.dim, 1, [3, 3]);
      V.label(g, 'h = ' + f2(p.h) + ' m', cx + 22, (y0 + yT) / 2 + 8, { color: C.text, size: 11 });
      g.fillStyle = '#cbd5e1'; g.beginPath(); g.arc(cx, y0 + 7 + fall * ppm, 7, 0, 7); g.fill();
      const tx = rod + 12;
      g.fillStyle = '#05080f'; V.rr(g, tx, H - 66, 84, 30, 5); g.fill();
      V.text(g, (t >= m.T && st.last != null ? f3(st.last) : f3(t)) + ' s', tx + 42, H - 50, C.green, 'center', 15, true);
      V.text(g, 'TIMER', tx + 2, H - 75, C.dim, 'left', 9.5, true);
      // graph of h against t squared
      const r = { x: lw + 50, y: 30, w: W - lw - 66, h: H - 30 - 46 };
      const ax = V.axes(g, r, { x0: 0, x1: 0.35, y0: 0, y1: 1.6, yl: 'h / m', xl: 't² / s²' });
      const fit = fitLine(st.pts);
      if (fit) {
        g.save(); g.beginPath(); g.rect(r.x, r.y, r.w, r.h); g.clip();
        V.line(g, ax.X(0), ax.Y(fit.a), ax.X(0.35), ax.Y(fit.a + fit.b * 0.35), C.cyan, 2);
        g.restore();
        V.label(g, 'gradient = ' + f2(fit.b) + MS2, r.x + 8, r.y + 14, { color: C.cyan, bold: true, size: 11.5 });
        V.label(g, 'g = 2 × gradient = ' + f2(2 * fit.b) + MS2, r.x + 8, r.y + 38, { color: C.white, bold: true, size: 11.5 });
      } else {
        V.label(g, 'Drop the ball from two or more heights', r.x + 8, r.y + 14, { color: C.dim, size: 11.5 });
      }
      st.pts.forEach((q) => V.dot(g, ax.X(q.t * q.t), ax.Y(q.h), 4.5, C.amber));
    },
    readouts: function (p, m, t, st) {
      const fit = fitLine(st.pts);
      return [['Drops recorded', String(st.pts.length)], ['Last fall time t', st.last != null ? f3(st.last) + ' s' : '–'], ['Last t²', st.last != null ? f3(st.last * st.last) + ' s²' : '–'],
        ['Gradient of the line', fit ? f2(fit.b) + MS2 : '–'], ['g = 2 × gradient', fit ? f2(2 * fit.b) + MS2 : '–'], ['Intercept on the h axis', fit ? f3(Math.abs(fit.a) < 0.0005 ? 0 : fit.a) + ' m' : '–']];
    },
    note: function (p) {
      const M = OL.m;
      return p.delay
        ? 'Every time is now 0.02 s too long. That is a <b>systematic error</b>: the points shift to the right, the line no longer passes through the origin, and g comes out too small. Repeating readings does not remove it.'
        : 'From rest, ' + M('h = ½gt^2') + ', so a graph of ' + M('h') + ' against ' + M('t^2') + ' is a straight line through the origin with gradient ' + M('½g') + '. The small scatter is random error from the timing.';
    }
  });

  /* ------------------------------------------------------------------ 6. Rally jump (projectile) */
  OL.defineViz('jump', {
    title: 'Rally jump: two motions at once',
    hint: 'Watch the cyan arrow (horizontal velocity) stay the same length while the amber arrow (vertical velocity) shrinks, reverses and grows.',
    height: (W) => (W < 560 ? 390 : 430),
    controls: [
      { k: 'u', label: 'Take-off speed, u', min: 10, max: 45, step: 1, val: 18, fmt: (v) => v + MS + ' (' + f0(v * 3.6) + ' km/h)' },
      { k: 'th', label: 'Ramp angle, θ', min: 0, max: 35, step: 1, val: 28, fmt: (v) => v + '°' },
      { k: 'h', label: 'Height of the lip above the landing', min: 0, max: 5, step: 0.25, val: 2, fmt: (v) => f2(v) + ' m' }
    ],
    toggles: [{ k: 'comp', label: 'Show velocity components', val: true }, { k: 'ghost', label: 'Show a ball with the same vertical motion only', val: true }],
    model: function (p) {
      const th = (p.th * Math.PI) / 180, ux = p.u * Math.cos(th), uy = p.u * Math.sin(th), T = (uy + Math.sqrt(uy * uy + 2 * G * p.h)) / G;
      return { ux: ux, uy: uy, T: T, R: ux * T, top: p.h + (uy * uy) / (2 * G), vyE: uy - G * T };
    },
    rate: (m) => Math.max(m.T, 0.01) / 5,
    startAt: (m) => m.T * 0.3,
    draw: function (g, W, H, p, m, t) {
      const gy = H - 50, ox = W < 560 ? 58 : 74, sceneTop = 196;
      if (m.T < 0.05) { V.label(g, 'Add some ramp angle or height so the car leaves the ground.', W / 2, H / 2, { align: 'center', color: C.text }); return; }
      const sc = Math.min((W - ox - (W < 560 ? 22 : 44)) / Math.max(m.R, 2), (gy - sceneTop - 22) / Math.max(m.top * 1.12, 0.8), 70);
      const X = (x) => ox + x * sc, Y = (y) => gy - y * sc;
      const pos = (tt) => [m.ux * tt, p.h + m.uy * tt - 0.5 * G * tt * tt];
      // ground and ramp
      V.line(g, 0, gy, W, gy, C.trackEdge, 2);
      g.fillStyle = '#0d1628'; g.fillRect(0, gy + 1, W, H - gy);
      const lipY = Y(p.h), backY = Math.min(gy, lipY + 62 * Math.tan((p.th * Math.PI) / 180));
      g.fillStyle = C.track; g.beginPath(); g.moveTo(ox, gy); g.lineTo(ox, lipY); g.lineTo(ox - 62, backY); g.lineTo(ox - 62, gy); g.closePath(); g.fill();
      V.line(g, ox - 62, backY, ox, lipY, C.trackEdge, 2);
      // path
      const full = [], done = [];
      for (let i = 0; i <= 80; i++) { const tt = (m.T * i) / 80, q = pos(tt); full.push([X(q[0]), Y(q[1])]); if (tt <= t) done.push([X(q[0]), Y(q[1])]); }
      const now = pos(t), here = [X(now[0]), Y(now[1])];
      done.push(here);
      V.poly(g, full, '#4a5b7c', 1.5, [5, 5]);
      V.poly(g, done, C.cyan, 2.2);
      // strobe marks every T/8
      const gx = ox - (W < 560 ? 30 : 40);
      for (let k = 0; k <= 8; k++) {
        const q = pos((m.T * k) / 8);
        V.dot(g, X(q[0]), Y(q[1]), 2.6, 'rgba(244,248,255,.55)');
        V.dot(g, X(q[0]), gy + 9, 3, C.cyan);
        if (p.ghost) V.dot(g, gx, Y(q[1]), 2.6, 'rgba(251,191,36,.55)');
      }
      if (m.uy > 0.5) { V.line(g, ox, Y(m.top), X(m.R), Y(m.top), '#33425f', 1, [3, 4]); V.label(g, 'max height ' + f2(m.top) + ' m', X(m.R), Y(m.top) - 11, { align: 'right', size: 11, color: C.dim }); }
      V.arrow(g, X(m.R) - 1, gy + 28, ox, gy + 28, C.dim, 1.5); V.arrow(g, ox + 1, gy + 28, X(m.R), gy + 28, C.dim, 1.5);
      V.label(g, 'range ' + f1(m.R) + ' m', (ox + X(m.R)) / 2, gy + 28, { align: 'center', size: 11.5, bold: true });
      // ghost ball
      const vy = m.uy - G * t;
      if (p.ghost) {
        V.line(g, gx, here[1], here[0], here[1], 'rgba(251,191,36,.5)', 1, [3, 4]);
        V.dot(g, gx, here[1], 6, C.amber);
        V.label(g, 'ball: vertical motion only', 4, Math.max(sceneTop, Y(m.top) - 22), { color: C.amber, size: 10.5 });
      }
      // car and vectors
      V.carRally(g, here[0], here[1] - 12, 0.6, -Math.atan2(vy, m.ux), C.cyan);
      if (p.comp) {
        const k = Math.min(2.4, 76 / p.u), cx = here[0], cyy = here[1] - 14;
        V.arrow(g, cx, cyy, cx + m.ux * k, cyy - vy * k, 'rgba(244,248,255,.85)', 2);
        V.arrow(g, cx, cyy, cx + m.ux * k, cyy, C.cyan, 3);
        V.arrow(g, cx, cyy, cx, cyy - vy * k, C.amber, 3);
      }
      // velocity components against time
      const r = { x: 48, y: 30, w: W - 64, h: 108 }, lim = Math.max(10, Math.ceil(Math.max(m.ux, Math.abs(m.uy), Math.abs(m.vyE)) / 10) * 10);
      const ax = V.axes(g, r, { x0: 0, x1: m.T, y0: -lim, y1: lim, yl: 'velocity components / m s⁻¹', xl: 't / s' });
      V.line(g, ax.X(0), ax.Y(m.ux), ax.X(m.T), ax.Y(m.ux), C.cyan, 2.4);
      V.line(g, ax.X(0), ax.Y(m.uy), ax.X(m.T), ax.Y(m.vyE), C.amber, 2.4);
      V.line(g, ax.X(t), r.y, ax.X(t), r.y + r.h, 'rgba(244,248,255,.35)', 1, [4, 4]);
      V.dot(g, ax.X(t), ax.Y(m.ux), 4.5, C.cyan); V.dot(g, ax.X(t), ax.Y(vy), 4.5, C.amber);
      V.label(g, 'horizontal: constant', r.x + r.w - 6, ax.Y(m.ux) + (ax.Y(m.ux) < r.y + 22 ? 14 : -13), { color: C.cyan, size: 11, bold: true, align: 'right' });
      V.label(g, 'vertical: gradient = −9.81 m s⁻²', r.x + r.w - 6, Math.min(r.y + r.h - 11, ax.Y(m.vyE) + 14), { color: C.amber, size: 11, bold: true, align: 'right' });
    },
    readouts: function (p, m, t) {
      return [['Time of flight', f2(m.T) + ' s'], ['Range', f1(m.R) + ' m'], ['Maximum height', f2(m.top) + ' m'], ['Landing speed', f1(Math.hypot(m.ux, m.vyE)) + MS],
        ['Horizontal velocity now', f1(m.ux) + MS], ['Vertical velocity now', f1(m.uy - G * t) + MS]];
    },
    note: function () {
      const M = OL.m;
      return 'Horizontal: ' + M('x = (u "cos" θ)t') + ', constant velocity. &nbsp; Vertical: ' + M('y = h + (u "sin" θ)t - ½gt^2') + ', constant acceleration. The dots under the track are equal time steps: evenly spaced across, because the horizontal velocity never changes.';
    }
  });
})();
