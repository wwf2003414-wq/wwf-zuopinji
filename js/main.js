/* 页面逻辑：加载动画、作品列表、筛选、导航高亮、视频弹窗 */
(function () {
  const works = window.WORKS || [];
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const TYPE_LABEL = { audio: "音频", video: "视频" };

  $("#year").textContent = new Date().getFullYear();

  /* ---------- 开屏加载 ---------- */
  (function loader() {
    const box = $("#loader"), bar = $("#loaderBar"), num = $("#loaderNum");
    document.body.classList.add("is-loading");
    const total = reduce ? 200 : 1300;
    const start = performance.now();
    let fontsReady = false;
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { fontsReady = true; });
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
    // 字体加载失败也不要卡住
    setTimeout(() => { fontsReady = true; }, 3000);
  })();

  /* ---------- 封面：没有封面图时用作品 id 生成一张频谱图 ---------- */
  function coverCanvas(work, w = 800, h = 500) {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const g = c.getContext("2d");
    let seed = 0;
    for (const ch of work.id) seed = (seed * 31 + ch.charCodeAt(0)) % 2147483647;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    g.fillStyle = "#2C3137"; g.fillRect(0, 0, w, h);
    const accent = work.type === "video" ? "245,183,0" : "92,200,214";
    const n = 64, bw = w / n;
    for (let i = 0; i < n; i++) {
      const env = Math.sin((i / n) * Math.PI);
      const v = (0.15 + rnd() * 0.85) * env;
      const bh = v * h * 0.7;
      g.fillStyle = `rgba(${accent},${0.25 + v * 0.65})`;
      g.fillRect(i * bw + 1, h / 2 - bh / 2, bw - 2, bh);
    }
    g.strokeStyle = "rgba(230,226,216,.18)";
    g.beginPath(); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.stroke();
    if (work.type === "video") {
      g.fillStyle = "rgba(21,23,26,.75)";
      g.beginPath(); g.arc(w / 2, h / 2, 44, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#F5B700";
      g.beginPath(); g.moveTo(w / 2 - 12, h / 2 - 18); g.lineTo(w / 2 + 20, h / 2); g.lineTo(w / 2 - 12, h / 2 + 18); g.fill();
    }
    c.setAttribute("aria-hidden", "true");
    return c;
  }

  const fmtDate = (d) => (d ? d.replace(/-/g, ".") : "");
  const actionLabel = (w) => (w.type === "video" ? "观看" : "播放");
  const ICON_PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4l13 8-13 8z"/></svg>';
  const ICON_PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>';

  function open(work) {
    if (work.type === "video") openVideo(work);
    else window.Player.play(work);
  }

  /* ---------- 主推作品 ---------- */
  function renderFeature() {
    const f = works.find((w) => w.featured) || works[0];
    const box = $("#feature");
    if (!f) { box.remove(); return; }
    box.innerHTML = `
      <div class="feature__media"></div>
      <div class="feature__body">
        <span class="feature__tag">主推 · ${TYPE_LABEL[f.type]}</span>
        <h3 class="feature__title"></h3>
        <p class="feature__desc"></p>
        <span class="feature__meta">${fmtDate(f.date)} · ${f.duration || ""}</span>
        <button class="btn btn--solid" type="button">${actionLabel(f)}</button>
      </div>`;
    $(".feature__title", box).textContent = f.title;
    $(".feature__desc", box).textContent = f.desc || f.subtitle || "";
    const media = $(".feature__media", box);
    if (f.cover) {
      const img = new Image(); img.src = f.cover; img.alt = f.title + " 封面"; media.appendChild(img);
    } else media.appendChild(coverCanvas(f, 960, 600));
    $(".btn", box).addEventListener("click", () => open(f));
  }

  /* ---------- 作品列表 ---------- */
  const list = $("#trackList");
  function renderTracks(filter = "all") {
    const items = works.filter((w) => filter === "all" || w.type === filter);
    list.innerHTML = "";
    if (!items.length) {
      list.innerHTML = '<p class="tracks__empty">这个分类还没有作品，去 js/data.js 里添加一条。</p>';
      return;
    }
    items.forEach((w, i) => {
      const row = document.createElement("div");
      row.className = "tracks__row track";
      row.setAttribute("role", "row");
      row.dataset.id = w.id;
      row.innerHTML = `
        <span class="track__num" role="cell"><span>${String(i + 1).padStart(2, "0")}</span><span class="eq" aria-hidden="true"><i></i><i></i><i></i></span></span>
        <span class="track__title" role="cell"><strong></strong><span></span></span>
        <span role="cell" class="track__tag" data-type="${w.type}">${TYPE_LABEL[w.type]}</span>
        <span role="cell" class="track__date">${fmtDate(w.date)}</span>
        <span role="cell" class="track__dur">${w.duration || ""}</span>
        <span role="cell"><button class="track__go" type="button">${ICON_PLAY}</button></span>`;
      $(".track__title strong", row).textContent = w.title;
      $(".track__title span", row).textContent = w.subtitle || "";
      const go = $(".track__go", row);
      go.setAttribute("aria-label", `${actionLabel(w)}：${w.title}`);
      row.addEventListener("click", () => open(w));
      list.appendChild(row);
    });
    syncPlaying(window.Player.state());
  }

  function syncPlaying({ id, playing }) {
    $$(".track", list).forEach((row) => {
      const on = row.dataset.id === id && playing;
      row.classList.toggle("is-playing", on);
      const w = works.find((x) => x.id === row.dataset.id);
      if (w && w.type === "audio") {
        const go = $(".track__go", row);
        go.innerHTML = on ? ICON_PAUSE : ICON_PLAY;
        go.setAttribute("aria-label", `${on ? "暂停" : "播放"}：${w.title}`);
      }
    });
  }
  document.addEventListener("player:change", (e) => syncPlaying(e.detail));

  $$(".filter").forEach((b) =>
    b.addEventListener("click", () => {
      $$(".filter").forEach((x) => { x.classList.toggle("is-active", x === b); x.setAttribute("aria-selected", x === b); });
      renderTracks(b.dataset.filter);
    })
  );

  /* ---------- 视频弹窗 ---------- */
  const modal = $("#videoModal"), screen = $("#vScreen");
  function openVideo(w) {
    window.Player.pause();
    $("#vTitle").textContent = w.title;
    screen.innerHTML = "";
    if (w.embed) {
      const f = document.createElement("iframe");
      f.src = w.embed; f.allowFullscreen = true; f.title = w.title;
      f.allow = "autoplay; fullscreen; picture-in-picture";
      screen.appendChild(f);
    } else if (w.src) {
      const v = document.createElement("video");
      v.src = w.src; v.controls = true; v.autoplay = true; v.playsInline = true;
      if (w.cover) v.poster = w.cover;
      screen.appendChild(v);
    } else {
      screen.appendChild(coverCanvas(w, 1280, 720));
      const tip = document.createElement("div");
      tip.className = "modal__empty";
      tip.innerHTML = "<p>这条视频还没有上传。打开 <code>js/data.js</code>，给它填上 <code>embed</code>（B 站嵌入链接）或 <code>src</code>（本地视频文件）。</p>";
      screen.appendChild(tip);
    }
    if (modal.showModal) modal.showModal(); else modal.setAttribute("open", "");
  }
  function closeVideo() { screen.innerHTML = ""; modal.close ? modal.close() : modal.removeAttribute("open"); }
  $("#vClose").addEventListener("click", closeVideo);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeVideo(); });
  modal.addEventListener("close", () => { screen.innerHTML = ""; });

  /* ---------- 导航高亮 + 侧栏进度 ---------- */
  const links = $$(".rail__nav a");
  const meter = $("#railMeter");
  const sections = $$("[data-section]").filter((s) => s.id);
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) links.forEach((a) => a.classList.toggle("is-active", a.dataset.section === en.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((s) => io.observe(s));
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

  renderFeature();
  renderTracks();
})();
