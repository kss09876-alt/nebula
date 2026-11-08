// N-001: one continuous story, with distinct desktop and mobile/app input.
import { lang, LANGS } from './i18n.js?v=4';
import { getFirstStory } from './first-story.js?v=2';
import { getDeviceCopy } from './first-device-copy.js?v=2';
import { createMotionPreference } from './app-preferences.js?v=1';
import { createFirstCanvas } from './first-canvas.js?v=3';
import { createFirstSound } from './first-sound.js?v=2';
import { createMobileSensors } from './first-mobile-sensors.js?v=1';

const story = getFirstStory(lang), ui = story.ui, device = getDeviceCopy(lang);
const isApp = document.body.classList.contains('first-app');
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const $ = (selector) => document.querySelector(selector);
const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5"/></svg>';
const star = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2 6 7 3-7 2-2 7-2-7-7-2 7-3z"/></svg>';
const motionQuery = createMotionPreference();
if (isApp && window.self !== window.top) document.body.classList.add('is-embedded');
document.title = `N-001 · ${story.title} — NEBULA`;
$('meta[name="description"]').content = story.summary;
$('.journey-skip').textContent = ui.readingOnly;
$('.journey-brand').setAttribute('aria-label', `NEBULA · ${ui.home}`);
$('.journey-brand').href = `./?lang=${encodeURIComponent(lang)}`;
const language = $('#journey-language');
language.innerHTML = LANGS.map((item) => `<option value="${item.id}">${esc(item.short)}</option>`).join('');
language.value = lang; language.setAttribute('aria-label', LANGS.find((item) => item.id === lang)?.name || 'Language');
language.addEventListener('change', () => {
  try { localStorage.setItem('xpace-lang', language.value); } catch {}
  const url = new URL(location.href); url.searchParams.set('lang', language.value);
  location.assign(url.pathname + url.search + url.hash);
});

