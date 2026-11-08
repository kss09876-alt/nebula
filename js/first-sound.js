// Original exhibition music and responsive tones. Audio begins only after the visitor opts in.
export function createFirstSound(onChange = () => {}) {
  let context = null, output = null, filter = null, music = null, oscillators = [];
  let requested = false, active = !document.hidden, quiet = false, progress = 0, revision = 0;

  function create() {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) throw new Error('Web Audio unavailable');
    context = new Audio();
    output = context.createGain(); output.gain.value = 0;
    filter = context.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 400; filter.Q.value = .4;
    const compressor = context.createDynamicsCompressor(); compressor.threshold.value = -24; compressor.ratio.value = 3;
    filter.connect(output); output.connect(compressor); compressor.connect(context.destination);
    [55, 82.41, 110, 164.81].forEach((frequency, index) => {
      const oscillator = context.createOscillator(), gain = context.createGain();
      oscillator.type = 'sine'; oscillator.frequency.value = frequency; gain.gain.value = index < 2 ? .15 : .06;
      oscillator.connect(gain); gain.connect(filter); oscillator.start(); oscillators.push(oscillator);
    });
    // The file is project-relative so the same build works on GitHub Pages and in the app.
    music = new window.Audio('assets/audio/nebula-journey.mp3');
    music.loop = true; music.preload = 'none'; music.volume = .14;
  }
  function volume() {
    if (music) music.volume = quiet ? .035 : .12 + .025 * Math.sin(progress * Math.PI);
    if (context && output && context.state === 'running') {
      output.gain.setTargetAtTime(quiet ? .023 : .07, context.currentTime, .65);
    }
  }
  async function apply() {
    const token = ++revision;
    if (!context) { onChange(requested); return; }
    if (!requested || !active || document.hidden) {
      music?.pause(); output.gain.cancelScheduledValues(context.currentTime); output.gain.value = 0;
      if (context.state === 'running') await context.suspend().catch(() => {});
      onChange(requested); return;
    }
    // Both calls begin before the first await, preserving Safari's user-gesture activation.
    let play;
    try { play = music?.play(); } catch { play = null; }
    const resume = context.resume();
    const settled = await Promise.allSettled([resume, Promise.resolve(play)]);
    if (token !== revision || !requested || !active || document.hidden) {
      if (!requested || !active || document.hidden) {
        music?.pause(); if (context.state === 'running') await context.suspend().catch(() => {});
      }
      return;
    }
    if (settled[0].status === 'rejected' || context.state !== 'running') {
      requested = false; music?.pause(); onChange(false); return;
    }
    // If the file is unavailable, the locally synthesized ambient layer remains usable.
    volume(); onChange(true);
  }
  return {
    async toggle() {
      requested = !requested;
      try { if (requested && !context) create(); await apply(); }
      catch { requested = false; music?.pause(); onChange(false); }
      return requested;
    },
    setActive(value) { active = Boolean(value); if (context) void apply(); },
    setScene(value) {
      progress = Math.min(1, Math.max(0, value));
      if (!context || context.state !== 'running') return;
      filter.frequency.setTargetAtTime(260 + Math.sin(progress * Math.PI) * 420, context.currentTime, 1.2);
      volume();
    },
    setQuiet(value) { quiet = Boolean(value); volume(); },
    respond(kind = 'light') {
      if (!requested || !active || document.hidden || !context || context.state !== 'running') return;
      const now = context.currentTime, oscillator = context.createOscillator(), envelope = context.createGain();
      oscillator.type = 'sine'; oscillator.frequency.value = kind === 'trace' ? 391.995 : kind === 'gather' ? 293.665 : 349.228;
      envelope.gain.setValueAtTime(.0001, now); envelope.gain.exponentialRampToValueAtTime(.08, now + .12);
      envelope.gain.exponentialRampToValueAtTime(.0001, now + 1.45);
      oscillator.connect(envelope); envelope.connect(filter); oscillator.start(now); oscillator.stop(now + 1.5);
      oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };
    },
    get enabled() { return requested; },
    destroy() {
      requested = false; revision++; music?.pause();
      oscillators.forEach((oscillator) => { try { oscillator.stop(); } catch {} }); oscillators = [];
      if (context && context.state !== 'closed') void context.close();
    },
  };
}
