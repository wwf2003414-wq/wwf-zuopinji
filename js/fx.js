/* ============================================================
   视觉特效（暗场放映）
   移植自 React Bits（https://reactbits.dev，MIT + Commons Clause，© David Haz），
   改写成不依赖 React 的原生 JS，网页双击就能打开。
     · Rays       放映光束（LightRays，WebGL2）
     · Grain      胶片颗粒 + 浮尘（Noise）
     · Decrypt    乱码解码浮现（DecryptedText）
     · Marquee    随滚动加速的跑马灯（ScrollVelocity）
     · Spotlight  跟随鼠标的聚光灯卡片（SpotlightCard）
     · Tilt       3D 倾斜卡片（TiltedCard）
     · CountUp    数字滚动（CountUp）
   用法：在 HTML 上加属性即可，见每段注释。
   ============================================================ */
(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------- 放映光束 · LightRays ----------
     <div data-rays data-origin="top-center" data-color="#ffd9a0"></div> */
  const VERT = `#version 300 es
const vec2 c[3] = vec2[3](vec2(-1.0,-1.0), vec2(3.0,-1.0), vec2(-1.0,3.0));
void main(){ gl_Position = vec4(c[gl_VertexID], 0.0, 1.0); }`;
  const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes; uniform float uScale; uniform float uTime;
uniform vec2 uSource; uniform vec2 uAim; uniform float uReach; uniform vec3 uColor;
uniform float uSpread; uniform float uLength; uniform float uDensity; uniform float uSharp;
uniform float uGlow; uniform float uHaze; uniform float uIntensity; uniform vec4 uShadow;
uniform vec4 uPulses[4]; uniform vec2 uIntro; uniform float uOpacity;
out vec4 o;
float hash(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
float vnoise(vec2 p){ vec2 i=floor(p), f=p-i; vec2 w=f*f*f*(f*(f*6.0-15.0)+10.0);
  return mix(mix(hash(i),hash(i+vec2(1,0)),w.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),w.x), w.y); }
float shape(float s, float w){ float e = max(mix(0.5,0.08,uSharp), w); return mix(s, smoothstep(0.62-e,0.62+e,s), uSharp); }
void main(){
  vec2 coord = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uScale;
  vec2 d = coord - uSource; float dist = length(d); vec2 dir = d / max(dist,1e-4);
  float ca = dot(dir, uAim); float slope = fwidth(ca); float depth = dist / uReach;
  float src = exp(-depth*depth*9.0)*0.9 + exp(-depth*3.2)*0.25;
  float glow = uGlow * src * smoothstep(-0.2,0.6,ca);
  float env = pow(max(ca,0.0), 1.0/uSpread) * clamp(1.0 - dist/(uReach*uLength),0.0,1.0);
  float reveal = uIntensity * uIntro.y * (1.0 - smoothstep(uIntro.x-0.35, uIntro.x, depth));
  if ((env*1.6 + glow) * reveal < 0.0015) { o = vec4(0.0); return; }
  float pA = ca*36.2214*uDensity + uTime*1.5, pB = -ca*21.11349*uDensity + uTime*1.5;
  float pC = ca*22.3991*uDensity + uTime*1.1, pD = -ca*18.0234*uDensity + uTime*1.1;
  float sA = clamp(0.75+0.15*sin(pA)+0.2*cos(pB),0.0,1.0), sB = clamp(0.75+0.15*sin(pC)+0.2*cos(pD),0.0,1.0);
  float wA = abs(0.15*36.2214*cos(pA)+0.2*21.11349*sin(pB))*uDensity*slope;
  float wB = abs(0.15*22.3991*cos(pC)+0.2*18.0234*sin(pD))*uDensity*slope;
  float ray = env * (0.5*shape(sA,wA) + 0.4*shape(sB,wB));
  float ar = atan(uAim.x*dir.y - uAim.y*dir.x, ca);
  vec2 drift = vec2(ar*2.2 + uTime*0.035, depth*2.6 - uTime*0.11);
  float fog = 0.65*vnoise(drift*vec2(3.0,1.0)) + 0.35*vnoise(drift*vec2(7.0,2.3)+4.1);
  ray *= mix(1.0, 0.25 + 1.2*fog, uHaze);
  if (uShadow.z > 0.0) {
    vec2 tc = uShadow.xy - uSource; float cd = length(tc);
    float along = dot(d,tc)/max(cd*cd,1e-4);
    float side = abs(d.x*tc.y - d.y*tc.x)/max(cd,1e-4);
    float trail = max(along-1.0,0.0); float width = uShadow.w*along + 0.22*trail*cd;
    float behind = smoothstep(0.97,1.25,along)*exp(-trail*1.1);
    ray *= 1.0 - uShadow.z*0.62*(1.0 - smoothstep(width*0.3, width*1.6, side))*behind;
  }
  float boost = 0.0;
  for (int i=0;i<4;i++){ vec4 w = uPulses[i]; if (w.z<=0.0) continue; float x=(depth-w.x)/w.y; boost += w.z*exp(-x*x); }
  float light = (ray*(1.0+boost) + glow) * reveal;
  float near = clamp(1.2 - dist/(uRes.y/uScale), 0.0, 1.0);
  vec3 hue = (vec3(0.1,0.3,0.5) + near*vec3(0.8,0.6,0.5)) * uColor;
  float grain = (fract(52.9829189*fract(dot(gl_FragCoord.xy, vec2(0.06711056,0.00583715)))) - 0.5)/255.0;
  float lv = light < 0.75 ? light : 0.75 + 0.25*(1.0 - exp(-(light-0.75)/0.25));
  float top = max(hue.r, max(hue.g, hue.b));
  hue = mix(hue, vec3(top), smoothstep(0.8,1.0,lv)*0.45);
  o = vec4(clamp(clamp(hue*lv,0.0,1.0)*lv + grain, 0.0, lv) * uOpacity, lv*uOpacity);
}`;
  const ORIGINS = { "top-center": [[0.5, -0.2], [0, 1]], "bottom-center": [[0.5, 1.2], [0, -1]], "top-left": [[0, -0.2], [0, 1]], "top-right": [[1, -0.2], [0, 1]] };
  const hex = (h) => { const m = /^#?([0-9a-f]{6})$/i.exec(h || ""); return m ? [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16) / 255) : [1, 1, 1]; };
  const smoother = (t) => { const x = clamp(t, 0, 1); return x * x * x * (x * (x * 6 - 15) + 10); };

  function Rays(box) {
    const o = box.dataset;
    const cfg = {
      origin: ORIGINS[o.origin] || ORIGINS["top-center"], color: hex(o.color || "#ffd9a0"),
      spread: +o.spread || 0.55, length: +o.length || 2.6, density: +o.density || 1, sharp: 0.35,
      glow: o.glow ? +o.glow : 0.6, haze: 0.35, intensity: +o.intensity || 1, influence: 0.12, opacity: o.opacity ? +o.opacity : 1
    };
    const canvas = document.createElement("canvas");
    canvas.className = "rays__canvas"; canvas.setAttribute("aria-hidden", "true");
    box.appendChild(canvas);
    const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, powerPreference: "high-performance" });
    if (!gl) { box.classList.add("rays--fallback"); return; }
    const sh = (t, s) => { const x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(x)); return null; } return x; };
    const vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) { box.classList.add("rays--fallback"); return; }
    const pg = gl.createProgram(); gl.attachShader(pg, vs); gl.attachShader(pg, fs); gl.linkProgram(pg);
    if (!gl.getProgramParameter(pg, gl.LINK_STATUS)) { box.classList.add("rays--fallback"); return; }
    const U = {}; const n = gl.getProgramParameter(pg, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) { const info = gl.getActiveUniform(pg, i); U[info.name.replace(/\[0\]$/, "")] = gl.getUniformLocation(pg, info.name); }
    const vao = gl.createVertexArray();
    const size = { w: 1, h: 1, r: 1 }, ptr = { x: 0.5, y: 0.5, in: false, seen: false }, aim = { x: 0.5, y: 0.5 }, shade = { x: 0.5, y: 0.5, p: 0 };
    const pulses = [], pdata = new Float32Array(16);
    let time = 0, open = reduce ? 1 : 0, raf = 0, last = 0, visible = true, dirty = true;
    function resize() {
      const r = box.getBoundingClientRect(), w = Math.max(1, r.width), h = Math.max(1, r.height);
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5, Math.sqrt(2.0e6 / (w * h)));
      canvas.width = Math.round(w * ratio); canvas.height = Math.round(h * ratio);
      size.w = w; size.h = h; size.r = canvas.width / w;
    }
    function frame(now) {
      raf = 0;
      if (dirty) { dirty = false; resize(); }
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05); last = now;
      time += dt * (reduce ? 0.3 : 1);
      if (open < 1) open = Math.min(1, open + dt / 2.2);
      const k = 1 - Math.exp(-dt / 0.2);
      aim.x += ((ptr.seen ? ptr.x : 0.5) - aim.x) * k; aim.y += ((ptr.seen ? ptr.y : 0.5) - aim.y) * k;
      const g = 1 - Math.exp(-dt / 0.08); shade.x += (ptr.x - shade.x) * g; shade.y += (ptr.y - shade.y) * g;
      const on = ptr.in && fine && !reduce; shade.p += ((on ? 1 : 0) - shade.p) * (1 - Math.exp(-dt / 0.35));
      for (let i = pulses.length - 1; i >= 0; i--) { pulses[i] += dt; if (pulses[i] >= 2) pulses.splice(i, 1); }
      pdata.fill(0);
      pulses.forEach((t, i) => { pdata[i * 4] = 0.05 + t * 1.05; pdata[i * 4 + 1] = 0.14 + t * 0.14; pdata[i * 4 + 2] = 0.9 * smoother(t / 0.15) * (1 - smoother(t / 2)); });
      const W = size.w, H = size.h, sx = cfg.origin[0][0] * W, sy = cfg.origin[0][1] * H;
      let dx = cfg.origin[1][0], dy = cfg.origin[1][1];
      const mx = aim.x * W - sx, my = aim.y * H - sy, ml = Math.hypot(mx, my) || 1;
      dx += (mx / ml - dx) * cfg.influence; dy += (my / ml - dy) * cfg.influence;
      const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
      gl.viewport(0, 0, canvas.width, canvas.height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(pg); gl.bindVertexArray(vao);
      gl.uniform2f(U.uRes, canvas.width, canvas.height); gl.uniform1f(U.uScale, size.r); gl.uniform1f(U.uTime, time);
      gl.uniform2f(U.uSource, sx, sy); gl.uniform2f(U.uAim, dx, dy); gl.uniform1f(U.uReach, Math.max(W, H));
      gl.uniform3f(U.uColor, cfg.color[0], cfg.color[1], cfg.color[2]);
      gl.uniform1f(U.uSpread, cfg.spread); gl.uniform1f(U.uLength, cfg.length); gl.uniform1f(U.uDensity, cfg.density);
      gl.uniform1f(U.uSharp, cfg.sharp); gl.uniform1f(U.uGlow, cfg.glow); gl.uniform1f(U.uHaze, cfg.haze);
      gl.uniform1f(U.uIntensity, cfg.intensity); gl.uniform4f(U.uShadow, shade.x * W, shade.y * H, shade.p, 16);
      gl.uniform4fv(U.uPulses, pdata);
      const e = 1 - Math.pow(1 - open, 3); gl.uniform2f(U.uIntro, e * 2.6, smoother(open / 0.5));
      gl.uniform1f(U.uOpacity, cfg.opacity);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (visible && document.visibilityState !== "hidden") raf = requestAnimationFrame(frame);
    }
    const wake = () => { if (!raf && visible) { last = performance.now(); raf = requestAnimationFrame(frame); } };
    const locate = (e) => { const r = box.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height, in: e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom }; };
    addEventListener("pointermove", (e) => { const s = locate(e); if (!ptr.in && s.in) { shade.x = s.x; shade.y = s.y; } Object.assign(ptr, s, { seen: true }); }, { passive: true });
    addEventListener("pointerdown", (e) => { if (reduce || !locate(e).in || e.target.closest("a,button,input")) return; pulses.push(0); if (pulses.length > 4) pulses.shift(); }, { passive: true });
    new ResizeObserver(() => { dirty = true; wake(); }).observe(box);
    new IntersectionObserver((en) => { visible = en.some((x) => x.isIntersecting); if (visible) wake(); }).observe(box);
    document.addEventListener("visibilitychange", wake);
    canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); visible = false; box.classList.add("rays--fallback"); });
    // 开屏：等加载层收起再点亮
    if (box.hasAttribute("data-wait-loader") && document.body.classList.contains("is-loading")) {
      open = 0;
      document.addEventListener("loader:done", () => { open = reduce ? 1 : 0; wake(); }, { once: true });
    }
    wake();
  }

  /* ---------- 胶片颗粒 · Noise ----------
     页面上自动铺一层，固定在最上面，不挡点击 */
  function Grain() {
    const root = document.createElement("div");
    root.className = "grain"; root.setAttribute("aria-hidden", "true");
    const tile = document.createElement("canvas"); tile.width = tile.height = 256;
    const ctx = tile.getContext("2d"), img = ctx.createImageData(256, 256);
    let s = 1013904223;
    const rnd = () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    for (let i = 0; i < img.data.length; i += 4) { const v = clamp(0.5 + (rnd() + rnd() - 1) * 1.16, 0, 1) * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
    ctx.putImageData(img, 0, 0);
    const grain = document.createElement("i"); grain.className = "grain__tile";
    grain.style.backgroundImage = `url(${tile.toDataURL()})`;
    const dust = document.createElement("canvas"); dust.className = "grain__dust";
    root.append(grain, dust);
    document.body.appendChild(root);
    if (reduce) return;
    const dc = dust.getContext("2d");
    let last = 0, w = 0, h = 0;
    const fit = () => { const d = Math.min(devicePixelRatio || 1, 2); w = innerWidth; h = innerHeight; dust.width = w * d; dust.height = h * d; dc.setTransform(d, 0, 0, d, 0, 0); };
    fit(); addEventListener("resize", fit);
    function tick(now) {
      if (now - last > 1000 / 18) {
        last = now;
        grain.style.backgroundPosition = `${(Math.random() * 256).toFixed(0)}px ${(Math.random() * 256).toFixed(0)}px`;
        grain.style.opacity = String(0.06 * (1 - Math.random() * 0.25));
        dc.clearRect(0, 0, w, h);
        const n = Math.round((w * h) / 400000 * 6 * Math.random());
        for (let i = 0; i < n; i++) {
          const x = Math.random() * w, y = Math.random() * h, r = 0.5 + Math.random() ** 2.5 * 2.2;
          dc.fillStyle = Math.random() < 0.4 ? "rgba(255,246,228,.55)" : "rgba(10,8,6,.6)";
          dc.beginPath(); dc.arc(x, y, r, 0, 6.283); dc.fill();
        }
      }
      if (document.visibilityState !== "hidden") requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    document.addEventListener("visibilitychange", () => { if (document.visibilityState !== "hidden") requestAnimationFrame(tick); });
  }

  /* ---------- 乱码解码 · DecryptedText ----------
     <h1 data-decrypt>王炜锋</h1>：加载层收起后逐字解码；
     <span data-decrypt="view">：滚动到这里时解码；鼠标经过会再闪一次 */
  const POOL_CJK = "影光帧幕镜声像剪调色频画格焦曝轨混渲染".split("");
  const POOL_LAT = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&*+=/<>".split("");
  function Decrypt(el) {
    const text = el.textContent;
    const chars = Array.from(text);
    const cjk = /[一-鿿]/.test(text);
    const pool = cjk ? POOL_CJK.concat(POOL_LAT.slice(0, 10)) : POOL_LAT;
    el.setAttribute("aria-label", text);
    el.textContent = "";
    const cells = chars.map((c) => {
      const span = document.createElement("span");
      span.className = "dc"; span.textContent = c; span.setAttribute("aria-hidden", "true");
      if (/\s/.test(c)) span.classList.add("dc--sp");
      el.appendChild(span);
      return span;
    });
    let timer = 0;
    function run(hidden) {
      clearInterval(timer);
      const order = cells.map((_, i) => i).filter((i) => !/\s/.test(chars[i]));
      let done = 0, tick = 0;
      cells.forEach((c, i) => { if (!/\s/.test(chars[i])) { c.classList.add("is-enc"); if (hidden) c.textContent = pool[(i * 7) % pool.length]; } });
      timer = setInterval(() => {
        tick++;
        if (tick % 2 === 0 && done < order.length) { const i = order[done++]; cells[i].textContent = chars[i]; cells[i].classList.remove("is-enc"); }
        for (let k = done; k < order.length; k++) cells[order[k]].textContent = pool[Math.floor(Math.random() * pool.length)];
        if (done >= order.length) clearInterval(timer);
      }, cjk ? 70 : 38);
    }
    if (reduce) return;
    const mode = el.dataset.decrypt;
    if (mode === "view") {
      cells.forEach((c, i) => { if (!/\s/.test(chars[i])) { c.classList.add("is-enc"); c.textContent = pool[(i * 7) % pool.length]; } });
      new IntersectionObserver((en, ob) => { if (en[0].isIntersecting) { ob.disconnect(); run(true); } }, { threshold: 0.6 }).observe(el);
    } else {
      cells.forEach((c, i) => { if (!/\s/.test(chars[i])) { c.classList.add("is-enc"); c.textContent = pool[(i * 7) % pool.length]; } });
      const go = () => setTimeout(() => run(true), 350);
      if (document.body.classList.contains("is-loading")) document.addEventListener("loader:done", go, { once: true }); else go();
    }
    if (fine) el.addEventListener("mouseenter", () => run(false));
  }

  /* ---------- 跑马灯 · ScrollVelocity ----------
     <div data-marquee data-speed="40"><span>内容</span></div>，滚动越快走得越快 */
  let scrollV = 0, lastY = scrollY;
  addEventListener("scroll", () => { scrollV += scrollY - lastY; lastY = scrollY; }, { passive: true });
  function Marquee(el) {
    const track = el.firstElementChild;
    if (!track) return;
    const base = (+el.dataset.speed || 40) * (el.dataset.dir === "right" ? 1 : -1);
    const copies = 4;
    for (let i = 1; i < copies; i++) { const c = track.cloneNode(true); c.setAttribute("aria-hidden", "true"); el.appendChild(c); }
    const parts = Array.from(el.children);
    let x = 0, last = 0, w = track.offsetWidth, vis = true, boost = 0;
    new ResizeObserver(() => { w = track.offsetWidth; }).observe(track);
    new IntersectionObserver((en) => { vis = en[0].isIntersecting; if (vis) requestAnimationFrame(step); }).observe(el);
    function step(now) {
      const dt = Math.min(0.05, (now - last) / 1000 || 0); last = now;
      if (el.dataset.marquee !== "static") {
        boost += (scrollV * 6 - boost) * 0.1; scrollV *= 0.85;
        const v = base * (1 + Math.min(6, Math.abs(boost) / 60)) * (boost < -20 ? -1 : 1);
        x += (reduce ? 0 : v) * dt;
        if (w) { x = ((x % w) + w) % w - w; }
        parts.forEach((p) => { p.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`; });
      }
      if (vis && document.visibilityState !== "hidden") requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- 聚光灯卡片 · SpotlightCard ----------
     class="spot"：鼠标位置写进 --mx/--my，样式在 cinema.css 里 */
  function Spotlight() {
    if (!fine) return;
    let cur = null;
    document.addEventListener("pointermove", (e) => {
      const el = e.target.closest && e.target.closest(".spot");
      if (cur && cur !== el) cur.classList.remove("is-lit");
      cur = el;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", (e.clientX - r.left).toFixed(0) + "px");
      el.style.setProperty("--my", (e.clientY - r.top).toFixed(0) + "px");
      el.classList.add("is-lit");
    }, { passive: true });
    document.addEventListener("pointerleave", () => { if (cur) cur.classList.remove("is-lit"); cur = null; });
  }

  /* ---------- 3D 倾斜 · TiltedCard ----------
     class="tilt"（可加 data-tilt="8" 控制角度）：鼠标在上面时卡片跟着倾斜，并带一道反光 */
  function Tilt(el) {
    if (!fine || reduce) return;
    const amp = +el.dataset.tilt || 10;
    const st = { rx: 0, ry: 0, tx: 0, ty: 0, s: 1, ts: 1, gx: 50, gy: 50 };
    let raf = 0;
    const glare = document.createElement("span"); glare.className = "tilt__glare"; glare.setAttribute("aria-hidden", "true");
    el.appendChild(glare);
    function loop() {
      st.rx += (st.tx - st.rx) * 0.14; st.ry += (st.ty - st.ry) * 0.14; st.s += (st.ts - st.s) * 0.14;
      el.style.transform = `perspective(900px) rotateX(${st.rx.toFixed(2)}deg) rotateY(${st.ry.toFixed(2)}deg) scale(${st.s.toFixed(3)})`;
      el.style.setProperty("--gx", st.gx + "%"); el.style.setProperty("--gy", st.gy + "%");
      raf = Math.abs(st.tx - st.rx) + Math.abs(st.ty - st.ry) + Math.abs(st.ts - st.s) > 0.01 ? requestAnimationFrame(loop) : 0;
    }
    const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      st.ty = (px - 0.5) * 2 * amp; st.tx = -(py - 0.5) * 2 * amp; st.ts = 1.03;
      st.gx = Math.round(px * 100); st.gy = Math.round(py * 100);
      el.classList.add("is-tilt"); kick();
    });
    el.addEventListener("pointerleave", () => { st.tx = st.ty = 0; st.ts = 1; el.classList.remove("is-tilt"); kick(); });
  }

  /* ---------- 数字滚动 · CountUp ----------
     data-count：元素里第一个数字会从 0 滚到原值，比如「60 分钟」「+50%」「1.1 万」 */
  function CountUp(el) {
    const node = Array.from(el.childNodes).find((n) => n.nodeType === 3 && /\d/.test(n.textContent)) ||
      (function find(n) { for (const c of n.childNodes) { if (c.nodeType === 3 && /\d/.test(c.textContent)) return c; const r = c.nodeType === 1 && find(c); if (r) return r; } return null; })(el);
    if (!node || reduce) return;
    const src = node.textContent, m = /(\d+(?:\.\d+)?)/.exec(src);
    if (!m) return;
    const target = parseFloat(m[1]), dec = (m[1].split(".")[1] || "").length;
    const put = (v) => { node.textContent = src.slice(0, m.index) + v.toFixed(dec) + src.slice(m.index + m[1].length); };
    put(0);
    new IntersectionObserver((en, ob) => {
      if (!en[0].isIntersecting) return;
      ob.disconnect();
      const t0 = performance.now(), dur = 1400;
      (function f(now) { const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 4); put(target * e); if (k < 1) requestAnimationFrame(f); else put(target); })(t0);
    }, { threshold: 0.5 }).observe(el);
  }

  /* ---------- 启动 ----------
     main.js 渲染完作品后会派发 site:rendered，再给新出现的元素挂上特效 */
  function bind(root = document) {
    $$("[data-rays]:not([data-fx])", root).forEach((el) => { el.dataset.fx = 1; Rays(el); });
    $$("[data-decrypt]:not([data-fx])", root).forEach((el) => { el.dataset.fx = 1; Decrypt(el); });
    $$("[data-marquee]:not([data-fx])", root).forEach((el) => { el.dataset.fx = 1; Marquee(el); });
    $$(".tilt:not([data-fx])", root).forEach((el) => { el.dataset.fx = 1; Tilt(el); });
    $$("[data-count]:not([data-fx])", root).forEach((el) => { el.dataset.fx = 1; CountUp(el); });
  }
  Grain();
  Spotlight();
  bind();
  document.addEventListener("site:rendered", () => bind());
  window.FX = { bind };
})();