function interaction(scene, index) {
  const heading = (text) => `<div class="interaction-heading"><span class="interaction-step">${String(index + 1).padStart(2, '0')} / EXPERIENCE</span><p>${esc(text)}</p></div>`;
  if (scene.interaction === 'tilt') return `<div class="journey-interaction" data-experience="tilt">
    ${heading(isApp ? device.tiltMobile : device.tiltDesktop)}
    <div id="gesture-surface" class="interaction-surface" tabindex="0" role="group" aria-label="${esc(device.tiltSurface)}"><div class="interaction-orb" aria-hidden="true"><i></i></div><span class="interaction-surface-label">${esc(device.tiltSurface)}</span></div>
    <div class="interaction-actions"><button id="gesture-reset" type="button">${esc(device.tiltReset)}</button></div><p id="tilt-state" class="interaction-status" role="status"></p></div>`;
  if (scene.interaction === 'gather') return `<div class="journey-interaction" data-experience="gather">
    ${heading(isApp ? device.gatherMobile : device.gatherDesktop)}<div class="interaction-actions"><button id="birth-button" class="journey-action" type="button"><span>${esc(device.gatherAction)}</span>${star}</button></div><p id="birth-state" class="interaction-status" role="status"></p><p class="interaction-note">${esc(ui.quiet)}</p></div>`;
  if (scene.interaction === 'breath') return `<div class="journey-interaction" data-experience="breath">
    ${heading(isApp ? device.breathMobile : device.breathDesktop)}<div class="interaction-actions">${isApp ? `<button id="mic-toggle" type="button" aria-pressed="false">${esc(device.micOn)}</button>` : ''}<button id="breath-button" type="button">${esc(device.pulse)}</button></div><p id="breath-state" class="interaction-status" role="status"></p>${isApp ? `<p id="mic-state" class="interaction-status" role="status">${esc(device.micDisabled)}</p><p class="interaction-note">${esc(device.micPrivacy)}</p>` : `<p class="interaction-note">${esc(ui.quiet)}</p>`}</div>`;
  if (scene.interaction === 'pause') return `<div class="journey-interaction" data-experience="pause">
    ${heading(isApp ? device.pauseMobile : device.pauseDesktop)}<div class="interaction-actions"><button id="quiet-button" type="button" aria-pressed="false">${esc(device.pauseAction)}</button></div><p id="quiet-state" class="interaction-status" role="status"></p></div>`;
  if (scene.interaction === 'trace') return `<div class="journey-trace-wrap"><p class="journey-side-note">${esc(isApp ? device.traceMobile : device.traceDesktop)}</p><div id="trace-surface" class="journey-trace-surface" tabindex="0" role="group" aria-label="${esc(ui.traceLabel)}"></div><div class="journey-trace-controls"><button id="trace-add" type="button">${esc(ui.traceAdd)}</button><button id="trace-reset" type="button" disabled>${esc(ui.traceReset)}</button><p id="trace-state" role="status">${esc(ui.traceCount.replace('{n}', '0'))}</p></div><p class="journey-side-note">${esc(ui.privacyNote)}</p></div>`;
  return '';
}
function opening() {
  const alternative = `${isApp ? 'first.html' : 'first-app.html'}?lang=${encodeURIComponent(lang)}`;
  return `<div class="journey-opening-meta"><span>NEBULA · ${esc(story.title)}</span></div><p class="journey-mode-label">${esc(isApp ? device.mobileMode : device.desktopMode)}</p><a class="journey-mode-switch" href="${alternative}">${esc(isApp ? device.switchDesktop : device.switchMobile)} ↗</a>${isApp ? `<div class="journey-sensor-intro" data-sensor-state="disabled"><strong>${esc(device.sensorTitle)}</strong><p>${esc(device.sensorIntro)}</p><div class="interaction-actions"><button id="sensor-toggle" type="button" aria-pressed="false">${esc(device.sensorOn)}</button></div><p id="sensor-state" class="journey-sensor-status" role="status">${esc(device.sensorDisabled)}</p><p class="interaction-note">${esc(device.sensorPrivacy)}</p></div>` : ''}<a class="journey-start" href="#nebula" aria-label="${esc(ui.startLabel)}">${esc(ui.scrollCue)} ${arrow}</a>`;
}
$('#journey-story').innerHTML = story.scenes.map((scene, index) => {
  const open = index === 0, ending = index === story.scenes.length - 1;
  return `<section class="journey-scene${open ? ' is-opening' : ''}${ending ? ' is-ending' : ''}" id="${esc(scene.id)}" data-scene="${index}" tabindex="-1"><div class="journey-copy"><p class="journey-kicker"><span class="scene-number">N-001</span>${esc(scene.eyebrow)}</p><${open ? 'h1' : 'h2'}>${esc(scene.title)}</${open ? 'h1' : 'h2'}><div class="journey-paragraphs">${scene.paragraphs.map((paragraph) => `<p>${esc(paragraph)}</p>`).join('')}</div>${open ? opening() : ''}${interaction(scene, index)}${ending ? `<div class="journey-ending-links"><a class="journey-home" href="./?lang=${encodeURIComponent(lang)}">${esc(ui.home)} ↗</a><button id="journey-restart" type="button">${esc(ui.start)}</button></div>` : ''}</div></section>`;
}).join('');
const footer = $('.journey-afterword'); footer.hidden = false;
footer.innerHTML = `<details class="journey-sources"><summary>${esc(ui.sources)}</summary><p>${esc(ui.sourcesNote)}</p><ul>${story.references.map((reference) => `<li><a href="${esc(reference.url)}" target="_blank" rel="noopener noreferrer">${esc(reference.title)} ↗</a></li>`).join('')}</ul></details><p class="journey-creative">${esc(ui.creativeNote)}</p>`;
const progress = $('.journey-progress'); progress.hidden = false; progress.setAttribute('aria-label', ui.progressLabel);
const next = $('#journey-next'); next.querySelector('span').textContent = ui.next;
const scenes = [...document.querySelectorAll('.journey-scene')];
const traceSurface = $('#trace-surface'), traceState = $('#trace-state');
const gestureSurface = $('#gesture-surface'), orb = gestureSurface?.querySelector('.interaction-orb');
const art = createFirstCanvas($('#journey-canvas'), { motionQuery });
let active = -1, measureFrame = 0, trace = [], birthTimer = 0, pointer = { x: 0, y: 0 };
let hostActive = true, pageActive = true, quiet = false, quietSource = null, sensorFaceDown = false;
let sensorControl = null, micRequested = false, micRequestVersion = 0, motionRequested = false, motionRequestVersion = 0;
const soundButton = $('#sound-toggle');
const sound = createFirstSound((enabled) => {
  soundButton.setAttribute('aria-pressed', String(enabled));
  const label = enabled ? ui.soundOff : ui.soundOn;
  soundButton.setAttribute('aria-label', label); soundButton.querySelector('span').textContent = label;
});
soundButton.querySelector('span').textContent = ui.soundOn; soundButton.setAttribute('aria-label', ui.soundOn);
soundButton.addEventListener('click', () => { void sound.toggle(); });

