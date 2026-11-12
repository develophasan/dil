/* Konuşma Kampı — yerel depolama (IndexedDB; yedek: localStorage).
   Hiçbir veri cihazdan dışarı çıkmaz. */
(function (G) {
  'use strict';
  const K = G.KK;
  const DB = 'konusma-kampi', KV = 'kv', BL = 'blob', STATE_KEY = 'state', LS_KEY = 'kk_state_v1';

  const todayKey = (d = new Date()) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const uid = (p) => (p || 'x') + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);

  function defaultState() {
    return { v: 1, created: Date.now(), onboarded: false, active: null, children: [],
      settings: { pin: null, recovery: null, voice: true, voiceRate: 0.8, sfx: true, reduceMotion: false, maxSessionsPerDay: 3, ackNotice: false } };
  }
  function newChild(o) {
    const lvl = o.level || 0;
    const startUnit = [0, 3, 6, 13, 23][lvl] != null ? [0, 3, 6, 13, 23][lvl] : 0; // seviye → başlangıç ünitesi (index)
    const min = o.minutes || 4;
    return { id: uid('c'), name: o.name || 'Çocuk', age: o.age || '', avatar: o.avatar || 0, created: Date.now(),
      cur: startUnit, level: lvl,
      settings: { minutes: min, perSession: min <= 2 ? 2 : min <= 4 ? 3 : 4, reps: 3, warmup: true, breath: true, review: true, targets: [], autoAdvance: false },
      items: {}, sessions: [], games: [], custom: [], pinned: [], hidden: [], notes: [], seenTrophies: [] };
  }

  /* ---------- IndexedDB ---------- */
  let db = null, idbOk = false;
  function openDB() {
    return new Promise((res) => {
      try {
        const r = indexedDB.open(DB, 1);
        r.onupgradeneeded = () => { const d = r.result; if (!d.objectStoreNames.contains(KV)) d.createObjectStore(KV); if (!d.objectStoreNames.contains(BL)) d.createObjectStore(BL); };
        r.onsuccess = () => { db = r.result; idbOk = true; res(true); };
        r.onerror = () => res(false);
        r.onblocked = () => res(false);
      } catch (e) { res(false); }
    });
  }
  function tx(store, mode, fn) {
    return new Promise((res, rej) => {
      if (!db) return res(null);
      try {
        const t = db.transaction(store, mode); const s = t.objectStore(store); const r = fn(s);
        t.oncomplete = () => res(r && r.result !== undefined ? r.result : null); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error);
      } catch (e) { rej(e); }
    });
  }
  const mem = {}; // IDB yoksa ses/fotoğraf geçici bellekte

  const S = {
    state: null, idb: false, persisted: null, _t: null, _dirty: false,

    async init() {
      this.idb = await openDB();
      let st = null;
      try { if (this.idb) st = await tx(KV, 'readonly', (s) => s.get(STATE_KEY)); } catch (e) { /* */ }
      if (!st) { try { const raw = localStorage.getItem(LS_KEY); if (raw) st = JSON.parse(raw); } catch (e) { /* */ } }
      this.state = this.migrate(st || defaultState());
      if (!this.state.active || !this.child(this.state.active)) this.state.active = this.state.children[0] ? this.state.children[0].id : null;
      addEventListener('pagehide', () => this.flush()); addEventListener('visibilitychange', () => { if (document.hidden) this.flush(); });
      return this.state;
    },
    migrate(st) {
      const d = defaultState();
      st.settings = Object.assign({}, d.settings, st.settings || {});
      st.children = st.children || [];
      st.children.forEach((c) => {
        const n = newChild({ name: c.name });
        c.settings = Object.assign({}, n.settings, c.settings || {});
        ['items', 'custom'].forEach((k) => { if (!c[k]) c[k] = n[k]; });
        ['sessions', 'games', 'pinned', 'hidden', 'notes', 'seenTrophies'].forEach((k) => { if (!Array.isArray(c[k])) c[k] = []; });
        if (typeof c.cur !== 'number') c.cur = 0;
      });
      return st;
    },
    /* Kaydet (gecikmeli) */
    save() {
      this._dirty = true; clearTimeout(this._t);
      this._t = setTimeout(() => this.flush(), 400);
    },
    async flush() {
      if (!this._dirty || !this.state) return; this._dirty = false; clearTimeout(this._t);
      try { if (this.idb) await tx(KV, 'readwrite', (s) => s.put(JSON.parse(JSON.stringify(this.state)), STATE_KEY)); } catch (e) { /* */ }
      try { localStorage.setItem(LS_KEY, JSON.stringify(this.state)); } catch (e) { /* kota */ }
    },
    async requestPersist() {
      try { if (navigator.storage && navigator.storage.persist) { this.persisted = await navigator.storage.persist(); } } catch (e) { /* */ }
      return this.persisted;
    },

    child(id) { return (this.state.children || []).find((c) => c.id === id) || null; },
    cur() { return this.child(this.state.active); },
    addChild(o) { const c = newChild(o); this.state.children.push(c); this.state.active = c.id; this.save(); return c; },
    removeChild(id) {
      const c = this.child(id); if (!c) return;
      this.state.children = this.state.children.filter((x) => x.id !== id);
      this.blobKeys('img:' + id).then((ks) => ks.forEach((k) => this.delBlob(k)));
      if (this.state.active === id) this.state.active = this.state.children[0] ? this.state.children[0].id : null;
      this.save();
    },

    /* ---------- Blob (ses kaydı / fotoğraf) ---------- */
    async putBlob(key, blob) { if (!this.idb) { mem[key] = blob; return; } await tx(BL, 'readwrite', (s) => s.put(blob, key)); },
    async getBlob(key) { if (!this.idb) return mem[key] || null; try { return await tx(BL, 'readonly', (s) => s.get(key)); } catch (e) { return null; } },
    async delBlob(key) { if (!this.idb) { delete mem[key]; return; } try { await tx(BL, 'readwrite', (s) => s.delete(key)); } catch (e) { /* */ } },
    async blobKeys(prefix) {
      if (!this.idb) return Object.keys(mem).filter((k) => k.startsWith(prefix || ''));
      try { const ks = await tx(BL, 'readonly', (s) => s.getAllKeys()); return (ks || []).filter((k) => String(k).startsWith(prefix || '')); } catch (e) { return []; }
    },

    /* ---------- Yedek ---------- */
    async exportAll() {
      await this.flush();
      const out = { app: 'konusma-kampi', v: 1, exported: new Date().toISOString(), state: this.state, blobs: {} };
      const keys = await this.blobKeys('');
      for (const k of keys) {
        const b = await this.getBlob(k); if (!b) continue;
        out.blobs[k] = { type: b.type, data: await blobToB64(b) };
      }
      return out;
    },
    async importAll(obj) {
      if (!obj || obj.app !== 'konusma-kampi' || !obj.state) throw new Error('Geçersiz yedek dosyası');
      this.state = this.migrate(obj.state);
      if (!this.state.active || !this.child(this.state.active)) this.state.active = this.state.children[0] ? this.state.children[0].id : null;
      for (const k of await this.blobKeys('')) await this.delBlob(k);
      for (const [k, v] of Object.entries(obj.blobs || {})) await this.putBlob(k, b64ToBlob(v.data, v.type));
      this._dirty = true; await this.flush();
    },
    async wipe() {
      try { if (db) { db.close(); } } catch (e) { /* */ }
      try { localStorage.removeItem(LS_KEY); } catch (e) { /* */ }
      await new Promise((res) => { try { const r = indexedDB.deleteDatabase(DB); r.onsuccess = r.onerror = r.onblocked = () => res(); } catch (e) { res(); } });
      Object.keys(mem).forEach((k) => delete mem[k]);
      this.state = defaultState(); this.idb = await openDB();
      this._dirty = true; await this.flush();
    },
    async usage() { try { if (navigator.storage && navigator.storage.estimate) { const e = await navigator.storage.estimate(); return e; } } catch (er) { /* */ } return null; },
  };

  function blobToB64(b) { return new Promise((res) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1] || ''); r.readAsDataURL(b); }); }
  function b64ToBlob(b64, type) { const bin = atob(b64); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return new Blob([u], { type: type || 'application/octet-stream' }); }

  Object.assign(K, { store: S, todayKey, uid, newChild, defaultState });
})(window);
