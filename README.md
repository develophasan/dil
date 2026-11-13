# Konuşma Kampı

Çocuk ve veli **birlikte** kullanır: ağız-dil egzersizleri, nefes, ünlüler, heceler, kelimeler ve cümleler.
Çevrimdışı çalışır, **hesap yok, sunucu yok, ağ isteği yok**. Tüm veri cihazın yerel depolamasında (IndexedDB) kalır.

> Destekleyici bir ev çalışması aracıdır. Tanı koymaz, dil ve konuşma terapisinin yerine geçmez.

## Özellikler
- **Çocuk modu:** büyük düğmeler, forma/saha temalı oyunlaştırma, 3–4 dk'lık mini antrenman, bitişte basket atışı ve yıldız, kupalar, "Lig Yolu" haritası.
- **Animasyonlu ağız modeli** (önden) ve **dilin yeri** (yan kesit): A E I İ O Ö U Ü ve 20 ünsüz için.
- **Aşamalı program (5 aşama, 31 ünite):** Isınma (ağız-dil-nefes, **hayvan ve araç sesleri**, ünlüler, **ses şiddeti**) → Sesler ve Heceler (heceler, **hız ve ritim**, **tekerleme**) → İlk Kelimeler → Kelime Ustası → Cümle Maçı. 217 resimli kelime, 39 cümle.
- **Dinleme oyunları:** ilk sesi bul, kaç hece, kafiye bul, aynı mı farklı mı, ses yağmuru.
- **Dil Dünyası:** kelime kategorileri, eylem kartları, zıtlar, yönerge uygulama (sahne), cümle kurma, soru–cevap, ekler, resimli hikâye, duygular, günlük iletişim.
- **Oyunlar:** hafıza kartı (hedef sesli), ağız oyunları, **Ağız Aynası** (kamerada kendini gör, görüntü kaydedilmez), ses ve ritim, isteğe bağlı **kaplumbağa konuşma** (yavaş başlangıç; uzman önerisiyle).
- **Veli işaretler:** Rahat / Yaklaşık / Tekrar. Aralıklı tekrar (Leitner) ile zorlanılan öğeler daha sık gelir. Her antrenmana günün kısa dil etkinliği de eklenir.
- **Her çocuğa özel:** başlangıç noktası, dikkat süresi, öğe/tekrar sayısı, odak sesler, sabitleme/gizleme, kendi kelimeniz (fotoğraf + kendi sesiniz), günlük antrenman sınırı, çoklu çocuk profili.
- **Veli alanı (PIN korumalı):** özet, ilerleme ölçütü, ses başarı grafiği, etkinlik sonuçları, günün ev görevleri, notlar, yazdırılabilir **gelişim raporu** (PDF), veli rehberi, yedek al / geri yükle.
- **Gizlilik:** CSP ile ağa çıkış kapalı; hesap, sunucu, izleyici yok. Kamera ve mikrofon yalnızca siz izin verdiğinizde, kayıt yapmadan kullanılır.

## Yayınlama (statik site)
Uygulama derleme gerektirmez; klasörün tamamı statik dosyadır. **HTTPS** gerekir (çevrimdışı çalışma, ana ekrana ekleme ve mikrofon için).

**Netlify / Cloudflare Pages:** klasörü sürükleyip bırakın (`_headers` dosyası güvenlik başlıklarını ekler).
**GitHub Pages:** dosyaları bir depoya yükleyin, *Settings → Pages → Deploy from branch* seçin.
**Kendi sunucunuz:** `konusma-kampi/` klasörünü herhangi bir statik web sunucusuyla yayınlayın.

Yerel deneme: `python3 -m http.server 8123` → http://localhost:8123

Kullanıcılar tarayıcıdan açıp **“Ana ekrana ekle”** ile uygulama gibi kullanır. İlk açılıştan sonra internet olmadan da çalışır.

## Dosya yapısı
```
index.html  manifest.webmanifest  sw.js  _headers
css/app.css
js/content2.js  ek içerik verileri (sesler, tekerlemeler, kategoriler, sorular…)
js/content.js   içerik: aşamalar, üniteler, sesler, kelimeler, cümleler
js/acts.js      etkinlikler: dinleme, dil, hafıza, ayna, yeni öğe ekranları
js/store.js     yerel depolama, yedek
js/audio.js     sesli okuma, veli kaydı, efektler
js/mouth.js     ağız ve dil animasyonları
js/engine.js    oturum kurma, aralıklı tekrar, ilerleme, kupalar
js/ui.js        DOM yardımcıları, yönlendirici, modal, veli kapısı
js/child.js     çocuk ekranları      js/parent.js   veli alanı
fonts/ icons/
```

## İçeriği değiştirme
`js/content.js` içinde kelime listesi (`W`), cümleler (`PH`), üniteler (`U`) düzenlenebilir. Yeni sürüm yayınlarken `sw.js` içindeki `VERSION` değerini artırın.

## Yazı tipleri
Alfa Slab One, Anton, Nunito — SIL Open Font License 1.1 (`fonts/LICENSE-*.txt`). Renk paleti: mor `#552583`, sarı `#fdb927`, siyah, beyaz, gri `#525252`. Uygulama herhangi bir spor takımı veya markayla bağlantılı değildir.

## Sürüm
1.1.0 — dinleme oyunları, Dil Dünyası, ses taklidi/ritim/tekerleme, ağız aynası, ev görevleri.
