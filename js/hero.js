/* 开屏互动：示波器地形
   一排排波形线按透视铺开，鼠标附近的波形被“拨起”，点击发出向外扩散的脉冲。 */
(function () {
  const canvas = document.getElementById("heroCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const hero = canvas.parentElement;
  const nameEl = document.querySelector(".hero__name");
  const hudCoord = document.getElementById("hudCoord");
  const hudFreq = document.getElementById("hudFreq");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const AMBER = [245, 183, 0];
  const BONE = [230, 226, 216];
  const CYAN = [92, 200, 214];

  let W = 0, H = 0, dpr = 1;
  let rows = 34, cols = 120;
  const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999, energy: 0, active: false };
  const ripples = [];
  let running = true, visible = true, t0 = performance.now(), raf = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = hero.clientWidth; H = hero.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    rows = W < 720 ? 24 : 34;
    cols = Math.round(Math.min(160, Math.max(60, W / 10)));
    if (reduce) draw(performance.now());
  }

  function mix(a, b, k) {
    return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
  }

  function draw(now) {
    const t = reduce ? 0 : (now - t0) / 1000;
    ctx.clearRect(0, 0, W, H);

    // 鼠标平滑跟随
    mouse.x += (mouse.tx - mouse.x) * 0.14;
    mouse.y += (mouse.ty - mouse.y) * 0.14;
    mouse.energy += ((mouse.active ? 1 : 0) - mouse.energy) * 0.05;

    const horizon = H * 0.18;
    const floor = H * 1.04;
    const sigma = Math.max(W, H) * 0.12;

    for (let r = 0; r < rows; r++) {
      const z = r / (rows - 1);             // 0 远 → 1 近
      const persp = Math.pow(z, 1.8);
      const baseY = horizon + (floor - horizon) * persp;
      const spread = 0.55 + 0.75 * persp;    // 近处更宽
      const scale = 8 + 70 * persp;          // 近处振幅更大
      let rowHot = 0;

      ctx.beginPath();
      for (let c = 0; c <= cols; c++) {
        const u = c / cols - 0.5;
        const x = W / 2 + u * W * spread * 1.2;
        // 环境波：几层正弦叠加，像缓慢起伏的频谱
        let h =
          Math.sin(u * 9 + t * 0.9 + z * 4) * 0.35 +
          Math.sin(u * 23 - t * 1.6 + z * 7) * 0.15 +
          Math.sin(u * 3.2 + t * 0.35) * 0.3;
        h *= 0.45 + 0.55 * Math.sin(z * 3.1 + t * 0.2) ** 2;

        // 鼠标拨弦
        const dx = x - mouse.x, dy = baseY - mouse.y;
        const g = Math.exp(-(dx * dx + dy * dy * 2.2) / (2 * sigma * sigma));
        const pluck = g * mouse.energy * (1.6 + Math.sin(dx * 0.045 - t * 9) * 0.9);
        h += pluck;
        rowHot = Math.max(rowHot, g * mouse.energy);

        // 点击脉冲
        for (const p of ripples) {
          const d = Math.hypot(x - p.x, (baseY - p.y) * 1.4);
          const k = (d - p.r) / 46;
          if (k > -3 && k < 3) h += Math.cos(k * 2.6) * Math.exp(-k * k) * p.a;
        }

        const y = baseY - h * scale;
        if (c === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }

      const col = rowHot > 0.05 ? mix(mix(BONE, CYAN, z * 0.4), AMBER, Math.min(1, rowHot * 1.4)) : mix(BONE, CYAN, (1 - z) * 0.5);
      const alpha = 0.06 + 0.42 * persp + rowHot * 0.4;
      ctx.strokeStyle = `rgba(${col[0] | 0},${col[1] | 0},${col[2] | 0},${Math.min(alpha, 0.95)})`;
      ctx.lineWidth = 0.6 + persp * 1.1 + rowHot * 0.8;
      ctx.stroke();
    }

    // 光标准星
    if (mouse.energy > 0.02) {
      ctx.strokeStyle = `rgba(245,183,0,${0.7 * mouse.energy})`;
      ctx.lineWidth = 1;
      const s = 14;
      ctx.beginPath();
      ctx.moveTo(mouse.x - s, mouse.y); ctx.lineTo(mouse.x - 5, mouse.y);
      ctx.moveTo(mouse.x + 5, mouse.y); ctx.lineTo(mouse.x + s, mouse.y);
      ctx.moveTo(mouse.x, mouse.y - s); ctx.lineTo(mouse.x, mouse.y - 5);
      ctx.moveTo(mouse.x, mouse.y + 5); ctx.lineTo(mouse.x, mouse.y + s);
      ctx.stroke();
    }

    // 脉冲衰减
    for (let i = ripples.length - 1; i >= 0; i--) {
      const p = ripples[i];
      p.r += 9; p.a *= 0.972;
      if (p.a < 0.02) ripples.splice(i, 1);
    }

    // 名字的色差偏移
    if (nameEl) {
      const ox = mouse.active ? ((mouse.x / W) - 0.5) * 14 * mouse.energy : 0;
      const oy = mouse.active ? ((mouse.y / H) - 0.5) * 8 * mouse.energy : 0;
      nameEl.style.setProperty("--sx", ox.toFixed(2) + "px");
      nameEl.style.setProperty("--sy", oy.toFixed(2) + "px");
    }
  }

  function loop(now) {
    draw(now);
    if (running && visible) raf = requestAnimationFrame(loop);
  }
  function kick() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(loop);
  }
  // 减少动态时：只在用户操作后的短时间内动画
  let idleTimer = 0;
  function nudge() {
    if (!reduce) return;
    running = true; kick();
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => { running = false; }, 1500);
  }

  function setPointer(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.tx = e.clientX - rect.left;
    mouse.ty = e.clientY - rect.top;
    if (!mouse.active) { mouse.x = mouse.tx; mouse.y = mouse.ty; }
    mouse.active = true;
    const fx = 110 * Math.pow(16, Math.max(0, Math.min(1, mouse.tx / W)));
    hudCoord.textContent = `X ${String(Math.round(mouse.tx)).padStart(3, "0")} / Y ${String(Math.round(mouse.ty)).padStart(3, "0")}`;
    hudFreq.textContent = `F ${fx.toFixed(1)} Hz`;
    nudge();
  }

  hero.addEventListener("pointermove", setPointer);
  hero.addEventListener("pointerdown", (e) => {
    if (e.target.closest("a, button")) return;
    setPointer(e);
    ripples.push({ x: mouse.tx, y: mouse.ty, r: 0, a: 1.8 });
    if (ripples.length > 6) ripples.shift();
  });
  hero.addEventListener("pointerleave", () => { mouse.active = false; nudge(); });

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && running) kick();
  }).observe(hero);

  window.addEventListener("resize", resize);
  resize();
  if (reduce) { running = false; draw(performance.now()); } else kick();
})();
