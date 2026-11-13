/* Konuşma Kampı — oturum kurma, aralıklı tekrar, ilerleme ve kupalar (hepsi kural tabanlı, cihaz içinde) */
(function (G) {
  'use strict';
  const K = G.KK;
  const DAY = 86400000;
  const dayNum = (ts) => { const d = new Date(ts); return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY); };
  const BOX_DAYS = [0, 1, 2, 4, 8];
  const rnd = (a) => a[Math.floor(Math.random() * a.length)];

  function stat(c, id) { return c.items[id] || null; }
  function allItems(c) { return c.custom.map((x) => x.id); }

  function item(c, id) { return K.getItem(id, c.custom); }
  function isHidden(c, id) { return c.hidden.indexOf(id) >= 0; }

  /* Bir sonuç kaydet: r = 2 rahat, 1 yaklaşık, 0 tekrar */
  function record(c, id, r, reps) {
    const it = item(c, id); const now = Date.now();
    const s = c.items[id] || (c.items[id] = { n: 0, box: 0, hist: [], last: 0, due: 0 });
    s.n++; s.last = now; s.hist.push(r); if (s.hist.length > 10) s.hist.shift();
    if (r === 2) s.box = Math.min(4, s.box + 1); else if (r === 0) s.box = 0; else s.box = Math.max(0, s.box);
    s.due = now + BOX_DAYS[s.box] * DAY;
    if (it && it.snd) {
      c.sounds = c.sounds || {};
      const letters = it.kind === 'w' || it.kind === 'p' ? it.snd.filter((l) => !K.isV(l) || it.kind === 'v') : it.snd;
      letters.forEach((l) => { const o = c.sounds[l] || (c.sounds[l] = { n: 0, s: 0 }); o.n++; o.s += r / 2; });
    }
  }
  const score = (h) => (h.length ? h.reduce((a, b) => a + b, 0) / (2 * h.length) : 0);

  function unitItems(c, u) { return u.items.filter((id) => !isHidden(c, id)); }

  function priority(c, id, today) {
    const s = stat(c, id); if (!s) return -6 + Math.random() * 2;
    let p = s.box * 8 + Math.random() * 3;
    if (dayNum(s.last) === today) p += 10; // bugün yapıldıysa geride kalsın
    if (s.due <= Date.now()) p -= 3;
    return p;
  }
  function pick(c, ids, n, taken) {
    const today = dayNum(Date.now());
    return ids.filter((id) => !taken.has(id)).map((id) => [priority(c, id, today), id]).sort((a, b) => a[0] - b[0]).slice(0, n).map((x) => x[1]);
  }

  function buildSession(c) {
    const st = c.settings, U = K.UNITS, u = U[Math.min(c.cur, U.length - 1)];
    const N = Math.max(1, st.perSession);
    const taken = new Set(); const steps = [];
    const unitHasMouth = u.items.some((id) => id[0] === 'm' || id[0] === 'b');

    // ısınma (ünite zaten ağız/nefes değilse)
    if (st.warmup && !unitHasMouth) {
      const keys = Object.keys(K.MOUTH_GAMES);
      const idx = (c.warmIdx || 0) % keys.length; c.warmIdx = idx + 1;
      steps.push({ type: 'item', id: 'm:' + keys[idx], warm: true });
    }
    if (st.breath && !unitHasMouth) {
      const keys = Object.keys(K.BREATH_GAMES);
      const idx = (c.breathIdx || 0) % keys.length; c.breathIdx = idx + 1;
      steps.push({ type: 'item', id: 'b:' + keys[idx], warm: true, short: true });
    }

    // ekstra slotlar
    const extra = [];
    const pinned = c.pinned.filter((id) => !isHidden(c, id) && item(c, id));
    if (pinned.length) extra.push(...pick(c, pinned, Math.min(2, Math.max(0, N - 1)), taken));
    extra.forEach((id) => taken.add(id));
    if (st.targets && st.targets.length && extra.length < N - 1) {
      const pool = [];
      U.slice(0, Math.min(U.length, c.cur + 2)).forEach((x) => x.items.forEach((id) => {
        const it = item(c, id); if (it && (it.kind === 'w' || it.kind === 's' || it.kind === 'c') && it.snd.some((l) => st.targets.includes(l)) && !isHidden(c, id)) pool.push(id);
      }));
      const p = pick(c, pool, 1, taken); p.forEach((id) => { extra.push(id); taken.add(id); });
    }
    if (st.review && c.cur > 0 && extra.length < N - 1) {
      const pool = [];
      U.slice(0, c.cur).forEach((x) => x.items.forEach((id) => { const s = stat(c, id); if (s && s.n > 0 && s.box <= 2 && s.due <= Date.now() && !isHidden(c, id) && id[0] !== 'm' && id[0] !== 'b') pool.push(id); }));
      const p = pick(c, pool, 1, taken); p.forEach((id) => { extra.push(id); taken.add(id); });
    }
    if (c.custom.length && extra.length < N - 1) {
      const p = pick(c, allItems(c).filter((id) => !isHidden(c, id)), 1, taken); p.forEach((id) => { extra.push(id); taken.add(id); });
    }

    const main = pick(c, unitItems(c, u), Math.max(1, N - extra.length), taken);
    main.forEach((id) => taken.add(id));
    // yeni (ana) öğeler önce, tekrar/ekstra sonra
    [...main, ...extra].forEach((id) => steps.push({ type: 'item', id }));
    if (st.langSlot && K.acts && K.acts.rotation && K.acts.rotation.length) {
      const rot = K.acts.rotation; const idx = (c.actIdx || 0) % rot.length; c.actIdx = idx + 1;
      steps.push({ type: 'act', act: rot[idx], rounds: 3, warm: true });
    }
    if (!steps.some((s) => !s.warm && s.type === 'item')) { // ünite boşsa (tümü gizli) güvenli yedek
      const any = pick(c, u.items, 1, new Set()); any.forEach((id) => steps.push({ type: 'item', id }));
    }
    return steps;
  }

  /* Ünite hazırlık ölçüsü */
  function readiness(c, u) {
    const ids = u.items.filter((id) => !isHidden(c, id));
    const tried = ids.filter((id) => c.items[id] && c.items[id].n >= 2);
    const need = Math.min(6, ids.length);
    const good = tried.filter((id) => score(c.items[id].hist.slice(-5)) >= 0.7).length;
    const days = new Set();
    c.sessions.forEach((s) => (s.marks || []).forEach((m) => { if (u.items.indexOf(m.id) >= 0) days.add(s.day); }));
    const pct = tried.length ? good / tried.length : 0;
    const ready = tried.length >= need && pct >= 0.75 && days.size >= 3;
    return { tried: tried.length, need, good, pct, days: days.size, ready, total: ids.length };
  }

  function sessionsToday(c) { const t = K.todayKey(); return c.sessions.filter((s) => s.day === t).length; }
  function canPlay(c) { return sessionsToday(c) < (K.store.state.settings.maxSessionsPerDay || 3); }

  function streak(c) {
    const days = new Set(c.sessions.map((s) => dayNum(s.t)));
    let d = dayNum(Date.now()); let n = 0;
    if (!days.has(d)) d--; // bugün henüz yoksa dünden say
    while (days.has(d)) { n++; d--; }
    return n;
  }
  function weekCounts(c) {
    const out = []; const today = dayNum(Date.now());
    for (let i = 6; i >= 0; i--) {
      const d = today - i; const date = new Date(d * DAY + DAY / 2);
      out.push({ d, label: ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'][new Date(d * DAY + 12 * 3600000).getUTCDay()], n: c.sessions.filter((s) => dayNum(s.t) === d).length, isToday: i === 0 });
    }
    return out;
  }
  const totalStars = (c) => c.sessions.reduce((a, s) => a + (s.stars || 0), 0);
  const totalMinutes = (c) => Math.round(c.sessions.reduce((a, s) => a + (s.dur || 0), 0) / 60);

  function finishSession(c, ses) {
    c.sessions.push(ses); if (c.sessions.length > 500) c.sessions.shift();
    let advance = null;
    const u = K.UNITS[c.cur];
    if (c.settings.autoAdvance && u) { const r = readiness(c, u); if (r.ready && c.cur < K.UNITS.length - 1) { advance = { from: c.cur, to: c.cur + 1 }; setUnit(c, c.cur + 1, 'oto'); } }
    K.store.save();
    return advance;
  }
  function setUnit(c, idx, why) {
    idx = Math.max(0, Math.min(K.UNITS.length - 1, idx));
    c.unitLog = c.unitLog || []; c.unitLog.push({ t: Date.now(), from: c.cur, to: idx, why: why || 'veli' });
    c.cur = idx; K.store.save();
  }

  /* ---------- Etkinlik (oyun) kaydı ---------- */
  function logGame(c, type, ok, total, mode) {
    const g = { t: Date.now(), day: K.todayKey(), type, ok: Math.round(ok * 10) / 10, total, mode: mode || 'auto' };
    c.games.push(g); if (c.games.length > 600) c.games.shift();
    const a = c.acts[type] || (c.acts[type] = { n: 0, ok: 0, total: 0, last: 0 }); a.n++; a.ok += ok; a.total += total; a.last = g.t;
    K.store.save(); return g;
  }

  /* ---------- Günün ev görevleri ---------- */
  function homeTasks(c) {
    const u = K.UNITS[Math.min(c.cur, K.UNITS.length - 1)]; const pool = K.DATA2.homeTasks[u.st] || K.DATA2.homeTasks[1];
    const day = dayNum(Date.now()); const out = [];
    const tg = (c.settings.targets || []).filter((l) => !K.isV(l));
    if (tg.length) { const l = tg[day % tg.length]; out.push('Gün içinde “' + K.trUp(l) + '” sesiyle başlayan 3 nesneyi gösterip adlandırın.'); }
    for (let i = 0; out.length < 3 && i < pool.length; i++) { const t = pool[(day + i) % pool.length]; if (out.indexOf(t) < 0) out.push(t); }
    return out;
  }
  function taskState(c) { const k = K.todayKey(); if (!c.tasks[k]) c.tasks[k] = [false, false, false]; return c.tasks[k]; }

  /* ---------- Kupalar ---------- */
  const stageStart = (st) => K.UNITS.findIndex((u) => u.st === st);
  const passed = (c, idx) => (c.unitLog || []).some((l) => l.from < idx && l.to >= idx);
  const TROPHIES = [
    { id: 't1', n: '1', name: 'İlk Antrenman', desc: 'İlk antrenmanı tamamladın!', ok: (c) => c.sessions.length >= 1 },
    { id: 't5', n: '5', name: '5 Antrenman', desc: '5 antrenman tamamladın.', ok: (c) => c.sessions.length >= 5 },
    { id: 't10', n: '10', name: '10 Antrenman', desc: 'Tam 10 antrenman!', ok: (c) => c.sessions.length >= 10 },
    { id: 't25', n: '25', name: '25 Antrenman', desc: 'Şampiyon gibi çalışıyorsun.', ok: (c) => c.sessions.length >= 25 },
    { id: 't50', n: '50', name: '50 Antrenman', desc: 'Yarım yüz antrenman!', ok: (c) => c.sessions.length >= 50 },
    { id: 's3', n: '3', name: '3 Gün Üst Üste', desc: 'Üç gün art arda antrenman.', ok: (c) => streak(c) >= 3 || (c.bestStreak || 0) >= 3 },
    { id: 's7', n: '7', name: '7 Gün Üst Üste', desc: 'Bir hafta boyunca her gün!', ok: (c) => streak(c) >= 7 || (c.bestStreak || 0) >= 7 },
    { id: 'm10', n: 'A', name: 'Ünlü Ustası', desc: 'Ünlülerin çoğunu rahat söylüyorsun.', ok: (c) => [...K.VOWELS].filter((v) => c.items['v:' + v] && c.items['v:' + v].box >= 2).length >= 4 },
    { id: 'w10', n: '10', name: '10 Kelime', desc: '10 kelimeyi rahat söyledin.', ok: (c) => Object.keys(c.items).filter((id) => id[0] === 'w' && c.items[id].box >= 2).length >= 10 },
    { id: 'w30', n: '30', name: '30 Kelime', desc: '30 kelime! Harika.', ok: (c) => Object.keys(c.items).filter((id) => id[0] === 'w' && c.items[id].box >= 2).length >= 30 },
    { id: 'x1', n: '🐮', name: 'Ses Taklitçisi', desc: '8 hayvan/araç sesini rahat taklit ettin.', ok: (c) => Object.keys(c.items).filter((id) => id[0] === 'a' && c.items[id].box >= 2).length >= 8 },
    { id: 'x2', n: '👂', name: 'Dinleme Ustası', desc: '10 dinleme oyunu oynadın.', ok: (c) => c.games.filter((g) => ['fsound', 'sylcount', 'rhyme', 'samediff', 'rain'].includes(g.type)).length >= 10 },
    { id: 'x3', n: '🌍', name: 'Dil Dünyası Kâşifi', desc: '10 dil etkinliği tamamladın.', ok: (c) => c.games.filter((g) => ['cat', 'action', 'opp', 'dir', 'build', 'qa', 'suffix', 'story', 'emotion', 'talk'].includes(g.type)).length >= 10 },
    { id: 'g1', n: '🔥', name: 'Isınma Tamam', desc: 'Isınma aşamasını bitirdin.', ok: (c) => passed(c, stageStart(2)) },
    { id: 'g2', n: '🎵', name: 'Hece Kralı', desc: 'Heceler aşamasını bitirdin.', ok: (c) => passed(c, stageStart(3)) },
    { id: 'g3', n: '🏀', name: 'Kelime Avcısı', desc: 'İlk kelimeler aşamasını bitirdin.', ok: (c) => passed(c, stageStart(4)) },
    { id: 'g4', n: '🏆', name: 'Kelime Ustası', desc: 'Kelime Ustası aşamasını bitirdin.', ok: (c) => passed(c, stageStart(5)) },
    { id: 'g5', n: '👑', name: 'Cümle Şampiyonu', desc: 'Tüm aşamaları tamamladın!', ok: (c) => c.cur >= K.UNITS.length - 1 && readiness(c, K.UNITS[K.UNITS.length - 1]).ready },
  ];
  function trophies(c) { return TROPHIES.map((t) => Object.assign({}, t, { got: !!t.ok(c) })); }
  function newTrophies(c) {
    const got = trophies(c).filter((t) => t.got && c.seenTrophies.indexOf(t.id) < 0);
    got.forEach((t) => c.seenTrophies.push(t.id)); if (got.length) K.store.save();
    return got;
  }
  function trackStreak(c) { const s = streak(c); if (s > (c.bestStreak || 0)) c.bestStreak = s; }

  K.engine = { logGame, homeTasks, taskState, record, buildSession, readiness, sessionsToday, canPlay, streak, weekCounts, totalStars, totalMinutes, finishSession, setUnit, trophies, newTrophies, trackStreak, score, stat, item, isHidden, unitItems, dayNum };
})(window);
