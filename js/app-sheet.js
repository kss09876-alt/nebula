// Bottom-sheet lifecycle: one close timer, cancellable transitions, focus containment.
export function createAppSheet({ stopVideos, translate, onChange, background, returnFocus, motionQuery = matchMedia('(prefers-reduced-motion: reduce)') }) {
  const backdrop = document.createElement('div'); backdrop.className = 'sheet-bg'; backdrop.hidden = true;
  const element = document.createElement('section'); element.className = 'sheet'; element.hidden = true;
  element.setAttribute('role', 'dialog'); element.setAttribute('aria-modal', 'true'); element.tabIndex = -1;
  document.body.append(backdrop, element);
  let timer = 0, raf = 0, generation = 0, trigger = null, startY = null, drag = 0, closing = false;

  function resetDrag() { startY = null; drag = 0; element.style.transform = ''; }
  function setBackground(inert) { background.forEach((el) => { el.inert = inert; }); }
  function close({ restoreFocus = true } = {}) {
    if (element.hidden || closing) return;
    const token = ++generation; closing = true;
    cancelAnimationFrame(raf); clearTimeout(timer); stopVideos(); resetDrag();
    element.classList.remove('in'); backdrop.classList.remove('in');
    timer = setTimeout(() => {
      if (token !== generation) return;
      timer = 0; closing = false; element.hidden = backdrop.hidden = true; element.innerHTML = '';
      document.body.classList.remove('sheet-open'); setBackground(false);
      onChange();
      if (restoreFocus) (trigger?.isConnected ? trigger : returnFocus())?.focus({ preventScroll: true });
      trigger = null;
    }, motionQuery.matches ? 0 : 320);
  }
  function open(html, className = '') {
    const wasHidden = element.hidden;
    ++generation; clearTimeout(timer); timer = 0; cancelAnimationFrame(raf); closing = false; resetDrag(); stopVideos();
    if (wasHidden) trigger = document.activeElement;
    element.className = `sheet ${className}`;
    element.innerHTML = `<i class="grab" aria-hidden="true"></i><button class="sheet-x" data-close aria-label="${translate('닫기')}">×</button>${html}`;
    element.setAttribute('aria-label', element.querySelector('h3,h2')?.textContent || translate('전시'));
    element.hidden = backdrop.hidden = false; element.scrollTop = 0;
    document.body.classList.add('sheet-open'); setBackground(true); element.focus({ preventScroll: true });
    const token = generation;
    raf = requestAnimationFrame(() => { raf = 0; if (token === generation) { element.classList.add('in'); backdrop.classList.add('in'); } });
    onChange(); return element;
  }
  backdrop.addEventListener('click', () => close());
  element.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) close(); });
  element.addEventListener('touchstart', (e) => { startY = element.scrollTop <= 0 && e.touches.length === 1 ? e.touches[0].clientY : null; }, { passive: true });
  element.addEventListener('touchmove', (e) => { if (startY != null && e.touches.length === 1) { drag = Math.max(0, e.touches[0].clientY - startY); element.style.transform = `translateY(${drag}px)`; } }, { passive: true });
  element.addEventListener('touchend', () => { const dismiss = drag > 90; resetDrag(); if (dismiss) close(); });
  element.addEventListener('touchcancel', resetDrag);
  document.addEventListener('keydown', (e) => {
    if (element.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key !== 'Tab') return;
    const items = [...element.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]')].filter((el) => el.getClientRects().length);
    const first = items[0], last = items.at(-1);
    if (!first) { e.preventDefault(); return; }
    if (e.shiftKey && (document.activeElement === first || !items.includes(document.activeElement))) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (document.activeElement === last || !items.includes(document.activeElement))) { e.preventDefault(); first.focus(); }
  });
  return { open, close, get isOpen() { return !element.hidden; }, get revision() { return generation; }, el: element };
}
