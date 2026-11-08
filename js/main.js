/* 页面逻辑：加载动画、各版块渲染、导航高亮、视频弹窗 */
(function () {
  const site = window.SITE || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ICON_PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4l13 8-13 8z"/></svg>';
  const ICON_PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>';
  const hasMedia = (m) => !!(m && (m.embed || m.src));

  $("#year").textContent = new Date().getFullYear();

  /* ---------- 开屏加载 ---------- */
  (function loader() {
    const box = $("#loader"), bar = $("#loaderBar"), num = $("#loaderNum");
    document.body.classList.add("is-loading");
    const total = reduce ? 200 : 1300;
    const start = performance.now();
    let fontsReady = false;
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { fontsReady = true; });
    setTimeout(() => { fontsReady = true; }, 3000);
    function step(now) {
      let k = Math.min(1, (now - start) / total);
      if (!fontsReady) k = Math.min(k, 0.92);
      const eased = 1 - Math.pow(1 - k, 3);
      bar.style.width = eased * 100 + "%";
      num.textContent = String(Math.round(eased * 100)).padStart(3, "0");
      if (k < 1) requestAnimationFrame(step);
      else setTimeout(() => { box.classList.add("is-done"); document.body.classList.remove("is-loading"); }, 180);
    }
    requestAnimationFrame(step);
    // 后台标签页里动画帧会暂停，用定时器兜底，保证加载层一定会关掉
    setTimeout(() => { box.classList.add("is-done"); document.body.classList.remove("is-loading"); }, 4000);
  })();

  /* ---------- 自动封面：没有封面图时用 id 生成一张频谱图 ---------- */
  function coverCanvas(id, { w = 800, h = 450, accent = "245,183,0", play = true } = {}) {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const g = c.getContext("2d");
    let seed = 7;
    for (const ch of id) seed = (seed * 31 + ch.charCodeAt(0)) % 2147483647;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    g.fillStyle = "#2C3137"; g.fillRect(0, 0, w, h);
    const n = 72, bw = w / n;
    for (let i = 0; i < n; i++) {
      const env = Math.sin((i / n) * Math.PI);
      const v = (0.12 + rnd() * 0.88) * env;
      const bh = v * h * 0.62;
      g.fillStyle = `rgba(${accent},${0.18 + v * 0.5})`;
      g.fillRect(i * bw + 1, h / 2 - bh / 2, bw - 2, bh);
    }
    if (play) {
      const r = Math.min(w, h) * 0.1;
      g.fillStyle = "rgba(21,23,26,.8)";
      g.beginPath(); g.arc(w / 2, h / 2, r, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#F5B700";
      g.beginPath(); g.moveTo(w / 2 - r * 0.3, h / 2 - r * 0.42); g.lineTo(w / 2 + r * 0.48, h / 2); g.lineTo(w / 2 - r * 0.3, h / 2 + r * 0.42); g.fill();
    }
    c.setAttribute("aria-hidden", "true");
    return c;
  }

  function fillCover(box, item, opts) {
    if (item.cover) {
      const img = new Image();
      img.src = item.cover; img.alt = ""; img.loading = "lazy";
      box.appendChild(img);
    } else box.appendChild(coverCanvas(item.id, opts));
  }

  /* ---------- 弹窗：视频 / 图片 ---------- */
  const modal = $("#videoModal"), screen = $("#vScreen");
  function openMedia(item, title) {
    window.Player.pause();
    $("#vTitle").textContent = title || item.title || item.label || "";
    screen.innerHTML = "";
    screen.classList.toggle("is-image", item.type === "image");
    if (item.type === "image" && item.src) {
      const img = new Image(); img.src = item.src; img.alt = title || "";
      screen.appendChild(img);
    } else if (item.embed) {
      const f = document.createElement("iframe");
      f.src = item.embed; f.allowFullscreen = true; f.title = title || "视频";
      f.allow = "autoplay; fullscreen; picture-in-picture";
      screen.appendChild(f);
    } else if (item.src) {
      const v = document.createElement("video");
      v.src = item.src; v.controls = true; v.autoplay = true; v.playsInline = true;
      if (item.cover) v.poster = item.cover;
      screen.appendChild(v);
    } else {
      screen.appendChild(coverCanvas(item.id || "empty", { w: 1280, h: 720, play: false }));
      const tip = document.createElement("div");
      tip.className = "modal__empty";
      tip.innerHTML = item.type === "image"
        ? "<p>这张图还没有上传。在 <code>js/data.js</code> 里给它填上 <code>src</code>（图片路径）。</p>"
        : "<p>这条视频还没有上传。在 <code>js/data.js</code> 里给它填上 <code>embed</code>（B 站嵌入链接）或 <code>src</code>（本地视频文件）。</p>";
      screen.appendChild(tip);
    }
    if (modal.showModal) modal.showModal(); else modal.setAttribute("open", "");
  }
  function closeModal() { screen.innerHTML = ""; modal.close ? modal.close() : modal.removeAttribute("open"); }
  $("#vClose").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  modal.addEventListener("close", () => { screen.innerHTML = ""; });

  /* ---------- 广告片 ---------- */
  function renderFilms() {
    const box = $("#films");
    (site.ads || []).forEach((ad, i) => {
      const el = document.createElement("article");
      el.className = "film" + (i % 2 ? " film--flip" : "");
      el.innerHTML = `
        <button class="film__media" type="button" aria-label="播放：${esc(ad.title)}">
          ${hasMedia(ad) ? "" : '<span class="pending">待上传</span>'}
        </button>
        <div class="film__body">
          <h3 class="film__title">${esc(ad.title)}</h3>
          ${ad.client ? `<p class="film__client">甲方：${esc(ad.client)}</p>` : ""}
          <ul class="chips">${(ad.roles || []).map((r) => `<li>${esc(r)}</li>`).join("")}</ul>
          <ul class="film__points">${(ad.points || []).map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
          <button class="btn btn--solid" type="button">观看影片</button>
        </div>`;
      const media = $(".film__media", el);
      fillCover(media, ad, { w: 1280, h: 720 });
      const go = () => openMedia({ ...ad, type: "video" }, ad.title);
      media.addEventListener("click", go);
      $(".film__body .btn", el).addEventListener("click", go);
      box.appendChild(el);
    });
  }

  /* ---------- 声音对比 ---------- */
  function waveBars(id, accent) {
    const c = coverCanvas(id, { w: 600, h: 80, accent, play: false });
    c.className = "voice__wave";
    return c;
  }
  function renderVoices() {
    const box = $("#voices");
    (site.voices || []).forEach((v) => {
      const el = document.createElement("article");
      el.className = "voice";
      el.innerHTML = `
        <header class="voice__head">
          <strong>${esc(v.speaker)}</strong>
          <span>${esc(v.account || "")}</span>
        </header>
        <p class="voice__text">${esc(v.text)}</p>
        <div class="voice__rows"></div>`;
      const rows = $(".voice__rows", el);
      [
        ["original", "本人原声", "230,226,216"],
        ["lora", "LoRA 生成", "92,200,214"]
      ].forEach(([key, label, accent]) => {
        const clip = v[key] || {};
        const id = `${v.id}-${key}`;
        const row = document.createElement("button");
        row.type = "button";
        row.className = `voice__row voice__row--${key}`;
        row.dataset.id = id;
        row.innerHTML = `<span class="voice__play">${ICON_PLAY}</span><span class="voice__label">${label}</span>`;
        row.appendChild(waveBars(id, accent));
        row.setAttribute("aria-label", `播放${v.speaker}${label}`);
        row.addEventListener("click", () =>
          window.Player.play({
            id, title: `${v.speaker} · ${label}`, subtitle: v.account,
            src: clip.src, demo: clip.demo, duration: "0:12"
          })
        );
        rows.appendChild(row);
      });
      box.appendChild(el);
    });
  }

  /* ---------- 产出流程 ---------- */
  function renderPipeline() {
    const box = $("#pipeline");
    (site.pipeline || []).forEach((s, i) => {
      const li = document.createElement("li");
      li.className = "step";
      li.innerHTML = `
        <span class="step__num">${String(i + 1).padStart(2, "0")}</span>
        <div class="step__body">
          <h4 class="step__title">${esc(s.title)}</h4>
          <ul class="chips chips--sm">${(s.tools || []).map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
          <p class="step__desc">${esc(s.desc)}</p>
        </div>
        <div class="step__media"></div>`;
      const mbox = $(".step__media", li);
      if (!(s.media || []).length) { mbox.remove(); li.classList.add("step--text"); }
      (s.media || []).forEach((m) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "slot";
        b.setAttribute("aria-label", `查看：${s.title} · ${m.label}`);
        const isImg = m.type === "image";
        if (isImg && m.src) {
          const img = new Image(); img.src = m.src; img.alt = ""; img.loading = "lazy"; b.appendChild(img);
        } else fillCover(b, m, { w: 640, h: 360, play: !isImg, accent: isImg ? "92,200,214" : "245,183,0" });
        b.insertAdjacentHTML("beforeend", `<span class="slot__label">${esc(m.label)}</span>${hasMedia(m) ? "" : '<span class="pending">待上传</span>'}`);
        b.addEventListener("click", () => openMedia(m, `${s.title} · ${m.label}`));
        mbox.appendChild(b);
      });
      box.appendChild(li);
    });
  }

  /* ---------- 账号成果 ---------- */
  function renderAccounts() {
    $("#accounts").innerHTML = (site.accounts || []).map((a) => `
      <div class="account">
        <span class="account__name">${esc(a.name)}</span>
        <span class="account__nums">${a.from ? `<s>${esc(a.from)}</s><i aria-hidden="true">→</i>` : ""}<b>${esc(a.to)}</b></span>
        <span class="account__note">${esc(a.note)}</span>
      </div>`).join("");
  }

  /* ---------- AI 音乐 ---------- */
  const list = $("#trackList");
  function renderTracks() {
    (site.music || []).forEach((w, i) => {
      const row = document.createElement("div");
      row.className = "tracks__row track";
      row.setAttribute("role", "row");
      row.dataset.id = w.id;
      row.innerHTML = `
        <span class="track__num" role="cell"><span>${String(i + 1).padStart(2, "0")}</span><span class="eq" aria-hidden="true"><i></i><i></i><i></i></span></span>
        <span class="track__title" role="cell"><strong>${esc(w.title)}</strong><span>${esc(w.subtitle)}</span></span>
        <span role="cell" class="track__dur">${esc(w.duration)}</span>
        <span role="cell"><button class="track__go" type="button" aria-label="播放：${esc(w.title)}">${ICON_PLAY}</button></span>`;
      row.addEventListener("click", () => window.Player.play(w));
      list.appendChild(row);
    });
  }

  /* ---------- 视觉短片 ---------- */
  function renderShorts() {
    const box = $("#shorts");
    (site.shorts || []).forEach((s) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "short";
      b.innerHTML = `<span class="short__media"></span><span class="short__title">${esc(s.title)}</span><span class="short__note">${esc(s.note)}</span>`;
      fillCover($(".short__media", b), s, { w: 640, h: 360 });
      if (!hasMedia(s)) $(".short__media", b).insertAdjacentHTML("beforeend", '<span class="pending">待上传</span>');
      b.addEventListener("click", () => openMedia({ ...s, type: "video" }, s.title));
      box.appendChild(b);
    });
  }

  /* ---------- 播放状态同步 ---------- */
  function syncPlaying({ id, playing }) {
    $$(".track").forEach((row) => {
      const on = row.dataset.id === id && playing;
      row.classList.toggle("is-playing", on);
      $(".track__go", row).innerHTML = on ? ICON_PAUSE : ICON_PLAY;
    });
    $$(".voice__row").forEach((row) => {
      const on = row.dataset.id === id && playing;
      row.classList.toggle("is-playing", on);
      $(".voice__play", row).innerHTML = on ? ICON_PAUSE : ICON_PLAY;
    });
  }
  document.addEventListener("player:change", (e) => syncPlaying(e.detail));

  /* ---------- 导航高亮 + 侧栏进度 ---------- */
  const links = $$(".rail__nav a");
  const meter = $("#railMeter");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) links.forEach((a) => a.classList.toggle("is-active", a.dataset.section === en.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  $$("[data-section]").filter((s) => s.id).forEach((s) => io.observe(s));
  function onScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    meter.style.height = (max > 0 ? (scrollY / max) * 100 : 0) + "%";
  }
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 手机端菜单 ---------- */
  const toggle = $("#navToggle"), navList = $("#navList");
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", open);
    navList.classList.toggle("is-open", open);
  });
  links.forEach((a) => a.addEventListener("click", () => {
    toggle.setAttribute("aria-expanded", "false");
    navList.classList.remove("is-open");
  }));

  renderFilms();
  renderVoices();
  renderPipeline();
  renderAccounts();
  renderTracks();
  renderShorts();
})();
