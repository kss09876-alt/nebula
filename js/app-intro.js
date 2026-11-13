// NEBULA 앱 첫 화면: VALIX 로고 인트로 + 전시장에 들어서는 소리 (앱을 켤 때마다 한 번, 약 4초)
// VALUE 와 X 가 합쳐져 VALIX 가 됨: U·E 가 빛으로 녹아 I 가 되고, 빛의 X 가 날아와 박힘 → 궤도 빛이 로고를 한 바퀴 → 카피 → 앱으로.
// 소리는 파일 없이 실시간 합성(Web Audio). 자동 재생이 막히면 로고가 다 그려진 뒤 '입장하기' 버튼을 눌러 소리와 함께 들어감.
// 화면을 누르면 건너뜀. 모션 줄이기 설정이면 짧게 페이드만. 소리 끄기(xpace-sound=off)면 소리·버튼 없이.
(() => {
  const L = (() => { try { return new URLSearchParams(location.search).get('lang') || localStorage.getItem('xpace-lang') || (navigator.language || 'ko').slice(0, 2); } catch (e) { return 'ko'; } })();
  const COPY = {
    ko: ['지금, 세상의 예술이 내 손 안에서 열려요', '보고 · 만지고 · 귀 기울이는 전시', '입장하기'],
    en: ['The world’s art, opening in your hand', 'Exhibitions you see, touch and hear', 'Enter'],
    zh: ['此刻，世界的艺术在你掌中展开', '可以观看、触摸、聆听的展览', '进入'],
    ja: ['いま、世界のアートが手のひらでひらく', '見て・ふれて・耳をすます展示', '入場する'],
  };
  const C = COPY[L] || COPY.ko;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches || (() => { try { return localStorage.getItem('valix-motion') === 'reduce'; } catch (e) { return false; } })();
  const soundOn = (() => { try { return localStorage.getItem('xpace-sound') !== 'off'; } catch (e) { return true; } })();

  const css = `
  .vi{position:fixed;inset:0;z-index:80;background:radial-gradient(ellipse at 50% 46%,#0b1424 0%,#05060c 62%);display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;color:#f2f3f8;font-family:Pretendard,-apple-system,'Apple SD Gothic Neo',sans-serif;transition:opacity .7s ease}
  .vi.out{opacity:0;pointer-events:none}
  .vi .dust{position:absolute;inset:0;pointer-events:none;opacity:0;animation:viFade 2.4s .1s ease forwards}
  .vi .dust i{position:absolute;width:2px;height:2px;border-radius:50%;background:#cfe3ff;opacity:.5}
  .vi .stage{position:relative;width:min(78vw,420px);height:120px}
  .vi .word{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-weight:200;font-size:clamp(40px,12vw,64px);letter-spacing:.18em;padding-left:.18em}
  .vi .ch{display:inline-block;opacity:0;transform:translateY(10px);filter:blur(6px);animation:viIn .7s cubic-bezier(.2,.8,.2,1) forwards}
  .vi .ch.u,.vi .ch.e{animation:viIn .7s cubic-bezier(.2,.8,.2,1) forwards,viMelt .7s 1.55s ease-in forwards}
  .vi .ch.i,.vi .ch.x{position:absolute;opacity:0;animation:none}
  .vi .word.v2 .ch{opacity:1;transform:none;filter:none;animation:none}
  .vi .word.v2 .ch.i{position:static;opacity:0;transform:scaleY(0);transform-origin:50% 100%;animation:viRise .5s 1.9s cubic-bezier(.3,1.4,.5,1) forwards;color:#fff}
  .vi .word.v2 .ch.x{position:static;opacity:0;transform:translateX(60vw) scale(1.8);filter:blur(8px);animation:viX .62s 2.05s cubic-bezier(.2,.9,.25,1) forwards;font-weight:300;color:#fff;text-shadow:0 0 18px rgba(140,220,255,.9)}
  .vi .word.v1{transition:opacity .25s 1.95s}
  .vi.merge .word.v1{opacity:0}
  .vi .word.v2{opacity:0;transition:opacity .2s 1.9s}
  .vi.merge .word.v2{opacity:1}
  .vi .flash{position:absolute;left:62%;top:50%;width:300px;height:300px;margin:-150px;border-radius:50%;background:radial-gradient(circle,rgba(200,240,255,.7) 0%,rgba(120,210,255,.25) 28%,rgba(120,210,255,0) 62%);opacity:0;pointer-events:none}
  .vi.merge .flash{animation:viFlash 1.1s 2.5s ease-out forwards}
  .vi .orbit{position:absolute;left:50%;top:50%;width:min(96vw,520px);height:min(36vw,190px);transform:translate(-50%,-50%) rotate(-8deg);pointer-events:none}
  .vi .orbit ellipse{fill:none;stroke:rgba(150,210,255,.35);stroke-width:1;stroke-dasharray:1400;stroke-dashoffset:1400}
  .vi.merge .orbit ellipse{animation:viDraw 1.5s 2.4s cubic-bezier(.4,0,.2,1) forwards}
  .vi .orbit .glow{opacity:0;fill:#9fe3ff;filter:url(#viBlur)}
  .vi.merge .orbit .glow{animation:viGlow 1.5s 2.4s ease-out forwards}
  .vi .copy{margin-top:34px;text-align:center;padding:0 28px;opacity:0;transform:translateY(8px);transition:opacity .9s,transform .9s}
  .vi.copyon .copy{opacity:1;transform:none}
  .vi .copy b{display:block;font-family:'Nanum Myeongjo','Noto Serif KR','AppleMyungjo',serif;font-weight:700;font-size:clamp(17px,4.8vw,22px);line-height:1.5;color:#f3ead6}
  .vi .copy small{display:block;margin-top:10px;font-size:13px;letter-spacing:.06em;color:#9aa1bd}
  .vi .enter{position:relative;z-index:2;margin-top:34px;padding:13px 30px;border-radius:999px;border:1px solid rgba(216,184,120,.6);color:#f0dcae;font-size:15px;letter-spacing:.12em;background:rgba(216,184,120,.06);opacity:0;transform:translateY(6px);transition:opacity .6s,transform .6s;font-family:inherit}
  .vi .enter.show{opacity:1;transform:none}
  .vi .enter i{display:inline-block;width:14px;margin-right:8px;font-style:normal}
  .vi .by{position:absolute;bottom:calc(env(safe-area-inset-bottom,0px) + 30px);font-size:11px;letter-spacing:.3em;color:#5f6684;opacity:0;transition:opacity 1s}
  .vi.copyon .by{opacity:1}
  @keyframes viIn{to{opacity:1;transform:none;filter:none}}
  @keyframes viMelt{to{opacity:0;transform:translateY(-6px) scaleX(.2);filter:blur(10px)}}
  @keyframes viRise{to{opacity:1;transform:none}}
  @keyframes viX{60%{opacity:1}to{opacity:1;transform:none;filter:none}}
  @keyframes viFlash{0%{opacity:0;transform:scale(.2)}18%{opacity:1;transform:scale(.7)}to{opacity:0;transform:scale(1.8)}}
  @keyframes viDraw{to{stroke-dashoffset:0}}
  @keyframes viGlow{0%{opacity:0}20%{opacity:1}100%{opacity:0}}
  @keyframes viFade{to{opacity:1}}
  @media (prefers-reduced-motion:reduce){.vi *{animation-duration:.01s!important;animation-delay:0s!important;transition-duration:.3s!important}}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  const el = document.createElement('div'); el.className = 'vi'; el.setAttribute('role', 'img'); el.setAttribute('aria-label', 'VALIX — ' + C[0]);
  let dust = ''; for (let i = 0; i < 40; i++) dust += `<i style="left:${(Math.random() * 100).toFixed(1)}%;top:${(Math.random() * 100).toFixed(1)}%;opacity:${(0.15 + Math.random() * 0.5).toFixed(2)}"></i>`;
  el.innerHTML = `<div class="dust">${dust}</div>
    <div class="stage">
      <svg class="orbit" viewBox="0 0 520 190" aria-hidden="true"><defs><filter id="viBlur" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="6"/></filter></defs><ellipse cx="260" cy="95" rx="250" ry="80"/><circle class="glow" r="14"><animateMotion dur="1.5s" begin="indefinite" fill="freeze" path="M510,95 A250,80 0 1,1 509.9,94.9"/></circle></svg>
      <div class="word v1">${['V', 'A', 'L', 'U', 'E'].map((t, i) => `<span class="ch ${t === 'U' ? 'u' : t === 'E' ? 'e' : ''}" style="animation-delay:${0.35 + i * 0.12}s${t === 'U' || t === 'E' ? `,${1.55 + (t === 'E' ? 0.08 : 0)}s` : ''}">${t}</span>`).join('')}</div>
      <div class="word v2"><span class="ch">V</span><span class="ch">A</span><span class="ch">L</span><span class="ch i">I</span><span class="ch x">X</span></div>
      <span class="flash"></span>
    </div>
    <div class="copy"><b>${C[0]}</b><small>${C[1]}</small></div>
    <button class="enter" type="button" hidden><i>♪</i>${C[2]}</button>
    <p class="by">VALIX LAB · NEBULA</p>`;
  document.body.appendChild(el);

  // ---------- 소리: 전시장 문이 열리고 넓은 홀의 공기, X가 박힐 때 맑은 종소리 화음 ----------
  let ac = null;
  function sound(at = 0) {
    if (!soundOn) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
      const t0 = ac.currentTime + 0.05 - at;
      const out = ac.createGain(); out.gain.value = 0.9;
      const comp = ac.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 4;
      // 큰 홀 잔향(합성 임펄스)
      const len = ac.sampleRate * 4.5, ir = ac.createBuffer(2, len, ac.sampleRate);
      for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
      const verb = ac.createConvolver(); verb.buffer = ir; const wet = ac.createGain(); wet.gain.value = 0.55;
      out.connect(comp); comp.connect(ac.destination); out.connect(verb); verb.connect(wet); wet.connect(ac.destination);
      // 1) 문이 열리며 밀려드는 공기 (필터가 열리는 노이즈)
      const nb = ac.createBuffer(1, ac.sampleRate * 3, ac.sampleRate), nd = nb.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
      const air = ac.createBufferSource(); air.buffer = nb; const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 0.7;
      lp.frequency.setValueAtTime(180, t0); lp.frequency.exponentialRampToValueAtTime(2600, t0 + 1.9); lp.frequency.exponentialRampToValueAtTime(400, t0 + 3);
      const ag = ac.createGain(); ag.gain.setValueAtTime(0.0001, t0); ag.gain.exponentialRampToValueAtTime(0.16, t0 + 1.6); ag.gain.exponentialRampToValueAtTime(0.0001, t0 + 3);
      air.connect(lp); lp.connect(ag); ag.connect(out); air.start(t0); air.stop(t0 + 3.1);
      // 2) 바닥에서 올라오는 낮은 울림
      const sub = ac.createOscillator(); sub.type = 'sine'; sub.frequency.setValueAtTime(55, t0 + 0.3); sub.frequency.linearRampToValueAtTime(65.4, t0 + 2.1);
      const sg = ac.createGain(); sg.gain.setValueAtTime(0.0001, t0 + 0.3); sg.gain.exponentialRampToValueAtTime(0.28, t0 + 1.9); sg.gain.exponentialRampToValueAtTime(0.0001, t0 + 4.2);
      sub.connect(sg); sg.connect(out); sub.start(t0 + 0.3); sub.stop(t0 + 4.3);
      // 3) X가 박히는 순간(2.6초): 맑은 종 화음 C–G–E–B (배음 섞은 종소리)
      const hit = t0 + 2.6;
      [[261.63, 0.16], [392, 0.12], [659.25, 0.1], [987.77, 0.06], [1318.5, 0.04]].forEach(([f, g], k) => {
        [1, 2.76, 5.4].forEach((m, j) => {
          const o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = f * m * (1 + (k % 2 ? 0.0015 : -0.001));
          const gg = ac.createGain(); const peak = g / (j + 1) / (j ? 2.5 : 1);
          gg.gain.setValueAtTime(0.0001, hit + k * 0.06); gg.gain.exponentialRampToValueAtTime(peak, hit + k * 0.06 + 0.01); gg.gain.exponentialRampToValueAtTime(0.0001, hit + k * 0.06 + (j ? 1.2 : 3.8));
          o.connect(gg); gg.connect(out); o.start(hit + k * 0.06); o.stop(hit + 4.2);
        });
      });
      // 4) 빛이 지나가는 반짝임
      const sh = ac.createOscillator(); sh.type = 'triangle'; sh.frequency.setValueAtTime(2093, hit + 0.15); sh.frequency.exponentialRampToValueAtTime(4186, hit + 1.4);
      const shg = ac.createGain(); shg.gain.setValueAtTime(0.0001, hit + 0.15); shg.gain.exponentialRampToValueAtTime(0.02, hit + 0.5); shg.gain.exponentialRampToValueAtTime(0.0001, hit + 1.6);
      sh.connect(shg); shg.connect(out); sh.start(hit + 0.15); sh.stop(hit + 1.7);
      if (ac.state === 'suspended') ac.resume();
    } catch (e) {}
  }
  const audible = () => ac && ac.state === 'running';

  // ---------- 진행 ----------
  let done = false, timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  function finish() {
    if (done) return; done = true; timers.forEach(clearTimeout);
    el.classList.add('out'); setTimeout(() => { el.remove(); st.remove(); if (ac && ac.state !== 'closed') setTimeout(() => ac.close().catch(() => {}), 4000); }, 700);
    try { sessionStorage.setItem('nebula-intro', '1'); } catch (e) {}
  }
  if (reduce) { el.classList.add('merge', 'copyon'); later(finish, 1400); }
  else {
    sound(0);
    requestAnimationFrame(() => { el.classList.add('merge'); const g = el.querySelector('.orbit .glow animateMotion'); later(() => { try { g.beginElement(); } catch (e) {} }, 2400); });
    later(() => el.classList.add('copyon'), 3000);
    later(() => {
      // 자동 재생이 막혔으면 '입장하기'로 소리와 함께 들어가게
      if (soundOn && !audible()) { const b = el.querySelector('.enter'); b.hidden = false; requestAnimationFrame(() => b.classList.add('show')); b.focus({ preventScroll: true }); later(finish, 9000); }
      else later(finish, 900);
    }, 3700);
  }
  el.addEventListener('click', (e) => {
    if (e.target.closest('.enter')) { sound(2.55); later(finish, 1700); e.target.closest('.enter').disabled = true; return; } // 종소리부터 울리고 들어감
    if (!done) finish(); // 아무 데나 누르면 건너뛰기
  });
})();
