export function createExhibitShare({ sheet, name, esc, t, lang, toast }) {
  let currentURL = '', request = 0;
  function linkFor(cell) {
    const url = new URL(location.href);
    url.search = ''; url.searchParams.set('lang', lang);
    url.hash = `open=${encodeURIComponent(cell.id)}`;
    return url.href;
  }
  function showLink(cell, url) {
    currentURL = url;
    sheet.open(`<div class="sh-h"><h3>${t('공유하기')}</h3></div><div class="nb-share-panel"><p>${esc(name(cell))}</p><label class="small" for="share-link">${t('링크를 길게 눌러 복사해 주세요.')}</label><div class="nb-share-field"><input id="share-link" type="url" readonly value="${esc(url)}" /><button data-copy-link>${t('링크 복사')}</button></div></div>`, 'share');
    const input = sheet.el.querySelector('#share-link');
    input.addEventListener('focus', () => input.select());
  }
  async function copy(url) {
    if (!navigator.clipboard?.writeText) return false;
    try { await navigator.clipboard.writeText(url); toast(t('링크를 복사했어요.')); return true; }
    catch { return false; }
  }
  async function share(cell) {
    const token = ++request, revision = sheet.revision;
    const isCurrent = () => token === request && sheet.isOpen && sheet.revision === revision;
    const url = linkFor(cell);
    if (navigator.share) {
      try { await navigator.share({ title: `NEBULA · ${name(cell)}`, text: name(cell), url }); return; }
      catch (error) { if (error.name === 'AbortError') return; }
    }
    if (!isCurrent()) return;
    if (!await copy(url) && isCurrent()) showLink(cell, url);
  }
  sheet.el.addEventListener('click', async (event) => {
    if (!event.target.closest('[data-copy-link]') || !sheet.el.classList.contains('share')) return;
    if (!await copy(currentURL)) {
      const input = sheet.el.querySelector('#share-link'); input?.focus(); input?.select();
    }
  });
  return { share, linkFor };
}
