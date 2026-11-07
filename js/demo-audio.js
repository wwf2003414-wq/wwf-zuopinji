/* 为没有音频文件的占位作品，在浏览器里合成一段示例音乐（WAV），
   这样播放器在上传真实作品前也能完整演示。 */
(function () {
  const cache = new Map();

  function midiToHz(m) { return 440 * Math.pow(2, (m - 69) / 12); }

  function osc(type, phase) {
    const p = phase - Math.floor(phase);
    switch (type) {
      case "square": return p < 0.5 ? 0.6 : -0.6;
      case "sawtooth": return (2 * p - 1) * 0.6;
      case "triangle": return 1 - 4 * Math.abs(p - 0.5);
      default: return Math.sin(2 * Math.PI * p);
    }
  }

  function render(demo, seconds) {
    const rate = 22050;
    const len = Math.floor(rate * seconds);
    const out = new Float32Array(len);
    const beat = 60 / demo.bpm / 2; // 八分音符
    const steps = Math.floor(seconds / beat);
    // 确定性的“随机”，同一作品每次生成同样的旋律
    let seed = demo.root * 97 + demo.bpm;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

    for (let s = 0; s < steps; s++) {
      const bar = Math.floor(s / 8);
      const chordShift = [0, 5, -2, 3][bar % 4];
      const note = demo.root + 12 + chordShift + demo.scale[Math.floor(rnd() * demo.scale.length)];
      const start = Math.floor(s * beat * rate);
      const dur = Math.floor(beat * rate * (rnd() < 0.3 ? 2 : 1));
      const f = midiToHz(note);
      for (let i = 0; i < dur && start + i < len; i++) {
        const t = i / rate;
        const env = Math.min(1, t * 60) * Math.exp(-t * 5);
        out[start + i] += osc(demo.wave, f * t) * env * 0.22;
      }
      // 低音：每小节第一拍
      if (s % 8 === 0) {
        const bf = midiToHz(demo.root + chordShift);
        const bdur = Math.floor(beat * 8 * rate);
        for (let i = 0; i < bdur && start + i < len; i++) {
          const t = i / rate;
          const env = Math.min(1, t * 20) * Math.exp(-t * 0.9);
          out[start + i] += Math.sin(2 * Math.PI * bf * t) * env * 0.28;
        }
      }
      // 轻微的打击（噪声）
      if (s % 2 === 0) {
        const hdur = Math.floor(0.03 * rate);
        for (let i = 0; i < hdur && start + i < len; i++) {
          out[start + i] += (rnd() * 2 - 1) * Math.exp(-i / rate * 120) * (s % 4 === 0 ? 0.12 : 0.05);
        }
      }
    }
    // 简单回声
    const d = Math.floor(rate * beat * 3);
    for (let i = d; i < len; i++) out[i] += out[i - d] * 0.28;
    // 淡入淡出
    const fade = rate * 1.2;
    for (let i = 0; i < fade; i++) { out[i] *= i / fade; out[len - 1 - i] *= i / fade; }
    return { data: out, rate };
  }

  function toWav({ data, rate }) {
    const buf = new ArrayBuffer(44 + data.length * 2);
    const v = new DataView(buf);
    const w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    w(0, "RIFF"); v.setUint32(4, 36 + data.length * 2, true); w(8, "WAVE");
    w(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
    w(36, "data"); v.setUint32(40, data.length * 2, true);
    for (let i = 0; i < data.length; i++) {
      const s = Math.max(-1, Math.min(1, data[i]));
      v.setInt16(44 + i * 2, s * 0x7fff, true);
    }
    return URL.createObjectURL(new Blob([buf], { type: "audio/wav" }));
  }

  function parseDur(str) {
    const [m, s] = String(str || "0:20").split(":").map(Number);
    return Math.max(8, Math.min(40, (m || 0) * 60 + (s || 0)));
  }

  window.demoAudioUrl = function (work) {
    if (cache.has(work.id)) return cache.get(work.id);
    const demo = work.demo || { root: 48, scale: [0, 3, 7, 10, 12], bpm: 90, wave: "sine" };
    const url = toWav(render(demo, parseDur(work.duration)));
    cache.set(work.id, url);
    return url;
  };
})();
