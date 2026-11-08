import { lang } from './i18n.js?v=4';

// Local copy is intentional: new discovery strings never fall back to Korean
// through the parent app's smaller translation dictionary.
const COPY = {
  ko: {
    heading: '전시 탐색', search: '전시 검색', placeholder: '제목, 작가, 설명 검색',
    clear: '검색어 지우기', filters: '전시 필터', all: '전체', open: '공개',
    coming: '예정', liked: '좋아요', sort: '정렬', editorial: '편집 순서',
    title: '제목순', recent: '역순', count: '{n}개의 전시',
    empty: '조건에 맞는 전시가 없어요.', hint: '다른 검색어나 필터로 찾아보세요.',
    reset: '검색·필터 초기화', untitled: '제목 없는 전시', closed: '종료',
    unavailable: '미공개',
  },
  en: {
    heading: 'Discover exhibitions', search: 'Search exhibitions', placeholder: 'Search titles, artists, descriptions',
    clear: 'Clear search', filters: 'Exhibition filters', all: 'All', open: 'Open',
    coming: 'Coming soon', liked: 'Liked', sort: 'Sort', editorial: 'Editorial order',
    title: 'Title', recent: 'Reverse order', count: '{n} exhibitions',
    empty: 'No exhibitions match.', hint: 'Try another search or filter.',
    reset: 'Reset search and filters', untitled: 'Untitled exhibition', closed: 'Closed',
    unavailable: 'Not open',
  },
  zh: {
    heading: '探索展览', search: '搜索展览', placeholder: '搜索标题、艺术家、说明',
    clear: '清除搜索', filters: '展览筛选', all: '全部', open: '开放',
    coming: '即将开放', liked: '喜欢', sort: '排序', editorial: '编辑顺序',
    title: '标题顺序', recent: '逆序', count: '{n} 个展览',
    empty: '没有符合条件的展览。', hint: '试试其他关键词或筛选条件。',
    reset: '重置搜索与筛选', untitled: '无标题展览', closed: '已结束',
    unavailable: '未开放',
  },
  ja: {
    heading: '展示を探す', search: '展示を検索', placeholder: 'タイトル・作家・説明を検索',
    clear: '検索語を消去', filters: '展示の絞り込み', all: 'すべて', open: '公開',
    coming: '予定', liked: 'いいね', sort: '並び替え', editorial: '編集順',
    title: 'タイトル順', recent: '逆順', count: '展示 {n} 件',
    empty: '条件に合う展示がありません。', hint: '別の検索語や条件をお試しください。',
    reset: '検索・絞り込みをリセット', untitled: 'タイトルのない展示', closed: '終了',
    unavailable: '未公開',
  },
};
const FILTERS = ['all', 'open', 'coming', 'liked'];
const SORTS = ['editorial', 'title', 'recent'];
const normalize = (value) => String(value ?? '').normalize('NFKC').toLocaleLowerCase(lang).trim();

/**
 * One controller per shared sheet. The parent handles data-detail card clicks.
 * Every explicit open starts a fresh query/editorial order and applies its
 * requested filter; focusSearch is opt-in to avoid opening mobile keyboards.
 * The supplied t remains part of the shared helper API; COPY owns all UI text.
 */
