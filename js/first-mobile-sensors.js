// Opt-in physical inputs for the first exhibition. No listeners or permissions
// are installed at import time. Call enableMotion/enableMicrophone directly
// from a user gesture; in particular, iOS requires that for permission prompts.
//
// Callbacks:
//   onTilt(x, y)                  -- screen-relative numbers clamped to [-1, 1].
//   onShake(strength)             -- normalized intensity [0, 1].
//   onFaceDown(isFaceDown)        -- debounced state changes.
//   onBlow(strength)              -- normalized microphone RMS intensity [0, 1].
//   onStatus({ type, state, ... }) -- motion additionally has orientation and
//                                    acceleration listener booleans; reason is optional.
// Availability getters are feature/policy checks, not proof a device has a
// working sensor. Likewise, enabled motion means listeners are attached, not
// that the browser has actually delivered readings.

export function createMobileSensors(options = {}) {
  const { onTilt, onShake, onFaceDown, onBlow, onStatus } = options || {};
  const win = typeof window !== 'undefined' ? window : null;
  const doc = typeof document !== 'undefined' ? document : null;
  const nav = typeof navigator !== 'undefined' ? navigator : null;
  const noop = () => {};
  const callbacks = {
    tilt: typeof onTilt === 'function' ? onTilt : noop,
    shake: typeof onShake === 'function' ? onShake : noop,
    face: typeof onFaceDown === 'function' ? onFaceDown : noop,
    blow: typeof onBlow === 'function' ? onBlow : noop,
    status: typeof onStatus === 'function' ? onStatus : noop,
  };
  const call = (fn, ...values) => { try { fn(...values); } catch (_) { /* UI callbacks must not break cleanup. */ } };
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  const now = () => win?.performance?.now?.() ?? Date.now();

  let active = true;
  let pageHidden = false;
  let destroyed = false;
  let lifecycleInstalled = false;
  let orientationAuthorized = false;
  let accelerationAuthorized = false;
  let orientationListening = false;
  let accelerationListening = false;
  let motionGeneration = 0;
  let motionPending = null;
  let lastTiltAt = -Infinity;
  let lastShakeAt = -Infinity;
  let gravityEstimate = null;
  let faceDown = false;
  let faceCandidate = false;
  let faceTimer = null;
  let microphoneSession = null;

  function running() {
    return !destroyed && active && !pageHidden && !doc?.hidden;
  }

  // Some browsers do not expose this API or throw for unknown feature names.
  // In those cases permission requests/events remain the source of truth.
  function policyAllows(feature) {
    try {
      const policy = doc?.permissionsPolicy || doc?.featurePolicy;
      if (!policy || typeof policy.allowsFeature !== 'function') return true;
      if (typeof policy.features === 'function' && !policy.features().includes(feature)) return true;
      return policy.allowsFeature(feature) !== false;
    } catch (_) {
      return true;
    }
  }

  function motionSupport() {
    const secure = !!win && win.isSecureContext !== false;
    const events = !!win && typeof win.addEventListener === 'function';
    const orientationApi = events && (!!win.DeviceOrientationEvent || 'ondeviceorientation' in win);
    const accelerationApi = events && (!!win.DeviceMotionEvent || 'ondevicemotion' in win);
    const accelerationPolicy = policyAllows('accelerometer');
    const orientationPolicy = accelerationPolicy && policyAllows('gyroscope');
    return {
      secure,
      orientationApi,
      accelerationApi,
      orientation: secure && orientationApi && orientationPolicy,
      acceleration: secure && accelerationApi && accelerationPolicy,
      blocked: (orientationApi && !orientationPolicy) || (accelerationApi && !accelerationPolicy),
    };
  }

  function microphoneSupport() {
    const secure = !!win && win.isSecureContext !== false;
    const api = !!nav?.mediaDevices && typeof nav.mediaDevices.getUserMedia === 'function'
      && !!(win?.AudioContext || win?.webkitAudioContext)
      && typeof win?.requestAnimationFrame === 'function'
      && typeof win?.cancelAnimationFrame === 'function';
    const allowed = policyAllows('microphone');
    return { secure, api, allowed, available: secure && api && allowed };
  }

  function motionStatus(state, reason) {
    const status = { type: 'motion', state, orientation: orientationListening, acceleration: accelerationListening };
    if (reason) status.reason = reason;
    call(callbacks.status, status);
  }

  function microphoneStatus(state, reason) {
    const status = { type: 'microphone', state };
    if (reason) status.reason = reason;
    call(callbacks.status, status);
  }

  function clearFaceState() {
    if (faceTimer !== null) clearTimeout(faceTimer);
    faceTimer = null;
    faceCandidate = false;
    faceDown = false;
  }

  function onOrientation(event) {
    if (!orientationListening || !running()) return;
    const gamma = Number.isFinite(event.gamma) ? event.gamma : null;
    const beta = Number.isFinite(event.beta) ? event.beta : null;
    if (gamma === null && beta === null) return;

    // A phone lying face down has beta near either +180 or -180 degrees.
    // Hysteresis avoids chatter near the boundary, and a timer confirms the
    // posture even on implementations that stop sending unchanged readings.
    if (beta !== null) {
      const isCandidate = Math.abs(beta) >= (faceDown ? 140 : 150)
        && (gamma === null || Math.abs(gamma) <= (faceDown ? 55 : 45));
      if (isCandidate !== faceCandidate) {
        faceCandidate = isCandidate;
        if (faceTimer !== null) clearTimeout(faceTimer);
        faceTimer = null;
        if (faceCandidate !== faceDown) {
          faceTimer = setTimeout(() => {
            faceTimer = null;
            if (!orientationListening || !running() || faceCandidate === faceDown) return;
            faceDown = faceCandidate;
            call(callbacks.face, faceDown);
          }, isCandidate ? 700 : 300);
        }
      }
    }

    const time = now();
    if (time - lastTiltAt < 50) return;
    lastTiltAt = time;
    let x = (gamma ?? 0) / 45;
    let y = (beta ?? 0) / 45;
    const angle = ((win.screen?.orientation?.angle ?? win.orientation ?? 0) % 360 + 360) % 360;
    if (angle === 90) [x, y] = [y, -x];
    else if (angle === 180) [x, y] = [-x, -y];
    else if (angle === 270) [x, y] = [-y, x];
    call(callbacks.tilt, clamp(x, -1, 1), clamp(y, -1, 1));
  }

  function vector(value) {
    if (!value || !['x', 'y', 'z'].some((key) => Number.isFinite(value[key]))) return null;
    return ['x', 'y', 'z'].map((key) => Number.isFinite(value[key]) ? value[key] : 0);
  }

  function onMotion(event) {
    if (!accelerationListening || !running()) return;
    let acceleration = vector(event.acceleration);
    if (!acceleration) {
      const withGravity = vector(event.accelerationIncludingGravity);
      if (!withGravity) return;
      if (!gravityEstimate) {
        gravityEstimate = withGravity;
        return;
      }
      // High-pass filtering removes steady gravity even as the phone changes
      // orientation; a simple |magnitude - 9.8| misses many lateral shakes.
      acceleration = withGravity.map((value, index) => value - gravityEstimate[index]);
      gravityEstimate = withGravity.map((value, index) => gravityEstimate[index] * 0.8 + value * 0.2);
    } else {
      gravityEstimate = null;
    }
    const magnitude = Math.hypot(...acceleration);
    const time = now();
    if (magnitude >= 12 && time - lastShakeAt >= 1000) {
      lastShakeAt = time;
      call(callbacks.shake, clamp(magnitude / 25, 0, 1));
    }
  }

  function detachMotion() {
    if (orientationListening) win.removeEventListener('deviceorientation', onOrientation);
    if (accelerationListening) win.removeEventListener('devicemotion', onMotion);
    orientationListening = false;
    accelerationListening = false;
    gravityEstimate = null;
    lastTiltAt = -Infinity;
    clearFaceState();
  }

  function attachMotion() {
    if (!running()) return false;
    const support = motionSupport();
    let failed = false;
    if (orientationAuthorized && support.orientation && !orientationListening) {
      try { win.addEventListener('deviceorientation', onOrientation, { passive: true }); orientationListening = true; }
      catch (_) { failed = true; }
    }
    if (accelerationAuthorized && support.acceleration && !accelerationListening) {
      try { win.addEventListener('devicemotion', onMotion, { passive: true }); accelerationListening = true; }
      catch (_) { failed = true; }
    }
    const enabled = orientationListening || accelerationListening;
    if (enabled) motionStatus('enabled', failed ? 'listener-error' : undefined);
    else motionStatus(support.blocked ? 'denied' : 'unsupported', failed ? 'listener-error' : 'unavailable');
    return orientationListening || accelerationListening;
  }

  function pauseMotion() {
    const wasListening = orientationListening || accelerationListening;
    detachMotion();
    if (wasListening || motionPending) motionStatus('paused');
  }

  function stopTracks(stream) {
    if (!stream || typeof stream.getTracks !== 'function') return;
    for (const track of stream.getTracks()) {
      try { track.stop(); } catch (_) { /* Continue stopping the other tracks. */ }
    }
  }

  function closeAudio(context) {
    if (!context || typeof context.close !== 'function' || context.state === 'closed') return;
    try {
      const closing = context.close();
      if (closing && typeof closing.catch === 'function') closing.catch(() => {});
    } catch (_) { /* It may already have been closed by the browser. */ }
  }

  function disposeMicrophone(session) {
    if (!session) return;
    session.cancelled = true;
    if (session.timer !== null) clearTimeout(session.timer);
    if (session.frame !== null && win) win.cancelAnimationFrame(session.frame);
    session.timer = null;
    session.frame = null;
    if (session.stream && typeof session.stream.getTracks === 'function') {
      for (const track of session.stream.getTracks()) {
        try { track.removeEventListener?.('ended', session.onEnded); } catch (_) {}
      }
    }
    try { session.source?.disconnect(); } catch (_) {}
    try { session.analyser?.disconnect(); } catch (_) {}
    stopTracks(session.stream);
    session.stream = null;
    closeAudio(session.context);
  }

  function stopMicrophone(state, reason, reportIfAbsent = false) {
    const session = microphoneSession;
    microphoneSession = null; // Invalidate pending permission before releasing resources.
    disposeMicrophone(session);
    if (session || reportIfAbsent) microphoneStatus(state, reason);
  }

  function scheduleMicrophone(session) {
    if (microphoneSession !== session || session.cancelled || !session.on || !running()) return;
    session.frame = win.requestAnimationFrame(() => {
      session.frame = null;
      if (microphoneSession !== session || session.cancelled || !session.on || !running()) return;
      try {
        let sum = 0;
        if (session.floatSamples) {
          session.analyser.getFloatTimeDomainData(session.samples);
          for (const sample of session.samples) sum += sample * sample;
        } else {
          session.analyser.getByteTimeDomainData(session.samples);
          for (const sample of session.samples) {
            const value = (sample - 128) / 128;
            sum += value * value;
          }
        }
        const rms = Math.sqrt(sum / session.samples.length);
        const threshold = Math.max(0.075, session.noiseFloor * 2.8);
        if (rms < threshold * 0.65) session.aboveThreshold = false;
        if (rms < threshold) session.noiseFloor = clamp(session.noiseFloor * 0.96 + rms * 0.04, 0.005, 0.06);
        if (rms >= threshold && !session.aboveThreshold) {
          session.aboveThreshold = true;
          const time = now();
          if (time - session.lastBlowAt >= 1000) {
            session.lastBlowAt = time;
            // This detects sufficiently loud local audio, not breath uniquely.
            call(callbacks.blow, clamp(rms / 0.4, 0, 1));
          }
        }
      } catch (_) {
        if (microphoneSession === session) stopMicrophone('unsupported', 'audio-analysis-error');
        return;
      }
      // A timer before the next RAF bounds both sampling and RAF callbacks to
      // at most 20 per second; neither runs while stopped or in the background.
      if (microphoneSession === session && session.on && running()) {
        session.timer = setTimeout(() => {
          session.timer = null;
          scheduleMicrophone(session);
        }, 50);
      }
    });
  }

  function installLifecycle() {
    if (lifecycleInstalled || !win || !doc) return;
    lifecycleInstalled = true;
    doc.addEventListener('visibilitychange', onVisibilityChange);
    win.addEventListener('pagehide', onPageHide);
    win.addEventListener('pageshow', onPageShow);
  }

  function pauseAll() {
    pauseMotion();
    // Includes pending microphone requests: any eventually acquired stream is
    // stopped by the continuation, and cannot restart without another click.
    stopMicrophone('paused');
  }

  function resumeMotion() {
    if (running() && (orientationAuthorized || accelerationAuthorized)
      && !orientationListening && !accelerationListening) attachMotion();
  }

  function onVisibilityChange() {
    if (doc.hidden) pauseAll();
    else resumeMotion();
  }

  function onPageHide() {
    pageHidden = true;
    pauseAll();
  }

  function onPageShow() {
    pageHidden = false;
    resumeMotion();
  }

  async function enableMotion() {
    if (destroyed) return false;
    const support = motionSupport();
    if (!support.orientation && !support.acceleration) {
      const state = support.secure && support.blocked ? 'denied' : 'unsupported';
      motionStatus(state, !support.secure ? 'insecure-context' : support.blocked ? 'permissions-policy' : 'api-unavailable');
      return false;
    }
    if (!running()) { motionStatus('paused'); return false; }
    installLifecycle();
    if (orientationListening || accelerationListening) return true;
    if (motionPending) return motionPending;
    if (orientationAuthorized || accelerationAuthorized) return attachMotion();

    const generation = ++motionGeneration;
    const requests = [];
    const kinds = [];
    function request(kind, constructor) {
      kinds.push(kind);
      try {
        // Both permission functions are invoked synchronously, before the first
        // await, so both still have the original iOS user activation.
        requests.push(Promise.resolve(typeof constructor?.requestPermission === 'function'
          ? constructor.requestPermission() : 'granted'));
      } catch (error) {
        requests.push(Promise.reject(error));
      }
    }
    if (support.orientation) request('orientation', win.DeviceOrientationEvent);
    if (support.acceleration) request('acceleration', win.DeviceMotionEvent);
    const pending = Promise.allSettled(requests).then((results) => {
      if (destroyed || generation !== motionGeneration) return false;
      results.forEach((result, index) => {
        const granted = result.status === 'fulfilled' && result.value === 'granted';
        if (kinds[index] === 'orientation') orientationAuthorized = granted;
        else accelerationAuthorized = granted;
      });
      if (!orientationAuthorized && !accelerationAuthorized) {
        motionStatus('denied', 'permission-denied');
        return false;
      }
      if (!running()) { motionStatus('paused'); return false; }
      return attachMotion();
    });
    motionPending = pending;
    pending.then(() => { if (motionPending === pending) motionPending = null; });
    return pending;
  }

  function disableMotion() {
    motionGeneration += 1;
    motionPending = null;
    orientationAuthorized = false;
    accelerationAuthorized = false;
    detachMotion();
    if (!destroyed) motionStatus('disabled');
  }

  async function enableMicrophone() {
    if (destroyed) return false;
    const support = microphoneSupport();
    if (!support.available) {
      const state = support.secure && support.api && !support.allowed ? 'denied' : 'unsupported';
      microphoneStatus(state, !support.secure ? 'insecure-context' : !support.allowed ? 'permissions-policy' : 'api-unavailable');
      return false;
    }
    if (!running()) { microphoneStatus('paused'); return false; }
    installLifecycle();
    if (microphoneSession?.on) return true;
    if (microphoneSession?.pending) return microphoneSession.pending;

    const session = {
      context: null, stream: null, source: null, analyser: null, samples: null,
      frame: null, timer: null, on: false, cancelled: false, pending: null,
      noiseFloor: 0.015, aboveThreshold: false, lastBlowAt: -Infinity, onEnded: null,
    };
    microphoneSession = session;
    let streamRequest;
    let resumeResult = Promise.resolve({ ok: true });
    try {
      const AudioContext = win.AudioContext || win.webkitAudioContext;
      // Construct/resume during the click, before getUserMedia's permission
      // dialog can consume the transient user activation (important on iOS).
      session.context = new AudioContext();
      if (session.context.state === 'suspended' && typeof session.context.resume === 'function') {
        resumeResult = Promise.resolve(session.context.resume()).then(
          () => ({ ok: true }), (error) => ({ ok: false, error }),
        );
      }
      streamRequest = nav.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
        video: false,
      });
    } catch (error) {
      if (microphoneSession === session) microphoneSession = null;
      disposeMicrophone(session);
      microphoneStatus(error?.name === 'NotAllowedError' || error?.name === 'SecurityError' ? 'denied' : 'unsupported', error?.name || 'audio-start-error');
      return false;
    }

    const pending = (async () => {
      try {
        const stream = await streamRequest;
        // An old permission prompt may resolve after disable, hide, or destroy.
        if (microphoneSession !== session || session.cancelled || !running()) {
          stopTracks(stream);
          return false;
        }
        session.stream = stream;
        if (typeof stream.getAudioTracks === 'function') {
          const audioTracks = stream.getAudioTracks();
          if (!audioTracks.length || audioTracks.every((track) => track.readyState === 'ended')) {
            throw new Error('no-live-audio-track');
          }
        }
        session.onEnded = () => {
          if (microphoneSession === session) stopMicrophone('disabled', 'track-ended');
        };
        for (const track of stream.getTracks()) track.addEventListener?.('ended', session.onEnded);
        const resumed = await resumeResult;
        if (microphoneSession !== session || session.cancelled || !running()) return false;
        if (!resumed.ok) throw resumed.error;
        if (session.context.state === 'suspended' || session.context.state === 'closed' || session.context.state === 'interrupted') {
          throw new Error('audio-context-not-running');
        }
        session.source = session.context.createMediaStreamSource(stream);
        session.analyser = session.context.createAnalyser();
        session.analyser.fftSize = 1024;
        session.floatSamples = typeof session.analyser.getFloatTimeDomainData === 'function';
        if (!session.floatSamples && typeof session.analyser.getByteTimeDomainData !== 'function') throw new Error('audio-analyser-unavailable');
        session.samples = session.floatSamples ? new Float32Array(session.analyser.fftSize) : new Uint8Array(session.analyser.fftSize);
        session.source.connect(session.analyser); // Deliberately never connected to speakers.
        session.on = true;
        scheduleMicrophone(session);
        microphoneStatus('enabled');
        return microphoneSession === session && session.on;
      } catch (error) {
        if (microphoneSession !== session || session.cancelled) return false;
        microphoneSession = null;
        disposeMicrophone(session);
        const denied = error?.name === 'NotAllowedError' || error?.name === 'SecurityError';
        const reason = error?.name === 'Error' ? error.message : error?.name;
        microphoneStatus(denied ? 'denied' : 'unsupported', reason || 'audio-start-error');
        return false;
      }
    })();
    session.pending = pending;
    pending.then(() => { if (session.pending === pending) session.pending = null; });
    return pending;
  }

  function disableMicrophone() {
    if (!destroyed) stopMicrophone('disabled', undefined, true);
  }

  function setActive(value) {
    if (destroyed) return;
    active = !!value;
    if (!active) pauseAll();
    else resumeMotion(); // The microphone always needs a fresh explicit click.
  }

  function destroy() {
    if (destroyed) return;
    // Mark destroyed before status callbacks can re-enter and start new work.
    destroyed = true;
    motionGeneration += 1;
    motionPending = null;
    orientationAuthorized = false;
    accelerationAuthorized = false;
    detachMotion();
    stopMicrophone('disabled');
    if (lifecycleInstalled) {
      doc.removeEventListener('visibilitychange', onVisibilityChange);
      win.removeEventListener('pagehide', onPageHide);
      win.removeEventListener('pageshow', onPageShow);
      lifecycleInstalled = false;
    }
  }

  return {
    enableMotion, disableMotion, enableMicrophone, disableMicrophone, setActive, destroy,
    get motionOn() { return orientationListening || accelerationListening; },
    get microphoneOn() { return !!microphoneSession?.on; },
    get motionAvailable() { const support = motionSupport(); return !destroyed && (support.orientation || support.acceleration); },
    get microphoneAvailable() { return !destroyed && microphoneSupport().available; },
  };
}
