/* Konuşma Kampı — çevrimdışı önbellek. Ağdan yalnızca uygulama dosyaları alınır; kullanıcı verisi hiçbir zaman gönderilmez. */
const VERSION = 'kk-v1.0.1';
const ASSETS = [
  './', './index.html', './manifest.webmanifest',
  './css/app.css',
  './js/content.js', './js/store.js', './js/audio.js', './js/mouth.js', './js/engine.js', './js/ui.js', './js/child.js', './js/parent.js', './js/app.js',
  './fonts/alfa-slab-one-latin-400-normal.woff2', './fonts/alfa-slab-one-latin-ext-400-normal.woff2',
  './fonts/anton-latin-400-normal.woff2', './fonts/anton-latin-ext-400-normal.woff2',
  './fonts/nunito-latin-600-normal.woff2', './fonts/nunito-latin-ext-600-normal.woff2',
  './fonts/nunito-latin-800-normal.woff2', './fonts/nunito-latin-ext-800-normal.woff2',
  './icons/icon.svg', './icons/icon-180.png', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png',
];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(VERSION).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url); if (url.origin !== location.origin) return;
  e.respondWith(caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req).then((res) => { const cp = res.clone(); caches.open(VERSION).then((c) => c.put(req, cp)); return res; }).catch(() => req.mode === 'navigate' ? caches.match('./index.html') : Response.error())));
});
