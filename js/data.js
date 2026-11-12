import { CONFIG } from './config.js?v=18';
import { lang, tr } from './i18n.js?v=5';

// 응답 본문을 읽는 동안에도 제한 시간을 유지 (느린 연결에서 시작이 멈추지 않게)
async function fetchBody(url, type, timeout, label = 'data') {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(label + ' ' + res.status);
    return await res[type]();
  } finally {
    clearTimeout(timer);
  }
}

// 공개 구글 시트를 gviz JSON 엔드포인트로 읽어 [{col: value}] 배열로 변환
async function fetchSheet(id) {
  const url = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:json&headers=1&t=${Date.now()}`;
  const txt = await fetchBody(url, 'text', 8000, 'sheet');
  const json = JSON.parse(txt.slice(txt.indexOf('{'), txt.lastIndexOf('}') + 1));
  if (json.status === 'error') throw new Error('sheet error');
  const cols = json.table.cols.map((c) => (c.label || c.id || '').trim());
  return json.table.rows.map((r) =>
    Object.fromEntries(cols.map((c, i) => {
      const cell = r.c[i];
      const v = cell ? (cell.v ?? cell.f ?? '') : '';
      return [c, String(v).trim()];
    }))
  );
}

let fallbackPromise, translationsPromise;
function fetchFallback() {
  if (!fallbackPromise) {
    fallbackPromise = fetchBody(CONFIG.fallbackUrl, 'json', 5000).then((fb) => {
      if (!Array.isArray(fb.cells) || !Array.isArray(fb.blocks)) throw new Error('invalid fallback');
      return fb;
    }).catch((e) => { fallbackPromise = undefined; throw e; });
  }
  return fallbackPromise;
}
function fetchTranslations() {
  if (lang === 'ko') return Promise.resolve({});
  if (!translationsPromise) {
    translationsPromise = fetchBody('data/i18n.json?v=1', 'json', 5000).catch((e) => {
      translationsPromise = undefined;
      throw e;
    });
  }
  // 번역 실패는 원문으로 표시하되 다음 요청 때 다시 시도
  return translationsPromise.catch(() => ({}));
}

// 로컬 시작은 라이브 캐시를 채우지 않음: 뒤에서 CMS를 반드시 새로 읽음
export async function loadLocalData() {
  const translations = fetchTranslations();
  const fb = await fetchFallback();
  return prepareData(fb.cells, fb.blocks, 'fallback', translations);
}

let cache, pending;
export async function loadData() {
  if (cache) return cache;
  if (!pending) pending = loadLiveData().then((data) => {
    cache = data;
    return data;
  }).finally(() => { pending = undefined; });
  return pending;
}

async function loadLiveData() {
  const translations = fetchTranslations();
  let cells, blocks, source = 'drive';
  try {
    [cells, blocks] = await Promise.all([fetchSheet(CONFIG.cellsSheetId), fetchSheet(CONFIG.blocksSheetId)]);
    if (!cells.length || !('id' in cells[0])) throw new Error('empty');
    // 시트에 아직 블록이 입력되지 않은 전시는 저장소의 백업 데이터로 채움 (새 전시 미리 공개용)
    try {
      const fb = await fetchFallback();
      const has = new Set(blocks.map((b) => b.cell_id));
      fb.cells.forEach((fc) => {
        if (has.has(fc.id)) return;
        const fbBlocks = fb.blocks.filter((b) => b.cell_id === fc.id);
        if (!fbBlocks.length) return;
        const i = cells.findIndex((c) => c.id === fc.id);
        if (i >= 0) cells[i] = { ...cells[i], ...fc }; else cells.push(fc);
        blocks = blocks.concat(fbBlocks);
      });
      // 저장소에서 추가한 체험 블록(extra)은 시트에 같은 종류가 없으면 함께 보여줌 (order에 소수를 써서 사이에 끼움)
      fb.blocks.filter((b) => b.extra && !blocks.some((x) => x.cell_id === b.cell_id && x.type === b.type)).forEach((b) => blocks.push(b));
    } catch (e2) {}
  } catch (e) {
    console.warn('[NEBULA] 드라이브 시트를 읽지 못해 백업 데이터를 사용합니다:', e.message);
    const fb = await fetchFallback();
    cells = fb.cells; blocks = fb.blocks; source = 'fallback';
  }
  return prepareData(cells, blocks, source, translations);
}

// 메모된 원본에 제목·그룹 역참조가 섞이지 않도록 행을 복사한 뒤 공통 처리
async function prepareData(cellRows, blockRows, source, translations) {
  let cells = cellRows.map((c) => ({ ...c }))
    .filter((c) => c.id && c.status !== 'hidden')
    .sort((a, b) => Number(a.order) - Number(b.order));
  let blocks = blockRows.map((b) => ({ ...b }))
    .filter((b) => b.cell_id).sort((a, b) => Number(a.order) - Number(b.order));
  // 다국어: 시트의 title_en 같은 칸 → data/i18n.json → 한국어 원문 순서로 사용
  if (lang !== 'ko') {
    const tx = (await translations) || {};
    const loc = (row, fields, t) => { const o = { ...row }; fields.forEach((f) => { const own = row[`${f}_${lang}`]; o[f] = own != null && String(own).trim() !== '' ? own : (t && t[f]) || row[f]; }); return o; };
    cells = cells.map((c) => loc(c, ['title', 'subtitle', 'artist', 'period'], tx.cells?.[c.id]?.[lang]));
    blocks = blocks.map((b) => loc(b, ['title', 'body', 'caption'], tx.blocks?.[`${b.cell_id}:${b.order}`]?.[lang]));
  }
  // 기획전 묶기: 멤버 전시는 행성 목록에서 빠지고, 첫 멤버 자리에 기획전 행성이 들어감
  const all = cells.slice(), top = [];
  const groups = (CONFIG.groups || []).map((g) => ({ ...g, members: [...g.members], title: tr(g.title), subtitle: tr(g.subtitle), artist: tr(g.artist), status: 'open', isGroup: true, rooms: [] }));
  cells.forEach((c) => {
    const g = groups.find((x) => x.members.includes(c.id));
    if (!g) { top.push(c); return; }
    if (!g.rooms.length) top.push(g);
    g.rooms.push(c);
  });
  groups.forEach((g) => g.rooms.sort((a, b) => g.members.indexOf(a.id) - g.members.indexOf(b.id)));
  // 번호 다시 매기기 (N-001, N-002 …), 중복된 구/신 번호도 한 번에 제거
  const shortTitle = (title) => String(title || '').replace(/^\s*(?:(?:CELL|X|N)[-\s]?\d+(?:-\d+)?\s*[·:|-]\s*)+/i, '');
  top.forEach((c, i) => {
    const code = 'N-' + String(i + 1).padStart(3, '0');
    c.code = code;
    c.title = `${code} · ${shortTitle(c.title)}`;
    if (c.isGroup) g_rooms(c, code);
  });
  function g_rooms(g, code) {
    g.rooms.forEach((r, k) => {
      r.group = g; r.room = k + 1; r.code = `${code}-${k + 1}`;
      r.short = shortTitle(r.title);
      r.title = `${g.title} · ROOM ${String(k + 1).padStart(2, '0')} — ${r.short}`;
    });
  }
  return { cells: top, all, groups, blocks, source };
}

// 드라이브 파일 ID / 공유 링크 / 일반 URL → 이미지 URL
export function driveId(v) {
  if (!v) return '';
  const m = String(v).match(/\/d\/([\w-]{20,})/) || String(v).match(/[?&]id=([\w-]{20,})/);
  if (m) return m[1];
  if (/^[\w-]{20,}$/.test(v)) return v;
  return '';
}
export function imageUrl(v, w = 2000) {
  if (!v) return '';
  const id = driveId(v);
  if (id) return `https://lh3.googleusercontent.com/d/${id}=w${w}`;
  return v;
}
export function videoEmbed(v) {
  if (!v) return '';
  const yt = String(v).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0`;
  const vm = String(v).match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  const id = driveId(v);
  if (id) return `https://drive.google.com/file/d/${id}/preview`;
  return v;
}
export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
export function paras(s) {
  return String(s ?? '').split(/\n+/).filter(Boolean).map((p) => `<p>${esc(p)}</p>`).join('');
}
