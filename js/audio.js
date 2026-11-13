/* Konuşma Kampı — ses: Türkçe sesli okuma (cihaz sesi), veli kaydı, efektler. Ağ yok. */
(function (G) {
  'use strict';
  const K = G.KK;
  let voice = null, voicesTried = false, current = null, actx = null;
  const synth = G.speechSynthesis || null;

  function pickVoice() {
    if (!synth) return null;
    const vs = synth.getVoices() || [];
    voice = vs.find((v) => /^tr/i.test(v.lang) && v.localService) || vs.find((v) => /^tr/i.test(v.lang)) || null;
    voicesTried = true; return voice;
  }
  if (synth) { pickVoice(); try { synth.onvoiceschanged = pickVoice; } catch (e) { /* */ } }

  function ctx() {
    if (!actx) { try { actx = new (G.AudioContext || G.webkitAudioContext)(); } catch (e) { actx = null; } }
    if (actx && actx.state === 'suspended') actx.resume();
    return actx;
  }
  function tone(freq, dur, type, vol, when) {
    const c = ctx(); if (!c) return;
    const t0 = c.currentTime + (when || 0);
    const o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol || 0.15, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0 + dur + 0.02);
  }

  const A = {
    hasTTS() { return !!synth && (voice || pickVoice()) !== null; },
    ttsSupported() { return !!synth; },
    sfx(name) {
      if (!K.store.state || !K.store.state.settings.sfx) return;
      switch (name) {
        case 'tap': tone(520, 0.07, 'triangle', 0.12); break;
        case 'pad': tone(180, 0.12, 'sine', 0.3); tone(90, 0.16, 'sine', 0.3); break;
        case 'ok': tone(660, 0.1, 'triangle', 0.14); tone(880, 0.16, 'triangle', 0.14, 0.09); break;
        case 'star': tone(784, 0.1, 'triangle', 0.14); tone(988, 0.1, 'triangle', 0.14, 0.09); tone(1318, 0.22, 'triangle', 0.14, 0.18); break;
        case 'swish': tone(300, 0.25, 'sawtooth', 0.04); break;
        case 'soft': tone(330, 0.15, 'sine', 0.1); break;
        default: tone(440, 0.08);
      }
    },
    stop() { try { if (synth) synth.cancel(); } catch (e) { /* */ } if (current) { try { current.pause(); } catch (e) { /* */ } current = null; } },

    /* Bir öğeyi seslendir: önce veli kaydı, yoksa cihaz sesi */
    async say(item, opts) {
      opts = opts || {};
      this.stop();
      const rec = item && item.id ? await K.store.getBlob('rec:' + item.id) : null;
      if (rec) return this.playBlob(rec);
      const text = this.textFor(item);
      return this.speak(text, opts);
    },
    textFor(item) {
      if (!item) return '';
      switch (item.kind) {
        case 'w': case 'p': return item.w.replace('…', '');
        case 's': return item.s;
        case 'v': return item.v;
        case 'c': case 'r': return item.syl.join(', ');
        case 'a': return item.t;
        case 'l': return item.w;
        case 't': return item.lines.join('. ');
        case 'k': return item.w;
        case 'm': case 'b': return item.say || item.name;
        default: return item.w || '';
      }
    },
    speak(text, opts) {
      opts = opts || {};
      return new Promise((res) => {
        const st = K.store.state;
        if (!synth || !text || (st && st.settings.voice === false)) return res(false);
        try {
          const u = new SpeechSynthesisUtterance(text);
          u.lang = 'tr-TR'; if (voice || pickVoice()) u.voice = voice;
          u.rate = opts.rate || (st ? st.settings.voiceRate : 0.8) || 0.8; u.pitch = 1.05;
          u.onend = () => res(true); u.onerror = () => res(false);
          synth.cancel(); synth.speak(u);
        } catch (e) { res(false); }
      });
    },
    playBlob(blob) {
      return new Promise((res) => {
        try {
          const url = URL.createObjectURL(blob); const a = new Audio(url); current = a;
          a.onended = () => { URL.revokeObjectURL(url); res(true); }; a.onerror = () => res(false);
          a.play().catch(() => res(false));
        } catch (e) { res(false); }
      });
    },

    /* Veli sesi kaydı */
    async startRecord() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof MediaRecorder === 'undefined') throw new Error('Bu cihaz kayıt almayı desteklemiyor.');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream); const chunks = [];
      rec.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
      const done = new Promise((res) => { rec.onstop = () => { stream.getTracks().forEach((t) => t.stop()); res(new Blob(chunks, { type: rec.mimeType || 'audio/webm' })); }; });
      rec.start();
      const timer = setTimeout(() => { if (rec.state !== 'inactive') rec.stop(); }, 4000);
      return { stop() { clearTimeout(timer); if (rec.state !== 'inactive') rec.stop(); return done; } };
    },
  };
  K.audio = A;
})(window);
