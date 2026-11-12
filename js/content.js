/* Konuşma Kampı — içerik veritabanı (aşamalar, üniteler, sesler, kelimeler, cümleler)
   Tüm içerik cihazda; ağ isteği yok. */
(function (G) {
  'use strict';

  const VOWELS = 'aeıioöuü';
  const isV = (c) => VOWELS.includes(c);
  const trUp = (s) => s.toLocaleUpperCase('tr-TR');
  const trLow = (s) => s.toLocaleLowerCase('tr-TR');

  /* Türkçe hecelendirme: V.CV, VC.CV, VCC.CV */
  function syllabify(word) {
    const w = trLow(word);
    const letters = [...w];
    const vIdx = [];
    letters.forEach((c, i) => { if (isV(c)) vIdx.push(i); });
    if (vIdx.length < 2) return [w];
    const cuts = [];
    for (let k = 0; k < vIdx.length - 1; k++) {
      const a = vIdx[k], b = vIdx[k + 1];
      const between = b - a - 1;
      // iki ünlü arası ünsüz sayısı: 0 → a|b ; 1 → a|Cb ; 2+ → aC|C..b
      if (between === 0) cuts.push(b);
      else if (between === 1) cuts.push(a + 1);
      else cuts.push(a + 2);
    }
    const out = [];
    let prev = 0;
    cuts.forEach((c) => { out.push(letters.slice(prev, c).join('')); prev = c; });
    out.push(letters.slice(prev).join(''));
    return out;
  }

  /* ---------- Ses bilgisi (çocuk dili ipuçları) ---------- */
  const SOUND = {
    a: { t: 'Ağzını kocaman aç!', pose: 'a', tongue: 'low' },
    e: { t: 'Ağzını biraz aç, dudaklar yana.', pose: 'e', tongue: 'rest' },
    ı: { t: 'Dudaklar yana, dil geride.', pose: 'ı', tongue: 'back' },
    i: { t: 'Gülümse! Dişlerini göster.', pose: 'i', tongue: 'rest' },
    o: { t: 'Dudaklarını yuvarla.', pose: 'o', tongue: 'back' },
    ö: { t: 'Dudaklar yuvarlak, dil önde.', pose: 'ö', tongue: 'rest' },
    u: { t: 'Küçük yuvarlak bir ağız yap.', pose: 'u', tongue: 'back' },
    ü: { t: 'Küçük yuvarlak, dil önde.', pose: 'ü', tongue: 'rest' },
    m: { t: 'Dudaklarını birleştir: mmm!', pose: 'lips', tongue: 'rest' },
    p: { t: 'Dudaklar kapanır, sonra pat diye açılır!', pose: 'lips', tongue: 'rest' },
    b: { t: 'Dudaklar kapanır, sonra b diye açılır!', pose: 'lips', tongue: 'rest' },
    t: { t: 'Dil ucu üst dişlerin arkasına: t!', pose: 'tip', tongue: 'tip' },
    d: { t: 'Dil ucu üst dişlerin arkasına: d!', pose: 'tip', tongue: 'tip' },
    n: { t: 'Dil ucu yukarıda: nnn!', pose: 'tip', tongue: 'tip' },
    l: { t: 'Dil ucu yukarıda: lll!', pose: 'tip', tongue: 'tip' },
    k: { t: 'Dilin arkası yukarı kalkar: k!', pose: 'back', tongue: 'back' },
    g: { t: 'Dilin arkası yukarı kalkar: g!', pose: 'back', tongue: 'back' },
    h: { t: 'Ağzını aç, nefes ver: h!', pose: 'a', tongue: 'low' },
    s: { t: 'Dişler yaklaşır, ince hava: sss!', pose: 'teeth', tongue: 'groove' },
    z: { t: 'Arı gibi: zzz!', pose: 'teeth', tongue: 'groove' },
    ş: { t: 'Dudaklar biraz öne: şşş!', pose: 'sh', tongue: 'sh' },
    ç: { t: 'Dudaklar öne, dil yukarıda: ç!', pose: 'sh', tongue: 'tip' },
    c: { t: 'Dudaklar öne, ses var: c!', pose: 'sh', tongue: 'tip' },
    f: { t: 'Üst dişler alt dudağa: fff!', pose: 'fv', tongue: 'rest' },
    v: { t: 'Üst dişler alt dudağa, ses var: vvv!', pose: 'fv', tongue: 'rest' },
    y: { t: 'Dilin ortası yukarı: yyy!', pose: 'i', tongue: 'y' },
    r: { t: 'Dil ucu titrer: rrr!', pose: 'tip', tongue: 'r' },
    j: { t: 'Dudaklar öne: jjj!', pose: 'sh', tongue: 'sh' },
  };

  /* ---------- Ağız ve nefes oyunları ---------- */
  const MOUTH_GAMES = {
    kiss_smile: { name: 'Öpücük – Gülümseme', e: '💋', say: 'Öpücük yap, sonra gülümse!', reps: 4,
      seq: [{ pose: 'kiss', ms: 1400, text: 'Öpücük!' }, { pose: 'i', ms: 1400, text: 'Gülümse!' }] },
    big_a: { name: 'Kocaman A', e: '😮', say: 'Ağzını kocaman aç!', reps: 4,
      seq: [{ pose: 'a', ms: 1700, text: 'Kocaman A!' }, { pose: 'closed', ms: 900, text: 'Kapat' }] },
    balloon: { name: 'Yanak Balonu', e: '🎈', say: 'Yanaklarını şişir!', reps: 3,
      seq: [{ pose: 'puff', ms: 2200, text: 'Şişir!' }, { pose: 'closed', ms: 900, text: 'Bırak' }] },
    fish: { name: 'Balık Ağzı', e: '🐟', say: 'Balık ağzı yap!', reps: 3,
      seq: [{ pose: 'fish', ms: 1600, text: 'Balık!' }, { pose: 'closed', ms: 900, text: 'Bırak' }] },
    tongue_out: { name: 'Dil Çıkar', e: '👅', say: 'Dilini dışarı çıkar!', reps: 4,
      seq: [{ pose: 'tongueOut', ms: 1600, text: 'Dil dışarı!' }, { pose: 'closed', ms: 800, text: 'İçeri' }] },
    tongue_updown: { name: 'Dil Yukarı – Aşağı', e: '↕️', say: 'Dilini yukarı, sonra aşağı götür!', reps: 4,
      seq: [{ pose: 'tongueUp', ms: 1400, text: 'Burnuna doğru!' }, { pose: 'tongueDown', ms: 1400, text: 'Çenene doğru!' }] },
    lick: { name: 'Dondurma Yala', e: '🍦', say: 'Dondurma yala! Sağa, sola, yukarı, aşağı.', reps: 2,
      seq: [{ pose: 'tongueRight', ms: 1100, text: 'Sağa!' }, { pose: 'tongueLeft', ms: 1100, text: 'Sola!' }, { pose: 'tongueUp', ms: 1100, text: 'Yukarı!' }, { pose: 'tongueDown', ms: 1100, text: 'Aşağı!' }] },
    tongue_circle: { name: 'Dil Turu', e: '🔄', say: 'Dilinle dudaklarının etrafında dön!', reps: 2,
      seq: [{ pose: 'tongueRight', ms: 800, text: '' }, { pose: 'tongueDown', ms: 800, text: '' }, { pose: 'tongueLeft', ms: 800, text: '' }, { pose: 'tongueUp', ms: 800, text: 'Tur!' }] },
    cluck: { name: 'At Nalı Sesi', e: '🐴', say: 'Dilini damağına yapıştır, çat diye bırak!', reps: 4,
      seq: [{ pose: 'roof', ms: 1300, text: 'Yapıştır…' }, { pose: 'a', ms: 600, text: 'Çat!' }] },
    brr: { name: 'Araba Sesi: Brrr', e: '🚗', say: 'Dudaklarını titret: brrrr!', reps: 3,
      seq: [{ pose: 'brr', ms: 2400, text: 'Brrrr!' }, { pose: 'closed', ms: 800, text: 'Dinlen' }] },
  };

  const BREATH_GAMES = {
    balloon: { name: 'Balon Şişir', e: '🏀', say: 'Burnundan nefes al, ağzından yavaşça ver.', cycles: 3, inhale: 4, exhale: 5, vis: 'ball' },
    candle: { name: 'Mum Üfle', e: '🕯️', say: 'Derin nefes al, mumu yavaşça üfle.', cycles: 3, inhale: 3, exhale: 5, vis: 'candle' },
    belly: { name: 'Karın Nefesi', e: '🌬️', say: 'Elini karnına koy. Nefes alırken karnın şişsin.', cycles: 3, inhale: 4, exhale: 4, vis: 'ball' },
  };

  /* ---------- Kelime bankası: "kelime|emoji" ---------- */
  const W = `
balon|🎈;bal|🍯;baba|👨;bebek|👶;balık|🐟;bayrak|🚩;bisiklet|🚲;bulut|☁️;bardak|🥛;bot|🥾;
pasta|🍰;para|💰;patates|🥔;pil|🔋;portakal|🍊;papatya|🌼;pizza|🍕;
mum|🕯️;muz|🍌;maymun|🐒;makas|✂️;mavi|🔵;mantar|🍄;mısır|🌽;mikrofon|🎤;
top|⚽;tavuk|🐔;tren|🚆;tilki|🦊;telefon|📱;tabak|🍽️;tavşan|🐰;taş|🪨;
davul|🥁;dondurma|🍦;dinozor|🦖;dağ|⛰️;diş|🦷;deve|🐪;defter|📓;domates|🍅;dil|👅;
nane|🌿;nota|🎵;anne|👩;deniz|🌊;lamba|💡;limon|🍋;lale|🌷;kalem|✏️;elma|🍎;salata|🥗;el|✋;
kedi|🐱;köpek|🐶;kuş|🐦;kitap|📖;kapı|🚪;kuzu|🐑;kaplan|🐯;kalp|❤️;kar|❄️;kek|🧁;kaşık|🥄;kamyon|🚚;kelebek|🦋;koltuk|🛋️;kurbağa|🐸;
göz|👁️;gül|🌹;gemi|🚢;güneş|☀️;gitar|🎸;gözlük|👓;geyik|🦌;gazete|📰;
havuç|🥕;horoz|🐓;hamburger|🍔;helikopter|🚁;hediye|🎁;
su|💧;saat|⏰;sandalye|🪑;sepet|🧺;sebze|🥦;süt|🥛;soğan|🧅;sarı|🟡;simit|🥯;
zil|🔔;zürafa|🦒;zarf|✉️;zebra|🦓;zar|🎲;tuz|🧂;
şapka|🎩;şemsiye|☂️;şeker|🍬;şişe|🍼;şarkı|🎶;şimşek|⚡;şeftali|🍑;
fil|🐘;fare|🐭;fındık|🌰;fırça|🖌️;fotoğraf|📷;fincan|☕;fener|🔦;
vapur|⛴️;vida|🔩;ev|🏠;kavun|🍈;
çiçek|🌸;çorap|🧦;çilek|🍓;çanta|👜;çatal|🍴;çocuk|🧒;çay|🍵;çam|🌲;çekiç|🔨;çöp|🗑️;
ceket|🧥;cetvel|📏;cüzdan|👛;canavar|👹;
yıldız|⭐;yılan|🐍;yatak|🛏️;yumurta|🥚;yaprak|🍃;yağmur|🌧️;yelken|⛵;yüzük|💍;yengeç|🦀;yarasa|🦇;
robot|🤖;radyo|📻;resim|🖼️;roket|🚀;rüzgar|💨;araba|🚗;kiraz|🍒;karpuz|🍉;armut|🍐;peynir|🧀;
ayı|🐻;arı|🐝;ağaç|🌳;ekmek|🍞;inek|🐄;ilaç|💊;ıspanak|🥬;orman|🌲;oyuncak|🧸;okul|🏫;ok|🏹;ördek|🦆;örümcek|🕷️;öpücük|💋;uçak|✈️;uyku|😴;uzay|🌌;üzüm|🍇;üçgen|🔺;
ayakkabı|👟;bilgisayar|💻;çikolata|🍫;elbise|👗;ambulans|🚑;traktör|🚜;pantolon|👖;ananas|🍍;muhallebi|🍮;
`;
  const WORDS = [];
  const WORD_MAP = {};
  W.split(';').forEach((p) => {
    const t = p.trim();
    if (!t) return;
    const [w, e] = t.split('|');
    if (!w || WORD_MAP[w]) return;
    const syl = syllabify(w);
    const o = { id: 'w:' + w, kind: 'w', w, e, syl, n: syl.length, init: [...w][0], fin: [...w].slice(-1)[0], snd: [...new Set([...w])] };
    WORDS.push(o); WORD_MAP[w] = o;
  });

  /* ---------- Heceler ---------- */
  const SYLS = {};
  function makeSyl(s) {
    if (SYLS[s]) return SYLS[s];
    const o = { id: 's:' + s, kind: 's', s, c: [...s][0], v: [...s][1], snd: [...new Set([...s])] };
    SYLS[s] = o; return o;
  }
  function sylSet(cons, vows) { const r = []; [...cons].forEach((c) => [...vows].forEach((v) => r.push(makeSyl(c + v).id))); return r; }
  const CHAINS = ['ma-ma', 'ba-ba', 'pa-pa', 'ta-ta', 'da-da', 'na-na', 'la-la', 'ka-ka', 'pa-ta-ka', 'ba-da-ga', 'ma-na-la', 'ta-ka-pa'];
  const CHAIN_MAP = {};
  CHAINS.forEach((c) => { CHAIN_MAP[c] = { id: 'c:' + c, kind: 'c', c, syl: c.split('-'), n: c.split('-').length, snd: [...new Set(c.replace(/-/g, ''))] }; });

  const VOW = {};
  [...VOWELS].forEach((v) => { VOW[v] = { id: 'v:' + v, kind: 'v', v, snd: [v] }; });

  /* ---------- Cümleler ---------- */
  const PH = [
    ['p1', 'Top al.', '⚽'], ['p1', 'Su ver.', '💧'], ['p1', 'Anne gel.', '👩'], ['p1', 'Baba bak.', '👨'], ['p1', 'Kedi gel.', '🐱'],
    ['p1', 'Araba git.', '🚗'], ['p1', 'Kitap oku.', '📖'], ['p1', 'Elma ye.', '🍎'], ['p1', 'Süt iç.', '🥛'], ['p1', 'Kapı aç.', '🚪'],
    ['p1', 'Işık yak.', '💡'], ['p1', 'Top at.', '⚽'], ['p1', 'Bana ver.', '🤲'], ['p1', 'Balon uç.', '🎈'], ['p1', 'Ayı geldi.', '🐻'],
    ['p2', 'Merhaba.', '👋'], ['p2', 'Günaydın.', '🌅'], ['p2', 'Hoşça kal.', '👋'], ['p2', 'Lütfen.', '🙏'], ['p2', 'Teşekkürler.', '😊'],
    ['p2', 'Evet.', '👍'], ['p2', 'Hayır.', '🙅'], ['p2', 'Bitti.', '✅'], ['p2', 'Yardım et.', '🙋'], ['p2', 'Daha istiyorum.', '➕'],
    ['p2', 'Ben su istiyorum.', '💧'], ['p2', 'Ben top istiyorum.', '⚽'], ['p2', 'Bu ne?', '❓'], ['p2', 'Benim adım …', '💜'],
    ['p3', 'Kedi süt içiyor.', '🐱'], ['p3', 'Ben elma yiyorum.', '🍎'], ['p3', 'Araba hızlı gidiyor.', '🚗'], ['p3', 'Kuş ağaçta.', '🐦'],
    ['p3', 'Baba kitap okuyor.', '📖'], ['p3', 'Top yuvarlanıyor.', '⚽'], ['p3', 'Balon uçuyor.', '🎈'], ['p3', 'Çiçek açıyor.', '🌸'],
    ['p3', 'Güneş çıktı.', '☀️'], ['p3', 'Anne yemek yapıyor.', '🍲'],
  ];
  const PHRASES = {};
  PH.forEach(([g, t, e], i) => { const id = 'p:' + (g + '-' + i); PHRASES[id] = { id, kind: 'p', g, w: t, e, n: t.split(' ').length, snd: [...new Set(trLow(t).replace(/[^a-zçğıöşü]/g, ''))] }; });

  /* ---------- Ünite yardımcıları ---------- */
  const byFirst = (letters) => WORDS.filter((x) => letters.includes(x.init)).map((x) => x.id);
  const idsOf = (arr) => arr.map((x) => x.id);

  const STAGES = [
    { id: 1, name: 'Isınma', icon: '🔥', desc: 'Ağız, dil ve nefes kasları + ünlüler' },
    { id: 2, name: 'Sesler ve Heceler', icon: '🎵', desc: 'Ünsüz + ünlü heceler' },
    { id: 3, name: 'İlk Kelimeler', icon: '🏀', desc: 'Başlangıç sesine göre kelimeler' },
    { id: 4, name: 'Kelime Ustası', icon: '🏆', desc: 'Kelime sonu, uzun kelimeler, zor sesler' },
    { id: 5, name: 'Cümle Maçı', icon: '👑', desc: 'İki ve üç kelimelik cümleler' },
  ];

  const hardWords = WORDS.filter((x) => /[rsşzç]/.test(x.w.slice(1)));
  const U = [
    // Aşama 1
    { id: 'u1', st: 1, t: 'Ağız Isınması', items: ['m:kiss_smile', 'm:big_a', 'm:balloon', 'm:fish'], tip: 'Aynada birlikte yapın; önce siz gösterin.' },
    { id: 'u2', st: 1, t: 'Dil Isınması', items: ['m:tongue_out', 'm:tongue_updown', 'm:lick', 'm:tongue_circle', 'm:cluck'], tip: 'Dil hareketleri çocuğa komik gelir; gülmesi serbest.' },
    { id: 'u3', st: 1, t: 'Nefes Oyunları', items: ['b:balloon', 'b:candle', 'b:belly', 'm:brr'], tip: 'Nefes alırken omuzlar kalkmasın.' },
    { id: 'u4', st: 1, t: 'Ünlüler: A • E • O • İ', items: ['v:a', 'v:e', 'v:o', 'v:i'], tip: 'Sesi hafifçe uzatın: aaa, eee…' },
    { id: 'u5', st: 1, t: 'Ünlüler: U • I', items: ['v:u', 'v:ı'], tip: 'Dudak şekline dikkat: U yuvarlak, I yana.' },
    { id: 'u6', st: 1, t: 'Ünlüler: Ö • Ü', items: ['v:ö', 'v:ü'], tip: 'Bu sesler zordur; kısa tutun, baskı yapmayın.' },
    // Aşama 2
    { id: 'u7', st: 2, t: 'Dudak Sesleri: M • P • B', items: sylSet('mpb', 'aeoi'), tip: 'Dudakların birleştiğini aynada gösterin.' },
    { id: 'u8', st: 2, t: 'Dil Ucu Sesleri: T • D • N', items: sylSet('tdn', 'aeoi'), tip: 'Dil ucu üst dişlerin arkasında.' },
    { id: 'u9', st: 2, t: 'Dil Arkası Sesleri: K • G • H', items: sylSet('kgh', 'aeoi'), tip: 'K ve G için dilin arkası kalkar; gıdıklayarak gösterebilirsiniz.' },
    { id: 'u10', st: 2, t: 'Sürtünmeli Sesler: S • Z • Ş', items: sylSet('szş', 'aeoi'), tip: 'Uzun, ince hava sesi. Elinizi ağzın önüne tutun.' },
    { id: 'u11', st: 2, t: 'F • V • L • Y', items: sylSet('fvly', 'aeoi'), tip: 'F ve V: üst dişler alt dudağa.' },
    { id: 'u12', st: 2, t: 'Ç • C • R', items: sylSet('çcr', 'aeoi'), tip: 'R en son oturan seslerdendir; acele etmeyin.' },
    { id: 'u13', st: 2, t: 'Hece Zincirleri', items: CHAINS.map((c) => 'c:' + c), tip: 'Hece hece masaya vurarak, ritimle söyleyin.' },
    // Aşama 3
    { id: 'u14', st: 3, t: 'M • P • B kelimeleri', items: byFirst('mpb'), tip: 'Her hafta 2–3 kelime; aynı kelimeler en az 2 hafta.' },
    { id: 'u15', st: 3, t: 'T • D • N • L kelimeleri', items: byFirst('tdnl'), tip: 'Kelimeyi tek nefeste söyletin.' },
    { id: 'u16', st: 3, t: 'K • G • H kelimeleri', items: byFirst('kgh'), tip: 'İlk sesi hafifçe uzatın: kkkedi.' },
    { id: 'u17', st: 3, t: 'S • Z • Ş kelimeleri', items: byFirst('szş'), tip: 'Sürtünmeli sesleri uzatarak başlatın.' },
    { id: 'u18', st: 3, t: 'F • V • Ç • C • Y kelimeleri', items: byFirst('fvçcy'), tip: 'Resimli kartla çalışın.' },
    { id: 'u19', st: 3, t: 'Ünlüyle başlayan kelimeler', items: byFirst('aeıioöuü'), tip: 'Ağız şekli sessiz başlangıçta bile önemlidir.' },
    // Aşama 4
    { id: 'u20', st: 4, t: 'Kelime Sonu Sesleri', items: idsOf(WORDS.filter((x) => !isV(x.fin) && x.n <= 2)), tip: 'Son sesi net bırakın: ku-ş.' },
    { id: 'u21', st: 4, t: 'İki Heceli Kelimeler', items: idsOf(WORDS.filter((x) => x.n === 2)), tip: 'Hece hece vurarak söyleyin.' },
    { id: 'u22', st: 4, t: 'Üç ve Daha Uzun Kelimeler', items: idsOf(WORDS.filter((x) => x.n >= 3)), tip: 'Yavaş başlayın, sonra hızlanın.' },
    { id: 'u23', st: 4, t: 'Zor Sesler (R • S • Ş • Z • Ç)', items: idsOf(hardWords), tip: 'Doğru söyleyemese de denemesini kutlayın.' },
    // Aşama 5
    { id: 'u24', st: 5, t: 'İki Kelimelik Cümleler', items: Object.values(PHRASES).filter((p) => p.g === 'p1').map((p) => p.id), tip: 'Birlikte söyleyin, sonra tek başına.' },
    { id: 'u25', st: 5, t: 'Günlük İfadeler', items: Object.values(PHRASES).filter((p) => p.g === 'p2').map((p) => p.id), tip: 'Günlük hayatta gerçek fırsatlarda kullanın.' },
    { id: 'u26', st: 5, t: 'Üç Kelimelik Cümleler', items: Object.values(PHRASES).filter((p) => p.g === 'p3').map((p) => p.id), tip: 'Uzun cümlede nefes almayı unutmayın.' },
  ];
  const UNIT_MAP = {}; U.forEach((u, i) => { u.i = i; UNIT_MAP[u.id] = u; });

  /* ---------- Item çözümleyici ---------- */
  function getItem(id, custom) {
    if (id.startsWith('cw:')) return (custom && custom.find((c) => c.id === id)) || null;
    const k = id[0], key = id.slice(2);
    if (k === 'w') return WORD_MAP[key] || (custom && custom.find((c) => c.id === id)) || null;
    if (k === 's') return SYLS[key] || makeSyl(key);
    if (k === 'v') return VOW[key] || null;
    if (k === 'c') return CHAIN_MAP[key] || null;
    if (k === 'p') return PHRASES[id] || null;
    if (k === 'm') return MOUTH_GAMES[key] ? { id, kind: 'm', key, ...MOUTH_GAMES[key], snd: [] } : null;
    if (k === 'b') return BREATH_GAMES[key] ? { id, kind: 'b', key, ...BREATH_GAMES[key], snd: [] } : null;
    return null;
  }

  /* Hedef ses seçenekleri */
  const TARGET_SOUNDS = [...'mpbtdnlkghszşfvçcyrj'];

  const AVATARS = ['🦁', '🐯', '🐻', '🦊', '🐼', '🐸', '🦄', '🐙', '🐶', '🐱', '🚀', '⭐'];

  G.KK = G.KK || {};
  Object.assign(G.KK, { VOWELS, isV, trUp, trLow, syllabify, SOUND, MOUTH_GAMES, BREATH_GAMES, WORDS, WORD_MAP, SYLS, makeSyl, CHAINS, CHAIN_MAP, VOW, PHRASES, STAGES, UNITS: U, UNIT_MAP, getItem, TARGET_SOUNDS, AVATARS });
})(window);
