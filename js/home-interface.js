import { lang } from './i18n.js?v=4';

const WORDS = {
  ko: { explore: '전시 둘러보기', orbit: '지금, 궤도 위에서', land: '착륙하기', landing: '당신의 궤도로 들어갑니다.', indexIntro: '당신의 다음 행성을 찾아보세요.', motion: '모션 줄이기', resume: '모션 다시 켜기', system: '모션 최소화 · 기기 설정', close: '닫기', choose: '행성 선택', select: '선택한 전시에 착륙' },
  en: { explore: 'Explore exhibitions', orbit: 'Now in orbit', land: 'Land', landing: 'Entering your orbit.', indexIntro: 'Find your next planet.', motion: 'Reduce motion', resume: 'Resume motion', system: 'Reduced motion · system', close: 'Close', choose: 'Choose a planet', select: 'Land on the selected planet' },
  zh: { explore: '探索展览', orbit: '此刻，轨道之上', land: '登陆', landing: '正在进入你的轨道。', indexIntro: '寻找你的下一颗行星。', motion: '减少动态效果', resume: '恢复动态效果', system: '减少动态 · 设备设置', close: '关闭', choose: '选择行星', select: '登陆所选展览' },
  ja: { explore: '展示を探す', orbit: 'いま、軌道の上で', land: '着陸する', landing: 'あなたの軌道へ。', indexIntro: '次の惑星を見つけよう。', motion: '動きを減らす', resume: '動きを再開', system: '動きを軽減 · 端末設定', close: '閉じる', choose: '惑星を選ぶ', select: '選んだ展示に着陸' },
};
const copy = WORDS[lang] || WORDS.ko;
export const homeWord = (key) => copy[key] || WORDS.ko[key] || key;

export function initHomeInterface({ planets, state, enter, code, shortTitle, motionQuery, onMotion, onExplore }) {
  document.querySelectorAll('[data-home-copy]').forEach((el) => { el.textContent = homeWord(el.dataset.homeCopy); });
  document.querySelectorAll('.panel-close').forEach((el) => el.setAttribute('aria-label', homeWord('close')));
  const tabs = document.querySelector('#orbit-tabs');
  const preview = document.querySelector('#dock-preview');
  const land = document.querySelector('#dock-enter');
  tabs.setAttribute('aria-label', homeWord('choose'));
  land.setAttribute('aria-label', homeWord('select'));
  document.querySelector('#orbit-count').textContent = String(planets.length).padStart(2, '0');
  let selected = planets.find((p) => p.open) || null;
  const buttons = new Map();
  const cameraPoint = { x: 0, y: 0, z: 0 };

  function show(p, moveCamera = false) {
    if (!p) return;
    selected = p;
    document.querySelector('#dock-code').textContent = code(p.i);
    document.querySelector('#dock-title').textContent = shortTitle(p.cell.title);
    document.querySelector('#dock-subtitle').textContent = p.cell.subtitle || '';
    preview.style.setProperty('--dock-accent', p.cell.color || '#b8cdc4');
    preview.hidden = false;
    buttons.forEach((button, q) => button.setAttribute('aria-pressed', String(q === p)));
    if (moveCamera) {
      state.dockFocus = p;
      // World transforms (including mobile compass) remain owned by main.js.
      p.group.updateWorldMatrix(true, false);
      const m = p.group.matrixWorld.elements;
      cameraPoint.x = m[12]; cameraPoint.z = m[14];
      let d = Math.atan2(cameraPoint.z, cameraPoint.x) - state.tAz;
      state.tAz += Math.atan2(Math.sin(d), Math.cos(d));
    }
  }
  planets.forEach((p) => {
    const button = document.createElement('button');
    button.className = 'orbit-tab';
    button.textContent = code(p.i);
    button.style.setProperty('--planet-color', p.cell.color || '#b8cdc4');
    button.setAttribute('aria-label', `${code(p.i)} · ${shortTitle(p.cell.title)}`);
    button.setAttribute('aria-pressed', 'false');
    button.disabled = !p.open;
    button.addEventListener('click', () => show(p, true));
    button.addEventListener('pointerenter', () => { state.uiHover = p; });
    button.addEventListener('pointerleave', () => { state.uiHover = null; });
    button.addEventListener('focus', () => { state.uiHover = p; });
    button.addEventListener('blur', () => { state.uiHover = null; });
    tabs.appendChild(button); buttons.set(p, button);
  });
  show(selected);
  land.addEventListener('click', () => { if (selected?.open) enter(selected); });
  document.querySelector('#btn-explore').addEventListener('click', (e) => onExplore(e.currentTarget));

  const motion = document.querySelector('#btn-motion');
  let userCalm = false;
  try { userCalm = localStorage.getItem('nebula-calm') === 'true'; } catch (e) { /* Storage may be disabled. */ }
  const updateMotion = () => {
    const calm = motionQuery.matches || userCalm;
    document.body.classList.toggle('calm', calm);
    motion.setAttribute('aria-pressed', String(calm));
    motion.disabled = motionQuery.matches;
    motion.querySelector('[data-home-copy]').textContent = homeWord(motionQuery.matches ? 'system' : calm ? 'resume' : 'motion');
    motion.querySelector('.motion-icon').textContent = calm ? '▷' : 'Ⅱ';
    onMotion(calm);
  };
  motion.addEventListener('click', () => {
    userCalm = !userCalm;
    try { localStorage.setItem('nebula-calm', String(userCalm)); } catch (e) { /* In-memory choice still works. */ }
    updateMotion();
  });
  motionQuery.addEventListener('change', updateMotion);
  updateMotion();
  return { show };
}
