// XPACE 모바일 센서: 기울기 · 나침반 · 흔들기 · 진동 · 카메라
// PC에서는 아무것도 하지 않습니다. iPhone은 사용자의 탭(입장 버튼 등) 안에서 enable()을 불러야 권한을 물을 수 있습니다.

export const IS_MOBILE = matchMedia('(hover: none) and (pointer: coarse)').matches || (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) && innerWidth < 1100);

const listeners = { shake: [], tilt: [] };
export const sensor = {
  on: false,          // 센서 사용 중
  tiltX: 0, tiltY: 0, // -1~1 (좌우, 앞뒤), 부드럽게 보정된 값
  heading: null,      // 0~360 나침반 방향 (북쪽 = 0), 모르면 null
  shake: 0,           // 0~1 최근 흔들림 세기 (서서히 줄어듦)
  async enable() {
    if (!IS_MOBILE || this.on) return this.on;
    try {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        const r = await DeviceOrientationEvent.requestPermission(); if (r !== 'granted') return false;
      }
      if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        try { await DeviceMotionEvent.requestPermission(); } catch (e) {}
      }
    } catch (e) { return false; }
    addEventListener('deviceorientation', onOrient, true);
    addEventListener('deviceorientationabsolute', onAbs, true);
    addEventListener('devicemotion', onMotion, true);
    this.on = true;
    return true;
  },
  onShake(fn) { listeners.shake.push(fn); },
  vibrate(p) { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) {} },
};

let rawX = 0, rawY = 0, lastShake = 0, absSeen = false;
function onOrient(e) {
  if (e.gamma == null) return;
  // 화면 방향(세로/가로)에 맞춰 좌우·앞뒤 기울기 계산
  const ang = (screen.orientation && screen.orientation.angle) || window.orientation || 0;
  let x = e.gamma / 45, y = (e.beta - 40) / 45; // 폰을 40도쯤 세워 든 자세를 0으로
  if (ang === 90) [x, y] = [(e.beta) / 45, -e.gamma / 45];
  if (ang === -90 || ang === 270) [x, y] = [-(e.beta) / 45, e.gamma / 45];
  rawX = Math.max(-1, Math.min(1, x)); rawY = Math.max(-1, Math.min(1, y));
  if (e.webkitCompassHeading != null) sensor.heading = e.webkitCompassHeading; // iPhone
  else if (!absSeen && e.absolute && e.alpha != null) sensor.heading = (360 - e.alpha) % 360;
}
function onAbs(e) { if (e.alpha != null) { absSeen = true; sensor.heading = (360 - e.alpha) % 360; } }
function onMotion(e) {
  const a = e.acceleration && e.acceleration.x != null ? e.acceleration : null;
  let m;
  if (a) m = Math.hypot(a.x || 0, a.y || 0, a.z || 0);
  else { const g = e.accelerationIncludingGravity; if (!g) return; m = Math.abs(Math.hypot(g.x || 0, g.y || 0, g.z || 0) - 9.8); }
  if (m > 3) {
    sensor.shake = Math.min(1, sensor.shake + m / 25);
    const now = performance.now();
    if (m > 11 && now - lastShake > 350) { lastShake = now; listeners.shake.forEach((f) => f(Math.min(1, m / 25))); }
  }
}
// 부드럽게 따라가기 + 흔들림 감쇠 (매 프레임)
(function loop() {
  sensor.tiltX += (rawX - sensor.tiltX) * 0.12;
  sensor.tiltY += (rawY - sensor.tiltY) * 0.12;
  sensor.shake *= 0.94;
  requestAnimationFrame(loop);
})();

// 카메라 (AR 배경): 뒤쪽 카메라 영상을 <video>로 깔기. 영상은 이 화면에서만 쓰이고 저장·전송되지 않음
export async function startCamera(videoEl) {
  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
  videoEl.srcObject = stream; videoEl.muted = true; videoEl.playsInline = true; await videoEl.play();
  return () => stream.getTracks().forEach((t) => t.stop());
}
