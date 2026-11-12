/* Konuşma Kampı — animasyonlu ağız (önden) ve dil kesiti (yandan). Palet: mor / sarı / siyah / beyaz / gri. */
(function (G) {
  'use strict';
  const K = G.KK;
  const NS = 'http://www.w3.org/2000/svg';
  const PURPLE = '#552583', GOLD = '#fdb927', BLACK = '#000', WHITE = '#fff', GRAY = '#525252';
  let uidN = 0;

  const el = (tag, attrs, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n; };
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  const BASE = { ow: 60, oh: 2, lt: 16, n: 2, curve: 0, tT: 0, tB: 0, tg: 0, tx: 0, ty: 0.4, tl: 0, td: 90, puff: 0, vib: 0, fv: 0 };
  const P = (o) => Object.assign({}, BASE, o);
  const POSES = {
    closed: P({ ow: 60, oh: 2, lt: 16 }),
    a: P({ ow: 54, oh: 52, lt: 14, n: 2.4, tT: 0.35, tg: 0.85, ty: 0.05 }),
    e: P({ ow: 68, oh: 26, curve: 6, tT: 0.6, tB: 0.3, tg: 0.55, ty: 0.2 }),
    i: P({ ow: 80, oh: 13, curve: 15, lt: 12, tT: 1, tB: 0.85 }),
    ı: P({ ow: 62, oh: 15, curve: 2, tT: 0.6, tB: 0.5, tg: 0.3, ty: 0.3 }),
    o: P({ ow: 34, oh: 38, n: 2.6, lt: 20, tg: 0.5, ty: 0.15 }),
    ö: P({ ow: 30, oh: 24, n: 2.6, lt: 22, tg: 0.4, ty: 0.3 }),
    u: P({ ow: 22, oh: 20, n: 2.2, lt: 24 }),
    ü: P({ ow: 24, oh: 15, n: 2.2, lt: 24, tg: 0.3, ty: 0.4 }),
    kiss: P({ ow: 18, oh: 11, n: 2, lt: 30 }),
    fish: P({ ow: 20, oh: 4, n: 2, lt: 32 }),
    lips: P({ ow: 58, oh: 2, lt: 21 }),
    tip: P({ ow: 58, oh: 24, tT: 0.75, tB: 0.2, tg: 0.65, ty: 1 }),
    back: P({ ow: 54, oh: 24, tT: 0.3, tg: 0.35, ty: 0.55 }),
    teeth: P({ ow: 66, oh: 11, curve: 9, tT: 0.95, tB: 0.95 }),
    sh: P({ ow: 42, oh: 19, lt: 23, n: 2.4, tT: 0.75, tB: 0.7 }),
    fv: P({ ow: 62, oh: 15, tT: 0.95, fv: 1 }),
    puff: P({ ow: 56, oh: 2, lt: 18, puff: 1 }),
    brr: P({ ow: 56, oh: 3, lt: 21, vib: 1 }),
    tongueOut: P({ ow: 54, oh: 30, tg: 0.9, ty: 0.1, tl: 1, td: 92 }),
    tongueUp: P({ ow: 54, oh: 30, tg: 0.9, ty: 0.1, tl: 1, td: -78 }),
    tongueDown: P({ ow: 54, oh: 30, tg: 0.9, ty: 0.1, tl: 1, td: 104 }),
    tongueRight: P({ ow: 54, oh: 30, tg: 0.9, ty: 0.1, tl: 1, td: 12 }),
    tongueLeft: P({ ow: 54, oh: 30, tg: 0.9, ty: 0.1, tl: 1, td: 168 }),
    roof: P({ ow: 52, oh: 32, tT: 0.5, tg: 1, ty: 1 }),
  };

  function openPath(cx, cy, ow, oh, n, curve) {
    const pts = []; const N = 40;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
      const x = ow * Math.sign(c) * Math.pow(Math.abs(c), 2 / n);
      let y = oh * Math.sign(s) * Math.pow(Math.abs(s), 2 / n);
      y -= curve * Math.pow(x / (ow || 1), 2);
      pts.push((cx + x).toFixed(1) + ' ' + (cy + y).toFixed(1));
    }
    return 'M' + pts.join('L') + 'Z';
  }

  function create(host, opts) {
    opts = opts || {};
    const id = 'mc' + (++uidN);
    const svg = el('svg', { viewBox: '22 20 256 205', class: 'mouth-svg', role: 'img', 'aria-label': opts.label || 'Ağız şekli' }); host.appendChild(svg);
    const defs = el('defs', {}, svg); const clip = el('clipPath', { id }, defs); const clipPath = el('path', {}, clip);
    const cheeks = el('g', {}, svg);
    const cL = el('circle', { fill: WHITE, stroke: PURPLE, 'stroke-width': 8 }, cheeks), cR = el('circle', { fill: WHITE, stroke: PURPLE, 'stroke-width': 8 }, cheeks);
    const lipsG = el('g', {}, svg);
    const lips = el('path', { fill: PURPLE }, lipsG);
    const hi = el('path', { fill: 'none', stroke: WHITE, 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0.35 }, lipsG);
    const open = el('path', { fill: BLACK }, lipsG);
    const inner = el('g', { 'clip-path': 'url(#' + id + ')' }, lipsG);
    const teethT = el('g', {}, inner), teethB = el('g', {}, inner);
    const tongue = el('ellipse', { fill: GOLD, stroke: BLACK, 'stroke-width': 3 }, inner);
    const line = el('path', { fill: 'none', stroke: BLACK, 'stroke-width': 4, 'stroke-linecap': 'round' }, lipsG);
    const fvT = el('rect', { fill: WHITE, stroke: BLACK, 'stroke-width': 3, rx: 6 }, lipsG);
    const tout = el('g', {}, svg);
    const tBody = el('rect', { fill: GOLD, stroke: BLACK, 'stroke-width': 4, rx: 24 }, tout);
    const tMid = el('path', { fill: 'none', stroke: BLACK, 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0.55 }, tout);

    const cx = 150, cy = 118;
    let cur = Object.assign({}, POSES.closed), from = cur, to = cur, t0 = 0, dur = 1, raf = 0, dead = false;

    function draw(p, time) {
      const jit = p.vib ? Math.sin(time / 28) * 2.2 * p.vib : 0;
      const jy = p.vib ? Math.cos(time / 33) * 1.6 * p.vib : 0;
      const ow = p.ow, oh = Math.max(p.oh, 0.01), lt = p.lt;
      lipsG.setAttribute('transform', 'translate(' + jit.toFixed(2) + ' ' + jy.toFixed(2) + ')');
      const op = openPath(cx, cy, ow, oh, p.n, p.curve);
      clipPath.setAttribute('d', op); open.setAttribute('d', op);
      lips.setAttribute('d', openPath(cx, cy, ow + lt * 0.95, oh + lt, Math.min(p.n, 2.6), p.curve));
      hi.setAttribute('d', 'M' + (cx - ow * 0.4) + ' ' + (cy - oh - lt * 0.55) + ' Q ' + cx + ' ' + (cy - oh - lt * 0.85) + ' ' + (cx + ow * 0.4) + ' ' + (cy - oh - lt * 0.55));
      const lo = Math.max(0, 1 - oh / 4);
      line.setAttribute('d', 'M' + (cx - ow) + ' ' + (cy - p.curve) + ' Q ' + cx + ' ' + (cy + 6 * lo) + ' ' + (cx + ow) + ' ' + (cy - p.curve));
      line.setAttribute('opacity', lo.toFixed(2));
      // dişler
      teethT.innerHTML = ''; teethB.innerHTML = '';
      const th = oh * 1.25 * p.tT, bh = oh * 1.25 * p.tB;
      if (th > 1) { el('rect', { x: cx - ow, y: cy - oh - 4 - p.curve, width: ow * 2, height: th + 4 + p.curve, fill: WHITE }, teethT); for (let i = -3; i <= 3; i++) el('line', { x1: cx + i * ow / 3.4, x2: cx + i * ow / 3.4, y1: cy - oh - 4 - p.curve, y2: cy - oh + th, stroke: BLACK, 'stroke-width': 1.5, opacity: 0.35 }, teethT); }
      if (bh > 1) { el('rect', { x: cx - ow, y: cy + oh - bh, width: ow * 2, height: bh + 6, fill: WHITE }, teethB); }
      // dil (ağız içi)
      const tg = p.tg;
      tongue.setAttribute('rx', (Math.max(ow * 0.55 * tg, 0.01)).toFixed(1)); tongue.setAttribute('ry', (Math.max(oh * 0.55 * tg, 0.01)).toFixed(1));
      tongue.setAttribute('cx', (cx + p.tx * ow * 0.3).toFixed(1)); tongue.setAttribute('cy', (cy + oh * (0.85 - p.ty * 1.25)).toFixed(1));
      tongue.setAttribute('opacity', p.tl > 0.5 ? 0 : (tg > 0.02 ? 1 : 0));
      // üst dişler alt dudak üstünde (f/v)
      fvT.setAttribute('opacity', p.fv.toFixed(2));
      fvT.setAttribute('x', cx - ow * 0.55); fvT.setAttribute('width', ow * 1.1);
      fvT.setAttribute('y', cy - 2); fvT.setAttribute('height', oh + lt * 0.55 + 4);
      // yanaklar
      const pr = 30 * p.puff;
      cL.setAttribute('r', pr.toFixed(1)); cR.setAttribute('r', pr.toFixed(1));
      cL.setAttribute('cx', cx - ow - lt - pr * 0.55); cR.setAttribute('cx', cx + ow + lt + pr * 0.55);
      cL.setAttribute('cy', cy); cR.setAttribute('cy', cy); cheeks.setAttribute('opacity', p.puff > 0.02 ? 1 : 0);
      // dışarı çıkan dil
      const L = 10 + 62 * p.tl;
      tout.setAttribute('opacity', p.tl > 0.02 ? 1 : 0);
      tout.setAttribute('transform', 'translate(' + (cx + jit) + ' ' + (cy + 2) + ') rotate(' + p.td.toFixed(1) + ')');
      tBody.setAttribute('x', 0); tBody.setAttribute('y', -24); tBody.setAttribute('width', L + 24); tBody.setAttribute('height', 48);
      tMid.setAttribute('d', 'M ' + (L * 0.2) + ' 0 L ' + (L + 8) + ' 0');
    }

    function frame(time) {
      if (dead) return;
      const k = dur <= 0 ? 1 : Math.min(1, (time - t0) / dur), e = ease(k);
      for (const key in BASE) cur[key] = from[key] + (to[key] - from[key]) * e;
      draw(cur, time);
      if (k < 1 || cur.vib > 0.01 || to.vib > 0) raf = requestAnimationFrame(frame); else raf = 0;
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }

    const api = {
      el: svg,
      pose(name, ms) {
        const target = typeof name === 'string' ? (POSES[name] || POSES.closed) : name;
        from = Object.assign({}, cur);
        // td dönüşünü kısa yoldan yap
        let d = target.td - from.td; if (Math.abs(d) > 180) from.td += d > 0 ? 360 : -360;
        to = target; t0 = performance.now(); dur = ms == null ? 450 : ms;
        if (G.matchMedia && G.matchMedia('(prefers-reduced-motion: reduce)').matches || (K.store.state && K.store.state.settings.reduceMotion)) dur = 0;
        kick(); return api;
      },
      /* seq: [{pose, ms, text}], opts: {loop, onStep} */
      play(seq, o) {
        o = o || {}; let i = 0, timer = 0, stopped = false;
        const step = () => {
          if (stopped || dead) return;
          const s = seq[i % seq.length];
          api.pose(s.pose, Math.min(500, s.ms * 0.45));
          if (o.onStep) o.onStep(s, i);
          i++;
          if (!o.loop && i >= seq.length) { timer = setTimeout(() => { if (o.onEnd) o.onEnd(); }, s.ms); return; }
          timer = setTimeout(step, s.ms);
        };
        step();
        return { stop() { stopped = true; clearTimeout(timer); } };
      },
      destroy() { dead = true; if (raf) cancelAnimationFrame(raf); svg.remove(); },
    };
    draw(cur, 0);
    if (opts.pose) { cur = Object.assign({}, POSES[opts.pose]); from = cur; to = cur; draw(cur, 0); }
    return api;
  }

  /* ---------- Yan kesit: dilin yeri ---------- */
  const TONGUE = {
    rest: [[64, 150], [100, 142], [150, 136], [205, 142], [262, 172]],
    low: [[64, 168], [100, 164], [150, 160], [205, 160], [262, 178]],
    tip: [[67, 92], [100, 110], [150, 134], [205, 144], [262, 172]],
    back: [[64, 160], [100, 154], [150, 112], [214, 62], [262, 130]],
    groove: [[68, 128], [100, 118], [150, 132], [205, 144], [262, 174]],
    sh: [[84, 130], [120, 112], [160, 122], [210, 140], [262, 172]],
    roof: [[67, 90], [100, 66], [150, 52], [205, 56], [262, 122]],
    y: [[64, 158], [100, 100], [150, 84], [205, 110], [262, 150]],
    r: [[67, 98], [100, 114], [150, 134], [205, 144], [262, 172]],
    out: [[24, 160], [70, 150], [130, 140], [205, 144], [262, 172]],
  };
  function tonguePath(pts) {
    const [a, b, c, d, e] = pts;
    return 'M' + a[0] + ' ' + a[1] + ' C ' + (a[0] + 18) + ' ' + (a[1] - 12) + ', ' + (b[0] - 14) + ' ' + (b[1] - 4) + ', ' + b[0] + ' ' + b[1]
      + ' S ' + (c[0] - 20) + ' ' + c[1] + ', ' + c[0] + ' ' + c[1] + ' S ' + (d[0] - 20) + ' ' + d[1] + ', ' + d[0] + ' ' + d[1]
      + ' S ' + (e[0] - 20) + ' ' + (e[1] - 10) + ', ' + e[0] + ' ' + e[1] + ' L ' + e[0] + ' 192 L ' + (a[0] + 4) + ' 192 Z';
  }
  function sideView(host, name) {
    const svg = el('svg', { viewBox: '0 0 300 200', class: 'side-svg', role: 'img', 'aria-label': 'Dilin yeri (yan kesit)' }); host.appendChild(svg);
    el('rect', { x: 0, y: 0, width: 300, height: 200, fill: WHITE, rx: 14 }, svg);
    el('path', { d: 'M62 84 Q150 6 250 66 L266 104 L266 192 L62 192 Z', fill: '#2b1245' }, svg);
    const tg = el('path', { fill: GOLD, stroke: BLACK, 'stroke-width': 3, 'stroke-linejoin': 'round' }, svg);
    el('path', { d: 'M62 84 Q150 6 250 66 L266 104', fill: 'none', stroke: GRAY, 'stroke-width': 7, 'stroke-linecap': 'round' }, svg);
    el('rect', { x: 40, y: 76, width: 22, height: 50, rx: 7, fill: WHITE, stroke: BLACK, 'stroke-width': 3 }, svg);
    el('rect', { x: 42, y: 152, width: 20, height: 40, rx: 7, fill: WHITE, stroke: BLACK, 'stroke-width': 3 }, svg);
    el('path', { d: 'M6 70 Q6 54 28 56 L42 66 L42 126 L22 124 Q4 122 6 104 Z', fill: PURPLE }, svg);
    el('path', { d: 'M6 136 Q6 152 28 148 L42 146 L42 196 L20 198 Q4 192 6 174 Z', fill: PURPLE }, svg);
    const t1 = el('text', { x: 150, y: 24, 'text-anchor': 'middle', fill: GRAY, 'font-size': 15, 'font-weight': 800, 'font-family': 'Nunito, sans-serif' }, svg); t1.textContent = 'damak';
    const t2 = el('text', { x: 166, y: 188, 'text-anchor': 'middle', fill: BLACK, 'font-size': 16, 'font-weight': 800, 'font-family': 'Nunito, sans-serif' }, svg); t2.textContent = 'dil';
    let cur = TONGUE.rest.map((p) => p.slice()), from = cur, to = cur, t0 = 0, dur = 1, raf = 0, dead = false;
    function frame(t) {
      if (dead) return;
      const k = Math.min(1, (t - t0) / dur), e = ease(k);
      cur = from.map((p, i) => [p[0] + (to[i][0] - p[0]) * e, p[1] + (to[i][1] - p[1]) * e]);
      tg.setAttribute('d', tonguePath(cur));
      raf = k < 1 ? requestAnimationFrame(frame) : 0;
    }
    const api = {
      el: svg,
      set(nm, ms) {
        from = cur.map((p) => p.slice()); to = (TONGUE[nm] || TONGUE.rest).map((p) => p.slice()); t0 = performance.now(); dur = ms == null ? 500 : ms;
        if (K.store.state && K.store.state.settings.reduceMotion) dur = 0;
        if (!raf) raf = requestAnimationFrame(frame); return api;
      },
      destroy() { dead = true; svg.remove(); },
    };
    tg.setAttribute('d', tonguePath(cur));
    api.set(name || 'rest', 0);
    return api;
  }

  K.mouth = { create, sideView, POSES, TONGUE };
})(window);
