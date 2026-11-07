/* 底部音频播放器：播放 / 暂停 / 拖动进度 / 实时示波器 */
(function () {
  const el = document.getElementById("player");
  const audio = document.getElementById("pAudio");
  const btn = document.getElementById("pPlay");
  const title = document.getElementById("pTitle");
  const meta = document.getElementById("pMeta");
  const cur = document.getElementById("pCur");
  const dur = document.getElementById("pDur");
  const seek = document.getElementById("pSeek");
  const close = document.getElementById("pClose");
  const scope = document.getElementById("pScope");
  const sctx = scope.getContext("2d");

  let current = null;
  let actx = null, analyser = null, buf = null, seeking = false, raf = 0;

  const fmt = (s) => {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60), r = Math.floor(s % 60);
    return `${m}:${String(r).padStart(2, "0")}`;
  };

  function ensureGraph() {
    if (actx) return;
    try {
      actx = new (window.AudioContext || window.webkitAudioContext)();
      const src = actx.createMediaElementSource(audio);
      analyser = actx.createAnalyser();
      analyser.fftSize = 1024;
      buf = new Uint8Array(analyser.fftSize);
      src.connect(analyser);
      analyser.connect(actx.destination);
    } catch (e) {
      actx = null; analyser = null; // 示波器不可用时，声音照常播放
    }
  }

  function drawScope() {
    const w = scope.clientWidth, h = scope.clientHeight, dpr = Math.min(devicePixelRatio || 1, 2);
    if (scope.width !== w * dpr) { scope.width = w * dpr; scope.height = h * dpr; }
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    sctx.clearRect(0, 0, w, h);
    sctx.strokeStyle = "rgba(230,226,216,.12)";
    sctx.beginPath(); sctx.moveTo(0, h / 2); sctx.lineTo(w, h / 2); sctx.stroke();
    if (analyser && !audio.paused) {
      analyser.getByteTimeDomainData(buf);
      sctx.strokeStyle = "#5CC8D6";
      sctx.lineWidth = 1.5;
      sctx.beginPath();
      for (let i = 0; i < buf.length; i++) {
        const x = (i / (buf.length - 1)) * w;
        const y = (buf[i] / 255) * h;
        i ? sctx.lineTo(x, y) : sctx.moveTo(x, y);
      }
      sctx.stroke();
    }
    if (!audio.paused) raf = requestAnimationFrame(drawScope);
  }

  function emit() {
    document.dispatchEvent(new CustomEvent("player:change", {
      detail: { id: current && current.id, playing: !audio.paused }
    }));
  }

  function play(work) {
    ensureGraph();
    if (actx && actx.state === "suspended") actx.resume();
    if (current && current.id === work.id) { toggle(); return; }
    current = work;
    audio.src = work.src || window.demoAudioUrl(work);
    title.textContent = work.title;
    meta.textContent = work.src ? work.subtitle || "" : "示例音频 · 上传作品后替换";
    el.hidden = false;
    document.body.classList.add("has-player");
    audio.play().catch(() => {});
  }

  function toggle() {
    if (!current) return;
    if (actx && actx.state === "suspended") actx.resume();
    audio.paused ? audio.play().catch(() => {}) : audio.pause();
  }

  btn.addEventListener("click", toggle);
  close.addEventListener("click", () => {
    audio.pause();
    el.hidden = true;
    document.body.classList.remove("has-player");
    current = null;
    emit();
  });

  audio.addEventListener("play", () => { el.classList.add("is-playing"); btn.setAttribute("aria-label", "暂停"); cancelAnimationFrame(raf); drawScope(); emit(); });
  audio.addEventListener("pause", () => { el.classList.remove("is-playing"); btn.setAttribute("aria-label", "播放"); drawScope(); emit(); });
  audio.addEventListener("ended", () => { audio.currentTime = 0; });
  audio.addEventListener("loadedmetadata", () => { dur.textContent = fmt(audio.duration); });
  audio.addEventListener("timeupdate", () => {
    cur.textContent = fmt(audio.currentTime);
    if (!seeking && audio.duration) {
      const v = (audio.currentTime / audio.duration) * 1000;
      seek.value = v;
      seek.style.setProperty("--p", v / 10 + "%");
    }
  });
  audio.addEventListener("error", () => {
    meta.textContent = "文件没加载出来，检查 data.js 里的 src 路径";
  });
  seek.addEventListener("input", () => {
    seeking = true;
    seek.style.setProperty("--p", seek.value / 10 + "%");
    if (audio.duration) cur.textContent = fmt((seek.value / 1000) * audio.duration);
  });
  seek.addEventListener("change", () => {
    if (audio.duration) audio.currentTime = (seek.value / 1000) * audio.duration;
    seeking = false;
  });

  // 空格键 = 播放/暂停（不在输入框和按钮上时）
  document.addEventListener("keydown", (e) => {
    if (e.code !== "Space" || !current) return;
    if (e.target.closest("input, textarea, button, a, [contenteditable]")) return;
    e.preventDefault();
    toggle();
  });

  window.Player = {
    play,
    pause: () => audio.pause(),
    state: () => ({ id: current && current.id, playing: !audio.paused })
  };
})();
