// 빛쌀 내레이션 — 기기의 음성 합성(speechSynthesis)으로 순이의 이야기를 읽어 줌
// 음원 파일·서버 없음. 읽는 문단에 표시(.speaking). 이야기 카드가 화면을 벗어나면 멈춤.
const VOICE_LANG = { ko: 'ko-KR', en: 'en-US', zh: 'zh-CN', ja: 'ja-JP' };
const GOOD = /natural|neural|premium|enhanced|google|siri|yuna|sora|kyoko|o-ren|tingting|xiaoxiao|samantha|ava/i;

export function createNarrator({ lang, onStart, onEnd, key = 'artmos-bitssal-narr' }) {
  const ok = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  const syn = ok ? window.speechSynthesis : null;
  const want = VOICE_LANG[lang] || 'ko-KR';
  let voice = null, on = false, card = null, token = 0, speaking = false, blocked = false;
  const done = new WeakSet();
  try { on = ok && localStorage.getItem(key) !== 'off'; } catch (e) { on = ok; }

  function pickVoice() {
    if (!syn) return;
    const vs = syn.getVoices().filter((v) => v.lang && v.lang.replace('_', '-').toLowerCase().startsWith(want.slice(0, 2)));
    voice = vs.find((v) => v.lang.replace('_', '-') === want && GOOD.test(v.name)) || vs.find((v) => GOOD.test(v.name)) || vs.find((v) => v.lang.replace('_', '-') === want) || vs[0] || null;
  }
  if (syn) { pickVoice(); syn.addEventListener && syn.addEventListener('voiceschanged', pickVoice); }

  // 문단 → 문장 (긴 문장이 중간에 끊기는 브라우저가 있어 문장 단위로 나눔)
  const sentences = (t) => t.replace(/\s+/g, ' ').trim().split(/(?<=[.!?。！？…])\s*/).map((s) => s.trim()).filter(Boolean);
  const paras = (el) => [...el.querySelectorAll('p')].filter((p) => !p.matches('.st-who, .chap, .note, .src, .st-next') && p.textContent.trim());

  function clearMarks() { document.querySelectorAll('.speaking').forEach((p) => p.classList.remove('speaking')); document.querySelectorAll('.card.story.narrating').forEach((c) => c.classList.remove('narrating')); }
  function stop() {
    token++; card = null;
    if (syn) syn.cancel();
    clearMarks();
    if (speaking) { speaking = false; onEnd && onEnd(); }
  }
  function speak(el) {
    if (!ok) return;
    stop();
    const my = ++token; card = el;
    const list = [];
    paras(el).forEach((p) => sentences(p.textContent).forEach((s) => list.push({ p, s })));
    if (!list.length) return;
    el.classList.add('narrating');
    speaking = true; onStart && onStart();
    let i = 0;
    const next = () => {
      if (my !== token) return;
      if (i >= list.length) { done.add(el); clearMarks(); card = null; speaking = false; onEnd && onEnd(); return; }
      const { p, s } = list[i++];
      document.querySelectorAll('.speaking').forEach((q) => q !== p && q.classList.remove('speaking'));
      p.classList.add('speaking');
      const u = new SpeechSynthesisUtterance(s);
      u.lang = want; if (voice) u.voice = voice;
      u.rate = lang === 'ko' ? 0.92 : 0.9; u.pitch = 0.96; u.volume = 1;
      u.onend = () => setTimeout(next, /[.。]$/.test(s) ? 260 : 120);
      u.onerror = (e) => {
        if (my !== token) return;
        // 아직 사용자가 화면을 누르기 전이라 막힘 → 첫 탭 뒤에 다시 읽음 (이 카드는 읽은 것으로 치지 않음)
        if (e && (e.error === 'not-allowed' || e.error === 'audio-busy')) { blocked = true; token++; card = null; clearMarks(); speaking = false; onEnd && onEnd(); return; }
        setTimeout(next, 60);
      };
      syn.speak(u);
    };
    next();
  }

  return {
    ok,
    get on() { return on; },
    get card() { return card; },
    // iPhone: 첫 음성은 사용자의 탭 안에서 시작해야 함
    unlock() { if (!ok) return; blocked = false; try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; syn.speak(u); } catch (e) {} },
    set(v) { on = ok && v; try { localStorage.setItem(key, on ? 'on' : 'off'); } catch (e) {} if (!on) stop(); },
    toggle() { this.set(!on); return on; },
    // 지금 읽는 이야기 카드를 따라감 (매 프레임 불러도 됨)
    follow(el) {
      if (!on || blocked) return;
      if (card && !card.classList.contains('in')) stop();
      if (el && el !== card && !done.has(el)) speak(el);
    },
    play(el) { if (!ok) return; if (!on) this.set(true); done.delete(el); speak(el); },
    stop,
    isDone: (el) => done.has(el),
  };
}
