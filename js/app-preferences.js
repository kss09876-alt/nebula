// Keep legacy data keys; share the existing home calm preference without migrations.
export function createMotionPreference() {
  const system = matchMedia('(prefers-reduced-motion: reduce)');
  const events = new EventTarget();
  let requested = false;
  try { requested = localStorage.getItem('nebula-calm') === 'true'; } catch {}
  function sync() {
    document.body.classList.toggle('nebula-calm', system.matches || requested);
    events.dispatchEvent(new Event('change'));
  }
  system.addEventListener('change', sync);
  addEventListener('storage', (event) => {
    if (event.key !== 'nebula-calm' && event.key !== null) return;
    try { requested = localStorage.getItem('nebula-calm') === 'true'; } catch {}
    sync();
  });
  document.body.classList.toggle('nebula-calm', system.matches || requested);
  return {
    get matches() { return system.matches || requested; },
    get requested() { return requested; },
    get systemReduced() { return system.matches; },
    setReduced(value) {
      requested = Boolean(value);
      try { localStorage.setItem('nebula-calm', String(requested)); } catch {}
      sync();
    },
    addEventListener(...args) { events.addEventListener(...args); },
    removeEventListener(...args) { events.removeEventListener(...args); },
  };
}
