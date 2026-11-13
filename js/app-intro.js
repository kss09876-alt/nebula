// 앱 첫 화면 인트로: ART + COSMOS → ARTMOS (앱을 켤 때마다 한 번, 약 4초)
// 흐름: 성운 먼지가 가운데로 모임 → 왼쪽에 ART, 오른쪽에 별로 된 COSMOS → COS가 별가루로 흩어지고 MOS가 ART에 붙어 ARTMOS
//      → 붙는 순간 빛 + 웅장한 소리, O가 고리를 두른 행성이 되고 작은 위성이 한 바퀴 → 카피 → 앱
// 소리는 실시간 합성(Web Audio): 낮은 금관 같은 화음이 차오르다 → 북·종 화음이 터지고 → 큰 홀 잔향.
// 자동 재생이 막히면 로고가 다 그려진 뒤 '입장하기' 버튼(누르면 소리와 함께 입장). 화면을 누르면 건너뜀.
// 모션 줄이기 설정이면 짧게 페이드만. 소리 끄기(xpace-sound=off)면 소리·버튼 없이.
(() => {
  const L = (() => { try { return new URLSearchParams(location.search).get('lang') || localStorage.getItem('xpace-lang') || (navigator.language || 'ko').slice(0, 2); } catch (e) { return 'ko'; } })();
  const COPY = {
    ko: ['지금, 세상의 예술이 내 손 안에서 열려요', 'ART + COSMOS · 예술로 이루어진 우주', '입장하기'],
    en: ['The world’s art, opening in your hand', 'ART + COSMOS · a universe made of art', 'Enter'],
    zh: ['此刻，世界的艺术在你掌中展开', 'ART + COSMOS · 由艺术构成的宇宙', '进入'],
    ja: ['いま、世界のアートが手のひらでひらく', 'ART + COSMOS · アートでできた宇宙', '入場する'],
  };
  const C = COPY[L] || COPY.ko;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches || (() => { try { return localStorage.getItem('valix-motion') === 'reduce'; } catch (e) { return false; } })();
  const soundOn = (() => { try { return localStorage.getItem('xpace-sound') !== 'off'; } catch (e) { return true; } })();
  const T = { art: 300, cosmos: 650, scatter: 1850, join: 1900, hit: 2600, ring: 2650, copy: 3200, end: 3950 }; // ms

  const css = `
  .ai{position:fixed;inset:0;z-index:80;background:radial-gradient(ellipse at 50% 46%,#0e1426 0%,#06070d 58%,#030308 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;color:#f2f3f8;font-family:Pretendard,-apple-system,'Apple SD Gothic Neo',sans-serif;transition:opacity .7s ease}
  .ai.out{opacity:0;pointer-events:none}
  .ai canvas{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
  .ai .stage{position:absolute;left:0;right:0;top:calc(47% - 70px);width:100%;height:140px;display:flex;align-items:center;justify-content:center}
  .ai .word{position:relative;display:flex;align-items:center;font-weight:200;font-size:clamp(34px,10.5vw,58px);letter-spacing:.16em;white-space:nowrap}
  .ai .word.ghost{position:absolute;visibility:hidden}
  .ai .ch{display:inline-block;opacity:0;transform:translateY(12px);filter:blur(8px);transition:transform .95s cubic-bezier(.65,0,.2,1),opacity .6s,filter .6s,color .6s,text-shadow .6s}
  .ai .ch.on{opacity:1;transform:none;filter:none}
  .ai .gap{display:inline-block;width:.9em}
  .ai .cos .ch{color:#bfe6ff;text-shadow:0 0 14px rgba(140,210,255,.8)}
  .ai .ch.dust{opacity:0!important;filter:blur(14px)!important;transition:transform 1s cubic-bezier(.2,.7,.2,1),opacity .9s,filter .9s}
  .ai .ch.lit{color:#fff;text-shadow:0 0 22px rgba(160,225,255,.95),0 0 4px #fff}
  .ai .planet{position:absolute;pointer-events:none;opacity:0;transition:opacity .5s}
  .ai .planet.on{opacity:1}
  .ai .planet .core{position:absolute;inset:18%;border-radius:50%;background:radial-gradient(circle at 35% 30%,rgba(255,255,255,.55),rgba(150,215,255,.22) 45%,rgba(90,120,220,0) 72%)}
  .ai .planet svg{position:absolute;inset:-60% -95%;width:290%;height:220%;overflow:visible}
  .ai .planet ellipse{fill:none;stroke:url(#aiRing);stroke-width:1.4;stroke-dasharray:420;stroke-dashoffset:420}
  .ai .planet.on ellipse{animation:aiDraw 1.1s cubic-bezier(.4,0,.2,1) forwards}
  .ai .planet .moon{fill:#e8f7ff;filter:url(#aiGlow);opacity:0}
  .ai .planet.on .moon{opacity:1}
  .ai .flash{position:absolute;left:50%;top:50%;width:340px;height:340px;margin:-170px;border-radius:50%;background:radial-gradient(circle,rgba(220,245,255,.75) 0%,rgba(130,200,255,.25) 26%,rgba(130,200,255,0) 62%);opacity:0;pointer-events:none}
  .ai .flash.on{animation:aiFlash 1.2s ease-out forwards}
  .ai .copy{position:absolute;left:0;right:0;top:calc(47% + 74px);text-align:center;padding:0 28px;opacity:0;transform:translateY(8px);transition:opacity .9s,transform .9s}
  .ai.copyon .copy{opacity:1;transform:none}
  .ai .copy b{display:block;font-family:'Nanum Myeongjo','Noto Serif KR','AppleMyungjo',serif;font-weight:700;font-size:clamp(17px,4.8vw,22px);line-height:1.5;color:#f3ead6}
  .ai .copy small{display:block;margin-top:10px;font-size:12.5px;letter-spacing:.14em;color:#9aa1bd}
  .ai .enter{position:absolute;z-index:2;top:calc(47% + 190px);left:50%;margin-left:-80px;width:160px;padding:13px 30px;border-radius:999px;border:1px solid rgba(216,184,120,.6);color:#f0dcae;font-size:15px;letter-spacing:.12em;background:rgba(216,184,120,.06);opacity:0;transform:translateY(6px);transition:opacity .6s,transform .6s;font-family:inherit}
  .ai .enter.show{opacity:1;transform:none}
  .ai .planet .core{box-shadow:0 0 24px rgba(150,215,255,.35)}
  .ai .by{position:absolute;bottom:calc(env(safe-area-inset-bottom,0px) + 30px);font-size:11px;letter-spacing:.3em;color:#5f6684;opacity:0;transition:opacity 1s}
  .ai.copyon .by{opacity:1}
  @keyframes aiDraw{to{stroke-dashoffset:0}}
  @keyframes aiFlash{0%{opacity:0;transform:scale(.2)}16%{opacity:1;transform:scale(.7)}to{opacity:0;transform:scale(1.9)}}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  const el = document.createElement('div'); el.className = 'ai'; el.setAttribute('role', 'img'); el.setAttribute('aria-label', 'ARTMOS — ' + C[0]);
  const span = (t, cls = '') => `<span class="ch ${cls}" data-c="${t}">${t}</span>`;
  el.innerHTML = `<canvas></canvas>
    <div class="stage">
      <div class="word ghost" aria-hidden="true">${[...'ARTMOS'].map((t) => span(t, 'on')).join('')}</div>
      <div class="word live" aria-hidden="true">
        <span class="art">${[...'ART'].map((t, i) => span(t, 'k k' + i)).join('')}</span><span class="gap"></span>
        <span class="cos">${span('C', 'x')}${span('O', 'x')}${span('S', 'x')}${span('M', 'k k3')}${span('O', 'k k4')}${span('S', 'k k5')}</span>
      </div>
      <div class="planet"><span class="core"></span><svg viewBox="-100 -40 200 80" aria-hidden="true"><defs>
        <linearGradient id="aiRing" x1="0" x2="1"><stop offset="0" stop-color="#9fd8ff" stop-opacity=".15"/><stop offset=".5" stop-color="#e9f7ff" stop-opacity=".95"/><stop offset="1" stop-color="#9fd8ff" stop-opacity=".2"/></linearGradient>
        <filter id="aiGlow" x="-300%" y="-300%" width="700%" height="700%"><feGaussianBlur stdDeviation="2.2"/></filter></defs>
        <ellipse rx="64" ry="15" transform="rotate(-14)"/><circle class="moon" r="3.2"><animateMotion dur="1.6s" begin="indefinite" fill="freeze" rotate="0" path="M64,0 A64,15 0 1,1 63.9,-0.9" /></circle></svg></div>
      <span class="flash"></span>
    </div>
    <div class="copy"><b>${C[0]}</b><small>${C[1]}</small></div>
    <button class="enter" type="button" hidden>♪&nbsp;&nbsp;${C[2]}</button>
    <p class="by">ARTMOS · BY VALIX LAB</p>`;
  document.body.appendChild(el);
  const $ = (s) => el.querySelector(s), $$ = (s) => [...el.querySelectorAll(s)];

  // ---------- 배경: 성운 먼지가 가운데로 모였다가, 합쳐지는 순간 바깥으로 퍼짐 ----------
  const cv = $('canvas'), cx = cv.getContext('2d');
  const dpr = Math.min(devicePixelRatio || 1, 2); let W = 0, H = 0;
  const size = () => { W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  size(); addEventListener('resize', size);
  const N = reduce ? 0 : 260, P = [];
  for (let i = 0; i < N; i++) { const a = Math.random() * Math.PI * 2, r = 0.35 + Math.random() * 0.75; P.push({ a, r, s: 0.4 + Math.random() * 1.3, hue: Math.random() < 0.7 ? 205 : 40, sp: (Math.random() - 0.5) * 0.4, tw: Math.random() * 6 }); }
  const sparks = []; // COS가 흩어질 때·합쳐질 때 생기는 별가루
  let t0 = performance.now(), raf = 0;
  function frame(now) {
    const t = now - t0; cx.clearRect(0, 0, W, H);
    const R = Math.max(W, H) * 0.62, mx = W / 2, my = H * 0.47;
    const pull = t < T.hit ? Math.min(1, t / T.hit) : 1, burst = t > T.hit ? Math.min(1, (t - T.hit) / 1400) : 0;
    for (const p of P) {
      const ang = p.a + p.sp * t / 1000 + pull * 0.6 * p.sp;
      const rr = p.r * R * (1 - 0.55 * easeOut(pull) + 0.75 * easeOut(burst));
      const x = mx + Math.cos(ang) * rr, y = my + Math.sin(ang) * rr * 0.62;
      const al = (0.25 + 0.5 * Math.abs(Math.sin(p.tw + t / 600))) * Math.min(1, t / 600) * (1 - burst * 0.6);
      cx.fillStyle = `hsla(${p.hue},80%,82%,${al})`; cx.fillRect(x, y, p.s, p.s);
    }
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i]; s.x += s.vx; s.y += s.vy; s.vx *= 0.97; s.vy *= 0.97; s.life -= 1;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      cx.fillStyle = `rgba(200,235,255,${(s.life / s.max) * 0.9})`; cx.beginPath(); cx.arc(s.x, s.y, s.r, 0, 6.283); cx.fill();
    }
    if (!done) raf = requestAnimationFrame(frame);
  }
  const easeOut = (x) => 1 - Math.pow(1 - x, 3);
  function burstAt(node, n, spread) {
    const r = node.getBoundingClientRect(), b = cv.getBoundingClientRect();
    for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, v = Math.random() * spread; sparks.push({ x: r.left - b.left + r.width / 2 + (Math.random() - 0.5) * r.width, y: r.top - b.top + r.height / 2 + (Math.random() - 0.5) * r.height, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 0.3, r: 0.6 + Math.random() * 1.4, life: 40 + Math.random() * 50, max: 90 }); }
  }

  // ---------- 소리: 차오르는 낮은 화음 → 합쳐지는 순간 북 + 종 화음 + 큰 홀 잔향 ----------
  let ac = null;
  function sound(at = 0) {
    if (!soundOn) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
      const s0 = ac.currentTime + 0.05 - at, hit = s0 + T.hit / 1000;
      const out = ac.createGain(); out.gain.value = 0.85;
      const comp = ac.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 5; comp.attack.value = 0.003;
      const len = Math.floor(ac.sampleRate * 5), ir = ac.createBuffer(2, len, ac.sampleRate);
      for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
      const verb = ac.createConvolver(); verb.buffer = ir; const wet = ac.createGain(); wet.gain.value = 0.6;
      out.connect(comp); comp.connect(ac.destination); out.connect(verb); verb.connect(wet); wet.connect(comp);
      const env = (g, a, peak, hold, rel) => { g.gain.setValueAtTime(0.0001, a); g.gain.exponentialRampToValueAtTime(peak, a + hold); g.gain.exponentialRampToValueAtTime(0.0001, a + hold + rel); };
      // 1) 차오르는 화음(낮은 금관·현 느낌): C2-G2-C3-E3, 톱니파 두 겹을 살짝 어긋나게 + 열리는 필터
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 1.2;
      lp.frequency.setValueAtTime(220, s0); lp.frequency.exponentialRampToValueAtTime(1800, hit); lp.frequency.exponentialRampToValueAtTime(500, hit + 2.5);
      const pad = ac.createGain(); pad.gain.setValueAtTime(0.0001, s0); pad.gain.exponentialRampToValueAtTime(0.11, hit - 0.05); pad.gain.exponentialRampToValueAtTime(0.06, hit + 0.4); pad.gain.exponentialRampToValueAtTime(0.0001, hit + 3.2);
      lp.connect(pad); pad.connect(out);
      [65.41, 98, 130.81, 164.81].forEach((f) => [-6, 6].forEach((det) => { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = det; o.connect(lp); o.start(s0); o.stop(hit + 3.4); }));
      // 2) 공기가 빨려 들어가는 소리(합쳐지기 직전)
      const nb = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), nd = nb.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
      const air = ac.createBufferSource(); air.buffer = nb; const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.5;
      bp.frequency.setValueAtTime(300, hit - 1.2); bp.frequency.exponentialRampToValueAtTime(5000, hit - 0.02);
      const ag = ac.createGain(); env(ag, hit - 1.2, 0.14, 1.15, 0.12); air.connect(bp); bp.connect(ag); ag.connect(out); air.start(hit - 1.2); air.stop(hit + 0.3);
      // 3) 합쳐지는 순간: 깊은 북(팀파니) + 서브 저음
      const boom = ac.createOscillator(); boom.type = 'sine'; boom.frequency.setValueAtTime(110, hit); boom.frequency.exponentialRampToValueAtTime(42, hit + 0.6);
      const bg = ac.createGain(); env(bg, hit, 0.55, 0.008, 1.6); boom.connect(bg); bg.connect(out); boom.start(hit); boom.stop(hit + 1.8);
      const thump = ac.createBufferSource(); thump.buffer = nb; const tl = ac.createBiquadFilter(); tl.type = 'lowpass'; tl.frequency.value = 900;
      const tg = ac.createGain(); env(tg, hit, 0.25, 0.004, 0.25); thump.connect(tl); tl.connect(tg); tg.connect(out); thump.start(hit); thump.stop(hit + 0.4);
      // 4) 종 화음 C4-G4-E5-B5-D6 (배음 섞은 종소리, 조금씩 늦게 퍼짐)
      [[261.63, 0.13], [392, 0.1], [659.25, 0.085], [987.77, 0.05], [1174.66, 0.035]].forEach(([f, g], k) => [1, 2.76, 5.4].forEach((m, j) => {
        const o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = f * m * (1 + (k % 2 ? 0.0015 : -0.001));
        const gg = ac.createGain(); env(gg, hit + 0.02 + k * 0.05, g / (j + 1) / (j ? 2.5 : 1), 0.01, j ? 1.3 : 3.6);
        o.connect(gg); gg.connect(out); o.start(hit + k * 0.05); o.stop(hit + 4.2);
      }));
      // 5) 위성이 고리를 도는 반짝임
      const sh = ac.createOscillator(); sh.type = 'triangle'; sh.frequency.setValueAtTime(2093, hit + 0.2); sh.frequency.exponentialRampToValueAtTime(4186, hit + 1.6);
      const shg = ac.createGain(); env(shg, hit + 0.2, 0.018, 0.4, 1.1); sh.connect(shg); shg.connect(out); sh.start(hit + 0.2); sh.stop(hit + 1.8);
      if (ac.state === 'suspended') ac.resume();
    } catch (e) {}
  }
  const audible = () => ac && ac.state === 'running';

  // ---------- 진행 ----------
  let done = false; const timers = [];
  const at = (ms, fn) => timers.push(setTimeout(fn, ms));
  function finish() {
    if (done) return; done = true; timers.forEach(clearTimeout); cancelAnimationFrame(raf);
    el.classList.add('out');
    setTimeout(() => { el.remove(); st.remove(); removeEventListener('resize', size); if (ac && ac.state !== 'closed') setTimeout(() => ac.close().catch(() => {}), 4000); }, 700);
  }
  function placePlanet() { // ARTMOS의 O 자리에 행성(고리·위성)을 겹침
    const o = $('.live .k4'), stg = $('.stage'), r = o.getBoundingClientRect(), s = stg.getBoundingClientRect(), pl = $('.planet');
    const d = r.height * 0.78; Object.assign(pl.style, { width: d + 'px', height: d + 'px', left: (r.left - s.left + r.width / 2 - d / 2) + 'px', top: (r.top - s.top + r.height / 2 - d / 2) + 'px' });
  }
  if (reduce) {
    $$('.live .k').forEach((c) => c.classList.add('on')); $$('.live .x').forEach((c) => c.remove()); $('.live .gap').remove();
    placePlanet(); $('.planet').classList.add('on'); el.classList.add('copyon'); at(1500, finish);
  } else {
    raf = requestAnimationFrame(frame); sound(0);
    $$('.art .ch').forEach((c, i) => at(T.art + i * 110, () => c.classList.add('on')));
    $$('.cos .ch').forEach((c, i) => at(T.cosmos + i * 70, () => c.classList.add('on')));
    at(T.scatter, () => $$('.cos .x').forEach((c, i) => { // COS가 별가루로 흩어짐
      c.classList.add('dust'); c.style.transform = `translate(${(i - 1) * 30}px,${-40 - i * 12}px) scale(.4)`; burstAt(c, 26, 3.2);
    }));
    at(T.join, () => { // 남은 글자를 ARTMOS 자리로 (ghost 단어의 글자 위치로 이동)
      const ghost = $$('.ghost .ch'), live = [0, 1, 2, 3, 4, 5].map((i) => $('.live .k' + i));
      live.forEach((c, i) => { const a = c.getBoundingClientRect(), b = ghost[i].getBoundingClientRect(); c.style.transform = `translate(${b.left - a.left}px,${b.top - a.top}px)`; });
      $$('.cos .k').forEach((c) => { c.style.color = ''; c.style.textShadow = ''; });
    });
    at(T.hit - 40, () => {
      const live = $$('.live .k'); live.forEach((c) => c.classList.add('lit')); setTimeout(() => live.forEach((c) => c.classList.remove('lit')), 700);
      $('.flash').classList.add('on'); burstAt($('.live .k4'), 60, 5);
      placePlanetAfterJoin();
    });
    at(T.ring + 200, () => { try { $('.planet .moon animateMotion').beginElement(); } catch (e) {} });
    at(T.copy, () => el.classList.add('copyon'));
    at(T.end, () => {
      if (soundOn && !audible()) { const b = $('.enter'); b.hidden = false; requestAnimationFrame(() => b.classList.add('show')); b.focus({ preventScroll: true }); at(T.end + 9000, finish); }
      else at(T.end + 900, finish);
    });
  }
  function placePlanetAfterJoin() { // 이동이 끝난 O(=ghost의 5번째 글자 자리)에 행성
    const g = $$('.ghost .ch')[4], s = $('.stage').getBoundingClientRect(), r = g.getBoundingClientRect(), pl = $('.planet');
    const d = r.height * 0.78; Object.assign(pl.style, { width: d + 'px', height: d + 'px', left: (r.left - s.left + r.width / 2 - d / 2) + 'px', top: (r.top - s.top + r.height / 2 - d / 2) + 'px' });
    pl.classList.add('on');
  }
  el.addEventListener('click', (e) => {
    const b = e.target.closest('.enter');
    if (b) { b.disabled = true; sound(T.hit / 1000 - 0.05); at(T.end + 1800, finish); setTimeout(finish, 1800); return; } // 북·종소리부터 울리고 입장
    finish(); // 아무 데나 누르면 건너뛰기
  });
})();
