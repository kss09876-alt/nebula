// 웹 '컬렉트' 페이지 (collect.html) — 앱의 컬렉트 탭과 같은 화면·같은 소장 흐름을 웹에서도.
// ?cell=c005 → 그 전시의 작품만, ?work=w001 → 작품 상세를 바로 엶, #orders → 소장 내역(결제 후 돌아올 때)
import * as SHOP from './app-shop.js?v=3';
import { createAppSheet } from './app-sheet.js?v=2';
import { loadLocalData } from './data.js?v=27';
import { lang } from './i18n.js?v=6';

document.documentElement.lang = lang;
const view = document.getElementById('view'), toastEl = document.getElementById('toast');
function toast(m) { toastEl.textContent = m; toastEl.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => { toastEl.hidden = true; }, 2600); }
const sheet = createAppSheet({ stopVideos: () => {}, translate: (k) => ({ '닫기': SHOP.st('close') }[k] || k), onChange: () => {}, background: [view], returnFocus: () => view });
const q = new URLSearchParams(location.search);
document.getElementById('cw-back').textContent = '← ' + SHOP.st('back');

let cells = [];
const cellUrl = (id) => { const c = cells.find((x) => x.id === id); return (c && c.url) || `cell.html?id=${encodeURIComponent(id)}`; };
function render() {
  view.innerHTML = SHOP.screenHTML('') + SHOP.myHTML();
}
function refresh() { const y = scrollY; render(); scrollTo(0, y); }
function onClick(e) {
  if (SHOP.shopAction(e, { sheet, toast, refresh })) return;
  const d = e.target.closest('[data-detail]'); // 작품 상세의 '관련 전시 보기' → 웹 전시 페이지로
  if (d && e.currentTarget.contains(d)) location.href = cellUrl(d.dataset.detail);
}
view.addEventListener('click', onClick);
sheet.el.addEventListener('click', onClick);
sheet.el.addEventListener('submit', (e) => SHOP.shopSubmit(e, { sheet, toast, refresh }));

SHOP.setCellFilter(q.get('cell'));
await SHOP.loadShop();
render();
loadLocalData().then((d) => { cells = (d && d.cells) || []; }).catch(() => {});
if (q.get('cell')) document.getElementById('sp-results')?.closest('.sec')?.scrollIntoView({ block: 'start' });
if (q.get('work')) SHOP.openWork(sheet, q.get('work'));
if (location.hash === '#orders') { history.replaceState(null, '', location.pathname + location.search); SHOP.openOrders(sheet); }
