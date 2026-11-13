/* Konuşma Kampı — çocuk tarafı: açılış, ana ekran, antrenman, harita, kupalar, oyunlar */
(function (G) {
  'use strict';
  const K = G.KK, U = K.ui, h = U.h, icon = U.icon, E = K.engine, S = K.store;
  const range = (n) => Array.from({ length: n }, (_, i) => i);
  const rndOf = (a) => a[Math.floor(Math.random() * a.length)];
  const CHEERS = ['Süper!', 'Harika!', 'Aferin!', 'Bravo!', 'Çok güzel!', 'Devam!', 'Şahane!'];

  /* ======================= Çocuk profil formu (açılış + veli) ======================= */
  const LEVELS = [
    ['Yeni başlıyor', 'Henüz ses ve ağız hareketi taklidi yapmıyor ya da çok az yapıyor.'],
    ['Ünlüleri söylüyor', 'Ağız hareketlerini taklit ediyor; a, e, o gibi sesleri çıkarıyor.'],
    ['Ses ve hece söylüyor', 'ma, ba, ta gibi heceleri söylemeye çalışıyor.'],
    ['Tek kelime söylüyor', 'Birkaç kelimeyi (anne, top, su…) söylüyor.'],
    ['İki kelime birleştiriyor', '“Top al”, “su ver” gibi iki kelimelik ifadeler kuruyor.'],
  ];
  function childForm(opts) {
    const d = Object.assign({ name: '', age: '', avatar: 0, level: 1, minutes: 4 }, opts.value || {});
    const nameI = h('input.input', { placeholder: 'Çocuğun adı', maxlength: 20, value: d.name, 'aria-label': 'Çocuğun adı' });
    const ageS = h('select.input', { 'aria-label': 'Yaş' }, h('option', { value: '' }, 'Yaş (isteğe bağlı)'), range(8).map((i) => h('option', { value: String(i + 2), selected: String(d.age) === String(i + 2) }, (i + 2) + ' yaş')));
    let av = d.avatar, lv = d.level, mn = d.minutes;
    const avs = h('div.avgrid', K.AVATARS.map((a, i) => h('button.avopt' + (i === av ? '.on' : ''), { type: 'button', 'aria-label': 'Karakter ' + (i + 1), onclick: (e) => { av = i; [...avs.children].forEach((b, j) => b.classList.toggle('on', j === i)); } }, a)));
    const lvs = h('div.radiolist', LEVELS.map((l, i) => h('button.radio' + (i === lv ? '.on' : ''), { type: 'button', onclick: () => { lv = i; [...lvs.children].forEach((b, j) => b.classList.toggle('on', j === i)); } }, h('b', l[0]), h('span', l[1]))));
    const mns = h('div.segs', [[2, 'Kısa', '2 dk'], [4, 'Orta', '4 dk'], [6, 'Uzun', '6 dk']].map(([v, a, b]) => h('button.seg' + (v === mn ? '.on' : ''), { type: 'button', onclick: (e) => { mn = v; [...mns.children].forEach((x) => x.classList.toggle('on', x === e.currentTarget)); } }, h('b', a), h('span', b))));
    const f = h('div.form',
      h('label.lbl', 'Adı'), nameI,
      h('label.lbl', 'Yaşı'), ageS,
      h('label.lbl', 'Karakter seç'), avs,
      opts.hideLevel ? null : [h('label.lbl', 'Şu an nerede? (başlangıç noktası)'), lvs, h('p.small', 'Emin değilseniz bir basamak aşağıdan başlayın; her zaman Plan bölümünden değiştirebilirsiniz.')],
      opts.hideLevel ? null : [h('label.lbl', 'Dikkat süresi (bir mini antrenman)'), mns, h('p.small', 'Çocuk çabuk sıkılıyorsa “Kısa” seçin.')],
      h('p.small.priv', 'Yalnızca ad ve yaş saklanır. Tanı ya da sağlık bilgisi girmeniz gerekmez.'));
    f.value = () => ({ name: nameI.value.trim() || 'Çocuk', age: ageS.value, avatar: av, level: lv, minutes: mn });
    return f;
  }

  K.childForm = childForm;

  /* ======================= Açılış / onboarding ======================= */
  U.route('/welcome', (root) => {
    root.className = 'scr purple welcome';
    const st = S.state; let step = 0; let form = null; let ack = false; let child = null;
    const body = h('div.wbody'); const dots = h('div.wdots');
    root.appendChild(h('div.wwrap', h('div.wlogo', h('span.wball', icon('ball', 34)), h('span', 'KONUŞMA KAMPI')), body, dots));
    const steps = [
      () => h('div.wstep', h('h1', 'Hoş geldiniz!'), h('p.lead', 'Çocuğunuzla birlikte oynayarak ağız-dil egzersizleri, sesler, heceler ve kelimeler çalışabileceğiniz küçük bir antrenman kampı.'), h('div.wfeat', [['🏀', 'Günde 2–3 mini antrenman, her biri 3–4 dakika'], ['🪞', 'Animasyonlu ağız ve dil modelleri'], ['📈', 'Çocuğa özel, adım adım ilerleyen plan']].map(([e, t]) => h('div.feat', h('span', e), h('b', t)))), h('button.btn.big', { onclick: () => next() }, 'Başlayalım')),
      () => h('div.wstep', h('h1', 'Nasıl çalışır?'), h('div.how', [['1', 'Veli yanında olur', 'Çocuk uygulamayı tek başına değil, sizinle birlikte kullanır.'], ['2', 'Uygulama gösterir', 'Ağız şekli, ses ve resim. Çocuk taklit eder ve söyler.'], ['3', 'Veli işaretler', '“Rahat / Yaklaşık / Tekrar” der. Uygulama bir sonraki adımı ayarlar.']].map(([n, a, b]) => h('div.howrow', h('span.hn', n), h('div', h('b', a), h('p', b))))), nav()),
      () => h('div.wstep', h('h1', 'Gizlilik'), h('div.privbox', icon('lock', 30), h('div', h('b', 'Hesap yok. İnternet yok. Paylaşım yok.'), h('p', 'Tüm bilgiler yalnızca bu cihazın içinde saklanır. Ses ve görüntü kaydedilmez; uygulama hiçbir veriyi ağa göndermez.'))), h('p', 'Veriler cihazda olduğu için tarayıcı verilerini silerseniz veya cihaz değiştirirseniz kaybolur. Bu yüzden ara sıra Ayarlar > Yedek bölümünden yedek almanızı öneririz.'), nav()),
      () => { const cb = h('input', { type: 'checkbox', id: 'ack', onchange: (e) => { ack = e.target.checked; nb.disabled = !ack; } }); const nb = h('button.btn.big', { disabled: true, onclick: () => next() }, 'Devam'); return h('div.wstep', h('h1', 'Önemli bilgi'), h('div.noticebox', h('p', 'Bu uygulama, konuşma ve dil gelişimini ', h('b', 'destekleyen bir ev çalışması aracıdır'), '. Tanı koymaz, tedavi yerine geçmez.'), h('p', 'Çocuğunuzun konuşma gelişimiyle ilgili endişeniz varsa bir ', h('b', 'Dil ve Konuşma Terapisti (DKT)'), ' ya da çocuk gelişim uzmanıyla görüşün. Bu uygulama uzman planını destekleyecek şekilde kullanılabilir.')), h('label.check', cb, h('span', 'Okudum, anladım.')), h('div.navrow', h('button.btn.white', { onclick: () => back() }, 'Geri'), nb)); },
      () => { form = childForm({ value: child }); return h('div.wstep', h('h1', 'Çocuğunuzu tanıyalım'), form, h('div.navrow', h('button.btn.white', { onclick: () => back() }, 'Geri'), h('button.btn', { onclick: () => { child = form.value(); next(); } }, 'Devam'))); },
      () => pinStep(),
    ];
    function nav() { return h('div.navrow', h('button.btn.white', { onclick: () => back() }, 'Geri'), h('button.btn', { onclick: () => next() }, 'Devam')); }
    function next() { step = Math.min(steps.length - 1, step + 1); draw(); }
    function back() { step = Math.max(0, step - 1); draw(); }
    function finish(pinSet) {
      st.settings.ackNotice = true; st.onboarded = true;
      const c = S.addChild(child || { name: 'Çocuk' }); S.save(); S.requestPersist();
      U.go('/home', true);
    }
    function pinStep() {
      const p1 = h('input.input.pin', { type: 'password', inputmode: 'numeric', maxlength: 4, placeholder: '4 haneli PIN', autocomplete: 'off', 'aria-label': 'PIN' });
      const msg = h('p.small', '');
      const setBtn = h('button.btn', { onclick: async () => {
        if (!/^\d{4}$/.test(p1.value)) { msg.textContent = 'PIN 4 rakamdan oluşmalı.'; return; }
        const salt = K.uid('s'); st.settings.pin = { salt, h: await U.hashPin(p1.value, salt) };
        const code = Array.from({ length: 6 }, () => 'ABCDEFGHJKLMNPRSTUVYZ23456789'[Math.floor(Math.random() * 29)]).join('');
        const rs = K.uid('r'); st.settings.recovery = { salt: rs, h: await U.hashPin(code, rs) };
        U.modal({ title: 'Kurtarma kodunuz', body: h('div', h('div.reccode', code), h('p', 'PIN\'i unutursanız bu kodla sıfırlayabilirsiniz. Lütfen bir yere yazın; uygulama bu kodu bir daha göstermez.')), actions: [{ label: 'Yazdım', value: true }], dismiss: false, onClose: () => finish(true) });
      } }, 'PIN\'i kaydet');
      return h('div.wstep', h('h1', 'Veli PIN\'i'), h('p.lead', 'Çocuğun ayarlara ve veli alanına girmesini engellemek için 4 haneli bir PIN belirleyin (önerilir).'), p1, msg, h('div.navrow', h('button.btn.white', { onclick: () => back() }, 'Geri'), setBtn), h('button.linkbtn.light', { onclick: () => finish(false) }, 'Şimdilik PIN belirlemeden devam et'));
    }
    function draw() {
      body.innerHTML = ''; body.appendChild(steps[step]());
      dots.innerHTML = ''; steps.forEach((_, i) => dots.appendChild(h('i' + (i === step ? '.on' : ''))));
      root.scrollTop = 0;
    }
    draw();
  });

  /* ======================= Çocuk seçimi ======================= */
  U.route('/who', (root) => {
    root.className = 'scr purple';
    const st = S.state;
    root.appendChild(h('div.page',
      h('header.topbar', h('button.icon-btn', { 'aria-label': 'Geri', onclick: () => U.go('/home') }, icon('back')), h('h1.ptitle', 'Kim oynuyor?')),
      h('div.whogrid', st.children.map((c) => h('button.whocard', { onclick: () => { st.active = c.id; S.save(); U.go('/home'); } }, U.avatar(c, 84), h('b', c.name), h('span.small', '⭐ ' + E.totalStars(c)))),
        h('button.whocard.add', { onclick: async () => { if (!(await U.gate())) return; U.go('/parent?tab=settings&add=1'); } }, h('span.plus', icon('plus', 40)), h('b', 'Çocuk ekle')))));
  });

  /* ======================= Ana ekran ======================= */
  U.route('/', () => U.go('/home', true));
  U.route('/home', (root) => {
    const c = S.cur(); if (!c) { U.go('/welcome', true); return; }
    root.className = 'scr purple';
    const u = K.UNITS[Math.min(c.cur, K.UNITS.length - 1)];
    const today = E.sessionsToday(c), max = S.state.settings.maxSessionsPerDay, can = E.canPlay(c);
    const ready = E.readiness(c, u).ready;
    const num = String(u.i + 1).padStart(2, '0');
    const startBtn = can
      ? h('button.btn.big.start', { onclick: () => { K.audio.sfx('ok'); U.go('/play'); } }, icon('play', 26), 'ANTRENMANA BAŞLA')
      : h('div.rest', h('b', 'Bugünlük antrenman tamam! 🌙'), h('span', 'Yarın yine oynarız.'), h('button.linkbtn.light', { onclick: async () => { if (await U.gate()) { U.go('/play'); } } }, 'Veli: yine de başlat'));
    root.appendChild(h('div.page.home',
      h('header.topbar',
        h('button.profile', { onclick: () => U.go('/who'), 'aria-label': 'Çocuk değiştir' }, U.avatar(c, 44), h('b', c.name), icon('swap', 18)),
        h('div.spacer'),
        h('div.score', h('span.num', String(E.totalStars(c))), h('small', 'YILDIZ')),
        h('div.score', h('span.num', String(E.streak(c))), h('small', 'GÜN')),
        h('button.icon-btn.lockbtn', { 'aria-label': 'Veli alanı', onclick: async () => { if (await U.gate()) U.go('/parent'); } }, icon('lock', 22), ready ? h('i.dot') : null)),
      h('section.hero',
        h('div.bignum', { 'aria-hidden': 'true' }, num),
        h('div.herotext', h('p.eyebrow', K.STAGES[u.st - 1].icon + ' ' + K.STAGES[u.st - 1].name), h('h1', 'Merhaba, ' + c.name + '!'), h('p.sub', 'Bugünkü ünite: ', h('b', u.t))),
        startBtn,
        h('div.todayballs', { 'aria-label': 'Bugünkü antrenmanlar' }, range(max).map((i) => h('span.tb' + (i < today ? '.on' : ''), icon('ball', 28))), h('small', today + ' / ' + max))),
      h('section.tiles',
        tile('map', 'Lig Yolu', 'Nerede olduğuna bak', () => U.go('/map')),
        tile('play', 'Etkinlikler', 'Dinleme, dil, ses, hafıza', () => U.go('/games')),
        tile('trophy', 'Kupalar', E.trophies(c).filter((t) => t.got).length + ' / ' + E.trophies(c).length, () => U.go('/trophies')))));
    function tile(ic, t, sub, fn) { return h('button.tile', { onclick: fn }, h('span.ticon', ic === 'map' ? h('span.mapi', '🗺️') : icon(ic, 34)), h('b', t), h('small', sub)); }
  });

  /* ======================= Lig Yolu ======================= */
  U.route('/map', (root) => {
    const c = S.cur(); root.className = 'scr purple';
    const wrap = h('div.maplist');
    K.STAGES.forEach((s) => {
      wrap.appendChild(h('div.stagehead', h('span', s.icon), h('div', h('b', 'Aşama ' + s.id + ': ' + s.name), h('small', s.desc))));
      K.UNITS.filter((u) => u.st === s.id).forEach((u, k) => {
        const state = u.i < c.cur ? 'done' : u.i === c.cur ? 'cur' : 'lock';
        wrap.appendChild(h('div.node.' + state + (k % 2 ? '.r' : '.l'), h('span.nnum', String(u.i + 1).padStart(2, '0')), h('div.ntxt', h('b', u.t), h('small', state === 'done' ? 'Tamamlandı ✓' : state === 'cur' ? 'BURADASIN' : 'Yakında'))));
      });
    });
    root.appendChild(h('div.page', h('header.topbar', h('button.icon-btn', { 'aria-label': 'Geri', onclick: () => U.go('/home') }, icon('back')), h('h1.ptitle', 'Lig Yolu')), wrap));
    setTimeout(() => { const n = wrap.querySelector('.node.cur'); if (n) n.scrollIntoView({ block: 'center' }); }, 60);
  });

  /* ======================= Kupalar ======================= */
  U.route('/trophies', (root) => {
    const c = S.cur(); root.className = 'scr purple';
    const ts = E.trophies(c);
    root.appendChild(h('div.page', h('header.topbar', h('button.icon-btn', { 'aria-label': 'Geri', onclick: () => U.go('/home') }, icon('back')), h('h1.ptitle', 'Kupalar')),
      h('p.centerp', ts.filter((t) => t.got).length + ' / ' + ts.length + ' kupa kazandın'),
      h('div.trgrid', ts.map((t) => h('div.trophy' + (t.got ? '.got' : ''), h('span.tnum', t.got ? t.n : '?'), h('b', t.got ? t.name : 'Gizli kupa'), h('small', t.got ? t.desc : 'Antrenman yaparak aç!'))))));
  });

  /* ======================= Oyunlar ======================= */
  U.route('/games', (root) => {
    const c = S.cur(); root.className = 'scr purple';
    root.appendChild(h('div.page', h('header.topbar', h('button.icon-btn', { 'aria-label': 'Geri', onclick: () => U.go('/home') }, icon('back')), h('h1.ptitle', 'Oyunlar')),
      h('div.tiles.col',
        h('button.tile.wide', { onclick: () => U.go('/listen') }, h('span.ticon', '👂'), h('b', 'Dinle ve Bul'), h('small', 'Kelimeyi dinle, resmi bul')),
        h('button.tile.wide', { onclick: () => U.go('/mouthlist') }, h('span.ticon', '👄'), h('b', 'Ağız Oyunları'), h('small', 'Aynadaki gibi yap')))));
  });
  U.route('/mouthlist', (root) => {
    root.className = 'scr purple';
    root.appendChild(h('div.page', h('header.topbar', h('button.icon-btn', { 'aria-label': 'Geri', onclick: () => U.go('/games') }, icon('back')), h('h1.ptitle', 'Ağız Oyunları')),
      h('div.whogrid', Object.keys(K.MOUTH_GAMES).map((k) => h('button.whocard', { onclick: () => U.go('/mouth?g=' + k) }, h('span.bigemoji', K.MOUTH_GAMES[k].e), h('b', K.MOUTH_GAMES[k].name))),
        Object.keys(K.BREATH_GAMES).map((k) => h('button.whocard', { onclick: () => U.go('/breath?g=' + k) }, h('span.bigemoji', K.BREATH_GAMES[k].e), h('b', K.BREATH_GAMES[k].name))))));
  });
  U.route('/mouth', (root, p) => {
    root.className = 'scr purple';
    const it = K.getItem('m:' + p.g); if (!it) { U.go('/mouthlist', true); return; }
    const stage = h('div.stage'); root.appendChild(h('div.page.play', h('header.topbar', h('button.icon-btn', { 'aria-label': 'Geri', onclick: () => U.go('/mouthlist') }, icon('back')), h('h1.ptitle', it.name)), stage));
    const ui = mouthGameUI(it, () => U.go('/mouthlist')); stage.appendChild(ui.el); return ui.destroy;
  });
  U.route('/breath', (root, p) => {
    root.className = 'scr purple';
    const it = K.getItem('b:' + p.g); if (!it) { U.go('/mouthlist', true); return; }
    const stage = h('div.stage'); root.appendChild(h('div.page.play', h('header.topbar', h('button.icon-btn', { 'aria-label': 'Geri', onclick: () => U.go('/mouthlist') }, icon('back')), h('h1.ptitle', it.name)), stage));
    const ui = breathUI(it, false, () => U.go('/mouthlist')); stage.appendChild(ui.el); return ui.destroy;
  });

  /* ---- Dinle ve Bul ---- */
  U.route('/listen', (root) => {
    const c = S.cur(); root.className = 'scr purple';
    let pool = K.WORDS.filter((w) => c.items[w.id] && c.items[w.id].n > 0);
    if (pool.length < 6) pool = pool.concat(['top', 'kedi', 'araba', 'su', 'ev', 'balon', 'elma', 'kuş', 'köpek', 'ayı', 'muz', 'çiçek'].map((w) => K.WORD_MAP[w]).filter(Boolean));
    pool = [...new Set(pool)];
    const rounds = 5; let n = 0, ok = 0, tries = 0, cur = null; const area = h('div.stage'); const top = h('div.dots');
    root.appendChild(h('div.page.play', h('header.topbar', h('button.icon-btn', { 'aria-label': 'Çık', onclick: () => U.go('/games') }, icon('close')), top), area));
    const shuffle = (a) => a.map((x) => [Math.random(), x]).sort((x, y) => x[0] - y[0]).map((x) => x[1]);
    function drawDots() { top.innerHTML = ''; range(rounds).forEach((i) => top.appendChild(h('i' + (i < n ? '.on' : i === n ? '.cur' : '')))); }
    function round() {
      if (n >= rounds) { c.games.push({ t: Date.now(), day: K.todayKey(), type: 'listen', ok, total: rounds }); S.save(); K.audio.sfx('star'); area.innerHTML = ''; area.appendChild(h('div.finish', h('h1', 'Bravo!'), h('p.lead', rounds + ' sorudan ' + ok + ' tanesini ilk denemede buldun.'), h('div.stars', range(3).map((i) => h('span.star.on', icon('star', 54)))), h('button.btn.big', { onclick: () => U.go('/games') }, 'Tamam'))); return; }
      drawDots(); tries = 0;
      const ans = shuffle(pool)[0]; const opts = shuffle([ans, ...shuffle(pool.filter((w) => w !== ans)).slice(0, 2)]); cur = ans;
      area.innerHTML = '';
      area.appendChild(h('div.listen', h('button.btn.big.round', { onclick: () => K.audio.say(ans) }, icon('speaker', 30), 'Tekrar dinle'), h('p.lead', 'Hangisi?'),
        h('div.opts', opts.map((o) => h('button.opt', { onclick: (e) => choose(o, e.currentTarget) }, h('span', o.e))))));
      setTimeout(() => K.audio.say(ans), 350);
    }
    function choose(o, btn) {
      if (o === cur) { if (tries === 0) ok++; K.audio.sfx('ok'); btn.classList.add('good'); n++; setTimeout(round, 800); }
      else { tries++; K.audio.sfx('soft'); btn.classList.add('wiggle'); btn.disabled = true; K.audio.say(cur); }
    }
    round(); return () => K.audio.stop();
  });

  /* ======================= Antrenman ======================= */
  U.route('/play', (root) => {
    const c = S.cur(); root.className = 'scr purple';
    if (!c) { U.go('/', true); return; }
    const steps = E.buildSession(c); S.save();
    const t0 = Date.now(); const limit = c.settings.minutes * 60;
    let idx = 0; const marks = []; let cleanupItem = null; let timerId = 0; let over = false;
    const hoop = h('div.hoop'); const clock = h('div.clock', '⏱ ' + U.mmss(limit));
    const stage = h('div.stage');
    root.appendChild(h('div.page.play',
      h('header.topbar', h('button.icon-btn', { 'aria-label': 'Antrenmandan çık', onclick: quit }, icon('close')), hoop, clock), stage));
    function quit() {
      U.confirmBox('Antrenman bırakılsın mı?', 'İstersen biraz dinlen, sonra devam edebilirsin.', 'Bırak', 'purple').then((y) => { if (y) { if (marks.length) finish(true); else U.go('/home'); } });
    }
    function drawHoop() { hoop.innerHTML = ''; steps.forEach((s, i) => hoop.appendChild(h('span.hb' + (i < idx ? '.on' : i === idx ? '.cur' : ''), icon('ball', 26)))); }
    timerId = setInterval(() => { const left = limit - (Date.now() - t0) / 1000; clock.textContent = '⏱ ' + U.mmss(left); if (left <= 0 && !over) { over = true; clock.classList.add('over'); } }, 500);

    function nextStep() {
      if (cleanupItem) { cleanupItem(); cleanupItem = null; }
      if (idx >= steps.length || (over && idx > 0 && idx >= 1 && !steps[idx - 1].warm)) { finish(false); return; }
      drawHoop(); stage.innerHTML = '';
      const s = steps[idx];
      if (s.type === 'act') {
        const aui = K.acts.run(c, s.act, { rounds: s.rounds, inSession: true }, (res) => {
          if (res && !res.skip) marks.push({ id: 'x:' + s.act, r: res.r, reps: res.n, warm: true, act: true });
          idx++; K.audio.sfx('ok'); setTimeout(nextStep, 250);
        });
        cleanupItem = aui.destroy; stage.appendChild(aui.el); return;
      }
      const it = E.item(c, s.id);
      if (!it) { idx++; nextStep(); return; }
      let ui;
      const done = (res) => {
        if (res && res.skip) { /* kaydetme */ }
        else if (res) { E.record(c, s.id, res.r, res.reps); marks.push({ id: s.id, r: res.r, reps: res.reps, warm: !!s.warm }); }
        idx++; K.audio.sfx('ok'); setTimeout(nextStep, 250);
      };
      if (it.kind === 'm') ui = mouthGameUI(it, () => done({ r: 2, reps: it.reps }), true);
      else if (it.kind === 'b') ui = breathUI(it, !!s.short, () => done({ r: 2, reps: 1 }), true);
      else ui = repItemUI(c, it, done);
      cleanupItem = ui.destroy; stage.appendChild(ui.el);
    }
    function finish(early) {
      clearInterval(timerId); if (cleanupItem) { cleanupItem(); cleanupItem = null; }
      const real = marks.filter((m) => !m.warm);
      const completed = !early && idx >= steps.length;
      const stars = real.length === 0 ? 1 : completed ? 3 : 2;
      const ses = { t: t0, day: K.todayKey(new Date(t0)), dur: Math.round((Date.now() - t0) / 1000), unit: K.UNITS[c.cur].id, marks, stars, planned: steps.length, completed };
      const adv = E.finishSession(c, ses); E.trackStreak(c); const trs = E.newTrophies(c);
      drawHoop(); showFinish(ses, trs, adv);
    }
    function showFinish(ses, trs, adv) {
      stage.innerHTML = ''; clock.remove();
      const ball = h('span.shotball', icon('ball', 46)); const stars = h('div.stars', range(3).map((i) => h('span.star' + (i < ses.stars ? '.pend' : '.off'), icon('star', 56))));
      const hp = h('div.shotarea', h('div.board', h('div.rim'), h('div.net')), ball);
      const sum = h('div.sumrow', h('div.score', h('span.num', String(ses.marks.length)), h('small', 'ÇALIŞMA')), h('div.score', h('span.num', U.mmss(ses.dur)), h('small', 'SÜRE')), h('div.score', h('span.num', String(E.streak(c))), h('small', 'GÜN SERİSİ')));
      const trEl = trs.length ? h('div.newtr', trs.map((t) => h('div.trophy.got.mini', h('span.tnum', t.n), h('b', 'Yeni kupa: ' + t.name)))) : null;
      const home = h('button.btn.big', { onclick: () => U.go('/home') }, 'Eve dön');
      const more = E.canPlay(c) ? h('button.btn.white', { onclick: () => { U.go('/play?r=' + Date.now()); } }, 'Bir tane daha') : null;
      stage.appendChild(h('div.finish', h('h1', ses.completed ? 'ANTRENMAN BİTTİ!' : 'GÜZEL ÇALIŞTIN!'), hp, stars, sum, trEl, h('div.navrow.c', more, home)));
      const runShot = () => {
        const anim = ball.animate ? ball.animate([{ transform: 'translate(-90px, 90px) scale(1)' }, { transform: 'translate(-20px, -40px) scale(.9)', offset: 0.55 }, { transform: 'translate(0px, -50px) scale(.82)', offset: 0.7 }, { transform: 'translate(0px, 70px) scale(.7)' }], { duration: 1400, easing: 'ease-in-out', fill: 'forwards' }) : null;
        K.audio.sfx('swish');
        setTimeout(() => { K.audio.sfx('star'); [...stars.children].forEach((s, i) => { if (s.classList.contains('pend')) setTimeout(() => s.classList.add('on'), i * 250); }); }, 1100);
        if (adv) setTimeout(() => U.toast('Yeni ünite açıldı: ' + K.UNITS[adv.to].t, 3200), 2000);
      };
      setTimeout(runShot, 250);
    }
    nextStep();
    return () => { clearInterval(timerId); if (cleanupItem) cleanupItem(); };
  });

  /* ---------- Ağız oyunu ---------- */
  function mouthGameUI(it, onDone, inSession) {
    const R = it.reps; let n = 0; let player = null;
    const m = K.mouth.create(h('div'), {});
    const box = h('div.mouthbox'); box.appendChild(m.el);
    const cap = h('div.caption', it.say); const dots = h('div.repdots', range(R).map(() => h('i')));
    const cheer = h('div.cheer', '');
    const say = h('button.btn.white.round', { onclick: () => K.audio.say(it) }, icon('speaker', 24), 'Dinle');
    const tap = h('button.btn.big', { onclick: () => { n++; dots.children[n - 1].classList.add('on'); K.audio.sfx('pad'); cheer.textContent = rndOf(CHEERS); cheer.classList.remove('pop'); void cheer.offsetWidth; cheer.classList.add('pop'); if (n >= R) { tap.disabled = true; setTimeout(onDone, 700); } } }, icon('ball', 26), 'Yaptım!');
    const skip = inSession ? h('button.linkbtn.light', { onclick: () => onDone() }, 'Atla') : null;
    const el = h('div.item.game', h('div.itemhead', h('span.etag', it.e), h('h2', it.name)), box, cap, dots, cheer, h('div.actions', say, tap), skip);
    player = m.play(it.seq, { loop: true, onStep: (s) => { if (s.text) cap.textContent = s.text; } });
    setTimeout(() => K.audio.say(it), 350);
    return { el, destroy() { if (player) player.stop(); m.destroy(); K.audio.stop(); } };
  }

  /* ---------- Nefes oyunu ---------- */
  function breathUI(it, short, onDone, inSession) {
    const cycles = short ? 2 : it.cycles; let timers = []; let started = false;
    const candle = it.vis === 'candle';
    const vis = h('div.breathvis' + (candle ? '.candle' : ''));
    const ballWrap = h('div.bball', icon('ball', 140)); if (!candle) vis.appendChild(ballWrap);
    const flame = h('div.flame', h('i')); const wax = h('div.wax'); if (candle) { vis.appendChild(flame); vis.appendChild(wax); }
    const cap = h('div.caption.big', it.say); const count = h('div.bcount', '');
    const dots = h('div.repdots', range(cycles).map(() => h('i')));
    const startB = h('button.btn.big', { onclick: start }, icon('play', 24), 'Başla');
    const skip = inSession ? h('button.linkbtn.light', { onclick: () => onDone() }, 'Atla') : null;
    const say = h('button.btn.white.round', { onclick: () => K.audio.say(it) }, icon('speaker', 24), 'Dinle');
    const el = h('div.item.game', h('div.itemhead', h('span.etag', it.e), h('h2', it.name)), vis, cap, count, dots, h('div.actions', say, startB), skip);
    function after(ms, fn) { timers.push(setTimeout(fn, ms)); }
    function phase(label, secs, cls, cb) {
      cap.textContent = label; vis.className = 'breathvis' + (candle ? ' candle' : '') + ' ' + cls; vis.style.setProperty('--dur', secs + 's');
      let left = secs; count.textContent = left; const iv = setInterval(() => { left--; count.textContent = left > 0 ? left : ''; }, 1000); timers.push(iv);
      after(secs * 1000, () => { clearInterval(iv); cb(); });
    }
    function start() {
      if (started) return; started = true; startB.disabled = true; let c = 0;
      const cycle = () => {
        if (c >= cycles) { cap.textContent = 'Harika!'; K.audio.sfx('star'); vis.className = 'breathvis' + (candle ? ' candle' : ''); after(900, onDone); return; }
        phase('Burnundan derin nefes al…', it.inhale, 'in', () => phase(candle ? 'Mumu yavaşça üfle… fuuuu' : 'Ağzından yavaşça ver… fuuuu', it.exhale, 'out', () => { dots.children[c].classList.add('on'); c++; cycle(); }));
      };
      cycle();
    }
    setTimeout(() => K.audio.say(it), 300);
    return { el, destroy() { timers.forEach((t) => { clearTimeout(t); clearInterval(t); }); K.audio.stop(); } };
  }

  K.repItemUI = (c, it, done) => repItemUI(c, it, done);

  /* ---------- Tekrarlı öğe: ünlü / hece / zincir / kelime / cümle ---------- */
  function repItemUI(c, it, done) {
    const R = c.settings.reps; let n = 0; let m = null, sv = null, player = null; const kill = [];
    const dots = h('div.repdots', range(R).map(() => h('i')));
    const cheer = h('div.cheer', '');
    const hint = h('p.hint', '');
    const say = h('button.btn.white.round', { onclick: () => K.audio.say(it) }, icon('speaker', 24), 'Dinle');
    const tap = h('button.btn.big', { onclick: tapFn }, icon('ball', 26), 'Söyledim!');
    const markp = h('div.markpanel', { hidden: true });
    const actions = h('div.actions', say, tap);
    const visual = h('div.visual');
    const skip = h('button.linkbtn.light', { onclick: () => done({ skip: true }) }, 'Atla');
    const KN = { v: 'Ünlü', s: 'Hece', c: 'Hece zinciri', p: 'Cümle', w: 'Kelime', a: 'Ses taklidi', r: 'Hız ve ritim', l: 'Ses şiddeti', t: 'Tekerleme', k: 'Kaplumbağa' };
    const head = h('div.itemhead', h('span.etag', KN[it.kind] || 'Çalışma'));

    const mouthBox = (pose, label) => { const mm = K.mouth.create(h('div'), { pose: 'closed', label }); const b = h('div.mouthbox' + (it.kind === 'w' ? '.mini' : '')); b.appendChild(mm.el); return { mm, b }; };
    const pads = (arr) => h('div.pads', arr.map((s, i) => h('button.pad', { onclick: (e) => { K.audio.sfx('pad'); const b = e.currentTarget; b.classList.remove('hit'); void b.offsetWidth; b.classList.add('hit'); } }, h('span', s), h('small', String(i + 1)))));

    if (it.kind === 'v') {
      const info = K.SOUND[it.v]; hint.textContent = info.t;
      const mb = mouthBox(info.pose, it.v + ' sesi için ağız'); m = mb.mm;
      visual.append(h('div.bigletter', K.trUp(it.v), h('small', it.v)), mb.b);
      player = m.play([{ pose: info.pose, ms: 1900 }, { pose: 'closed', ms: 900 }], { loop: true });
    } else if (it.kind === 's') {
      const ci = K.SOUND[it.c] || K.SOUND.a, vi = K.SOUND[it.v] || K.SOUND.a; hint.textContent = ci.t;
      const mb = mouthBox('closed', it.s + ' hecesi için ağız'); m = mb.mm; sv = K.mouth.sideView(h('div'), ci.tongue);
      const svbox = h('div.sidebox', h('small', 'Dil nerede?')); svbox.appendChild(sv.el);
      visual.append(h('div.bigletter.syl', K.trUp(it.s)), h('div.mouthrow', mb.b, svbox));
      player = m.play([{ pose: ci.pose, ms: 1000, t: ci.tongue }, { pose: vi.pose, ms: 1500, t: vi.tongue }, { pose: 'closed', ms: 700, t: 'rest' }], { loop: true, onStep: (s) => sv.set(s.t, 500) });
    } else if (it.kind === 'c') {
      hint.textContent = 'Hece hece vurarak, ritimle söyle.';
      visual.append(h('div.bigletter.syl.chain', K.trUp(it.syl.join('-'))), pads(it.syl.map(K.trUp)));
    } else if (it.kind === 'w') {
      hint.textContent = 'Resme bak, kelimeyi söyle.';
      const pic = h('div.pic', it.img ? h('img', { alt: it.w }) : h('span.emoji', it.e));
      if (it.img) S.getBlob('img:' + c.id + ':' + it.id).then((b) => { if (b) { const u = URL.createObjectURL(b); kill.push(() => URL.revokeObjectURL(u)); pic.querySelector('img').src = u; } else { pic.innerHTML = ''; pic.appendChild(h('span.emoji', it.e || '🖼️')); } });
      const wordEl = h('div.word', it.syl.map((s, i) => h('span.sy.s' + (i % 2), K.trUp(s))));
      visual.append(pic, wordEl, pads(it.syl.map(K.trUp)));
      const info = K.SOUND[it.init];
      if (info) { const mb = mouthBox('closed', 'İlk ses ' + it.init); m = mb.mm; const sb = h('div.firstsound', h('small', 'İlk ses: ' + K.trUp(it.init)), mb.b); visual.append(sb); const first = K.isV(it.init) ? it.init : it.init; player = m.play([{ pose: info.pose, ms: 1300 }, { pose: 'closed', ms: 700 }], { loop: true }); }
    } else if (it.kind === 'p') {
      hint.textContent = 'Birlikte söyleyelim.';
      visual.append(h('div.pic', h('span.emoji', it.e)), h('div.word.phrase', it.w.split(' ').map((s, i) => h('span.sy.s' + (i % 2), s))));
    } else {
      const xv = K.acts.itemVisual(c, it); hint.textContent = xv.hint; visual.append(...xv.nodes); kill.push(xv.destroy);
    }

    function tapFn() {
      if (n >= R) return; n++; dots.children[n - 1].classList.add('on'); K.audio.sfx('pad');
      cheer.textContent = rndOf(CHEERS); cheer.classList.remove('pop'); void cheer.offsetWidth; cheer.classList.add('pop');
      if (n >= R) { tap.disabled = true; setTimeout(showMarks, 450); }
    }
    function showMarks() {
      actions.hidden = true; skip.hidden = true; markp.hidden = false; markp.innerHTML = '';
      const opt = (r, label, sub, ic, cls) => h('button.markbtn.' + cls, { onclick: () => { markp.querySelectorAll('button').forEach((b) => (b.disabled = true)); done({ r, reps: R }); } }, h('span.mic', icon(ic, 34)), h('b', label), h('small', sub));
      markp.append(h('p.markq', 'Veli: nasıl söyledi?'), h('div.markrow', opt(2, 'Rahat', 'kolay söyledi', 'check', 'ok'), opt(1, 'Yaklaşık', 'yardımla / yakın', 'tilde', 'mid'), opt(0, 'Tekrar', 'zorlandı', 'redo', 'again')));
    }
    const el = h('div.item', head, visual, hint, dots, cheer, actions, markp, skip);
    setTimeout(() => K.audio.say(it), 450);
    return { el, destroy() { if (player) player.stop(); if (m) m.destroy(); if (sv) sv.destroy(); kill.forEach((f) => f()); K.audio.stop(); } };
  }
})(window);
