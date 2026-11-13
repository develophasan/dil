/* Konuşma Kampı — veli alanı: özet, plan, kitaplık, rapor, rehber, ayarlar */
(function (G) {
  'use strict';
  const K = G.KK, U = K.ui, h = U.h, icon = U.icon, E = K.engine, S = K.store;
  const range = (n) => Array.from({ length: n }, (_, i) => i);
  const VERSION = '1.1.0';
  K.parentUntil = 0;

  const label = (c, id) => {
    if (id.startsWith('x:')) { const a = K.acts && K.acts.A[id.slice(2)]; return a ? a.name : id; }
    const it = E.item(c, id); if (!it) return id;
    switch (it.kind) { case 'a': return it.w + ' (' + it.t + ')'; case 'r': return it.c + ' · ' + it.bpm; case 'l': return it.txt.split(' ')[0] + ': ' + it.w; case 't': return it.w; case 'k': return it.w; case 'w': case 'p': return it.w; case 's': return K.trUp(it.s); case 'v': return K.trUp(it.v); case 'c': return it.syl.join('-'); default: return it.name || id; }
  };
  const kindName = { w: 'Kelime', s: 'Hece', v: 'Ünlü', c: 'Zincir', p: 'Cümle', m: 'Ağız oyunu', b: 'Nefes', a: 'Ses taklidi', r: 'Ritim', l: 'Ses şiddeti', t: 'Tekerleme', k: 'Kaplumbağa' };
  const markIcon = (r) => h('span.mk.m' + r, icon(r === 2 ? 'check' : r === 1 ? 'tilde' : 'redo', 16));

  /* ======================= Yönlendirme ======================= */
  const TABS = [['summary', 'Özet', 'chart'], ['plan', 'Plan', 'list'], ['library', 'Kitaplık', 'book'], ['report', 'Rapor', 'print'], ['guide', 'Rehber', 'info'], ['settings', 'Ayarlar', 'gear']];

  U.route('/parent', (root, params) => {
    if (K.parentUntil < Date.now()) {
      root.className = 'scr light'; root.appendChild(h('div.page', h('p.centerp', 'Veli girişi bekleniyor…')));
      U.gate().then((ok) => { if (ok) { K.parentUntil = Date.now() + 15 * 60000; U.render(); } else U.go('/home', true); });
      return;
    }
    root.className = 'scr light';
    let tab = params.tab || 'summary'; const addMode = params.add === '1';
    const content = h('div.pcontent'); const tabbar = h('nav.tabbar', { 'aria-label': 'Veli bölümleri' });
    const c0 = S.cur();
    const header = h('header.phead',
      h('div.pwho', c0 ? [U.avatar(c0, 40), h('div', h('b', c0.name), h('small', 'Veli alanı'))] : h('b', 'Veli alanı')),
      h('button.btn.sm', { onclick: () => { K.parentUntil = 0; U.go('/home'); } }, icon('home', 18), 'Çocuk ekranı'));
    root.appendChild(h('div.pshell', header, content, tabbar));
    function draw() {
      tabbar.innerHTML = '';
      TABS.forEach(([id, name, ic]) => tabbar.appendChild(h('button.tab' + (id === tab ? '.on' : ''), { onclick: () => { tab = id; draw(); }, 'aria-current': id === tab ? 'page' : null }, icon(ic, 22), h('span', name))));
      content.innerHTML = ''; content.scrollTop = 0; root.scrollTop = 0;
      const c = S.cur();
      const fn = { summary, plan, library, report, guide, settings }[tab];
      if (!c && tab !== 'settings' && tab !== 'guide') { content.appendChild(h('p.centerp', 'Önce Ayarlar bölümünden bir çocuk ekleyin.')); return; }
      content.appendChild(fn(c, draw));
    }
    draw();
    if (addMode) setTimeout(() => addChildModal(draw), 100);
    return () => { /* kapanışta kilit çocuk ekranında sıfırlanır */ };
  });

  /* ======================= ÖZET ======================= */
  function tile(num, lab) { return h('div.stat', h('span.num', String(num)), h('small', lab)); }
  function summary(c) {
    const wrap = h('div.tabpane');
    const u = K.UNITS[Math.min(c.cur, K.UNITS.length - 1)], r = E.readiness(c, u);
    wrap.appendChild(h('div.stats', tile(c.sessions.length, 'ANTRENMAN'), tile(E.totalMinutes(c), 'DAKİKA'), tile(E.totalStars(c), 'YILDIZ'), tile(E.streak(c), 'GÜN SERİSİ')));

    // Aşama / hazırlık
    const bar = (p) => h('div.pbar', h('i', { style: { width: Math.round(Math.min(1, p) * 100) + '%' } }));
    const cur = h('section.card',
      h('div.cardhead', h('h2', 'Şu anki ünite'), h('span.badge', 'Aşama ' + u.st)),
      h('p.unitname', h('b.unum', String(u.i + 1).padStart(2, '0')), ' ', u.t),
      h('p.small', K.STAGES[u.st - 1].name + ' · ' + u.tip),
      h('div.readyrows',
        h('div.rrow', h('span', 'Denenen öğe'), bar(r.tried / r.need), h('b', r.tried + '/' + r.need)),
        h('div.rrow', h('span', 'Rahat oranı'), bar(r.pct), h('b', '%' + Math.round(r.pct * 100))),
        h('div.rrow', h('span', 'Farklı gün'), bar(r.days / 3), h('b', r.days + '/3'))),
      r.ready
        ? h('div.ready', h('b', '🎉 Bu ünite için hazır görünüyor.'), h('p.small', 'Çocuk öğelerin çoğunu 3+ günde rahat söyledi. İsterseniz sonraki üniteye geçebilirsiniz.'), h('button.btn', { onclick: () => { E.setUnit(c, c.cur + 1); U.toast('Yeni ünite: ' + K.UNITS[c.cur].t); U.render(); } }, 'Sonraki üniteye geç'))
        : h('p.small.note', 'Ölçüt: en az ' + r.need + ' öğe denendi, %75 rahat ve 3 farklı gün. Hazır değilse aynı ünitede kalmak normaldir.'));
    wrap.appendChild(cur);

    // Haftalık grafik
    const wk = E.weekCounts(c); const mx = Math.max(3, ...wk.map((d) => d.n));
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('viewBox', '0 0 280 130'); svg.setAttribute('class', 'wk'); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', 'Son 7 gün antrenman sayısı');
    wk.forEach((d, i) => {
      const x = 12 + i * 38, hh = (d.n / mx) * 80;
      svg.insertAdjacentHTML('beforeend', `<rect x="${x}" y="${100 - Math.max(hh, 3)}" width="26" height="${Math.max(hh, 3)}" rx="5" fill="${d.isToday ? '#fdb927' : '#552583'}" ${d.n ? '' : 'opacity=".25"'} stroke="#000" stroke-width="${d.n ? 2 : 0}"/><text x="${x + 13}" y="${100 - Math.max(hh, 3) - 6}" text-anchor="middle" font-family="Anton" font-size="14" fill="#000">${d.n || ''}</text><text x="${x + 13}" y="118" text-anchor="middle" font-family="Nunito" font-weight="800" font-size="11" fill="#525252">${d.label}</text>`);
    });
    wrap.appendChild(h('section.card', h('h2', 'Son 7 gün'), svg));

    // Ses başarıları
    const sounds = c.sounds || {}; const letters = K.TARGET_SOUNDS.concat([...K.VOWELS]).filter((l) => sounds[l] && sounds[l].n >= 3);
    wrap.appendChild(h('section.card', h('h2', 'Ses ve harf başarıları'),
      letters.length ? h('div.soundgrid', letters.map((l) => { const p = sounds[l].s / sounds[l].n; return h('div.snd', { title: sounds[l].n + ' deneme' }, h('i', { style: { height: Math.round(p * 100) + '%' } }), h('b', K.trUp(l)), h('small', '%' + Math.round(p * 100))); })) : h('p.small', 'Birkaç antrenmandan sonra burada hangi seslerin kolay, hangilerinin zor olduğu görünür.'),
      h('p.small.note', 'Yüzde, “rahat” ve “yaklaşık” işaretlerinden hesaplanır; kelime içindeki tüm harfler sayılır.')));

    // Zorlanan öğeler
    const hard = Object.keys(c.items).filter((id) => c.items[id].n >= 3 && E.score(c.items[id].hist.slice(-5)) < 0.5).sort((a, b) => E.score(c.items[a].hist) - E.score(c.items[b].hist)).slice(0, 6);
    wrap.appendChild(h('section.card', h('h2', 'Zorlanılan öğeler'), hard.length ? h('div.chips', hard.map((id) => h('button.chip' + (c.pinned.includes(id) ? '.on' : ''), { title: 'Sabitle / kaldır', onclick: (e) => { const i = c.pinned.indexOf(id); if (i >= 0) c.pinned.splice(i, 1); else c.pinned.push(id); S.save(); e.currentTarget.classList.toggle('on'); U.toast(i >= 0 ? 'Sabitleme kaldırıldı' : 'Her antrenmana eklenecek'); } }, label(c, id)))) : h('p.small', 'Şimdilik zorlanılan öğe yok.'), hard.length ? h('p.small.note', 'Dokunarak her antrenmana sabitleyebilirsiniz.') : null));

    // Günün ev görevleri
    const tasks = E.homeTasks(c), tstate = E.taskState(c);
    wrap.appendChild(h('section.card', h('h2', 'Bugünün ev görevleri'), h('p.small', 'Çalışmanın günlük hayata taşınması için kısa öneriler. Yaptıkça işaretleyin.'),
      h('div.tasks', tasks.map((t, i) => h('label.task', h('input', { type: 'checkbox', checked: !!tstate[i], onchange: (e) => { tstate[i] = e.target.checked; S.save(); } }), h('span', t))))));

    // Etkinlik sonuçları
    const acts = Object.keys(c.acts || {}).filter((id) => K.acts.A[id]);
    wrap.appendChild(h('section.card', h('h2', 'Dinleme ve dil etkinlikleri'),
      acts.length ? h('div.actlist', acts.sort((a, b) => c.acts[b].last - c.acts[a].last).map((id) => { const a = c.acts[id], pc = a.total ? Math.round(a.ok / a.total * 100) : 0; return h('div.actrow', h('span.ae', K.acts.A[id].e), h('div.utxt', h('b', K.acts.A[id].name), h('small', a.n + ' kez · ' + U.fmtDate(a.last))), h('div.pbar.small', h('i', { style: { width: pc + '%' } })), h('b.pct', '%' + pc)); }))
        : h('p.small', 'Çocuk Etkinlikler bölümünden oyun oynadıkça sonuçlar burada görünür.'),
      h('p.small.note', 'Yüzde, doğru yanıt ve veli işaretlerinden hesaplanır. Düşük skor bir değerlendirme değildir; hangi alanlarda daha çok destek verilebileceğini gösterir.')));

    // Son antrenmanlar
    const last = c.sessions.slice(-6).reverse();
    wrap.appendChild(h('section.card', h('h2', 'Son antrenmanlar'), last.length ? h('div.sesslist', last.map((s) => h('div.sess', h('div.shead', h('b', U.fmtDate(s.t) + ' ' + U.fmtTime(s.t)), h('small', U.mmss(s.dur) + ' · ' + '⭐'.repeat(s.stars || 0))), h('div.smarks', (s.marks || []).filter((m) => m.id[0] !== 'm' && m.id[0] !== 'b' && !m.act).map((m) => h('span.sm', markIcon(m.r), label(c, m.id))))))) : h('p.small', 'Henüz antrenman yok. Çocuk ekranından başlayabilirsiniz.')));

    // Notlar
    const noteI = h('textarea.input', { rows: 2, placeholder: 'Gözleminizi yazın (örn. “ba hecesini yardımsız söyledi”)', maxlength: 300 });
    const notes = h('div.notes');
    const drawNotes = () => { notes.innerHTML = ''; c.notes.slice().reverse().slice(0, 8).forEach((n, i) => notes.appendChild(h('div.noteitem', h('small', U.fmtDate(n.t)), h('p', n.text), h('button.iconlink', { 'aria-label': 'Notu sil', onclick: () => { c.notes.splice(c.notes.indexOf(n), 1); S.save(); drawNotes(); } }, icon('trash', 16))))); };
    drawNotes();
    wrap.appendChild(h('section.card', h('h2', 'Gözlem notları'), noteI, h('button.btn.sm', { onclick: () => { const t = noteI.value.trim(); if (!t) return; c.notes.push({ t: Date.now(), text: t }); S.save(); noteI.value = ''; drawNotes(); } }, 'Not ekle'), notes));
    return wrap;
  }

  /* ======================= PLAN ======================= */
  function stepper(val, min, max, onchange, fmt) {
    const out = h('b.stv', fmt ? fmt(val) : String(val)); let v = val;
    const set = (n) => { v = Math.max(min, Math.min(max, n)); out.textContent = fmt ? fmt(v) : String(v); onchange(v); };
    return h('div.stepper', h('button', { 'aria-label': 'Azalt', onclick: () => set(v - 1) }, '−'), out, h('button', { 'aria-label': 'Artır', onclick: () => set(v + 1) }, '+'));
  }
  function toggle(on, onchange, text) {
    const b = h('button.toggle' + (on ? '.on' : ''), { role: 'switch', 'aria-checked': String(!!on), onclick: () => { on = !on; b.classList.toggle('on', on); b.setAttribute('aria-checked', String(on)); onchange(on); } }, h('i'));
    return b;
  }
  const setting = (name, sub, ctrl) => h('div.setrow', h('div', h('b', name), sub ? h('small', sub) : null), ctrl);

  function plan(c, redraw) {
    const wrap = h('div.tabpane'); const st = c.settings;
    wrap.appendChild(h('section.card', h('h2', c.name + ' için antrenman ayarları'),
      setting('Mini antrenman süresi', 'Dikkat süresine göre kısa tutun', stepper(st.minutes, 1, 10, (v) => { st.minutes = v; S.save(); }, (v) => v + ' dk')),
      setting('Antrenmanda öğe sayısı', 'Çocuk çabuk yoruluyorsa 2', stepper(st.perSession, 1, 6, (v) => { st.perSession = v; S.save(); })),
      setting('Her öğede tekrar', 'Çocuğun söyleme sayısı', stepper(st.reps, 1, 6, (v) => { st.reps = v; S.save(); })),
      setting('Günlük en fazla antrenman', 'Tüm çocuklar için', stepper(S.state.settings.maxSessionsPerDay, 1, 8, (v) => { S.state.settings.maxSessionsPerDay = v; S.save(); })),
      setting('Ağız ısınması', 'Her antrenmanın başında bir ağız oyunu', toggle(st.warmup, (v) => { st.warmup = v; S.save(); })),
      setting('Nefes oyunu', 'Isınmadan sonra kısa nefes çalışması', toggle(st.breath, (v) => { st.breath = v; S.save(); })),
      setting('Eski öğeleri tekrar et', 'Zorlanılan eski öğeler araya girer', toggle(st.review, (v) => { st.review = v; S.save(); })),
      setting('Günün dil etkinliği', 'Her antrenmana 1 kısa dinleme/dil etkinliği ekler', toggle(st.langSlot !== false, (v) => { st.langSlot = v; S.save(); })),
      setting('Kaplumbağa konuşma', 'Yavaş, rahat konuşma çalışmasını Etkinlikler’de gösterir (uzman önerisiyle)', toggle(!!st.slow, (v) => { st.slow = v; S.save(); })),
      setting('Otomatik ilerle', 'Ölçüt sağlanınca sonraki üniteye kendisi geçer. Kapalıyken siz onaylarsınız.', toggle(st.autoAdvance, (v) => { st.autoAdvance = v; S.save(); }))));

    // Hedef sesler
    const tg = h('div.chips', K.TARGET_SOUNDS.map((l) => h('button.chip' + (st.targets.includes(l) ? '.on' : ''), { onclick: (e) => { const i = st.targets.indexOf(l); if (i >= 0) st.targets.splice(i, 1); else st.targets.push(l); S.save(); e.currentTarget.classList.toggle('on'); } }, K.trUp(l))));
    wrap.appendChild(h('section.card', h('h2', 'Odak sesler'), h('p.small', 'Seçilen seslerin geçtiği öğelerden her antrenmana bir tane eklenir (ünite ilerlemesi değişmez). Boş bırakabilirsiniz.'), tg));

    // Üniteler
    const list = h('div.unitlist');
    K.STAGES.forEach((s) => {
      list.appendChild(h('div.stagehead.light', h('span', s.icon), h('div', h('b', 'Aşama ' + s.id + ': ' + s.name), h('small', s.desc))));
      K.UNITS.filter((u) => u.st === s.id).forEach((u) => {
        const state = u.i < c.cur ? 'done' : u.i === c.cur ? 'cur' : 'next'; const r = E.readiness(c, u);
        list.appendChild(h('div.urow.' + state, h('span.unum', String(u.i + 1).padStart(2, '0')),
          h('div.utxt', h('b', u.t), h('small', u.items.length + ' öğe' + (state === 'cur' ? ' · ' + Math.round(r.pct * 100) + '% rahat' : state === 'done' ? ' · tamamlandı' : ''))),
          state === 'cur' ? h('span.badge', 'Şu an') : h('button.btn.sm.white', { onclick: async () => { if (state === 'done' || await U.confirmBox('Üniteye geçilsin mi?', '“' + u.t + '” ünitesine geçilecek. Atlanan üniteler tamamlanmış sayılır.', 'Geç')) { E.setUnit(c, u.i); U.toast('Ünite: ' + u.t); redraw(); } } }, 'Buradan başla')));
      });
    });
    wrap.appendChild(h('section.card', h('h2', 'Üniteler'), h('p.small', 'Aşamalar, çocuğun hazır oldukça ilerleyecek şekilde sıralanmıştır. İstediğiniz üniteden başlatabilir ya da geri dönebilirsiniz.'), list));
    return wrap;
  }

  /* ======================= KİTAPLIK ======================= */
  function library(c, redraw) {
    const wrap = h('div.tabpane'); let q = '', f = 'all', limit = 40; const recKeys = new Set();
    const rows = h('div.librows'); const more = h('button.btn.white.block', { onclick: () => { limit += 40; draw(); } }, 'Daha fazla göster');
    const all = () => {
      const arr = [];
      c.custom.forEach((x) => arr.push(x));
      K.WORDS.forEach((x) => arr.push(x)); Object.keys(K.PHRASES).forEach((id) => arr.push(K.PHRASES[id]));
      K.UNITS.filter((u) => u.st === 2).forEach((u) => u.items.forEach((id) => { const it = K.getItem(id); if (it && !arr.includes(it)) arr.push(it); }));
      ['a1', 'a2', 'l1'].forEach((uid) => K.UNIT_MAP[uid].items.forEach((id) => { const it = K.getItem(id); if (it && !arr.includes(it)) arr.push(it); }));
      Object.keys(K.SLOW).forEach((id) => arr.push(K.SLOW[id]));
      [...K.VOWELS].forEach((v) => arr.push(K.VOW[v]));
      return arr;
    };
    const items = all();
    const filterFn = (it) => {
      if (f === 'custom' && !it.id.startsWith('cw:')) return false;
      if (f === 'pinned' && !c.pinned.includes(it.id)) return false;
      if (f === 'hidden' && !c.hidden.includes(it.id)) return false;
      if (['w', 's', 'v', 'c', 'p'].includes(f) && it.kind !== f) return false;
      if (f === 'snd' && !['a', 'l', 'r', 't', 'k'].includes(it.kind)) return false;
      if (q) { const t = K.trLow(label(c, it.id)); if (!t.includes(K.trLow(q))) return false; }
      return true;
    };
    function draw() {
      rows.innerHTML = ''; const list = items.filter(filterFn); const shown = list.slice(0, limit);
      shown.forEach((it) => {
        const pinned = c.pinned.includes(it.id), hidden = c.hidden.includes(it.id), hasRec = recKeys.has('rec:' + it.id);
        rows.appendChild(h('div.librow' + (hidden ? '.hid' : ''),
          h('span.lemoji', it.e || (it.kind === 'w' ? '🖼️' : K.trUp(label(c, it.id).slice(0, 3)))),
          h('div.ltxt', h('b', label(c, it.id)), h('small', kindName[it.kind] + (it.syl && it.kind === 'w' ? ' · ' + it.syl.join('-') : '') + (hasRec ? ' · 🎙 kendi sesiniz' : ''))),
          h('div.lact',
            h('button.iconlink', { 'aria-label': 'Dinle', onclick: () => K.audio.say(it) }, icon('speaker', 20)),
            h('button.iconlink' + (hasRec ? '.on' : ''), { 'aria-label': 'Kendi sesinizi kaydedin', onclick: () => recordModal(it, () => { S.blobKeys('rec:').then((ks) => { recKeys.clear(); ks.forEach((k) => recKeys.add(k)); draw(); }); }) }, icon('mic', 20)),
            h('button.iconlink' + (pinned ? '.on' : ''), { 'aria-label': pinned ? 'Sabitlemeyi kaldır' : 'Her antrenmana sabitle', onclick: () => { const i = c.pinned.indexOf(it.id); if (i >= 0) c.pinned.splice(i, 1); else c.pinned.push(it.id); S.save(); draw(); } }, icon('star', 20)),
            h('button.iconlink' + (hidden ? '.on' : ''), { 'aria-label': hidden ? 'Göster' : 'Gizle', onclick: () => { const i = c.hidden.indexOf(it.id); if (i >= 0) c.hidden.splice(i, 1); else c.hidden.push(it.id); S.save(); draw(); } }, icon(hidden ? 'eyeoff' : 'eye', 20)),
            it.id.startsWith('cw:') ? h('button.iconlink', { 'aria-label': 'Sil', onclick: async () => { if (await U.confirmBox('Kelime silinsin mi?', '“' + it.w + '” silinecek.', 'Sil', 'purple')) { c.custom = c.custom.filter((x) => x.id !== it.id); S.delBlob('img:' + c.id + ':' + it.id); S.delBlob('rec:' + it.id); S.save(); redraw(); } } }, icon('trash', 20)) : null)));
      });
      if (!list.length) rows.appendChild(h('p.centerp', 'Sonuç yok.'));
      more.hidden = list.length <= limit; countEl.textContent = list.length + ' öğe';
    }
    const countEl = h('small.count', '');
    const search = h('input.input', { type: 'search', placeholder: 'Ara (kelime, hece…)', 'aria-label': 'Ara', oninput: (e) => { q = e.target.value.trim(); limit = 40; draw(); } });
    const FIL = [['all', 'Hepsi'], ['w', 'Kelime'], ['s', 'Hece'], ['v', 'Ünlü'], ['p', 'Cümle'], ['snd', 'Ses/ritim'], ['custom', 'Özel'], ['pinned', 'Sabit'], ['hidden', 'Gizli']];
    const chips = h('div.chips.scroll', FIL.map(([id, n]) => h('button.chip' + (id === f ? '.on' : ''), { onclick: (e) => { f = id; limit = 40; [...chips.children].forEach((x) => x.classList.toggle('on', x === e.currentTarget)); draw(); } }, n)));
    wrap.appendChild(h('section.card', h('div.cardhead', h('h2', 'Kitaplık'), h('button.btn.sm', { onclick: () => addWordModal(c, redraw) }, icon('plus', 18), 'Kelime ekle')),
      h('p.small', 'Kendi sesinizi kaydedin (cihaz sesinden daha doğal), kelimeleri her antrenmana sabitleyin ya da gizleyin. Kendi kelimeniz için fotoğraf da ekleyebilirsiniz.'), search, chips, countEl));
    wrap.appendChild(rows); wrap.appendChild(more);
    S.blobKeys('rec:').then((ks) => { ks.forEach((k) => recKeys.add(k)); draw(); }); draw();
    return wrap;
  }

  function recordModal(it, done) {
    let rec = null; const status = h('p.recstat', 'Hazır. Kaydı başlatmak için düğmeye basın, kelimeyi net söyleyin.');
    const startB = h('button.btn.big', { onclick: async () => {
      try {
        rec = await K.audio.startRecord(); startB.hidden = true; stopB.hidden = false; status.textContent = '🔴 Kayıt alınıyor… (en fazla 4 sn)';
        rec.stop().then(async (blob) => { stopB.hidden = true; if (blob.size > 800) { await S.putBlob('rec:' + it.id, blob); status.textContent = 'Kaydedildi ✓'; K.audio.playBlob(blob); done(); } else status.textContent = 'Kayıt alınamadı.'; });
      } catch (e) { status.textContent = 'Mikrofon kullanılamadı: ' + (e.message || e); }
    } }, icon('mic', 24), 'Kaydı başlat');
    const stopB = h('button.btn.big', { hidden: true, onclick: () => rec && rec.stop() }, 'Bitir');
    const hasRec = S.getBlob('rec:' + it.id);
    modal2(label(S.cur(), it.id) + ' — kendi sesim', h('div', status, startB, stopB, h('p.small', 'Ses yalnızca bu cihazda saklanır.')), [{ label: 'Kayıtlı sesi sil', cls: 'white', onclick: async () => { await S.delBlob('rec:' + it.id); U.toast('Kayıt silindi'); done(); } }, { label: 'Kapat', value: true }]);
  }
  const modal2 = (title, body, actions) => U.modal({ title, body, actions });

  async function downscale(file, max) {
    const bmp = await (G.createImageBitmap ? createImageBitmap(file) : new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(file); }));
    const sc = Math.min(1, max / Math.max(bmp.width, bmp.height)); const cv = document.createElement('canvas'); cv.width = Math.round(bmp.width * sc); cv.height = Math.round(bmp.height * sc);
    cv.getContext('2d').drawImage(bmp, 0, 0, cv.width, cv.height);
    return new Promise((res) => cv.toBlob((b) => res(b), 'image/jpeg', 0.82));
  }
  function addWordModal(c, redraw) {
    const w = h('input.input', { placeholder: 'Kelime (örn. mama, Pamuk, dede)', maxlength: 24 });
    const e = h('input.input', { placeholder: 'Emoji (isteğe bağlı, örn. 🐶)', maxlength: 4 });
    let photo = null; const prev = h('div.photoprev');
    const file = h('input', { type: 'file', accept: 'image/*', hidden: true, onchange: async (ev) => { const f = ev.target.files[0]; if (!f) return; try { photo = await downscale(f, 520); prev.innerHTML = ''; const u = URL.createObjectURL(photo); prev.appendChild(h('img', { src: u, alt: 'Seçilen fotoğraf' })); } catch (er) { U.toast('Fotoğraf okunamadı'); } } });
    U.modal({ title: 'Kendi kelimenizi ekleyin', body: h('div.form', h('p.small', 'Aile üyeleri, evcil hayvan, sevdiği oyuncak gibi çocuğa özel kelimeler için. Fotoğraf cihazdan çıkmaz.'), w, e, h('button.btn.white.block', { onclick: () => file.click() }, icon('camera', 20), 'Fotoğraf ekle / çek'), file, prev),
      actions: [{ label: 'Vazgeç', cls: 'white', value: false }, { label: 'Kaydet', value: true, onclick: async () => {
        const word = K.trLow(w.value.trim()); if (!word || /\s/.test(word)) { U.toast('Tek bir kelime yazın'); return false; }
        const syl = K.syllabify(word); const id = 'cw:' + K.uid('');
        c.custom.push({ id, kind: 'w', w: word, e: e.value.trim() || (photo ? '' : '⭐'), img: !!photo, syl, n: syl.length, init: [...word][0], fin: [...word].slice(-1)[0], snd: [...new Set([...word])] });
        if (photo) await S.putBlob('img:' + c.id + ':' + id, photo);
        S.save(); U.toast('Kelime eklendi'); setTimeout(redraw, 50);
      } }] });
  }

  /* ======================= RAPOR ======================= */
  function report(c) {
    const wrap = h('div.tabpane'); let range = 'all';
    const body = h('div.report');
    const sel = h('div.segs', [['all', 'Tümü'], ['30', 'Son 30 gün'], ['7', 'Son 7 gün']].map(([v, n]) => h('button.seg' + (v === range ? '.on' : ''), { onclick: (e) => { range = v; [...sel.children].forEach((x) => x.classList.toggle('on', x === e.currentTarget)); draw(); } }, h('b', n))));
    function draw() {
      body.innerHTML = '';
      const now = Date.now(); const from = range === 'all' ? 0 : now - Number(range) * 86400000;
      const ss = c.sessions.filter((s) => s.t >= from);
      const marks = ss.flatMap((s) => (s.marks || []).filter((m) => m.id[0] !== 'm' && m.id[0] !== 'b' && !m.act));
      const gms = c.games.filter((g) => g.t >= from); const gAgg = {}; gms.forEach((g) => { const a = gAgg[g.type] || (gAgg[g.type] = { n: 0, ok: 0, total: 0 }); a.n++; a.ok += g.ok; a.total += g.total; });
      const cnt = [0, 0, 0]; marks.forEach((m) => cnt[m.r]++);
      const u = K.UNITS[c.cur];
      const first = c.sessions[0] ? U.fmtDate(c.sessions[0].t) : '-', last = c.sessions.length ? U.fmtDate(c.sessions[c.sessions.length - 1].t) : '-';
      const sounds = c.sounds || {}; const ls = K.TARGET_SOUNDS.concat([...K.VOWELS]).filter((l) => sounds[l] && sounds[l].n >= 3);
      const strong = Object.keys(c.items).filter((id) => c.items[id].n >= 3 && E.score(c.items[id].hist.slice(-5)) >= 0.8).slice(0, 14);
      const weak = Object.keys(c.items).filter((id) => c.items[id].n >= 3 && E.score(c.items[id].hist.slice(-5)) < 0.5).slice(0, 14);
      const parts = [
        h('div.rhead', h('h1', 'Konuşma Kampı — Gelişim Özeti'), h('p', h('b', c.name), c.age ? ' · ' + c.age + ' yaş' : '', ' · Rapor tarihi: ' + U.fmtDate(now))),
        h('table.rtable', h('tbody',
          row('Dönem', range === 'all' ? first + ' – ' + last : 'Son ' + range + ' gün'),
          row('Antrenman sayısı', ss.length + ' (' + Math.round(ss.reduce((a, s) => a + s.dur, 0) / 60) + ' dk)'),
          row('Değerlendirilen çalışma', marks.length + ' (Rahat: ' + cnt[2] + ' · Yaklaşık: ' + cnt[1] + ' · Tekrar: ' + cnt[0] + ')'),
          row('Şu anki ünite', 'Ünite ' + (u.i + 1) + ': ' + u.t + ' (Aşama ' + u.st + ' – ' + K.STAGES[u.st - 1].name + ')'),
          row('Antrenman ayarları', c.settings.minutes + ' dk · ' + c.settings.perSession + ' öğe · ' + c.settings.reps + ' tekrar'),
          row('Odak sesler', c.settings.targets.length ? c.settings.targets.map(K.trUp).join(', ') : '—'))),
        h('h3', 'Dinleme ve dil etkinlikleri'),
        Object.keys(gAgg).filter((id) => K.acts.A[id]).length ? h('table.rtable', h('tbody', Object.keys(gAgg).filter((id) => K.acts.A[id]).map((id) => row(K.acts.A[id].name, gAgg[id].n + ' kez · %' + Math.round(gAgg[id].ok / gAgg[id].total * 100))))) : h('p', 'Bu dönemde etkinlik oynanmadı.'),
        h('h3', 'Ses / harf başarı oranları'),
        ls.length ? h('table.rtable', h('thead', h('tr', ls.map((l) => h('th', K.trUp(l))))), h('tbody', h('tr', ls.map((l) => h('td', '%' + Math.round(sounds[l].s / sounds[l].n * 100)))), h('tr.sm', ls.map((l) => h('td', sounds[l].n + ' den.'))))) : h('p', 'Yeterli veri yok (en az 3 deneme gerekir).'),
        h('h3', 'Rahat söylenen öğeler'), h('p', strong.length ? strong.map((id) => label(c, id)).join(', ') : '—'),
        h('h3', 'Zorlanılan öğeler'), h('p', weak.length ? weak.map((id) => label(c, id)).join(', ') : '—'),
        c.unitLog && c.unitLog.length ? [h('h3', 'Ünite geçişleri'), h('p', c.unitLog.slice(-8).map((l) => U.fmtDate(l.t) + ': ' + (l.to + 1) + '. üniteye').join(' · '))] : null,
        c.notes.length ? [h('h3', 'Veli notları'), h('ul', c.notes.slice(-6).map((n) => h('li', U.fmtDate(n.t) + ' — ' + n.text)))] : null,
        h('p.rfoot', 'Bu rapor veli gözlemlerine dayanır ve tanı niteliği taşımaz. Konuşma ve dil terapisti ya da öğretmenle paylaşılabilir. Veriler yalnızca bu cihazdan alınmıştır.')];
      parts.flat().filter(Boolean).forEach((x) => body.appendChild(x));
    }
    const row = (a, b) => h('tr', h('th', a), h('td', b));
    wrap.appendChild(h('section.card.noprint', h('h2', 'Rapor'), h('p.small', 'Öğretmen veya dil ve konuşma terapistiyle paylaşmak için yazdırılabilir özet. “Yazdır” ekranından PDF olarak kaydedebilirsiniz.'), sel, h('button.btn.block', { onclick: () => { G.print(); } }, icon('print', 22), 'Yazdır / PDF kaydet')));
    wrap.appendChild(body); draw(); return wrap;
  }

  /* ======================= REHBER ======================= */
  const GUIDE = [
    ['Bir antrenman nasıl geçer?', [
      'Sessiz bir köşede, çocukla göz hizasında oturun. TV ve diğer sesleri kapatın.',
      'Antrenman 3–4 dakikadır: önce ağız oyunu ve nefes, sonra 2–4 çalışma.',
      'Her çalışmada sıra şöyle: dinleyin → birlikte söyleyin → çocuk söylesin → siz işaretleyin.',
      'Süre dolunca bırakın. Çocuk istekli olsa bile “yarın devam” demek ertesi günün isteğini korur.']],
    ['İşaretleme nasıl yapılır?', [
      'Rahat: yardım almadan, kolayca söyledi.',
      'Yaklaşık: yardımla ya da sese yakın söyledi.',
      'Tekrar: zorlandı veya söyleyemedi. Bu başarısızlık değildir; uygulama o öğeyi yakında yeniden getirir.',
      'Emin değilseniz “Yaklaşık” seçin. Dürüst işaretleme planın çocuğa uyması için önemlidir.']],
    ['Yapın / Yapmayın', [
      'Yapın: önce siz gösterin, aynada birlikte yapın, her denemeyi ödüllendirin, yavaş ve net konuşun.',
      'Yapın: yanlış söylediğinde doğrusunu yavaşça kendiniz söyleyin (model olun).',
      'Yapmayın: “Yanlış!”, “Tekrar söyle!” demeyin; zorlamayın; kardeşle kıyaslamayın.',
      'Yapmayın: başkalarının yanında test etmeyin; çalışmayı ceza gibi sunmayın.']],
    ['Ağız şekli ve ses ipuçları', [
      'A: ağız kocaman açık. E: yarı açık, dudaklar yana. İ: gülümseme. O/U: yuvarlak dudak. Ö/Ü: yuvarlak dudak, dil önde.',
      'M, P, B: dudaklar birleşir. T, D, N, L: dil ucu üst dişlerin arkasında. K, G: dilin arkası yukarı kalkar.',
      'S, Z: dişler yaklaşır, ince hava. Ş, Ç, C: dudaklar biraz öne. F, V: üst dişler alt dudağa. R: dil ucu titrer (en geç oturan seslerden biridir).',
      'Uygulamadaki “Dil nerede?” çizimi ve ağız modeli, bu ipuçlarını çocuğa gösterir.']],
    ['Kelimenin başına ek ses (“dıdıdı”) ya da takılma olursa', [
      'Uyarmayın, düzeltmeyin. Sakin kalıp gülümseyerek bekleyin.',
      'Birlikte derin nefes alın, sonra kelimeyi siz yavaşça söyleyin.',
      'Birlikte, ritimle (hece hece vurarak) söyleyin; sonra çocuk tek başına denesin.',
      'İlk sesi hafifçe uzatmak kolaylaştırır: “mmmuz”, “sssu”.',
      'Takılma 6 aydan uzun sürüyor ya da çocuk gerginleşiyorsa bir dil ve konuşma terapistine danışın.']],
    ['Dikkati kısa olan çocuklar için', [
      'Antrenman süresini 2 dakikaya, öğe sayısını 2’ye indirin (Plan > Ayarlar).',
      'Tek hedef, çok tekrar: aynı birkaç öğeyi günlerce tekrarlamak öğrenmeyi sağlamlaştırır.',
      'Ödülü hemen verin: alkış, sarılma, yıldız. Bitişi görünür kılın (uygulamadaki top ve kum saati).',
      'Aynı saatte, aynı yerde çalışın; rutin güven verir.',
      'Gün iyi geçmiyorsa sadece ağız oyunu ya da şarkı yeterlidir.']],
    ['Gelişme yavaş görünüyorsa', [
      'Çocuklar farklı hızlarda öğrenir; bir sesin yerleşmesi haftalar, bazen aylar alabilir.',
      'Uygulama ilerlemeyi takvime göre değil, çocuğun başarısına göre ayarlar. Aynı ünitede kalmak ya da geri dönmek normaldir.',
      'Çalışmayı haftada 5–6 gün, kısa seanslarla sürdürmek yoğun ama seyrek çalışmaktan daha etkilidir.',
      'Küçük ilerlemeleri (ilk kez söylenen bir ses bile) kutlayın.']],
    ['Ne zaman uzmana başvurmalı?', [
      'Çevresindekiler çocuğu anlamakta zorlanıyorsa; kelime dağarcığı yaşıtlarına göre belirgin biçimde azsa.',
      'Daha önce söylediği sesleri ya da kelimeleri kaybediyorsa.',
      'İşitme ile ilgili en küçük şüphe varsa (KBB / odyoloji kontrolü iyi bir ilk adımdır).',
      'Konuşurken belirgin çaba, gerginlik, yüz buruşturma veya konuşmaktan kaçınma görüyorsanız.',
      '4–6 hafta düzenli çalışmaya rağmen belirgin ilerleme olmuyorsa.',
      'Bu uygulama bir terapinin yerine geçmez; terapist planını destekleyici bir ev çalışması aracı olarak kullanılabilir. Raporu terapistle paylaşabilirsiniz.']],
    ['Etkinlikler (dinleme, dil, ses, hafıza)', [
      'Antrenmana her gün kısa bir “dil etkinliği” de eklenir (Plan’dan kapatabilirsiniz). Çocuk dilerse Etkinlikler bölümünden serbestçe de oynar.',
      'Dinleme oyunları (ilk sesi bul, kaç hece, kafiye, aynı mı farklı mı, ses yağmuru) konuşmadan önceki ses farkındalığını destekler. Doğru yanıt otomatik puanlanır.',
      'Dil Dünyası etkinliklerinde (kelime kategorileri, eylemler, zıtlar, yönergeler, cümle kurma, soru-cevap, ekler, hikâye, duygular, günlük iletişim) çocuk söylediğinde siz “Rahat / Yaklaşık / Tekrar” dersiniz.',
      'Hayvan ve araç sesleri, ritim, tekerleme ve ses şiddeti çalışmaları en erken seviye için güzel bir başlangıçtır; Ses ve Ritim bölümünde serbestçe de oynanır.',
      'Ağız Aynası kamerada kendini gösterir; görüntü hiçbir yere kaydedilmez ve cihazdan çıkmaz. Hedef şekle gelip gelmediğini veli değerlendirir (otomatik takip yoktur).',
      'Kaplumbağa konuşma yavaş ve rahat bir başlangıcı destekler; akıcılıkla ilgili bir endişeniz varsa bir dil ve konuşma terapistine danışarak kullanın.']],
    ['Veriler nerede? Kaybolur mu?', [
      'Tüm bilgiler bu cihazın tarayıcı depolamasındadır; hiçbir yere gönderilmez.',
      'Tarayıcı verileri silinir ya da cihaz değişirse veriler gider. Ayarlar > Yedek bölümünden düzenli yedek alın.',
      'Yedek dosyasını başka bir cihazda “İçe aktar” ile geri yükleyebilirsiniz.']],
  ];
  function guide() {
    const wrap = h('div.tabpane');
    wrap.appendChild(h('section.card', h('h2', 'Veli Rehberi'), h('p.small', 'Kısa ve uygulanabilir ipuçları.')));
    GUIDE.forEach(([t, items], i) => wrap.appendChild(h('details.acc', i === 0 ? { open: true } : null, h('summary', t), h('ul', items.map((x) => h('li', x))))));
    return wrap;
  }

  /* ======================= AYARLAR ======================= */
  function addChildModal(redraw, existing) {
    const form = childForm2(existing);
    U.modal({ title: existing ? 'Profili düzenle' : 'Çocuk ekle', body: form.el, actions: [{ label: 'Vazgeç', cls: 'white', value: false }, { label: 'Kaydet', value: true, onclick: () => { const v = form.value(); if (existing) { existing.name = v.name; existing.age = v.age; existing.avatar = v.avatar; } else { S.addChild(v); } S.save(); setTimeout(redraw, 30); } }] });
  }
  function childForm2(existing) {
    // Çocuk formunu child.js'den ayrı kullanmak için basit sarmalayıcı
    const el = K.childForm({ value: existing ? { name: existing.name, age: existing.age, avatar: existing.avatar, level: existing.level, minutes: existing.settings.minutes } : null, hideLevel: !!existing });
    return { el, value: el.value };
  }

  function settings(c, redraw) {
    const wrap = h('div.tabpane'); const st = S.state;
    // Profiller
    wrap.appendChild(h('section.card', h('div.cardhead', h('h2', 'Çocuk profilleri'), h('button.btn.sm', { onclick: () => addChildModal(redraw) }, icon('plus', 18), 'Ekle')),
      h('div.profiles', st.children.map((ch) => h('div.prow' + (ch.id === st.active ? '.on' : ''), U.avatar(ch, 40), h('div.utxt', h('b', ch.name), h('small', ch.sessions.length + ' antrenman')),
        h('button.iconlink', { 'aria-label': 'Seç', onclick: () => { st.active = ch.id; S.save(); redraw(); } }, icon('check', 20)),
        h('button.iconlink', { 'aria-label': 'Düzenle', onclick: () => addChildModal(redraw, ch) }, icon('edit', 20)),
        h('button.iconlink', { 'aria-label': 'Sil', onclick: async () => { if (await U.confirmBox(ch.name + ' silinsin mi?', 'Bu çocuğun tüm ilerlemesi ve kayıtları silinir. Geri alınamaz.', 'Sil', 'purple')) { S.removeChild(ch.id); if (!st.children.length) { st.onboarded = false; S.save(); U.go('/welcome'); } else redraw(); } } }, icon('trash', 20)))))));

    // Ses
    const ttsInfo = K.audio.ttsSupported() ? (K.audio.hasTTS() ? null : 'Bu cihazda Türkçe sesli okuma bulunamadı. Kitaplık bölümünden kelimeleri kendi sesinizle kaydedin.') : 'Bu tarayıcı sesli okumayı desteklemiyor. Kelimeleri kendi sesinizle kaydedebilirsiniz.';
    wrap.appendChild(h('section.card', h('h2', 'Ses ve görünüm'),
      setting('Sesli okuma', 'Cihazın Türkçe sesi', toggle(st.settings.voice, (v) => { st.settings.voice = v; S.save(); })),
      setting('Okuma hızı', 'Yavaş okuma çocuğa yardımcı olur', h('div.rate', h('input', { type: 'range', min: 0.5, max: 1.1, step: 0.05, value: st.settings.voiceRate, 'aria-label': 'Okuma hızı', onchange: (e) => { st.settings.voiceRate = Number(e.target.value); S.save(); } }), h('button.btn.sm.white', { onclick: () => K.audio.speak('Merhaba, ben konuşma kampı.') }, 'Dene'))),
      ttsInfo ? h('p.small.warnbox', ttsInfo) : null,
      setting('Ses efektleri', 'Dokunma ve ödül sesleri', toggle(st.settings.sfx, (v) => { st.settings.sfx = v; S.save(); })),
      setting('Hareketi azalt', 'Animasyonları kısaltır', toggle(st.settings.reduceMotion, (v) => { st.settings.reduceMotion = v; document.documentElement.classList.toggle('reduce', v); S.save(); }))));

    // Uygulama olarak yükle
    wrap.appendChild(installCard());

    // PIN
    const hasPin = !!st.settings.pin;
    wrap.appendChild(h('section.card', h('h2', 'Güvenlik'), h('p.small', hasPin ? 'Veli alanı PIN ile korunuyor.' : 'PIN belirlenmedi; veli alanı 3 sn basılı tutma ile açılıyor.'),
      h('button.btn.block', { onclick: () => pinModal(redraw) }, hasPin ? 'PIN\'i değiştir' : 'PIN belirle'),
      hasPin ? h('button.btn.white.block', { onclick: async () => { if (await U.confirmBox('PIN kaldırılsın mı?', 'Veli alanı yalnızca basılı tutma ile korunur.', 'Kaldır')) { st.settings.pin = null; st.settings.recovery = null; S.save(); redraw(); } } }, 'PIN\'i kaldır') : null));

    // Yedek
    const usage = h('small.usage', '');
    S.usage().then((e) => { if (e && e.usage != null) usage.textContent = 'Kullanılan depolama: ' + (e.usage / 1048576).toFixed(1) + ' MB' + (S.persisted === true ? ' · kalıcı depolama açık' : ''); });
    const imp = h('input', { type: 'file', accept: '.json,application/json', hidden: true, onchange: async (ev) => {
      const f = ev.target.files[0]; if (!f) return;
      try { const obj = JSON.parse(await f.text()); if (!(await U.confirmBox('Yedek geri yüklensin mi?', 'Bu cihazdaki mevcut veriler yedekteki verilerle değiştirilir.', 'Geri yükle', 'purple'))) return; await S.importAll(obj); U.toast('Yedek yüklendi'); U.go('/home'); setTimeout(() => location.reload(), 300); } catch (e) { U.toast('Yedek okunamadı: ' + (e.message || '')); }
    } });
    wrap.appendChild(h('section.card', h('h2', 'Yedek'), h('p.small', 'Veriler yalnızca bu cihazdadır. Tarayıcı verisi silinirse veya cihaz değişirse yedeğe ihtiyaç duyarsınız. Yedek dosyası ses kayıtlarını ve fotoğrafları da içerir.'),
      h('button.btn.block', { onclick: async () => { const o = await S.exportAll(); const blob = new Blob([JSON.stringify(o)], { type: 'application/json' }); const a = h('a', { href: URL.createObjectURL(blob), download: 'konusma-kampi-yedek-' + K.todayKey() + '.json' }); document.body.appendChild(a); a.click(); a.remove(); U.toast('Yedek indirildi'); } }, icon('download', 22), 'Yedek indir'),
      h('button.btn.white.block', { onclick: () => imp.click() }, icon('upload', 22), 'Yedekten geri yükle'), imp,
      h('button.btn.white.block', { onclick: async () => { const r = await S.requestPersist(); U.toast(r ? 'Kalıcı depolama açıldı' : 'Tarayıcı kalıcı depolamaya izin vermedi'); } }, 'Kalıcı depolama iste'), usage));

    // Tehlikeli alan
    wrap.appendChild(h('section.card.danger', h('h2', 'Tüm verileri sil'), h('p.small', 'Bu cihazdaki tüm profiller, ilerleme, kayıtlar ve fotoğraflar kalıcı olarak silinir.'),
      h('button.btn.purple.block', { onclick: async () => { if (await U.confirmBox('Her şey silinsin mi?', 'Bu işlem geri alınamaz. Önce yedek almanız önerilir.', 'Evet, sil', 'purple')) { await S.wipe(); K.parentUntil = 0; location.hash = '#/welcome'; location.reload(); } } }, 'Tüm verileri sil')));

    // Hakkında
    wrap.appendChild(h('section.card', h('h2', 'Hakkında'),
      h('p', h('b', 'Konuşma Kampı'), ' v' + VERSION),
      h('p.small', 'Konuşma ve dil gelişimini destekleyen, çocuk ve veli birlikte kullanım için hazırlanmış çevrimdışı ev çalışması aracı. Tanı koymaz, terapinin yerine geçmez.'),
      h('p.small', 'Gizlilik: Hesap yok, sunucu yok, çerez ve izleyici yok. Uygulama hiçbir veriyi ağa göndermez. Mikrofon yalnızca siz kendi sesinizi kaydederken; kamera yalnızca fotoğraf eklerken kullanılır ve çıktılar cihazda kalır.'),
      h('p.small', 'Yazı tipleri: Alfa Slab One, Anton, Nunito (SIL Open Font License 1.1). Bu uygulama herhangi bir spor takımı veya markayla bağlantılı değildir.')));
    return wrap;
  }

  function installCard() {
    const ua = navigator.userAgent, I = K.install || {};
    const isIOS = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    const isSafari = /Safari/.test(ua) && !/Chrome|Chromium|Edg|CriOS|FxiOS/.test(ua);
    const secure = G.isSecureContext;
    const body = [];
    if (I.standalone) body.push(h('p', h('b', '✓ Uygulama olarak çalışıyor.'), ' Çevrimdışı da kullanabilirsiniz.'));
    else {
      if (I.evt) body.push(h('button.btn.big.block', { onclick: async () => { try { I.evt.prompt(); await I.evt.userChoice; } catch (e) { /* */ } I.evt = null; } }, icon('download', 22), 'Uygulamayı yükle'));
      body.push(h('div.install',
        h('p', h('b', 'Chrome / Edge (Windows, Mac, Android): '), 'adres çubuğunun sağındaki “Yükle” simgesine tıklayın ya da menüden ', h('i', 'Kaydet ve paylaş › Uygulama olarak yükle'), ' seçin.'),
        h('p', h('b', 'Safari (Mac): '), 'menüden ', h('i', 'Dosya › Dock\'a Ekle'), ' seçin (macOS Sonoma ve sonrası).'),
        h('p', h('b', 'iPhone / iPad (Safari): '), h('i', 'Paylaş › Ana Ekrana Ekle'), '.')));
      if (!secure) body.push(h('p.small.warnbox', 'Yükleme için sayfa HTTPS ya da localhost üzerinden açılmalıdır. Şu an güvenli olmayan bir adresten açık.'));
    }
    return h('section.card', h('h2', 'Uygulama olarak yükle'), h('p.small', 'Masaüstüne veya ana ekrana eklenir; kendi penceresinde açılır ve internetsiz çalışır. Veriler yine yalnızca bu cihazda kalır.'), body);
  }

  function pinModal(redraw) {
    const st = S.state; const a = h('input.input.pin', { type: 'password', inputmode: 'numeric', maxlength: 4, placeholder: 'Yeni PIN (4 rakam)' }); const b = h('input.input.pin', { type: 'password', inputmode: 'numeric', maxlength: 4, placeholder: 'PIN tekrar' }); const msg = h('p.small', '');
    U.modal({ title: 'PIN belirle', body: h('div.form', a, b, msg), actions: [{ label: 'Vazgeç', cls: 'white', value: false }, { label: 'Kaydet', value: true, onclick: async (close) => {
      if (!/^\d{4}$/.test(a.value)) { msg.textContent = 'PIN 4 rakam olmalı.'; return false; } if (a.value !== b.value) { msg.textContent = 'PIN\'ler eşleşmiyor.'; return false; }
      const salt = K.uid('s'); st.settings.pin = { salt, h: await U.hashPin(a.value, salt) };
      const code = Array.from({ length: 6 }, () => 'ABCDEFGHJKLMNPRSTUVYZ23456789'[Math.floor(Math.random() * 29)]).join(''); const rs = K.uid('r'); st.settings.recovery = { salt: rs, h: await U.hashPin(code, rs) }; S.save();
      setTimeout(() => U.modal({ title: 'Kurtarma kodunuz', body: h('div', h('div.reccode', code), h('p', 'PIN\'i unutursanız bu kodla sıfırlayabilirsiniz. Lütfen yazın; bir daha gösterilmeyecek.')), actions: [{ label: 'Yazdım', value: true }], dismiss: false, onClose: redraw }), 50);
    } }] });
  }

  K.childFormRef = true;
})(window);
