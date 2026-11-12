/* Konuşma Kampı — başlatıcı */
(function (G) {
  'use strict';
  const K = G.KK;
  // Masaüstü / ana ekran kurulumu (Chrome, Edge: beforeinstallprompt; Safari: elle)
  K.install = { evt: null, standalone: (G.matchMedia && G.matchMedia('(display-mode: standalone)').matches) || G.navigator.standalone === true };
  G.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); K.install.evt = e; });
  G.addEventListener('appinstalled', () => { K.install.evt = null; K.install.standalone = true; if (K.ui) K.ui.toast('Uygulama yüklendi'); });
  (async function boot() {
    try {
      await K.store.init();
      document.documentElement.classList.toggle('reduce', !!K.store.state.settings.reduceMotion);
      K.ui.render();
      // Çevrimdışı çalışma: servis çalışanı yalnızca güvenli bağlamda (https / localhost)
      if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
        navigator.serviceWorker.register('sw.js').catch(() => { /* sessizce geç */ });
      }
    } catch (e) {
      console.error(e);
      document.getElementById('app').innerHTML = '<div class="boot">Uygulama başlatılamadı.<br><small>Tarayıcınızın yerel depolama izni kapalı olabilir.</small></div>';
    }
  })();
})(window);
