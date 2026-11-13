/* Konuşma Kampı — etkinlikler: dinleme oyunları, dil dünyası, hafıza, ses yağmuru, ayna;
   ses taklidi / ritim / ses şiddeti / tekerleme / kaplumbağa öğe ekranları. Hepsi cihaz içinde. */
(function (G) {
  'use strict';
  const K = G.KK, U = K.ui, h = U.h, icon = U.icon, E = K.engine, S = K.store, D = K.DATA2;
  const range = (n) => Array.from({ length: n }, (_, i) => i);
  const shuffle = (a) => a.map((x) => [Math.random(), x]).sort((x, y) => x[0] - y[0]).map((x) => x[1]);
  const sample = (a, n) => shuffle(a).slice(0, n);
  const one = (a) => a[Math.floor(Math.random() * a.length)];
  const cap = (t) => t.charAt(0).toLocaleUpperCase('tr-TR') + t.slice(1);
  const CHEERS = ['Süper!', 'Harika!', 'Aferin!', 'Bravo!', 'Çok güzel!', 'Şahane!'];
  const sp = () => K.acts.speed;
  const say = (t, rate) => K.audio.speak(t, rate ? { rate } : undefined);

  const CORE = (w) => !(w.cat && w.cat.some((x) => ['sayi', 'renk', 'duygu'].includes(x)));
  const wordPool = () => K.WORDS.filter(CORE);
  const distinctBy = (arr, key) => { const seen = new Set(); return arr.filter((x) => { const k = key(x); if (seen.has(k)) return false; seen.add(k); return true; }); };

  /* ======================= Etkinlik tanımları ======================= */
  const A = {};
  const def = (id, o) => { A[id] = Object.assign({ id }, o); };

  /* ---- Dinleme ---- */
  def('fsound', { cat: 'dinleme', e: '🔤', name: 'İlk Sesi Bul', desc: 'Heceyi dinle, aynı sesle başlayan resmi bul.', build: (c, N) => {
    const pool = wordPool(); return range(N).map(() => {
      const t = one(pool); const others = distinctBy(shuffle(pool.filter((w) => w.init !== t.init && w.e !== t.e)), (w) => w.init).slice(0, 2);
      const st = t.syl[0];
      return { kind: 'pick', say: st, rate: 0.6, prompt: '“' + st + '” ile başlayan hangisi?', options: shuffle([{ e: t.e, ok: true }, ...others.map((w) => ({ e: w.e }))]) };
    }); } });
  def('sylcount', { cat: 'dinleme', e: '🥁', name: 'Kaç Hece?', desc: 'Kelimeyi dinle, kaç hece olduğunu bul.', build: (c, N) => {
    const pool = wordPool().filter((w) => w.n <= 4); return range(N).map(() => { const t = one(pool); return { kind: 'count', word: t.w, e: t.e, syl: t.syl, answer: t.n, say: t.w, max: 4 }; }); } });
  def('rhyme', { cat: 'dinleme', e: '🎶', name: 'Kafiye Bul', desc: 'Benzer sesle biten kelimeyi bul.', build: (c, N) => {
    const gs = D.rhymeGroups; return range(N).map(() => {
      const g = one(gs); const [a, b] = sample(g, 2); const others = sample(gs.filter((x) => x !== g).flat(), 2);
      return { kind: 'pick', show: { e: a[1], text: a[0] }, say: a[0] + '. Hangisi ' + a[0] + ' gibi bitiyor?', prompt: '“' + a[0] + '” gibi biten hangisi?', options: shuffle([{ e: b[1], ok: true }, ...others.map((o) => ({ e: o[1] }))]) };
    }); } });
  def('samediff', { cat: 'dinleme', e: '👯', name: 'Aynı mı, Farklı mı?', desc: 'İki kelimeyi dinle: aynı mı, farklı mı?', build: (c, N) => range(N).map((i) => {
    const p = one(D.minPairs); const same = i % 2 === 0; const a = Math.random() < 0.5 ? p[0] : p[1];
    return { kind: 'same', words: same ? [a, a] : (Math.random() < 0.5 ? p : [p[1], p[0]]), same }; }) });
  def('rain', { cat: 'dinleme', e: '🌧️', name: 'Ses Yağmuru', desc: 'Aynı sesle başlayan kelimeleri dinle.', build: () => [{ kind: 'rain' }] });

  /* ---- Dil Dünyası ---- */
  def('cat', { cat: 'dil', e: '🧺', name: 'Kelime Dünyası', desc: 'Hayvanlar, yiyecekler, renkler, sayılar…', build: (c, N) => {
    const cats = Object.keys(D.cats); return range(N).map((i) => {
      const cid = cats[Math.floor(Math.random() * cats.length)]; const [name, , list] = D.cats[cid]; const t = one(list);
      if (i % 2 === 0) { const opts = sample(list.filter((x) => x[1] !== t[1]), 2); return { kind: 'pick', say: t[0] + ' hangisi?', prompt: 'Hangisi ' + t[0] + '?', options: shuffle([{ e: t[1], ok: true }, ...opts.map((o) => ({ e: o[1] }))]) }; }
      return { kind: 'say', show: { e: t[1] }, prompt: cid === 'duygu' ? 'Nasıl hissediyor?' : 'Bu ne?', answer: t[0], model: t[0] };
    }); } });
  def('action', { cat: 'dil', e: '🏃', name: 'Eylem Kartları', desc: 'Ne yapıyor? Koşuyor, uyuyor, yiyor…', build: (c, N) => range(N).map((i) => {
    const t = one(D.actions);
    if (i % 2 === 0) { const opts = sample(D.actions.filter((x) => x[1] !== t[1]), 2); return { kind: 'pick', say: 'Hangisi ' + t[0] + '?', prompt: 'Hangisi ' + t[0] + '?', options: shuffle([{ e: t[1], ok: true }, ...opts.map((o) => ({ e: o[1] }))]) }; }
    return { kind: 'say', show: { e: t[1] }, prompt: 'Ne yapıyor?', answer: t[0], model: t[0] }; }) });
  def('opp', { cat: 'dil', e: '↔️', name: 'Zıtlar ve Kavramlar', desc: 'Büyük–küçük, sıcak–soğuk, hızlı–yavaş…', build: (c, N) => range(N).map((i) => {
    const p = one(D.opp); const flip = Math.random() < 0.5; const [a, ae, b, be] = flip ? [p[2], p[3], p[0], p[1]] : p;
    if (i % 2 === 0) return { kind: 'pick', say: 'Hangisi ' + a + '?', prompt: 'Hangisi ' + a + '?', options: shuffle([{ e: ae, ok: true }, { e: be }]) };
    return { kind: 'say', show: { e: ae, text: a }, prompt: '“' + a + '” kelimesinin zıttı ne?', answer: b, model: b }; }) });
  def('dir', { cat: 'dil', e: '📦', name: 'Yönergeleri Uygula', desc: 'Eşyayı doğru yere koy: içine, üstüne, altına…', build: (c, N) => range(N).map((i) => {
    const two = i >= Math.ceil(N / 2); const objs = sample(D.sceneObjs, two ? 3 : 2); const pls = sample(D.scenePlaces, 2);
    const need = two ? 2 : 1;
    const sol = objs.slice(0, need).map((o, k) => [o[0], pls[k % pls.length][0]]);
    const txt = two ? 'Önce ' + objs[0][1] + ' ' + pls[0][1] + ', sonra ' + objs[1][1] + ' ' + pls[1][1] + ' koy.' : cap(objs[0][1]) + ' ' + pls[0][1] + ' koy.';
    return { kind: 'scene', instr: txt, objs: objs.map((o) => ({ k: o[0], e: o[2], label: o[0] })), places: D.scenePlaces.slice(0, 4).map((p) => ({ k: p[0], e: p[2], label: p[3] })), solution: sol, placesAll: D.scenePlaces };
  }).map((r) => { // yer kümesi çözümdeki yerleri içersin
    const need = new Set(r.solution.map((s) => s[1])); const ps = D.scenePlaces.filter((p) => need.has(p[0])).concat(D.scenePlaces.filter((p) => !need.has(p[0])).slice(0, 4 - need.size));
    r.places = ps.map((p) => ({ k: p[0], e: p[2], label: p[3] })); return r; }) });
  def('build', { cat: 'dil', e: '🧩', name: 'Cümle Kur', desc: 'Kartları sırala, cümleyi söyle.', build: (c, N) => sample(D.build, N).map((b) => ({ kind: 'order', blocks: b.map(([e, t]) => ({ e, t })), then: 'say', sentence: cap(b.map((x) => x[1]).join(' ')) + '.', prompt: 'Kartları sırayla seç' })) });
  def('qa', { cat: 'dil', e: '❓', name: 'Soru – Cevap', desc: 'Kim? Ne? Nerede? Neden?', build: (c, N) => sample(D.qa, N).map(([e, q, a]) => ({ kind: 'say', show: { e }, prompt: q, answer: a, model: q })) });
  def('suffix', { cat: 'dil', e: '🔗', name: 'Ekler', desc: 'kedi → kediler, ev → evde, top → topu', build: (c, N) => {
    const all = [...sample(D.plural, 3).map(([a, b, e]) => ({ e, frame: 'Bunlar ___.', full: 'Bunlar ' + b + '.', ans: b })), ...sample(D.locative, 3).map(([a, b, e]) => ({ e, frame: 'Kedi ___.', full: 'Kedi ' + b + '.', ans: b })), ...sample(D.accusative, 3).map(([a, b, e]) => ({ e, frame: 'Ben ___ görüyorum.', full: 'Ben ' + b + ' görüyorum.', ans: b }))];
    return sample(all, N).map((x) => ({ kind: 'say', show: { e: x.e, text: x.frame }, prompt: 'Boşluğu tamamla ve cümleyi söyle', answer: x.full, model: x.full })); } });
  def('story', { cat: 'dil', e: '📚', name: 'Resimli Hikâye', desc: 'Resimleri sırala, hikâyeyi anlat.', build: (c, N) => sample(D.stories, Math.min(N, D.stories.length)).map(([t, em, nar]) => ({ kind: 'order', blocks: em.map((e) => ({ e, t: '' })), then: 'say', sentence: nar, title: t, prompt: 'Önce ne olmuş? Resimleri sırala' })) });
  def('emotion', { cat: 'dil', e: '😊', name: 'Duygular', desc: 'Yüzlere bak, ne hissettiğini söyle.', build: (c, N) => range(N).map((i) => {
    const t = one(D.emotions);
    if (i % 2 === 0) { const opts = sample(D.emotions.filter((x) => x[0] !== t[0]), 2); return { kind: 'pick', say: 'Hangisi ' + t[0] + '?', prompt: 'Hangisi ' + t[0] + '?', options: shuffle([{ e: t[1], ok: true }, ...opts.map((o) => ({ e: o[1] }))]) }; }
    return { kind: 'say', show: { text: t[2] }, prompt: 'Nasıl hissediyor?', answer: t[0], model: t[0] }; }) });
  def('talk', { cat: 'dil', e: '💬', name: 'Günlük İletişim', desc: 'Selamlaş, iste, teşekkür et, yardım iste.', build: (c, N) => sample(D.talk, N).map(([e, s, a]) => ({ kind: 'say', show: { e }, prompt: s, answer: a, model: a.split(' / ')[0] })) });

  /* ---- Oyunlar ---- */
  def('memory', { cat: 'oyun', e: '🃏', name: 'Hafıza Kartı', desc: 'Eşleri bul, kelimeyi söyle.', build: () => [{ kind: 'memory' }] });

  const ROTATION = ['cat', 'action', 'fsound', 'qa', 'opp', 'sylcount', 'build', 'rhyme', 'dir', 'emotion', 'suffix', 'story', 'samediff', 'talk'];

  /* ======================= Yardımcı bileşenler ======================= */
  const T = []; // zamanlayıcılar (ekran kapanınca temizlenir)
  const later = (fn, ms) => { const t = setTimeout(fn, ms * sp()); T.push(t); return t; };
  function clearTimers() { T.splice(0).forEach((t) => { clearTimeout(t); clearInterval(t); }); }

  function markPanel(cb, q) {
    const opt = (r, label, sub, ic, cls) => h('button.markbtn.' + cls, { onclick: (e) => { e.currentTarget.parentNode.querySelectorAll('button').forEach((b) => (b.disabled = true)); cb(r / 2); } }, h('span.mic', icon(ic, 34)), h('b', label), h('small', sub));
    return h('div.markpanel', h('p.markq', q || 'Veli: nasıl söyledi?'), h('div.markrow', opt(2, 'Rahat', 'kolay söyledi', 'check', 'ok'), opt(1, 'Yaklaşık', 'yardımla / yakın', 'tilde', 'mid'), opt(0, 'Tekrar', 'zorlandı', 'redo', 'again')));
  }
  function showCard(s) { return h('div.pic.sm', s.e ? h('span.emoji', s.e) : null, s.text ? h('div.ptext', s.text) : null); }

  /* ======================= Tur çizicileri ======================= */
  const R = {};

  R.pick = (r, done) => {
    let tries = 0;
    const grid = h('div.opts' + (r.options.length === 2 ? '.two' : ''), r.options.map((o) => h('button.opt', { 'data-ok': o.ok ? '1' : null, onclick: (ev) => choose(o, ev.currentTarget) }, h('span', o.e), o.text ? h('small', o.text) : null)));
    function choose(o, b) {
      if (o.ok) { K.audio.sfx('ok'); b.classList.add('good'); grid.querySelectorAll('button').forEach((x) => (x.disabled = true)); later(() => done(tries === 0 ? 1 : 0.5), 600); }
      else { tries++; K.audio.sfx('soft'); b.classList.add('wiggle'); b.disabled = true; say(r.say, r.rate); }
    }
    later(() => say(r.say, r.rate), 350);
    return h('div.rnd', r.show ? showCard(r.show) : null, h('p.prompt', r.prompt), h('button.btn.white.round', { onclick: () => say(r.say, r.rate) }, icon('speaker', 24), 'Dinle'), grid);
  };

  R.count = (r, done) => {
    let tries = 0; const reveal = h('div.reveal', '');
    const row = h('div.numrow', range(r.max).map((i) => h('button.numbtn', { 'data-ok': i + 1 === r.answer ? '1' : null, onclick: (ev) => {
      const b = ev.currentTarget;
      if (i + 1 === r.answer) { K.audio.sfx('ok'); b.classList.add('good'); row.querySelectorAll('button').forEach((x) => (x.disabled = true)); reveal.textContent = r.syl.map(K.trUp).join(' – '); later(() => done(tries === 0 ? 1 : 0.5), 1100); }
      else { tries++; K.audio.sfx('soft'); b.classList.add('wiggle'); b.disabled = true; say(r.say, 0.55); }
    } }, String(i + 1))));
    later(() => say(r.say, 0.55), 350);
    return h('div.rnd', h('div.pic.sm', h('span.emoji', r.e)), h('p.prompt', 'Kaç hece var? Kelimeyi dinle.'), h('button.btn.white.round', { onclick: () => say(r.say, 0.55) }, icon('speaker', 24), 'Dinle'), row, reveal);
  };

  R.same = (r, done) => {
    const play = async () => { await say(r.words[0], 0.7); await new Promise((x) => later(x, 600)); await say(r.words[1], 0.7); };
    let tries = 0;
    const choose = (isSame, b) => {
      if (isSame === r.same) { K.audio.sfx('ok'); b.classList.add('good'); box.querySelectorAll('.bigchoice button').forEach((x) => (x.disabled = true)); later(() => done(tries === 0 ? 1 : 0.5), 700); }
      else { tries++; K.audio.sfx('soft'); b.classList.add('wiggle'); b.disabled = true; play(); }
    };
    const box = h('div.rnd', h('div.pic.sm', h('span.emoji', '👂')), h('p.prompt', 'İki kelimeyi dinle. Aynı mı, farklı mı?'), h('button.btn.white.round', { onclick: play }, icon('speaker', 24), 'Tekrar dinle'),
      h('div.bigchoice', h('button.opt', { 'data-ok': r.same ? '1' : null, onclick: (e) => choose(true, e.currentTarget) }, h('span', '🟰'), h('small', 'Aynı')), h('button.opt', { 'data-ok': r.same ? null : '1', onclick: (e) => choose(false, e.currentTarget) }, h('span', '↔️'), h('small', 'Farklı'))));
    later(play, 400); return box;
  };

  R.say = (r, done) => {
    const mp = markPanel(done);
    const play = () => say(r.model);
    later(play, 350);
    return h('div.rnd', r.show ? showCard(r.show) : null, h('p.prompt', r.prompt), h('button.btn.white.round', { onclick: play }, icon('speaker', 24), 'Dinle'),
      h('p.expect', h('small', 'Veli için beklenen: '), h('b', r.answer)), mp);
  };

  R.order = (r, done) => {
    const n = r.blocks.length; let next = 0, wrong = 0;
    const slots = h('div.slots', range(n).map(() => h('div.slot')));
    const blocks = h('div.blocks', shuffle(range(n)).map((idx) => h('button.blk', { 'data-idx': String(idx), onclick: (ev) => {
      const b = ev.currentTarget;
      if (idx === next) { K.audio.sfx('ok'); const s = slots.children[next]; s.innerHTML = ''; s.appendChild(h('div.blkin', h('span', r.blocks[idx].e), r.blocks[idx].t ? h('small', r.blocks[idx].t) : null)); s.classList.add('full'); b.disabled = true; b.classList.add('used'); next++; if (next === n) later(complete, 500); }
      else { wrong++; K.audio.sfx('soft'); b.classList.add('wiggle'); setTimeout(() => b.classList.remove('wiggle'), 400); }
    } }, h('span', r.blocks[idx].e), r.blocks[idx].t ? h('small', r.blocks[idx].t) : null)));
    const wrap = h('div.rnd', r.title ? h('div.etag', r.title) : null, h('p.prompt', r.prompt), slots, blocks);
    function complete() {
      if (r.then !== 'say') { done(Math.max(0.5, 1 - wrong * 0.25)); return; }
      wrap.innerHTML = ''; wrap.append(h('div.sentence', r.sentence), h('p.prompt', 'Şimdi birlikte söyleyin!'), h('button.btn.white.round', { onclick: () => say(r.sentence) }, icon('speaker', 24), 'Dinle'), markPanel(done));
      say(r.sentence);
    }
    return wrap;
  };

  R.scene = (r, done) => {
    const placed = {}; let sel = null, wrong = 0;
    const byObj = {}; r.objs.forEach((o) => { byObj[o.k] = o; });
    const objsEl = h('div.sobjs', r.objs.map((o) => h('button.sobj', { 'data-obj': o.k, onclick: () => { sel = o.k; refresh(); K.audio.sfx('tap'); } }, h('span', o.e), h('small', o.label))));
    const placesEl = h('div.splaces', r.places.map((p) => h('button.splace', { 'data-place': p.k, onclick: () => put(p.k) }, h('span.pi', p.e), h('small', p.label), h('div.inside'))));
    function put(pk) { if (!sel) { U.toast('Önce bir eşyaya dokun'); return; } placed[sel] = pk; sel = null; K.audio.sfx('pad'); refresh(); }
    function refresh() {
      [...objsEl.children].forEach((b) => { const k = b.getAttribute('data-obj'); b.classList.toggle('sel', k === sel); b.classList.toggle('used', !!placed[k] && k !== sel); });
      [...placesEl.children].forEach((pb) => { const pk = pb.getAttribute('data-place'); const ins = pb.querySelector('.inside'); ins.innerHTML = ''; Object.keys(placed).filter((k) => placed[k] === pk).forEach((k) => ins.appendChild(h('span', byObj[k].e))); });
    }
    function check() {
      const ok = r.solution.every(([o, pk]) => placed[o] === pk) && Object.keys(placed).length === r.solution.length;
      if (ok) { K.audio.sfx('star'); placesEl.classList.add('good'); checkB.disabled = true; later(() => done(wrong === 0 ? 1 : 0.5), 800); }
      else { wrong++; K.audio.sfx('soft'); placesEl.classList.add('wiggle'); setTimeout(() => placesEl.classList.remove('wiggle'), 400); Object.keys(placed).forEach((k) => delete placed[k]); sel = null; refresh(); say(r.instr, 0.75); }
    }
    const checkB = h('button.btn.big', { onclick: check }, icon('check', 24), 'Tamam');
    later(() => say(r.instr, 0.75), 350);
    return h('div.rnd.scene', { 'data-solution': JSON.stringify(r.solution) }, h('p.prompt', r.instr), h('button.btn.white.round', { onclick: () => say(r.instr, 0.75) }, icon('speaker', 24), 'Dinle'), objsEl, placesEl, checkB);
  };

  /* ---- Hafıza kartı ---- */
  R.memory = (r, done, ctx) => {
    const c = ctx.c; const u = K.UNITS[Math.min(c.cur, K.UNITS.length - 1)];
    let pool = u.items.map((id) => K.getItem(id)).filter((x) => x && x.kind === 'w' && x.e && x.n <= 3);
    if (pool.length < 6) pool = pool.concat(K.WORDS.filter((w) => CORE(w) && w.n <= 2 && w.e));
    pool = distinctBy(shuffle(pool), (w) => w.e).slice(0, 6);
    const cards = shuffle([...pool, ...pool].map((w, i) => ({ w, id: i }))); let open = [], matched = 0, lock = false;
    const grid = h('div.mem', cards.map((cd, i) => { const b = h('button.mcard', { 'data-pair': cd.w.w, 'aria-label': 'Kart ' + (i + 1), onclick: () => flip(b, cd) }, h('span.back', '⭐'), h('span.front', h('i', cd.w.e), h('small', cd.w.w))); return b; }));
    const overlay = h('div.memover', { hidden: true });
    function flip(b, cd) {
      if (lock || b.classList.contains('open') || b.classList.contains('done')) return; K.audio.sfx('tap'); b.classList.add('open'); open.push([b, cd]);
      if (open.length === 2) {
        lock = true; const [[b1, c1], [b2, c2]] = open; open = [];
        if (c1.w === c2.w) { later(() => { b1.classList.add('done'); b2.classList.add('done'); matched++; K.audio.sfx('ok'); ask(c1.w); }, 500); }
        else later(() => { b1.classList.remove('open'); b2.classList.remove('open'); lock = false; }, 900);
      }
    }
    function ask(w) {
      overlay.hidden = false; overlay.innerHTML = ''; say(w.w, 0.7);
      overlay.append(h('div.pic.sm', h('span.emoji', w.e)), h('div.sentence', w.w), h('p.prompt', 'Kelimeyi söyle!'), h('button.btn.big', { onclick: () => { overlay.hidden = true; lock = false; if (matched >= pool.length) { K.audio.sfx('star'); later(() => done(1), 500); } } }, icon('ball', 24), 'Söyledim!'));
    }
    return h('div.rnd', h('p.prompt', 'Eşleri bul! Eşleşince kelimeyi söyle.'), grid, overlay);
  };

  /* ---- Ses yağmuru ---- */
  R.rain = (r, done, ctx) => {
    const c = ctx.c; const tg = (c.settings.targets || []).filter((l) => !K.isV(l));
    const u = K.UNITS[Math.min(c.cur, K.UNITS.length - 1)];
    const fromUnit = [...new Set(u.items.map((id) => K.getItem(id)).filter((x) => x && (x.kind === 'w' || x.kind === 's')).map((x) => (x.kind === 'w' ? x.init : x.c)))].filter((l) => !K.isV(l));
    const cands = (tg.length ? tg : fromUnit.length ? fromUnit : ['m', 'b', 's', 'k', 't', 'ş', 'l', 'p', 'd']).filter((l) => K.WORDS.filter((w) => CORE(w) && w.init === l).length >= 4);
    const L = one(cands.length ? cands : ['m', 'b', 's', 'k']);
    const words = sample(K.WORDS.filter((w) => CORE(w) && w.init === L), 10); let i = 0;
    const stage = h('div.rainstage'); const title = h('div.sentence', K.trUp(L));
    const step = () => {
      if (i >= words.length) { stage.innerHTML = ''; stage.append(h('div.sentence', 'Hepsi “' + K.trUp(L) + '” ile başladı!')); K.audio.sfx('star'); later(() => done(1), 1600); return; }
      const w = words[i++]; stage.innerHTML = ''; stage.append(h('div.raincard', h('span.emoji', w.e), h('div.rw', h('b', w.w.charAt(0).toLocaleUpperCase('tr-TR')), w.w.slice(1)))); say(w.w, 0.7); later(step, 2300);
    };
    later(step, 400);
    return h('div.rnd.rain', h('p.prompt', 'Sadece dinle ve izle. Sesi yakala:'), title, stage, h('button.linkbtn.light', { onclick: () => { clearTimers(); done(1); } }, 'Bitir'));
  };

  const RENDER = (kind) => R[kind];

  /* ======================= Etkinlik çalıştırıcı ======================= */
  function run(c, actId, opts, onDone) {
    opts = opts || {}; const act = A[actId]; const N = opts.rounds || (act.id === 'rain' || act.id === 'memory' ? 1 : 6);
    const rounds = act.build(c, N); let i = 0, sum = 0; let marked = false;
    const dots = h('div.dots'); const body = h('div.roundwrap');
    const el = h('div.item.act', h('div.itemhead', h('span.etag', act.e), h('h2', act.name)), dots, body);
    function drawDots() { dots.innerHTML = ''; rounds.forEach((_, k) => dots.appendChild(h('i' + (k < i ? '.on' : k === i ? '.cur' : '')))); }
    function show() {
      if (i >= rounds.length) return finish(); drawDots(); body.innerHTML = ''; clearTimers(); K.audio.stop();
      const r = rounds[i]; if (r.kind === 'say' || (r.kind === 'order' && r.then === 'say')) marked = true;
      body.appendChild(RENDER(r.kind)(r, (frac) => { sum += frac; i++; later(show, 350); }, { c }));
    }
    function finish() {
      clearTimers(); drawDots(); const ratio = sum / rounds.length;
      if (opts.inSession) { E.logGame(c, actId, sum, rounds.length, marked ? 'marked' : 'auto'); body.innerHTML = ''; body.append(h('div.sentence', rounds.length ? cheerFor(ratio) : '')); K.audio.sfx('star'); setTimeout(() => onDone && onDone({ act: true, ratio, n: rounds.length, r: ratio >= 0.75 ? 2 : ratio >= 0.4 ? 1 : 0 }), 1100 * sp()); return; }
      E.logGame(c, actId, sum, rounds.length, marked ? 'marked' : 'auto'); const trs = E.newTrophies(c);
      const stars = ratio >= 0.75 ? 3 : ratio >= 0.4 ? 2 : 1; K.audio.sfx('star');
      body.innerHTML = ''; body.append(h('div.finish', h('h1', cheerFor(ratio)), h('div.stars', range(3).map((k) => h('span.star' + (k < stars ? '.on' : '.off'), icon('star', 54)))),
        rounds.length > 1 ? h('p.lead', rounds.length + ' turdan ' + Math.round(sum * 10) / 10 + ' puan') : null, trs.length ? h('div.newtr', trs.map((t) => h('div.trophy.got.mini', h('span.tnum', t.n), h('b', 'Yeni kupa: ' + t.name)))) : null,
        h('div.navrow.c', h('button.btn.white', { onclick: () => U.go('/act?id=' + actId + '&r=' + Date.now()) }, 'Tekrar oyna'), h('button.btn.big', { onclick: () => U.go('/games') }, 'Etkinlikler'))));
    }
    if (opts.inSession) el.appendChild(h('button.linkbtn.light', { onclick: () => { clearTimers(); K.audio.stop(); onDone && onDone({ act: true, skip: true }); } }, 'Atla'));
    show();
    return { el, destroy() { clearTimers(); K.audio.stop(); } };
  }
  const cheerFor = (ratio) => (ratio >= 0.75 ? one(CHEERS) : ratio >= 0.4 ? 'Güzel denedin!' : 'Birlikte tekrar deneriz!');

  /* ======================= Ağız aynası (kamera) ======================= */
  function mirrorUI() {
    let stream = null, mm = null, player = null, idx = 0;
    const poses = [['a', 'Kocaman A'], ['e', 'E'], ['i', 'Gülümse (İ)'], ['o', 'O'], ['u', 'U'], ['kiss', 'Öpücük'], ['tongueOut', 'Dil çıkar'], ['tongueUp', 'Dil yukarı'], ['puff', 'Yanak şişir'], ['fish', 'Balık ağzı']];
    const video = h('video.mirrorvid', { autoplay: true, playsinline: true, muted: true, 'aria-label': 'Kendi görüntün' }); video.muted = true;
    const msg = h('p.hint', 'Kamera açılıyor…');
    const mbox = h('div.mouthbox.mini2'); mm = K.mouth.create(h('div'), {}); mbox.appendChild(mm.el);
    const label = h('div.sentence.small', '');
    let count = 0; const dotsEl = h('div.repdots', range(3).map(() => h('i')));
    function setPose() { const [p, n] = poses[idx]; label.textContent = n; mm.pose(p, 500); K.audio.speak(n); count = 0; [...dotsEl.children].forEach((d) => d.classList.remove('on')); }
    const tap = h('button.btn.big', { onclick: () => { if (count >= 3) return; dotsEl.children[count++].classList.add('on'); K.audio.sfx('pad'); if (count >= 3) { setTimeout(() => { idx = (idx + 1) % poses.length; setPose(); }, 700); } } }, icon('ball', 24), 'Yaptım!');
    const nav = h('div.actions', h('button.btn.white.round', { onclick: () => { idx = (idx + poses.length - 1) % poses.length; setPose(); } }, icon('back', 22), 'Önceki'), h('button.btn.white.round', { onclick: () => { idx = (idx + 1) % poses.length; setPose(); } }, 'Sonraki', icon('next', 22)));
    (async () => {
      try { if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('yok'); stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false }); video.srcObject = stream; msg.textContent = 'Aynadaki gibi yap! Görüntü kaydedilmez, cihazdan çıkmaz.'; }
      catch (e) { msg.textContent = 'Kamera kullanılamadı. Gerçek bir aynanın karşısında birlikte yapabilirsiniz.'; video.hidden = true; }
    })();
    setPose();
    return { el: h('div.item.act', h('div.itemhead', h('span.etag', '🪞'), h('h2', 'Ağız Aynası')), msg, h('div.mirrorrow', h('div.mirrorbox', video), mbox), label, dotsEl, tap, nav),
      destroy() { if (stream) stream.getTracks().forEach((t) => t.stop()); if (mm) mm.destroy(); K.audio.stop(); } };
  }

  /* ======================= Yeni öğe ekranları (ses taklidi, ritim, ses şiddeti, tekerleme, kaplumbağa) ======================= */
  async function startMeter(fill, say2) {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const AC = G.AudioContext || G.webkitAudioContext; const ac = new AC(); const an = ac.createAnalyser(); an.fftSize = 1024; ac.createMediaStreamSource(stream).connect(an);
    const buf = new Uint8Array(an.fftSize); let raf = 0, alive = true;
    const loop = () => { if (!alive) return; an.getByteTimeDomainData(buf); let s = 0; for (let k = 0; k < buf.length; k++) { const v = (buf[k] - 128) / 128; s += v * v; } const lvl = Math.min(1, Math.sqrt(s / buf.length) * 5); fill(lvl); raf = requestAnimationFrame(loop); };
    loop(); return () => { alive = false; cancelAnimationFrame(raf); stream.getTracks().forEach((t) => t.stop()); try { ac.close(); } catch (e) { /* */ } };
  }

  function itemVisual(c, it) {
    const kill = []; const nodes = []; let hint = '';
    const timers = []; const t = (fn, ms) => { const x = setTimeout(fn, ms * sp()); timers.push(x); return x; }; kill.push(() => timers.forEach((x) => { clearTimeout(x); clearInterval(x); }));
    if (it.kind === 'a') {
      hint = 'Sesi taklit et!';
      nodes.push(h('div.pic', h('span.emoji', it.e)), h('div.soundtext', it.t.toLocaleUpperCase('tr-TR')), h('div.small', it.w));
    } else if (it.kind === 'r') {
      hint = 'Tempoya uyarak hece hece söyle.'; const ms = 60000 / it.bpm;
      const pads = h('div.pads', it.syl.map((s2, k) => h('button.pad', { onclick: (e) => { K.audio.sfx('pad'); const b = e.currentTarget; b.classList.remove('hit'); void b.offsetWidth; b.classList.add('hit'); } }, h('span', K.trUp(s2)), h('small', String(k + 1)))));
      const go = h('button.btn.white.round', { onclick: () => {
        go.disabled = true; let n = 0; const total = it.syl.length * 3;
        const beat = () => { const k = n % it.syl.length; [...pads.children].forEach((p, j) => p.classList.toggle('lit', j === k)); K.audio.sfx('pad'); n++; if (n < total) t(beat, ms / sp()); else t(() => { [...pads.children].forEach((p) => p.classList.remove('lit')); go.disabled = false; }, ms / sp()); };
        beat();
      } }, icon('play', 22), 'Ritimle (' + it.bpm + ')');
      nodes.push(h('div.bigletter.syl.chain', K.trUp(it.c)), pads, go);
    } else if (it.kind === 'l') {
      const T3 = { fisilda: [0, 0.2], konus: [0.2, 0.55], bagir: [0.55, 1] }[it.mode]; hint = it.txt + ': “' + it.w + '”';
      const fill = h('i'); const zone = h('b.zone', { style: { left: (T3[0] * 100) + '%', width: ((T3[1] - T3[0]) * 100) + '%' } }); const state = h('small', 'Ses göstergesi isteğe bağlıdır (kayıt yapılmaz).');
      let stopM = null; const mbtn = h('button.btn.white.round', { onclick: async () => {
        if (stopM) { stopM(); stopM = null; mbtn.textContent = 'Ses göstergesini aç'; fill.style.width = '0'; return; }
        try { stopM = await startMeter((lvl) => { fill.style.width = Math.round(lvl * 100) + '%'; state.textContent = lvl < 0.04 ? 'Sessiz' : lvl >= T3[0] && lvl <= T3[1] ? '✓ Tam yerinde' : lvl < T3[0] ? 'Biraz daha yüksek' : 'Biraz daha alçak'; }); mbtn.textContent = 'Göstergeyi kapat'; }
        catch (e) { state.textContent = 'Mikrofon kullanılamadı; gösterge olmadan devam edebilirsiniz.'; }
      } }, icon('mic', 20), 'Ses göstergesini aç');
      kill.push(() => { if (stopM) stopM(); });
      nodes.push(h('div.pic.sm', h('span.emoji', it.e)), h('div.sentence', it.txt), h('div.pic.sm', h('span.emoji', it.we), h('div.ptext', it.w)), h('div.meter', zone, h('div.mfill', fill)), state, mbtn);
    } else if (it.kind === 't') {
      hint = 'Birlikte, ritimle söyleyelim.'; const ms = 60000 / it.bpm; const toks = [];
      const lines = h('div.lyrics', it.lines.map((ln) => h('p', ln.split(' ').map((w) => { const s2 = h('span.lw', w + ' '); toks.push(s2); return s2; }))));
      const go = h('button.btn.white.round', { onclick: () => { go.disabled = true; let n = 0; const stepf = () => { toks.forEach((x, j) => x.classList.toggle('lit', j === n)); K.audio.sfx('pad'); n++; if (n <= toks.length) t(stepf, ms / sp()); else { toks.forEach((x) => x.classList.remove('lit')); go.disabled = false; } }; stepf(); } }, icon('play', 22), 'Başla');
      nodes.push(h('div.pic.sm', h('span.emoji', it.e)), h('div.sentence.small', it.w), lines, go);
    } else if (it.kind === 'k') {
      hint = 'Önce nefes al, sonra yavaş yavaş söyle.'; const toks = []; const track = h('div.tokens', it.toks.map(([s2, wi], k) => { const x = h('span.tok', K.trUp(s2)); toks.push(x); return x; }));
      const turtle = h('div.turtle', '🐢'); const stat = h('div.small', 'Hazır olunca “Yavaşça” düğmesine bas.');
      const go = h('button.btn.white.round', { onclick: () => {
        go.disabled = true; stat.textContent = 'Nefes al…'; K.audio.sfx('soft');
        t(() => { let n = 0; stat.textContent = 'Yavaş yavaş…'; const stepf = () => { toks.forEach((x, j) => x.classList.toggle('lit', j === n)); turtle.style.left = Math.min(92, (n / Math.max(1, toks.length - 1)) * 92) + '%'; n++; if (n <= toks.length) t(stepf, 1100 / sp()); else { toks.forEach((x) => x.classList.remove('lit')); stat.textContent = 'Güzel! Bir daha dener misin?'; go.disabled = false; } }; stepf(); }, 1600 / sp());
      } }, icon('play', 22), 'Yavaşça');
      nodes.push(h('div.sentence.small', it.w), track, h('div.turtlebar', turtle), stat, go);
    }
    return { nodes, hint, destroy() { kill.forEach((f) => f()); } };
  }

  /* ======================= Yönlendirme ve merkez ekranlar ======================= */
  const ACT_ORDER = { dinleme: ['fsound', 'sylcount', 'rhyme', 'samediff', 'rain'], dil: ['cat', 'action', 'opp', 'dir', 'build', 'qa', 'suffix', 'story', 'emotion', 'talk'], oyun: ['memory'] };
  const tile = (e, t, sub, fn) => h('button.tile.wide', { onclick: fn }, h('span.ticon', e), h('div.ttxt', h('b', t), h('small', sub)));

  U.route('/games', (root) => {
    const c = S.cur(); root.className = 'scr purple';
    const sec = (title, tiles) => h('section.hubsec', h('h2.hubh', title), h('div.tiles.col', tiles));
    root.appendChild(h('div.page', h('header.topbar', h('button.icon-btn', { 'aria-label': 'Geri', onclick: () => U.go('/home') }, icon('back')), h('h1.ptitle', 'Etkinlikler')),
      sec('👂 Dinleme Oyunları', ACT_ORDER.dinleme.map((id) => tile(A[id].e, A[id].name, A[id].desc, () => U.go('/act?id=' + id)))),
      sec('🌍 Dil Dünyası', ACT_ORDER.dil.map((id) => tile(A[id].e, A[id].name, A[id].desc, () => U.go('/act?id=' + id)))),
      sec('🎮 Oyunlar', [
        tile('🃏', A.memory.name, A.memory.desc, () => U.go('/act?id=memory')),
        tile('👄', 'Ağız Oyunları', 'Aynadaki gibi yap, nefes oyunları', () => U.go('/mouthlist')),
        tile('🥁', 'Ses ve Ritim', 'Hayvan sesleri, ritim, tekerleme, ses şiddeti', () => U.go('/soundlist')),
        tile('🪞', 'Ağız Aynası', 'Kamerada kendini gör, aynı şekli yap', () => U.go('/mirror')),
        c && c.settings.slow ? tile('🐢', 'Kaplumbağa Konuşma', 'Yavaş ve rahat konuşma', () => U.go('/slow')) : null,
      ]),
    ));
  });

  U.route('/act', (root, p) => {
    const c = S.cur(); root.className = 'scr purple'; const a = A[p.id]; if (!a) { U.go('/games', true); return; }
    const stage = h('div.stage'); root.appendChild(h('div.page.play', h('header.topbar', h('button.icon-btn', { 'aria-label': 'Geri', onclick: () => { clearTimers(); U.go('/games'); } }, icon('back'))), stage));
    const ui = run(c, p.id, {}, null); stage.appendChild(ui.el); return ui.destroy;
  });

  const listRoute = (path, title, ids, back) => U.route(path, (root) => {
    const c = S.cur(); root.className = 'scr purple';
    const items = ids(c).map((id) => K.getItem(id, c.custom)).filter(Boolean);
    root.appendChild(h('div.page', h('header.topbar', h('button.icon-btn', { 'aria-label': 'Geri', onclick: () => U.go(back || '/games') }, icon('back')), h('h1.ptitle', title)),
      h('div.whogrid', items.map((it) => h('button.whocard', { onclick: () => U.go('/free?id=' + encodeURIComponent(it.id) + '&b=' + encodeURIComponent(path)) }, h('span.bigemoji', it.e), h('b', it.kind === 'r' ? it.c + ' · ' + it.bpm : it.kind === 'l' ? it.txt.split(' ')[0] + ': ' + it.w : it.kind === 'a' ? it.w : it.w))))));
  });
  listRoute('/soundlist', 'Ses ve Ritim', () => ['a1', 'a2', 'l1', 'r1', 't1'].flatMap((id) => K.UNIT_MAP[id].items));
  U.route('/slow', (root) => {
    const c = S.cur(); root.className = 'scr purple';
    const items = Object.keys(K.SLOW).map((id) => K.SLOW[id]);
    U.modal({ title: 'Kaplumbağa Konuşma', body: h('div', h('p', 'Bu çalışma, yavaş ve rahat bir başlangıçla konuşmayı destekler.'), h('p.small', 'Takılma ya da akıcılıkla ilgili bir endişeniz varsa, bu çalışmayı bir dil ve konuşma terapistinin önerisiyle kullanın.')), actions: [{ label: 'Anladım', value: true }], dismiss: false });
    root.appendChild(h('div.page', h('header.topbar', h('button.icon-btn', { 'aria-label': 'Geri', onclick: () => U.go('/games') }, icon('back')), h('h1.ptitle', 'Kaplumbağa')),
      h('div.whogrid', items.map((it) => h('button.whocard', { onclick: () => U.go('/free?id=' + encodeURIComponent(it.id) + '&b=%2Fslow') }, h('span.bigemoji', '🐢'), h('b', it.w))))));
  });
  U.route('/free', (root, p) => {
    const c = S.cur(); root.className = 'scr purple'; const it = K.getItem(p.id, c.custom); const back = p.b || '/games'; if (!it) { U.go('/games', true); return; }
    const stage = h('div.stage'); root.appendChild(h('div.page.play', h('header.topbar', h('button.icon-btn', { 'aria-label': 'Geri', onclick: () => U.go(back) }, icon('back')), h('h1.ptitle', 'Serbest çalışma')), stage));
    const ui = K.repItemUI(c, it, (res) => { if (res && res.r != null) { E.record(c, it.id, res.r, res.reps); S.save(); } U.go(back); }); stage.appendChild(ui.el); return ui.destroy;
  });
  U.route('/mirror', (root) => {
    root.className = 'scr purple'; const stage = h('div.stage');
    root.appendChild(h('div.page.play', h('header.topbar', h('button.icon-btn', { 'aria-label': 'Geri', onclick: () => U.go('/games') }, icon('back')), h('h1.ptitle', 'Ağız Aynası')), stage));
    const ui = mirrorUI(); stage.appendChild(ui.el); return ui.destroy;
  });

  K.acts = { A, ACT_ORDER, rotation: ROTATION, run, itemVisual, speed: 1, clearTimers, mirrorUI };
})(window);
