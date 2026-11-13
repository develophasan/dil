/* Konuşma Kampı — ek içerik verileri (ses taklidi, ritim, dil dünyası, dinleme oyunları…).
   Yalnızca veri; content.js bunları öğelere ve ünitelere dönüştürür. */
(function (G) {
  'use strict';
  const K = (G.KK = G.KK || {});
  const D = (K.DATA2 = {});

  /* ---- Ses taklidi: [anahtar, emoji, taklit sesi] ---- */
  D.animals = [
    ['inek', '🐄', 'möö'], ['koyun', '🐑', 'meee'], ['kedi', '🐱', 'miyav'], ['köpek', '🐶', 'hav hav'],
    ['kuş', '🐦', 'cik cik'], ['horoz', '🐓', 'kukuriku'], ['ördek', '🦆', 'vak vak'], ['tavuk', '🐔', 'gıt gıt'],
    ['kurbağa', '🐸', 'vırak vırak'], ['arı', '🐝', 'vızzz'], ['yılan', '🐍', 'ssss'], ['at', '🐴', 'ihhh'], ['aslan', '🦁', 'grrr'],
  ];
  D.things = [
    ['araba', '🚗', 'bip bip'], ['tren', '🚆', 'çuf çuf'], ['uçak', '✈️', 'vıııın'], ['ambulans', '🚑', 'ıııu ıııu'],
    ['motor', '🏍️', 'brrm brrm'], ['gemi', '🚢', 'vuuu vuuu'], ['saat', '⏰', 'tik tak'], ['zil', '🔔', 'çınn çınn'],
    ['telefon', '📱', 'ring ring'], ['bebek', '👶', 'ınga ınga'], ['yağmur', '🌧️', 'şıp şıp'], ['rüzgar', '💨', 'vuuuu'],
    ['davul', '🥁', 'bum bum'], ['kapı', '🚪', 'tak tak'], ['top', '⚽', 'pat pat'],
  ];

  /* ---- Ses yüksekliği ---- */
  D.loud = [['fisilda', '🤫', 'Fısılda'], ['konus', '🗣️', 'Normal sesle söyle'], ['bagir', '📣', 'Kocaman sesle söyle']];
  D.loudWords = [['su', '💧'], ['anne', '👩'], ['top', '⚽']];

  /* ---- Hız ve ritim: [zincir, bpm] ---- */
  D.rhythm = [['pa-ta-ka', 50], ['pa-ta-ka', 80], ['pa-ta-ka', 110], ['ba-da-ga', 50], ['ba-da-ga', 80], ['ma-na-la', 60], ['ta-ta-ta-ta', 60], ['ba-ba-ba-ba', 80], ['ka-ta-pa', 70]];

  /* ---- Özgün kısa tekerlemeler (geleneksel metin değildir) ---- */
  D.rhymes = [
    { t: 'Top Zıplar', e: '⚽', bpm: 84, lines: ['Pat pat pat top zıplar', 'Bam bam bam davul çalar'] },
    { t: 'Davul', e: '🥁', bpm: 84, lines: ['Dum dum dum davul davul', 'Tak tak tak tavşan tavşan'] },
    { t: 'Kedi ve Köpek', e: '🐱', bpm: 80, lines: ['Kedi kuyruk sallar', 'Köpek hav hav havlar'] },
    { t: 'Yağmur', e: '🌧️', bpm: 76, lines: ['Şıp şıp şıp yağmur yağar', 'Su akar su akar'] },
    { t: 'Lale', e: '🌷', bpm: 72, lines: ['Lale lale la la la', 'Döner durur la la la'] },
    { t: 'Arı ve Kuş', e: '🐝', bpm: 84, lines: ['Vız vız vız arı uçar', 'Cik cik cik kuş öter'] },
    { t: 'Sayı Sayma', e: '🔢', bpm: 90, lines: ['Bir iki üç hop hop hop', 'Dört beş altı zıp zıp zıp', 'Yedi sekiz dokuz bam bam bam', 'On hadi bir daha'] },
    { t: 'Parmaklar', e: '🖐️', bpm: 70, lines: ['Baş parmak selam der', 'Gösterme parmağı bak der', 'Orta parmak uzun der', 'Küçük parmak merhaba'] },
  ];

  /* ---- Kaplumbağa konuşma (yavaş ve kolay başlangıç) ---- */
  D.slow = ['su', 'elma', 'anne', 'baba', 'top al', 'anne gel', 'su ver', 'ben su istiyorum', 'kedi süt içiyor', 'araba hızlı gidiyor'];

  /* ---- Kelime kategorileri: id → [ad, emoji, [[kelime, emoji]…]] ---- */
  D.cats = {
    hayvan: ['Hayvanlar', '🐾', [['kedi', '🐱'], ['köpek', '🐶'], ['kuş', '🐦'], ['balık', '🐟'], ['inek', '🐄'], ['koyun', '🐑'], ['at', '🐴'], ['tavşan', '🐰'], ['fil', '🐘'], ['zürafa', '🦒'], ['aslan', '🦁'], ['maymun', '🐒'], ['ayı', '🐻'], ['yılan', '🐍'], ['kurbağa', '🐸'], ['kelebek', '🦋'], ['arı', '🐝'], ['ördek', '🦆']] ],
    yiyecek: ['Yiyecekler', '🍎', [['elma', '🍎'], ['muz', '🍌'], ['çilek', '🍓'], ['portakal', '🍊'], ['limon', '🍋'], ['karpuz', '🍉'], ['üzüm', '🍇'], ['armut', '🍐'], ['kiraz', '🍒'], ['havuç', '🥕'], ['domates', '🍅'], ['patates', '🥔'], ['mısır', '🌽'], ['ekmek', '🍞'], ['peynir', '🧀'], ['yumurta', '🥚'], ['süt', '🥛'], ['dondurma', '🍦'], ['pasta', '🍰']] ],
    tasit: ['Taşıtlar', '🚗', [['araba', '🚗'], ['otobüs', '🚌'], ['tren', '🚆'], ['uçak', '✈️'], ['gemi', '🚢'], ['bisiklet', '🚲'], ['motor', '🏍️'], ['kamyon', '🚚'], ['helikopter', '🚁'], ['traktör', '🚜'], ['ambulans', '🚑'], ['taksi', '🚕']] ],
    vucut: ['Vücudumuz', '🙋', [['göz', '👁️'], ['burun', '👃'], ['kulak', '👂'], ['ağız', '👄'], ['dil', '👅'], ['diş', '🦷'], ['el', '✋'], ['ayak', '🦶'], ['bacak', '🦵'], ['kol', '💪']] ],
    giysi: ['Giysiler', '👕', [['tişört', '👕'], ['pantolon', '👖'], ['elbise', '👗'], ['ceket', '🧥'], ['çorap', '🧦'], ['ayakkabı', '👟'], ['şapka', '🎩'], ['eldiven', '🧤'], ['atkı', '🧣'], ['gözlük', '👓']] ],
    ev: ['Evimiz', '🏠', [['yatak', '🛏️'], ['sandalye', '🪑'], ['kapı', '🚪'], ['lamba', '💡'], ['televizyon', '📺'], ['saat', '⏰'], ['tabak', '🍽️'], ['kaşık', '🥄'], ['çatal', '🍴'], ['fincan', '☕'], ['anahtar', '🔑'], ['küvet', '🛁']] ],
    renk: ['Renkler', '🎨', [['kırmızı', '🔴'], ['mavi', '🔵'], ['sarı', '🟡'], ['yeşil', '🟢'], ['siyah', '⚫'], ['beyaz', '⚪'], ['turuncu', '🟠'], ['mor', '🟣'], ['kahverengi', '🟤']] ],
    sayi: ['Sayılar', '🔢', [['bir', '1️⃣'], ['iki', '2️⃣'], ['üç', '3️⃣'], ['dört', '4️⃣'], ['beş', '5️⃣'], ['altı', '6️⃣'], ['yedi', '7️⃣'], ['sekiz', '8️⃣'], ['dokuz', '9️⃣'], ['on', '🔟']] ],
    duygu: ['Duygular', '😊', [['mutlu', '😊'], ['üzgün', '😢'], ['kızgın', '😠'], ['korkmuş', '😨'], ['uykulu', '😴'], ['şaşkın', '😲']] ],
  };

  /* ---- Eylemler: [fiil, emoji] ---- */
  D.actions = [['koşuyor', '🏃'], ['uyuyor', '😴'], ['yürüyor', '🚶'], ['yiyor', '🍽️'], ['içiyor', '🥤'], ['gülüyor', '😄'], ['ağlıyor', '😢'], ['zıplıyor', '🤸'], ['yüzüyor', '🏊'], ['dans ediyor', '💃'], ['okuyor', '📖'], ['yazıyor', '✍️'], ['konuşuyor', '🗣️'], ['dinliyor', '👂'], ['bakıyor', '👀'], ['temizliyor', '🧹'], ['şarkı söylüyor', '🎤'], ['yıkanıyor', '🛁']];

  /* ---- Zıtlar: [a, emojiA, b, emojiB] ---- */
  D.opp = [['büyük', '🐘', 'küçük', '🐭'], ['sıcak', '🔥', 'soğuk', '🧊'], ['hızlı', '🐇', 'yavaş', '🐢'], ['gündüz', '☀️', 'gece', '🌙'], ['mutlu', '😊', 'üzgün', '😢'], ['ağır', '🪨', 'hafif', '🪶'], ['yukarı', '⬆️', 'aşağı', '⬇️'], ['açık', '🔓', 'kapalı', '🔒'], ['çok', '🍎🍎🍎', 'az', '🍎'], ['ıslak', '💧', 'kuru', '🏜️'], ['var', '✅', 'yok', '❌']];

  /* ---- Yönerge sahnesi ---- */
  D.sceneObjs = [['top', 'topu', '⚽'], ['kedi', 'kediyi', '🐱'], ['elma', 'elmayı', '🍎'], ['ayı', 'ayıyı', '🧸'], ['kitap', 'kitabı', '📖']];
  D.scenePlaces = [['kutuIc', 'kutunun içine', '📦', 'Kutunun içi'], ['kutuYan', 'kutunun yanına', '📦', 'Kutunun yanı'], ['sandUst', 'sandalyenin üstüne', '🪑', 'Sandalyenin üstü'], ['sandAlt', 'sandalyenin altına', '🪑', 'Sandalyenin altı'], ['sepetIc', 'sepetin içine', '🧺', 'Sepetin içi']];

  /* ---- Cümle kurma: sıralı bloklar ---- */
  D.build = [
    [['🐱', 'Kedi'], ['🥛', 'süt'], ['😋', 'içiyor']], [['🐶', 'Köpek'], ['🦴', 'kemik'], ['😋', 'yiyor']], [['👧', 'Kız'], ['📖', 'kitap'], ['👀', 'okuyor']],
    [['👦', 'Çocuk'], ['⚽', 'top'], ['🎮', 'oynuyor']], [['🐦', 'Kuş'], ['🌳', 'ağaçta'], ['🎶', 'ötüyor']], [['🚗', 'Araba'], ['💨', 'hızlı'], ['🛣️', 'gidiyor']],
    [['👩', 'Anne'], ['🍲', 'yemek'], ['🍳', 'yapıyor']], [['👨', 'Baba'], ['📰', 'gazete'], ['👀', 'okuyor']], [['🐟', 'Balık'], ['🌊', 'suda'], ['🏊', 'yüzüyor']],
    [['🌧️', 'Yağmur'], ['☔', 'yağıyor']], [['☀️', 'Güneş'], ['🌤️', 'çıktı']], [['🎈', 'Balon'], ['🕊️', 'uçuyor']], [['🌸', 'Çiçek'], ['🌱', 'açıyor']], [['👶', 'Bebek'], ['😴', 'uyuyor']],
  ];

  /* ---- Soru cevap: [emoji, soru, beklenen cevap] ---- */
  D.qa = [
    ['🐱🥛', 'Kedi ne içiyor?', 'Süt içiyor.'], ['🐶🦴', 'Köpek ne yiyor?', 'Kemik yiyor.'], ['🐦🌳', 'Kuş nerede?', 'Ağaçta.'], ['🐟🌊', 'Balık nerede?', 'Denizde (suda).'],
    ['👧📖', 'Kız ne yapıyor?', 'Kitap okuyor.'], ['👦⚽', 'Çocuk ne oynuyor?', 'Top oynuyor.'], ['🌧️', 'Yağmur yağıyor. Ne açarız?', 'Şemsiye.'], ['😴🛏️', 'Bebek nerede uyuyor?', 'Yatakta.'],
    ['🎂', 'Doğum gününde ne yeriz?', 'Pasta.'], ['☀️', 'Gündüz gökyüzünde ne var?', 'Güneş.'], ['🌙⭐', 'Gece gökyüzünde ne var?', 'Ay ve yıldızlar.'], ['🐄', 'İnek bize ne verir?', 'Süt.'],
    ['🐔🥚', 'Tavuk ne yapar?', 'Yumurta yapar.'], ['🧼🚿', 'Elimizi neyle yıkarız?', 'Sabunla (suyla).'], ['🌧️☂️', 'Neden şemsiye açarız?', 'Islanmamak için.'], ['🍽️', 'Yemeği neyle yeriz?', 'Kaşıkla (çatalla).'],
  ];

  /* ---- Ekler: [kök, ek'li, emoji] ---- */
  D.plural = [['kedi', 'kediler', '🐱🐱🐱'], ['top', 'toplar', '⚽⚽⚽'], ['kuş', 'kuşlar', '🐦🐦🐦'], ['balık', 'balıklar', '🐟🐟🐟'], ['elma', 'elmalar', '🍎🍎🍎'], ['çiçek', 'çiçekler', '🌸🌸🌸'], ['araba', 'arabalar', '🚗🚗🚗'], ['kitap', 'kitaplar', '📖📖📖']];
  D.locative = [['ev', 'evde', '🏠'], ['okul', 'okulda', '🏫'], ['kutu', 'kutuda', '📦'], ['yatak', 'yatakta', '🛏️'], ['deniz', 'denizde', '🌊'], ['ağaç', 'ağaçta', '🌳'], ['sepet', 'sepette', '🧺'], ['masa', 'masada', '🍽️']];
  D.accusative = [['top', 'topu', '⚽'], ['kedi', 'kediyi', '🐱'], ['elma', 'elmayı', '🍎'], ['kitap', 'kitabı', '📖'], ['araba', 'arabayı', '🚗'], ['süt', 'sütü', '🥛']];

  /* ---- Resimli hikâye: [ad, [emojiler], anlatım] ---- */
  D.stories = [
    ['Civciv Büyüyor', ['🥚', '🐣', '🐔'], 'Önce yumurta var. Sonra civciv çıkıyor. Sonra büyüyüp tavuk oluyor.'],
    ['Ağaç Büyüyor', ['🌰', '🌱', '🌳'], 'Önce tohum toprağa girer. Sonra filiz çıkar. Sonra büyük bir ağaç olur.'],
    ['Yağmur', ['☁️', '🌧️', '🌈'], 'Önce bulutlar gelir. Sonra yağmur yağar. Sonra gökkuşağı çıkar.'],
    ['Sabah', ['⏰', '🪥', '🥞'], 'Önce saat çalar. Sonra dişlerimizi fırçalarız. Sonra kahvaltı yaparız.'],
    ['Pasta', ['🥣', '🔥', '🍰'], 'Önce malzemeleri karıştırırız. Sonra fırında pişiririz. Sonra pasta hazır.'],
    ['Uyku', ['🌙', '🛏️', '😴', '🌅'], 'Akşam olur. Yatağa gideriz. Uyuruz. Sabah güneş doğar.'],
    ['Balon', ['🎈', '💨', '🎈', '💥'], 'Önce balon alırız. Sonra şişiririz. Balon büyür. Sonra patlar.'],
  ];

  /* ---- Duygular: [ad, emoji, durum cümlesi] ---- */
  D.emotions = [
    ['mutlu', '😊', 'Doğum günü partisine gitti.'], ['üzgün', '😢', 'Oyuncağı kırıldı.'], ['kızgın', '😠', 'Arkadaşı oyuncağını aldı.'],
    ['korkmuş', '😨', 'Karanlıkta bir ses duydu.'], ['uykulu', '😴', 'Bütün gün oynadı, çok yoruldu.'], ['şaşkın', '😲', 'Kutudan sürpriz çıktı.'],
  ];

  /* ---- Günlük iletişim: [emoji, durum, örnek cevap] ---- */
  D.talk = [
    ['👋', 'Birine selam ver.', 'Merhaba!'], ['🥛', 'Su istiyorsun. Ne dersin?', 'Su istiyorum. / Su lütfen.'], ['🆘', 'Bir şeyi yapamıyorsun. Ne dersin?', 'Yardım eder misin?'],
    ['🎁', 'Sana hediye verdiler. Ne dersin?', 'Teşekkür ederim.'], ['😔', 'Birinin oyuncağını düşürdün. Ne dersin?', 'Özür dilerim.'], ['🛒', 'Markette ekmek istiyorsun. Ne dersin?', 'Ekmek istiyorum.'],
    ['🩺', 'Doktor “Neren ağrıyor?” diye sordu. Ne dersin?', 'Karnım ağrıyor. / Başım ağrıyor.'], ['⏳', 'Sıranı beklemek istiyorsun. Ne dersin?', 'Sıra bende mi?'], ['👋', 'Birine veda et.', 'Hoşça kal!'],
    ['🚽', 'Tuvalete gitmek istiyorsun.', 'Tuvalete gitmek istiyorum.'], ['🍽️', 'Yemeğin bitti. Ne dersin?', 'Doydum. / Bitti.'], ['🤝', 'Arkadaşınla oynamak istiyorsun.', 'Benimle oynar mısın?'],
  ];

  /* ---- Kafiye grupları (aynı sesle biten kelimeler) ---- */
  D.rhymeGroups = [
    [['çiçek', '🌸'], ['köpek', '🐶'], ['kelebek', '🦋'], ['ekmek', '🍞']],
    [['kulak', '👂'], ['yatak', '🛏️'], ['bardak', '🥛'], ['ayak', '🦶']],
    [['tavşan', '🐰'], ['yılan', '🐍'], ['kaplan', '🐯'], ['fincan', '☕']],
    [['balık', '🐟'], ['kaşık', '🥄'], ['yıldız', '⭐']].slice(0, 2),
  ];
  /* ---- Benzer ses çiftleri (gerçek kelimeler) ---- */
  D.minPairs = [['kar', 'kal'], ['saz', 'saç'], ['kız', 'kış'], ['sal', 'şal'], ['dağ', 'bağ'], ['dal', 'bal'], ['gaz', 'kaz'], ['gül', 'kül'], ['kul', 'kol'], ['gel', 'gül'], ['bil', 'dil']];

  /* ---- Ev görevleri havuzu: aşamaya göre ---- */
  D.homeTasks = {
    1: ['Gün içinde aynada 3 kez ağız oyunu yapın (öpücük–gülümseme).', 'Yemekte pipetle su içirin ya da balon şişirtin.', 'Hayvan sesi taklit eden bir şarkı veya oyun oynayın.', 'Kitap okurken hayvanların seslerini birlikte taklit edin.', 'Banyoda köpükle “fuu” diye üfleyin.'],
    2: ['Gün içinde hedef hecelerden 3 tanesini oyun gibi tekrarlayın (ma-ma, ba-ba).', 'Yürürken hece hece adım atarak “pa-ta-ka” söyleyin.', 'Bir nesneyi gösterip ilk hecesini söyleterek “ne olduğunu” bulun.', 'Çocuğun sevdiği şarkıda tekrar eden heceleri birlikte söyleyin.'],
    3: ['Gün içinde hedef sesle başlayan 3 nesneyi gösterip adlandırın.', 'Kitaptaki bir resmi gösterip “Bu ne?” diye sorun, cevabı bekleyin.', 'Yemekte istediği şeyi söylemesi için kısa bir bekleme fırsatı yaratın.', 'Evdeki eşyalarla “bul ve söyle” oyunu oynayın.'],
    4: ['Çocuğun söylediği kelimeyi iki kelimelik cümleye çevirin (“top” → “top al”).', 'Yürüyüşte gördüğünüz 3 şeyi birlikte adlandırın.', 'Akşam yemeğinde günün bir olayını anlatmasını isteyin.', 'Evde nesneleri saklayıp “nerede?” oyunu oynayın.'],
    5: ['Gün sonunda 3 şeyi birlikte anlatın: “Bugün ne yaptık?”.', 'Bir resmi gösterip “Ne oluyor?” diye sorun, cümle kurmasını bekleyin.', 'Markette veya parkta kısa bir rol oyunu yapın (“Ekmek istiyorum”).', 'Birlikte kısa bir hikâye anlatın; her birinizin bir cümle eklemesi.'],
  };
})(window);
