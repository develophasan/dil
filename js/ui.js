/* Konuşma Kampı — UI çekirdeği: DOM yardımcıları, ikonlar, modal, yönlendirici */
(function (G) {
  'use strict';
  const K = G.KK;
  const NS = 'http://www.w3.org/2000/svg';

  /* h('div.class#id', {attrs}, ...children) */
  function h(tag, attrs, ...kids) {
    let t = tag, cls = '';
    const m = tag.match(/^([a-z0-9]+)((?:\.[\w-]+)*)$/i);
    if (m) { t = m[1]; cls = m[2].replace(/\./g, ' ').trim(); }
    const n = document.createElement(t);
    if (cls) n.className = cls;
    if (attrs && (typeof attrs !== 'object' || attrs.nodeType || Array.isArray(attrs))) { kids.unshift(attrs); attrs = null; }
    if (attrs) for (const k in attrs) {
      const v = attrs[k]; if (v == null || v === false) continue;
      if (k === 'class') n.className = (n.className ? n.className + ' ' : '') + v;
      else if (k === 'style' && typeof v === 'object') Object.assign(n.style, v);
      else if (k.startsWith('on')) n.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === 'html') n.innerHTML = v;
      else if (k === 'value') n.value = v;
      else if (k === 'checked' || k === 'disabled' || k === 'selected' || k === 'hidden') { if (v) n[k] = true; }
      else n.setAttribute(k, v === true ? '' : v);
    }
    const add = (c) => { if (c == null || c === false) return; if (Array.isArray(c)) c.forEach(add); else n.appendChild(c.nodeType ? c : document.createTextNode(String(c))); };
    kids.forEach(add);
    return n;
  }

  const ICONS = {
    close: '<path d="M5 5l14 14M19 5L5 19"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    next: '<path d="M9 5l7 7-7 7"/>',
    speaker: '<path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16.5 8.5c1.8 2 1.8 5 0 7M19.5 5.5c3.6 3.7 3.6 9.3 0 13"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    check: '<path d="M4 12.5l5 5L20 6"/>',
    redo: '<path d="M20 12a8 8 0 1 1-3-6.2M20 4v5h-5"/>',
    tilde: '<path d="M3 12c3-5 6-5 9 0s6 5 9 0"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z M4 5v16"/><path d="M8 7h7"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    print: '<path d="M7 9V3h10v6M6 18H4v-7h16v7h-2M7 14h10v7H7z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14"/>',
    star: '<path d="M12 3l2.8 5.8 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.3l1-6.2L3 9.7l6.2-.9z" fill="currentColor"/>',
    home: '<path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
    play: '<path d="M7 4l13 8-13 8z" fill="currentColor"/>',
    pause: '<path d="M7 4h4v16H7zM13 4h4v16h-4z" fill="currentColor"/>',
    eyeoff: '<path d="M3 3l18 18M10 6a9 9 0 0 1 11 6 9 9 0 0 1-3 3.5M6 8a9 9 0 0 0-3 4 9 9 0 0 0 13 4"/>',
    eye: '<path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    download: '<path d="M12 3v12M7 11l5 5 5-5M4 20h16"/>',
    upload: '<path d="M12 16V4M7 8l5-5 5 5M4 20h16"/>',
    camera: '<path d="M3 8h4l2-3h6l2 3h4v12H3z"/><circle cx="12" cy="13" r="4"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/>',
    trophy: '<path d="M7 4h10v6a5 5 0 0 1-10 0zM7 6H3v2a4 4 0 0 0 4 4M17 6h4v2a4 4 0 0 1-4 4M12 15v4M8 21h8"/>',
    ball: '<circle cx="12" cy="12" r="9" fill="currentColor"/><path d="M3 12h18M12 3v18M5.5 5.5c4 3 4 10 0 13M18.5 5.5c-4 3-4 10 0 13" stroke="#000" stroke-width="1.6" fill="none"/>',
    swap: '<path d="M7 7h12l-3-3M17 17H5l3 3"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  };
  function icon(name, size) {
    const s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('width', size || 24); s.setAttribute('height', size || 24);
    s.setAttribute('fill', 'none'); s.setAttribute('stroke', 'currentColor'); s.setAttribute('stroke-width', '2.6'); s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round');
    s.setAttribute('aria-hidden', 'true'); s.classList.add('ic');
    s.innerHTML = ICONS[name] || ''; return s;
  }

  /* ---------- Yönlendirici ---------- */
  const app = () => document.getElementById('app');
  let cleanup = null;
  const routes = {};
  function route(path, fn) { routes[path] = fn; }
  function go(path, replace) { if (replace) location.replace('#' + path); else location.hash = '#' + path; }
  function render() {
    const raw = (location.hash || '#/').slice(1) || '/';
    const [path, q] = raw.split('?'); const params = {}; (q || '').split('&').forEach((p) => { if (p) { const [k, v] = p.split('='); params[k] = decodeURIComponent(v || ''); } });
    if (cleanup) { try { cleanup(); } catch (e) { /* */ } cleanup = null; }
    K.audio.stop();
    const a = app(); a.innerHTML = ''; a.className = ''; a.scrollTop = 0;
    const st = K.store.state;
    let fn = routes[path] || routes['/'];
    if (!st.onboarded && path !== '/welcome') { go('/welcome', true); return; }
    try { const r = fn(a, params); if (typeof r === 'function') cleanup = r; } catch (e) { console.error(e); a.appendChild(h('div.card.pad', h('h2', 'Bir sorun oluştu'), h('p', String(e && e.message || e)), h('button.btn', { onclick: () => go('/', true) }, 'Ana sayfa'))); }
  }
  G.addEventListener('hashchange', render);

  /* ---------- Modal / toast ---------- */
  function modal(opts) {
    const root = document.getElementById('modal-root');
    const back = h('div.modal-back');
    const box = h('div.modal', { role: 'dialog', 'aria-modal': 'true' });
    const close = (v) => { back.remove(); if (opts.onClose) opts.onClose(v); };
    if (opts.title) box.appendChild(h('h2', opts.title));
    if (opts.body) box.appendChild(typeof opts.body === 'function' ? opts.body(close) : (opts.body.nodeType ? opts.body : h('p', opts.body)));
    const row = h('div.modal-actions');
    (opts.actions || []).forEach((a) => row.appendChild(h('button.btn' + (a.cls ? '.' + a.cls : ''), { onclick: async () => { if (a.onclick) { const r = await a.onclick(close); if (r === false) return; } close(a.value); } }, a.label)));
    if (row.children.length) box.appendChild(row);
    back.appendChild(box);
    if (opts.dismiss !== false) back.addEventListener('click', (e) => { if (e.target === back) close(null); });
    root.appendChild(back);
    const f = box.querySelector('input,button'); if (f && opts.focus !== false) setTimeout(() => f.focus(), 30);
    return close;
  }
  function confirmBox(title, text, yes, cls) {
    return new Promise((res) => modal({ title, body: text, onClose: (v) => res(v === true), actions: [{ label: 'Vazgeç', cls: 'white', value: false }, { label: yes || 'Evet', cls: cls || '', value: true }] }));
  }
  function toast(text, ms) {
    const r = document.getElementById('modal-root'); const t = h('div.toast', { role: 'status' }, text); r.appendChild(t);
    setTimeout(() => t.classList.add('out'), ms || 2200); setTimeout(() => t.remove(), (ms || 2200) + 400);
  }

  /* ---------- Ortak parçalar ---------- */
  const avatar = (c, size) => h('span.avatar', { style: { width: (size || 48) + 'px', height: (size || 48) + 'px', fontSize: ((size || 48) * 0.58) + 'px' } }, K.AVATARS[c.avatar % K.AVATARS.length]);
  const stripe = () => h('div.stripe', h('i'), h('i'), h('i'));
  const ballIcon = (size) => icon('ball', size || 22);
  function fmtDate(ts) { const d = new Date(ts); return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' }); }
  function fmtTime(ts) { return new Date(ts).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }); }
  function mmss(s) { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }

  /* Veli kapısı: PIN varsa PIN, yoksa 3 sn basılı tutma */
  async function hashPin(pin, salt) {
    const data = new TextEncoder().encode(salt + ':' + pin);
    try { if (G.crypto && G.crypto.subtle) { const d = await G.crypto.subtle.digest('SHA-256', data); return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join(''); } } catch (e) { /* */ }
    let x = 5381; for (const b of data) x = ((x << 5) + x + b) >>> 0; return 'f' + x.toString(16);
  }
  function gateInner() {
    const st = K.store.state;
    return new Promise((resolve) => {
      if (!st.settings.pin) {
        let timer = null; let prog = null;
        const bar = h('div.hold-bar', prog = h('i'));
        const btn = h('button.btn.big.hold', { 'aria-label': 'Veli girişi için basılı tutun' }, 'Basılı tut');
        const start = (e) => { e.preventDefault(); prog.style.transition = 'width 2.6s linear'; prog.style.width = '100%'; timer = setTimeout(() => { close(true); }, 2600); };
        const stop = () => { clearTimeout(timer); prog.style.transition = 'width .2s'; prog.style.width = '0'; };
        ['pointerdown', 'touchstart'].forEach((ev) => btn.addEventListener(ev, start, { passive: false }));
        ['pointerup', 'pointerleave', 'pointercancel', 'touchend'].forEach((ev) => btn.addEventListener(ev, stop));
        btn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); close(true); } });
        const close = modal({ title: 'Veli girişi', body: h('div', h('p', 'Bu alan yetişkinler içindir. Devam etmek için düğmeyi yaklaşık 3 saniye basılı tutun.'), bar, btn, h('p.small', 'İpucu: Ayarlardan bir PIN belirleyerek bu kilidi güçlendirebilirsiniz.')), actions: [{ label: 'Vazgeç', cls: 'white', value: false }], onClose: (v) => { clearTimeout(timer); resolve(v === true); }, focus: false });
        return;
      }
      let val = '';
      const dots = h('div.pin-dots'); const msg = h('p.pin-msg', 'PIN kodunu girin');
      const draw = () => { dots.innerHTML = ''; for (let i = 0; i < 4; i++) dots.appendChild(h('i' + (i < val.length ? '.on' : ''))); };
      const press = async (d) => {
        if (d === 'del') val = val.slice(0, -1); else if (val.length < 4) val += d; draw();
        if (val.length === 4) {
          const hh = await hashPin(val, st.settings.pin.salt);
          if (hh === st.settings.pin.h) close(true); else { msg.textContent = 'Yanlış PIN, tekrar deneyin'; dots.classList.add('shake'); setTimeout(() => dots.classList.remove('shake'), 400); val = ''; draw(); }
        }
      };
      const pad = h('div.keypad', ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((k) => k === '' ? h('span') : h('button.key', { onclick: () => press(k), 'aria-label': k === 'del' ? 'Sil' : k }, k === 'del' ? icon('back', 22) : k)));
      draw();
      const close = modal({ title: 'Veli girişi', body: h('div', msg, dots, pad, h('button.linkbtn', { onclick: () => { close(false); forgotPin().then(resolve); } }, 'PIN\'imi unuttum')), actions: [{ label: 'Vazgeç', cls: 'white', value: false }], onClose: (v) => resolve(v === true), focus: false });
    });
  }
  const gate = () => gateInner().then((ok) => { if (ok) K.parentUntil = Date.now() + 15 * 60000; return ok; });
  async function forgotPin() {
    const st = K.store.state;
    return new Promise((resolve) => {
      const inp = h('input.input', { placeholder: 'Kurtarma kodu', autocapitalize: 'characters', maxlength: 12 });
      modal({ title: 'PIN\'i sıfırla', body: h('div', h('p', 'PIN\'i belirlerken size gösterilen kurtarma kodunu girin.'), inp, h('p.small', 'Kodu kaybettiyseniz verileri silmeden PIN sıfırlanamaz (veriler yalnızca bu cihazdadır).')),
        actions: [{ label: 'Vazgeç', cls: 'white', value: false }, { label: 'Tüm verileri sil', cls: 'purple', value: 'wipe' }, { label: 'Sıfırla', value: true, onclick: async () => { const hh = await hashPin(inp.value.trim().toUpperCase(), st.settings.recovery ? st.settings.recovery.salt : ''); if (st.settings.recovery && hh === st.settings.recovery.h) { st.settings.pin = null; K.store.save(); toast('PIN kaldırıldı. Ayarlardan yenisini belirleyin.'); } else { toast('Kod yanlış'); return false; } } }],
        onClose: async (v) => { if (v === 'wipe') { const ok = await confirmBox('Tüm veriler silinsin mi?', 'Bu cihazdaki tüm çocuk profilleri, ilerleme ve kayıtlar silinir. Geri alınamaz.', 'Evet, sil', 'purple'); if (ok) { await K.store.wipe(); G.location.hash = '#/welcome'; G.location.reload(); } resolve(false); } else resolve(v === true); } });
    });
  }

  K.ui = { h, icon, route, go, render, modal, confirmBox, toast, avatar, stripe, ballIcon, fmtDate, fmtTime, mmss, gate, hashPin, app };
})(window);
