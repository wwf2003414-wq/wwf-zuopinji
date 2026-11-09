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
      const clips = v.clips || [
        { kind: "real", label: "本人原声", ...(v.original || {}) },
        { kind: "ai", label: "LoRA 生成", ...(v.lora || {}) }
      ];
      clips.forEach((clip, k) => {
        const ai = clip.kind === "ai";
        const label = clip.label;
        const accent = ai ? "92,200,214" : "230,226,216";
        const id = `${v.id}-${k}`;
        const row = document.createElement("button");
        row.type = "button";
        row.className = `voice__row voice__row--${ai ? "lora" : "original"}`;
        row.dataset.id = id;
        row.innerHTML = `<span class="voice__play">${ICON_PLAY}</span><span class="voice__label">${esc(label)}</span>`;
        row.appendChild(waveBars(id, accent));
        if (clip.duration) row.insertAdjacentHTML("beforeend", `<span class="voice__dur">${esc(clip.duration)}</span>`);
        row.setAttribute("aria-label", `播放${v.speaker}${label}`);
        row.addEventListener("click", () =>
          window.Player.play({
            id, title: `${v.speaker} · ${label}`, subtitle: v.account,
            src: clip.src, demo: clip.demo, duration: clip.duration || "0:12"
          })
        );
        rows.appendChild(row);
      });
      box.appendChild(el);
    });
  }

  /* ---------- 产出流程：分步面板 ---------- */
  function renderFlow() {
    const box = $("#flow");
    const steps = site.pipeline || [];
    if (!steps.length) return;
    const num = (i) => String(i + 1).padStart(2, "0");

    box.innerHTML = `
      <div class="flow__tabs" role="tablist" aria-label="流程步骤">
        ${steps.map((s, i) => `
          <button class="flow__tab" type="button" role="tab" id="flow-tab-${i}" aria-controls="flow-panel" aria-selected="false" tabindex="-1" data-i="${i}">
            <i>${num(i)}</i><span>${esc(s.short || s.title)}</span>
          </button>`).join("")}
        <span class="flow__bar" aria-hidden="true"><b></b></span>
      </div>
      <div class="flow__panel" id="flow-panel" role="tabpanel" aria-live="polite">
        <div class="flow__info">
          <p class="flow__count"><b></b> / ${num(steps.length - 1)}</p>
          <h4 class="flow__title"></h4>
          <ul class="chips chips--sm flow__tools"></ul>
          <p class="flow__desc"></p>
          <div class="flow__nav">
            <button class="flow__arrow" type="button" data-dir="-1" aria-label="上一步">←</button>
            <button class="flow__arrow flow__arrow--next" type="button" data-dir="1">下一步 →</button>
          </div>
        </div>
        <figure class="flow__shot">
          <figcaption><span>操作面板</span><em class="flow__shotlabel"></em></figcaption>
          <div class="flow__frame flow__frame--shot"></div>
        </figure>
        <figure class="flow__result">
          <figcaption><span>产出效果</span><span class="flow__switch" role="group" aria-label="切换效果"></span></figcaption>
          <div class="flow__frame flow__frame--result"></div>
        </figure>
      </div>`;

    const tabs = $$(".flow__tab", box);
    const bar = $(".flow__bar b", box);
    const shotFrame = $(".flow__frame--shot", box);
    const resFrame = $(".flow__frame--result", box);
    const sw = $(".flow__switch", box);
    let cur = 0;

    function fillShot(s) {
      const p = s.panel || { id: `p-${cur}`, label: "操作面板" };
      shotFrame.innerHTML = "";
      shotFrame.classList.toggle("is-text", p.type === "text");
      $(".flow__shot figcaption > span", box).textContent = p.type === "text" ? "文字说明" : "操作面板";
      $(".flow__shotlabel", box).textContent = p.label || "";
      if (p.type === "text") {
        shotFrame.innerHTML = `<p class="flow__textlabel">${esc(p.label || "")}</p><ol class="flow__points">${(p.points || []).map(([k, t]) => `<li><b>${esc(k)}</b><span>${esc(t)}</span></li>`).join("")}</ol>`;
        $(".flow__shotlabel", box).textContent = "";
        return;
      }
      const zoom = document.createElement("button");
      zoom.type = "button"; zoom.className = "flow__zoom";
      zoom.setAttribute("aria-label", `放大查看：${s.title} 操作面板`);
      if (p.src) { const img = new Image(); img.src = p.src; img.alt = `${s.title} 操作面板`; zoom.appendChild(img); }
      else {
        zoom.appendChild(coverCanvas(p.id || `shot-${cur}`, { w: 960, h: 600, accent: "92,200,214", play: false }));
        zoom.insertAdjacentHTML("beforeend", '<span class="pending">待上传截图</span>');
      }
      zoom.addEventListener("click", () => openMedia({ ...p, type: "image" }, `${s.title} · ${p.label || "操作面板"}`));
      shotFrame.appendChild(zoom);
    }

    function fillResult(s, k) {
      const r = (s.results || [])[k];
      resFrame.innerHTML = "";
      resFrame.classList.remove("is-portrait");
      $$(".flow__chip", sw).forEach((b, j) => b.setAttribute("aria-pressed", j === k));
      if (!r) return;
      const title = `${s.title} · ${r.label}`;
      if (r.type === "audio") {
        const b = document.createElement("button");
        b.type = "button"; b.className = "flow__audio voice__row"; b.dataset.id = r.id;
        b.innerHTML = `<span class="voice__play">${ICON_PLAY}</span><span class="voice__label">${esc(r.label)}</span>`;
        b.appendChild(waveBars(r.id, "92,200,214"));
        b.addEventListener("click", () => window.Player.play({ id: r.id, title, subtitle: "拟真数字人流程", src: r.src, duration: "0:12" }));
        resFrame.appendChild(b);
        if (!r.src) resFrame.insertAdjacentHTML("beforeend", '<span class="pending">待上传 · 现在是示例音</span>');
        syncPlaying(window.Player.state());
      } else if (r.type === "video" && r.src && !r.embed) {
        const v = document.createElement("video");
        v.src = r.src; v.controls = true; v.playsInline = true; v.preload = "metadata";
        if (r.cover) v.poster = r.cover;
        v.addEventListener("loadedmetadata", () => resFrame.classList.toggle("is-portrait", v.videoHeight > v.videoWidth * 1.2));
        resFrame.appendChild(v);
      } else if (r.type === "image" && r.src) {
        const b = document.createElement("button");
        b.type = "button"; b.className = "flow__zoom";
        const img = new Image(); img.src = r.src; img.alt = title; b.appendChild(img);
        b.addEventListener("click", () => openMedia(r, title));
        resFrame.appendChild(b);
      } else {
        const b = document.createElement("button");
        b.type = "button"; b.className = "flow__zoom"; b.setAttribute("aria-label", `查看：${title}`);
        fillCover(b, r, { w: 960, h: 540, play: r.type !== "image" });
        if (!hasMedia(r)) b.insertAdjacentHTML("beforeend", '<span class="pending">待上传</span>');
        b.addEventListener("click", () => openMedia(r, title));
        resFrame.appendChild(b);
      }
    }

    function go(i, focus) {
      cur = (i + steps.length) % steps.length;
      const s = steps[cur];
      tabs.forEach((t, j) => {
        const on = j === cur;
        t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1;
        t.classList.toggle("is-done", j < cur);
      });
      if (focus) tabs[cur].focus();
      bar.style.width = (steps.length > 1 ? (cur / (steps.length - 1)) * 100 : 100) + "%";
      $(".flow__count b", box).textContent = num(cur);
      $(".flow__title", box).textContent = s.title;
      $(".flow__tools", box).innerHTML = (s.tools || []).map((t) => `<li>${esc(t)}</li>`).join("");
      $(".flow__desc", box).textContent = s.desc || "";
      $(".flow__arrow--next", box).textContent = cur === steps.length - 1 ? "回到第一步 ↺" : "下一步 →";
      const rs = s.results || [];
      sw.innerHTML = rs.length > 1 ? rs.map((r, j) => `<button class="flow__chip" type="button" data-k="${j}">${esc(r.label)}</button>`).join("") : (rs[0] ? `<em>${esc(rs[0].label)}</em>` : "");
      $$(".flow__chip", sw).forEach((b) => b.addEventListener("click", () => fillResult(s, +b.dataset.k)));
      fillShot(s);
      fillResult(s, 0);
      const panel = $(".flow__panel", box);
      panel.setAttribute("aria-labelledby", `flow-tab-${cur}`);
      if (!reduce) { panel.classList.remove("is-enter"); void panel.offsetWidth; panel.classList.add("is-enter"); }
    }

    tabs.forEach((t) => t.addEventListener("click", () => go(+t.dataset.i)));
    $$(".flow__arrow", box).forEach((b) => b.addEventListener("click", () => go(cur + +b.dataset.dir)));
    box.addEventListener("keydown", (e) => {
      if (e.target.closest("video")) return;
      if (e.key === "ArrowRight") { e.preventDefault(); go(cur + 1, e.target.classList.contains("flow__tab")); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(cur - 1, e.target.classList.contains("flow__tab")); }
    });
    go(0);
  }

  /* ---------- 复制邮箱 ---------- */
  function setupCopy() {
    const btn = $("#copyMail");
    if (!btn) return;
    const label = $("span", btn);
    let timer = 0;
    async function copy(text) {
      try { await navigator.clipboard.writeText(text); return true; }
      catch (e) {
        const ta = document.createElement("textarea");
        ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        let ok = false;
        try { ok = document.execCommand("copy"); } catch (err) { ok = false; }
        ta.remove();
        return ok;
      }
    }
    btn.addEventListener("click", async () => {
      const ok = await copy(btn.dataset.copy);
      clearTimeout(timer);
      btn.classList.toggle("is-copied", ok);
      if (!ok) {
        // 浏览器不允许写剪贴板时，帮用户选中邮箱文字
        const r = document.createRange(); r.selectNodeContents($("#mailText"));
        const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
      }
      label.textContent = ok ? "已复制" : "已选中，按 Ctrl+C";
      timer = setTimeout(() => { btn.classList.remove("is-copied"); label.textContent = "复制"; }, 2200);
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
    const box = $("#shortList");
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

  /* ---------- 导航高亮 + 顶部进度条 ---------- */
  const links = $$(".topbar__nav a[data-section]");
  const meter = $("#navMeter");
  const topbar = $("#topbar");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) links.forEach((a) => a.classList.toggle("is-active", a.dataset.section === en.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  $$("[data-section]").filter((s) => s.id).forEach((s) => io.observe(s));
  function onScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    meter.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + "%";
    topbar.classList.toggle("is-scrolled", scrollY > 40);
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
  renderFlow();
  renderAccounts();
  renderTracks();
  renderShorts();
  setupCopy();
})();