export function createAppDiscover({ sheet, getCells, getLikes, name, planetSrc, planetKey, esc, t }) {
  const copy = COPY[lang] || COPY.en;
  let query = '', filter = 'all', sort = 'editorial';
  const text = (key) => esc(copy[key]);
  const active = () => sheet.isOpen && sheet.el.classList.contains('discover');
  const titleOf = (cell) => String(name(cell) || copy.untitled);
  const statusOf = (cell) => {
    if (cell.status === 'open') return 'open';
    if (cell.status === 'coming') return 'coming';
    if (['closed', 'ended', 'archived'].includes(cell.status)) return 'closed';
    return 'unavailable';
  };

  function results() {
    const data = getCells();
    const cells = Array.isArray(data) ? data.filter((cell) => cell && typeof cell.id === 'string') : [];
    const liked = getLikes();
    const likes = new Set(Array.isArray(liked) ? liked : []);
    const tokens = normalize(query).split(/\s+/u).filter(Boolean);
    const found = cells.filter((cell) => {
      if (filter === 'open' && cell.status !== 'open') return false;
      if (filter === 'coming' && cell.status !== 'coming') return false;
      if (filter === 'liked' && !likes.has(cell.id)) return false;
      const haystack = [name(cell), cell.artist, cell.subtitle, cell.summary].map(normalize).join(' ');
      return tokens.every((token) => haystack.includes(token));
    });
    if (sort === 'title') found.sort((a, b) => titleOf(a).localeCompare(titleOf(b), lang, { sensitivity: 'base', numeric: true }));
    // CMS dates are not guaranteed: reverse editorial order, not “latest”.
    if (sort === 'recent') found.reverse();
    return found;
  }

  function card(cell) {
    const status = statusOf(cell);
    return `<button type="button" class="nb-discover-card" data-detail="${esc(cell.id)}">
      <img class="pl" data-pl="${esc(planetKey(cell))}" src="${esc(planetSrc(cell))}" decoding="async" alt="" loading="lazy" draggable="false">
      <span class="nb-discover-card-copy"><span class="nb-discover-code">${esc(cell.code || '')}</span>
        <b class="nb-discover-title">${esc(titleOf(cell))}</b>
        <span class="nb-discover-artist">${esc(cell.artist || '')}</span></span>
      <span class="nb-status ${status}" data-status="${status}">${text(status)}</span>
    </button>`;
  }

  function renderResults() {
    if (!active()) return;
    const container = sheet.el.querySelector('.nb-discover-results');
    if (!container) return;
    const found = results();
    container.innerHTML = found.length ? found.map(card).join('') : `<div class="nb-discover-empty">
      <p>${text('empty')}</p><p>${text('hint')}</p>
      <button type="button" class="btn" data-discover-reset>${text('reset')}</button>
    </div>`;
    sheet.el.querySelector('.nb-discover-count').textContent = copy.count.replace('{n}', found.length.toLocaleString(lang));
    sheet.el.querySelectorAll('[data-discover-filter]').forEach((button) => {
      const pressed = button.dataset.discoverFilter === filter;
      button.setAttribute('aria-pressed', String(pressed));
      button.classList.toggle('on', pressed);
    });
    sheet.el.querySelector('[data-discover-clear]').hidden = !query;
    // Do not replace the search input or reset sheet scroll during updates.
  }

  function readQuery(event) {
    if (!active() || event.target !== sheet.el.querySelector('#discover-search')) return;
    query = event.target.value;
    renderResults();
  }
  // Installed once, rather than on each sheet opening. Current nodes/state are
  // resolved on every event so replaced sheets cannot retain stale references.
  sheet.el.addEventListener('input', readQuery);
  sheet.el.addEventListener('search', readQuery);
  sheet.el.addEventListener('change', (event) => {
    if (!active() || event.target !== sheet.el.querySelector('#discover-sort')) return;
    sort = SORTS.includes(event.target.value) ? event.target.value : 'editorial';
    renderResults();
  });
  sheet.el.addEventListener('click', (event) => {
    if (!active()) return;
    const button = event.target.closest?.('[data-discover-filter], [data-discover-clear], [data-discover-reset]');
    if (!button || !sheet.el.contains(button)) return;
    if (button.hasAttribute('data-discover-filter')) {
      filter = FILTERS.includes(button.dataset.discoverFilter) ? button.dataset.discoverFilter : 'all';
      renderResults();
      return;
    }
    query = '';
    const input = sheet.el.querySelector('#discover-search');
    input.value = '';
    if (button.hasAttribute('data-discover-reset')) {
      filter = 'all';
      sort = 'editorial';
      sheet.el.querySelector('#discover-sort').value = sort;
    }
    renderResults();
    input.focus({ preventScroll: true });
  });

  function open(nextFilter = 'all', focusSearch = false) {
    query = '';
    filter = FILTERS.includes(nextFilter) ? nextFilter : 'all';
    sort = 'editorial';
    sheet.open(`<div class="nb-discover-head sh-h"><h3>${text('heading')}</h3></div>
      <div class="nb-search-field">
        <label for="discover-search">${text('search')}</label>
        <div class="nb-search-input"><input id="discover-search" type="search" value="" placeholder="${text('placeholder')}" autocomplete="off" spellcheck="false" aria-controls="discover-results">
          <button type="button" data-discover-clear aria-label="${text('clear')}" hidden>×</button></div>
      </div>
      <div class="nb-discover-filters" role="group" aria-label="${text('filters')}">
        ${FILTERS.map((key) => `<button type="button" data-discover-filter="${key}" aria-pressed="${key === filter}">${text(key)}</button>`).join('')}
      </div>
      <div class="nb-discover-meta">
        <span class="nb-discover-count" role="status" aria-live="polite" aria-atomic="true"></span>
        <label for="discover-sort">${text('sort')}</label>
        <select id="discover-sort" aria-controls="discover-results">${SORTS.map((key) => `<option value="${key}">${text(key)}</option>`).join('')}</select>
      </div>
      <div id="discover-results" class="nb-discover-results"></div>`, 'discover');
    renderResults();
    if (focusSearch && active()) sheet.el.querySelector('#discover-search')?.focus({ preventScroll: true });
  }

  return { open };
}