function setPoint(x, y, announce = false) {
  pointer = { x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) };
  if (orb) orb.style.transform = `translate3d(${pointer.x * 36}px, ${pointer.y * 24}px, 0)`;
  art.update({ pointer });
  if (announce && $('#tilt-state')) $('#tilt-state').textContent = device.tiltResult;
}
function birth() {
  clearTimeout(birthTimer); art.birth(); sound.respond('gather');
  $('#birth-button span').textContent = device.gatherAgain;
  $('#birth-state').textContent = motionQuery.matches || quiet ? device.gatherDone : '';
  if (!motionQuery.matches && !quiet) birthTimer = setTimeout(() => { $('#birth-state').textContent = device.gatherDone; }, 2800);
}
function pulse() { art.pulse(); sound.respond('light'); $('#breath-state').textContent = device.pulseDone; }
function setQuiet(value, source = 'manual') {
  quiet = Boolean(value); quietSource = quiet ? source : null;
  art.update({ quiet }); sound.setQuiet(quiet);
  const button = $('#quiet-button'); button.setAttribute('aria-pressed', String(quiet));
  button.textContent = quiet ? device.resumeAction : device.pauseAction;
  $('#quiet-state').textContent = quiet ? device.pauseOn : device.pauseOff;
}
function sensorStatus(event = {}) {
  if (event.type === 'motion') {
    const state = event.state;
    const intro = $('.journey-sensor-intro'), button = $('#sensor-toggle'), output = $('#sensor-state');
    if (!intro || !button || !output) return;
    intro.dataset.sensorState = state || 'disabled';
    const on = state === 'enabled' || state === 'paused';
    button.setAttribute('aria-pressed', String(on)); button.textContent = on ? device.sensorOff : device.sensorOn;
    output.textContent = state === 'enabled' ? device.sensorEnabled : state === 'paused' ? device.sensorPaused : state === 'denied' ? device.sensorDenied : state === 'unsupported' ? device.sensorUnsupported : device.sensorDisabled;
  }
  if (event.type === 'microphone') {
    const button = $('#mic-toggle'), output = $('#mic-state'); if (!button || !output) return;
    if (event.state !== 'enabled') {
      if (micRequested) { micRequested = false; micRequestVersion++; }
      button.disabled = !sensorControl?.microphoneAvailable;
    }
    const on = event.state === 'enabled'; button.setAttribute('aria-pressed', String(on)); button.textContent = on ? device.micOff : device.micOn;
    output.textContent = on ? device.micEnabled : event.state === 'paused' ? device.micPaused : event.state === 'denied' || event.state === 'unsupported' ? device.micDenied : device.micDisabled;
  }
}
if (isApp) {
  sensorControl = createMobileSensors({
    onTilt: (x, y) => { if (!motionQuery.matches && story.scenes[active]?.id === 'nebula') setPoint(x, y); },
    onShake: () => {
      if (motionQuery.matches || document.hidden || !hostActive || !pageActive) return;
      if (story.scenes[active]?.id === 'gravity') birth(); else if (story.scenes[active]?.id === 'star') pulse();
    },
    onFaceDown: (down) => {
      if (motionQuery.matches || document.hidden || !hostActive || !pageActive) return;
      sensorFaceDown = down;
      if (down && story.scenes[active]?.id === 'pause') setQuiet(true, 'sensor');
      else if (!down && quietSource === 'sensor') setQuiet(false);
    },
    onBlow: () => { if (story.scenes[active]?.id === 'star') pulse(); }, onStatus: sensorStatus,
  });
  const sensorButton = $('#sensor-toggle');
  if (!sensorControl.motionAvailable) { sensorButton.disabled = true; sensorStatus({ type: 'motion', state: 'unsupported' }); }
  sensorButton.addEventListener('click', async () => {
    if (sensorControl.motionOn || motionRequested) {
      motionRequested = false; motionRequestVersion++; sensorControl.disableMotion();
      sensorFaceDown = false; if (quietSource === 'sensor') setQuiet(false); return;
    }
    if (motionQuery.matches) { $('#sensor-state').textContent = device.sensorCalm; return; }
    $('#sensor-state').textContent = device.sensorLoading;
    const token = ++motionRequestVersion; motionRequested = true;
    // Invocation must remain in the click handler: iOS permission APIs require a user gesture.
    const request = sensorControl.enableMotion(); sensorButton.disabled = true;
    try {
      await request;
      if (token === motionRequestVersion && motionQuery.matches) {
        sensorControl.disableMotion(); $('#sensor-state').textContent = device.sensorCalm;
      }
    } finally {
      if (token === motionRequestVersion) { motionRequested = false; sensorButton.disabled = !sensorControl.motionAvailable; }
    }
  });
  const micButton = $('#mic-toggle');
  if (!sensorControl.microphoneAvailable) { micButton.disabled = true; sensorStatus({ type: 'microphone', state: 'unsupported' }); }
  micButton.addEventListener('click', async () => {
    if (sensorControl.microphoneOn || micRequested) { stopMicrophone(); return; }
    // Focus the requested scene before permission: leaving it cancels even a pending prompt.
    if (story.scenes[active]?.id !== 'star') {
      document.getElementById('star').scrollIntoView({ behavior: 'auto', block: 'start' });
      measure();
    }
    if (story.scenes[active]?.id !== 'star') return;
    micRequested = true; const token = ++micRequestVersion;
    const request = sensorControl.enableMicrophone(); micButton.disabled = true;
    try { await request; } finally {
      if (token === micRequestVersion) micButton.disabled = !sensorControl.microphoneAvailable;
    }
  });
}

function updateMotion() {
  document.body.classList.toggle('journey-calm', motionQuery.matches);
  const button = $('#motion-toggle'), label = motionQuery.matches ? ui.motionOn : ui.motionOff;
  button.disabled = motionQuery.systemReduced; button.setAttribute('aria-pressed', String(motionQuery.matches));
  button.setAttribute('aria-label', motionQuery.systemReduced ? `${ui.motionLabel} · ${ui.motionSystem}` : label);
  button.querySelector('span').textContent = motionQuery.systemReduced ? ui.motionSystem : label;
  if (sensorControl && motionQuery.matches) {
    motionRequested = false; motionRequestVersion++; sensorControl.disableMotion(); sensorFaceDown = false;
    if (quietSource === 'sensor') setQuiet(false);
    $('#sensor-toggle').disabled = !sensorControl.motionAvailable; $('#sensor-state').textContent = device.sensorCalm;
  } else if (sensorControl && !sensorControl.motionOn && !motionRequested) $('#sensor-state').textContent = device.sensorDisabled;
  measure();
}
$('#motion-toggle').addEventListener('click', () => { motionQuery.setReduced(!motionQuery.requested); });
motionQuery.addEventListener('change', updateMotion);
addEventListener('focus', updateMotion);
function measure() {
  measureFrame = 0; if (document.hidden || !hostActive || !pageActive) return;
  const middle = innerHeight * .48, rectangles = scenes.map((scene) => scene.getBoundingClientRect());
  let index = 0; rectangles.forEach((rectangle, i) => { if (rectangle.top <= middle) index = i; });
  const rect = rectangles[index], fraction = Math.max(0, Math.min(1, (middle - rect.top) / rect.height));
  const amount = Math.max(0, Math.min(1, (index + fraction) / scenes.length));
  if (index !== active) {
    const previous = story.scenes[active]?.id, upcoming = story.scenes[index].id;
    if (previous === 'pause' && upcoming !== 'pause' && quiet) setQuiet(false);
    active = index;
    if (upcoming === 'pause' && sensorFaceDown && !motionQuery.matches) setQuiet(true, 'sensor');
    scenes.forEach((scene, i) => scene.classList.toggle('is-active', i === index));
    $('#journey-position').textContent = `${String(index + 1).padStart(2, '0')} / ${String(scenes.length).padStart(2, '0')}`;
    $('#journey-section').textContent = story.scenes[index].title;
    next.disabled = index === scenes.length - 1;
    next.setAttribute('aria-label', index < scenes.length - 1 ? `${ui.next} · ${story.scenes[index + 1].title}` : ui.afterword);
  }
  if (sensorControl && micRequested && story.scenes[index].id !== 'star') stopMicrophone(device.micPaused);
  $('#journey-progress-bar').style.setProperty('--progress', `${amount * 100}%`);
  art.update({ progress: amount, pointer, trace, bounds: traceSurface.getBoundingClientRect() }); sound.setScene(amount);
}
function stopMicrophone(message = '') {
  micRequested = false; micRequestVersion++; sensorControl?.disableMicrophone();
  const button = $('#mic-toggle'); if (button) button.disabled = !sensorControl?.microphoneAvailable;
  if (message && $('#mic-state')) $('#mic-state').textContent = message;
}
function queueMeasure() { if (!measureFrame && !document.hidden && hostActive && pageActive) measureFrame = requestAnimationFrame(measure); }
function visit(index, focus = true) {
  const section = scenes[Math.max(0, Math.min(scenes.length - 1, index))];
  section.scrollIntoView({ behavior: motionQuery.matches ? 'auto' : 'smooth', block: 'start' });
  if (focus) section.focus({ preventScroll: true });
}
next.addEventListener('click', () => { if (active < scenes.length - 1) visit(active + 1); });
$('.journey-start').addEventListener('click', (event) => { event.preventDefault(); visit(1); });
$('#journey-restart').addEventListener('click', () => { visit(0); });
addEventListener('scroll', queueMeasure, { passive: true }); addEventListener('resize', queueMeasure);
addEventListener('pointermove', (event) => {
  if (event.pointerType === 'touch') return;
  setPoint(event.clientX / innerWidth * 2 - 1, event.clientY / innerHeight * 2 - 1);
}, { passive: true });
gestureSurface.addEventListener('pointerdown', (event) => {
  if (event.button !== 0) return;
  const rect = gestureSurface.getBoundingClientRect();
  if (rect.width && rect.height) setPoint((event.clientX - rect.left) / rect.width * 2 - 1, (event.clientY - rect.top) / rect.height * 2 - 1, true);
}, { passive: true });
gestureSurface.addEventListener('keydown', (event) => {
  const delta = .18;
  if (event.key === 'ArrowLeft') setPoint(pointer.x - delta, pointer.y, true);
  else if (event.key === 'ArrowRight') setPoint(pointer.x + delta, pointer.y, true);
  else if (event.key === 'ArrowUp') setPoint(pointer.x, pointer.y - delta, true);
  else if (event.key === 'ArrowDown') setPoint(pointer.x, pointer.y + delta, true);
  else if (event.key === 'Enter' || event.key === ' ') { art.pulse(); sound.respond('light'); $('#tilt-state').textContent = device.tiltResult; }
  else return;
  event.preventDefault();
});
$('#gesture-reset').addEventListener('click', () => setPoint(0, 0, true));
$('#birth-button').addEventListener('click', birth); $('#breath-button').addEventListener('click', pulse);
$('#quiet-button').addEventListener('click', () => setQuiet(!quiet));
function addTrace(point) {
  if (trace.length >= 12) return;
  trace.push(point); traceState.textContent = `${ui.traceCount.replace('{n}', String(trace.length))} · ${ui.traceDone}`;
  $('#trace-reset').disabled = false; $('#trace-add').disabled = trace.length >= 12; sound.respond('trace'); queueMeasure();
}
function addTraceByButton() {
  const angle = trace.length * 2.4, radius = .1 + trace.length % 4 * .08;
  addTrace({ x: .5 + Math.cos(angle) * radius, y: .5 + Math.sin(angle) * radius });
}
$('#trace-add').addEventListener('click', addTraceByButton);
$('#trace-reset').addEventListener('click', () => {
  trace = []; traceState.textContent = ui.traceCount.replace('{n}', '0');
  $('#trace-reset').disabled = true; $('#trace-add').disabled = false; queueMeasure();
});
traceSurface.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); addTraceByButton(); } });
const contacts = new Map(); let multiTouch = false;
traceSurface.addEventListener('pointerdown', (event) => {
  if (event.button !== 0) return;
  contacts.set(event.pointerId, { x: event.clientX, y: event.clientY }); if (contacts.size > 1) multiTouch = true;
});
traceSurface.addEventListener('pointerup', (event) => {
  const origin = contacts.get(event.pointerId), mayAdd = contacts.size === 1 && !multiTouch;
  contacts.delete(event.pointerId);
  if (origin && mayAdd && Math.hypot(event.clientX - origin.x, event.clientY - origin.y) < 10) {
    const rect = traceSurface.getBoundingClientRect();
    if (rect.width && rect.height) addTrace({ x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)), y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)) });
  }
  if (!contacts.size) multiTouch = false;
});
const clearContacts = () => { contacts.clear(); multiTouch = false; };
traceSurface.addEventListener('pointercancel', clearContacts); addEventListener('blur', clearContacts);
function syncActive() {
  const foreground = hostActive && pageActive && !document.hidden;
  sound.setActive(foreground); art.setActive(foreground);
  if (!foreground) {
    if (quietSource === 'sensor') setQuiet(false); sensorFaceDown = false;
    if (motionRequested && sensorControl) {
      motionRequested = false; motionRequestVersion++; sensorControl.disableMotion();
      $('#sensor-toggle').disabled = !sensorControl.motionAvailable;
    }
  }
  sensorControl?.setActive(foreground);
  if (!foreground) { cancelAnimationFrame(measureFrame); measureFrame = 0; clearContacts(); }
  else queueMeasure();
}
document.addEventListener('visibilitychange', syncActive);
addEventListener('pagehide', () => { pageActive = false; clearTimeout(birthTimer); syncActive(); });
addEventListener('pageshow', () => { pageActive = true; syncActive(); });
addEventListener('message', (event) => {
  if (window.self === window.top || event.source !== window.parent || event.origin !== location.origin || event.data?.type !== 'nebula:first-active') return;
  document.body.classList.add('is-embedded');
  hostActive = event.data.active === true; syncActive();
});
updateMotion();
const hash = location.hash.slice(1), index = story.scenes.findIndex((scene) => scene.id === hash);
if (index >= 0) requestAnimationFrame(() => { scenes[index].scrollIntoView({ behavior: 'auto', block: 'start' }); queueMeasure(); });
