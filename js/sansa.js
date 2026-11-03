// 산사, 잠시 머물다 — 온라인 산사 힐링 전시 (기획 제안 프로토타입)
// 장면: 일주문 → 숨 고르기 → 풍경 → 범종 → 목탁 → 절 → 연등 → 좌선 → 회향
// 소리는 모두 Web Audio 실시간 합성. 센서·마이크는 기기 안에서만 쓰고 저장·전송하지 않음.
import { IS_MOBILE, sensor, keepAwake, startMic } from './sensors.js?v=2';
import { lang } from './i18n.js?v=3';

/* ---------- 문구 번역 (한국어 = 키) [en, zh, ja] ---------- */
const W = {
  '산사, 잠시 머물다': ['A Mountain Temple, For a While', '山寺，小憩片刻', '山寺で、しばし'],
  '산의 소리': ['Mountain sound', '山之声', '山の音'],
  'ONLINE TEMPLE STAY · 기획 제안 프로토타입': ['ONLINE TEMPLE STAY · PROPOSAL PROTOTYPE', '线上寺院寄宿 · 策划提案原型', 'オンライン・テンプルステイ · 企画提案プロトタイプ'],
  '말없이 함께 앉아 있는 온라인 절.': ['An online temple where we sit together in silence.', '一座无言同坐的线上寺院。', '言葉なく共に座るオンラインのお寺。'],
  '이곳에서는 아무것도 하지 않아도 괜찮습니다.': ['Here, it is fine to do nothing at all.', '在这里，什么都不做也没关系。', 'ここでは、何もしなくて大丈夫です。'],
  '일주문 들어서기': ['Step through the gate', '走进一柱门', '一柱門をくぐる'],
  '소리를 켜면 바람과 새, 물소리가 들려요. 휴대폰은 기울이고, 흔들고, 엎어 두며 체험합니다.': ['With sound on you will hear wind, birds and water. Tilt, shake and lay your phone down to take part.', '打开声音，可以听到风声、鸟鸣和水声。倾斜、摇晃、把手机朝下放来体验。', '音をつけると風や鳥、水の音が聞こえます。スマホを傾けたり、振ったり、伏せたりして体験します。'],
  '숨 고르기': ['Settling the breath', '调息', '息をととのえる'],
  '원을 누르면 시작해요': ['Touch the circle to begin', '轻触圆圈开始', '円にふれると始まります'],
  '원이 커지면 들이쉬고, 작아지면 내쉬어요.': ['Breathe in as the circle grows, out as it shrinks.', '圆变大时吸气，变小时呼气。', '円が大きくなったら吸って、小さくなったら吐きます。'],
  '후~ 불어 촛불 흔들기': ['Blow to stir the candle', '吹气让烛火摇曳', 'ふーっと吹いてろうそくを揺らす'],
  '마이크 소리는 이 기기 안에서만 쓰이고 녹음·전송되지 않아요.': ['Microphone sound stays on this device and is never recorded or sent.', '麦克风声音只在本设备中使用，不会录音或传送。', 'マイクの音はこの端末の中だけで使われ、録音・送信されません。'],
  '풍경': ['Wind chime', '风铃', '風鈴（風磬）'],
  '처마 끝 물고기가 바람에 흔들리면 맑은 소리가 납니다.': ['When the fish under the eaves sways in the wind, a clear sound rings.', '屋檐下的小鱼随风摇动，便响起清音。', '軒先の魚が風に揺れると、澄んだ音が鳴ります。'],
  '범종': ['Temple bell', '梵钟', '梵鐘'],
  '번 울렸어요': ['rings', '声', '回鳴りました'],
  '종소리가 멀리 퍼지는 동안, 마음속 소리 하나를 내려놓아요.': ['While the bell sound travels far, set down one noise in your mind.', '在钟声远远传开时，放下心中的一个声音。', '鐘の音が遠くへ広がるあいだ、心の中の音をひとつ下ろします。'],
  '산사에서는 새벽 예불에 28번, 저녁 예불에 33번 종을 칩니다.': ['Mountain temples ring the bell 28 times at dawn service and 33 times in the evening.', '山寺晨课敲钟二十八下，晚课三十三下。', '山寺では朝のお勤めに28回、夕べに33回鐘をつきます。'],
  '목탁': ['Moktak (wooden fish)', '木鱼', '木魚'],
  '물고기는 눈을 감지 않는다고 합니다. 깨어 있으라는 뜻으로 목탁은 물고기 모양을 닮았어요.': ['Fish are said never to close their eyes. The moktak takes their shape as a reminder to stay awake.', '据说鱼从不闭眼。木鱼形似鱼，提醒人保持清醒。', '魚は目を閉じないといわれます。目覚めていなさいという意味で、木魚は魚の形をしています。'],
  '세 번의 절': ['Three bows', '三拜', '三度の礼拝'],
  '몸을 낮추면 마음도 낮아집니다.': ['When the body bows, the heart grows humble.', '身体放低，心也放低。', '体を低くすると、心も低くなります。'],
  '절 올리기': ['Bow', '礼拜', '礼拝する'],
  '연등': ['Lotus lantern', '莲灯', '蓮灯'],
  '바라는 마음 한 줄을 연등에 적어 하늘로 띄워요.': ['Write one line of hope on a lantern and let it float up.', '在莲灯上写下一句心愿，让它飘上天空。', '願いを一行、蓮灯に書いて空へ浮かべます。'],
  '연등 띄우기': ['Release lantern', '放飞莲灯', '蓮灯を浮かべる'],
  '모두가 평안하기를': ['May all be at peace', '愿众生平安', 'みんなが安らかでありますように'],
  '적은 글은 이 화면에만 머물고 어디에도 저장되지 않아요.': ['Your words stay on this screen and are not saved anywhere.', '写下的字只留在此画面，不会保存在任何地方。', '書いた言葉はこの画面にだけとどまり、どこにも保存されません。'],
  '좌선': ['Sitting meditation', '坐禅', '坐禅'],
  '분': [' min', '分钟', '分'],
  '아무것도 하지 않는 시간. 끝나면 종이 한 번 울려요.': ['A time of doing nothing. A bell rings once at the end.', '什么都不做的时间。结束时钟声响起一次。', '何もしない時間。終わると鐘が一度鳴ります。'],
  '회향': ['Returning', '回向', '回向'],
  '머문 시간을 일상으로 돌려보냅니다.': ['We return the time we stayed to everyday life.', '把停留的时间，送回日常。', 'とどまった時間を、日常へ返します。'],
  '다시 일상으로': ['Back to everyday life', '回到日常', '日常へ戻る'],
  '이 전시는 VALIX가 대한불교조계종과의 협력을 가정해 만든 기획 제안용 프로토타입입니다. 실제 주최·후원을 뜻하지 않으며, 협의 전 단계입니다. 모든 소리는 웹 오디오로 실시간 합성했습니다.': ['This is a proposal prototype made by VALIX assuming a collaboration with the Jogye Order of Korean Buddhism. It does not indicate actual hosting or sponsorship; discussions have not yet taken place. All sounds are synthesized live with Web Audio.', '本展是 VALIX 以与大韩佛教曹溪宗合作为假设制作的策划提案原型，不代表实际主办或赞助，目前尚未协商。所有声音均以 Web Audio 实时合成。', 'この展示は、VALIXが大韓仏教曹渓宗との協力を想定して制作した企画提案用プロトタイプです。実際の主催・後援を意味するものではなく、協議前の段階です。すべての音はWeb Audioでリアルタイム合成しています。'],
  '숨을 따라가요': ['Follow your breath', '跟随呼吸', '息についていく'],
  '그만하기': ['Stop', '结束', 'やめる'],
  '들이쉬고': ['Breathe in', '吸气', '吸って'],
  '머물고': ['Hold', '停留', 'とどめて'],
  '내쉬고': ['Breathe out', '呼气', '吐いて'],
  '번째 숨': [' breaths', '次呼吸', '回目の息'],
  '첫 번째 절 — 나를 낮추며': ['First bow — lowering myself', '第一拜 — 放下自己', '一度目 — 自分を低くして'],
  '두 번째 절 — 곁의 사람을 생각하며': ['Second bow — thinking of those beside me', '第二拜 — 想着身边的人', '二度目 — そばの人を思って'],
  '세 번째 절 — 모든 생명이 평안하기를': ['Third bow — may all beings be at peace', '第三拜 — 愿一切生命平安', '三度目 — すべての命が安らかであるように'],
  '고른 박자예요. 마음도 고르게.': ['A steady rhythm. A steady heart.', '节拍很均匀，心也均匀。', '整ったリズムです。心も整って。'],
  '머문 시간': ['Time stayed', '停留时间', 'とどまった時間'],
  '범종': ['Temple bell', '梵钟', '梵鐘'],
  '절': ['bows', '拜', '礼拝'],
  '연등': ['Lotus lantern', '莲灯', '蓮灯'],
  '좌선을 마쳤어요': ['Meditation complete', '坐禅结束', '坐禅を終えました'],
  '휴대폰을 천천히 기울여 바람을 보내 보세요': ['Slowly tilt your phone to send a breeze', '慢慢倾斜手机，送去一阵风', 'スマホをゆっくり傾けて風を送ってみて'],
  '풍경을 누르거나 마우스로 쓸어 보세요': ['Tap the chime or brush it with the mouse', '点击风铃，或用鼠标拂过', '風鈴を押すか、マウスでなでてみて'],
  '종을 누르거나, 휴대폰을 한 번 크게 흔들어 종을 쳐요': ['Tap the bell, or give your phone one big shake', '点击钟，或用力摇一下手机来敲钟', '鐘を押すか、スマホを大きく一度振って鐘をつく'],
  '종을 눌러 쳐 보세요': ['Tap the bell to ring it', '点击敲钟', '鐘を押してついてみて'],
  '화면을 두드려요 · 일정하게 치면 박자가 고와져요': ['Tap the screen · a steady beat sounds gentler', '轻敲屏幕 · 节拍均匀会更柔和', '画面をたたいて · 一定に打つとリズムが整う'],
  '목탁을 누르거나 스페이스 키로 두드려요': ['Click the moktak or press the space bar', '点击木鱼或按空格键', '木魚を押すかスペースキーでたたく'],
  '휴대폰을 바닥에 엎었다가 다시 들면 절 한 번': ['Lay your phone face down, then lift it — one bow', '把手机朝下放再拿起，算一拜', 'スマホを伏せてから持ち上げると一礼'],
  '버튼을 눌러 절을 올려요': ['Press the button to bow', '按按钮礼拜', 'ボタンを押して礼拝する'],
  '띄운 뒤 휴대폰을 뒤로 젖히면 연등이 더 높이 올라가요': ['After releasing, tilt your phone back to lift the lantern higher', '放飞后把手机向后仰，莲灯会升得更高', '浮かべたあとスマホを後ろに倒すと、もっと高く上がる'],
  '여러 개를 띄워도 좋아요': ['You can release as many as you like', '可以放飞好几盏', 'いくつ浮かべても大丈夫'],
  '시작한 뒤 휴대폰을 엎어 두어도 괜찮아요': ['After starting, you may lay your phone face down', '开始后可以把手机朝下放', '始めたらスマホを伏せておいても大丈夫'],
  '시작하면 화면이 어두워져요': ['The screen dims when you begin', '开始后画面会变暗', '始めると画面が暗くなります'],
};
const IDX = { en: 0, zh: 1, ja: 2 };
const t = (k) => (lang !== 'ko' && W[k] && W[k][IDX[lang]]) || k;
document.documentElement.lang = lang;
document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t); });
document.querySelectorAll('[data-ph]').forEach((el) => { el.placeholder = t(el.dataset.ph); });
document.querySelectorAll('[data-hint-m]').forEach((el) => { el.textContent = t(IS_MOBILE ? el.dataset.hintM : el.dataset.hintD); });

const $ = (s, r = document) => r.querySelector(s);
const enteredAt = Date.now();
const stats = { bell: 0, bow: 0, lantern: 0, zen: 0 };

/* ---------- 기울기 (휴대폰 센서, PC는 마우스) ---------- */
const tilt = { x: 0, y: 0, mx: 0, my: 0 };
addEventListener('pointermove', (e) => { if (!IS_MOBILE) { tilt.mx = (e.clientX / innerWidth - 0.5) * 2; tilt.my = (e.clientY / innerHeight - 0.5) * 2; } }, { passive: true });
function tickTilt() {
  const tx = IS_MOBILE && sensor.on ? sensor.tiltX : tilt.mx, ty = IS_MOBILE && sensor.on ? sensor.tiltY : tilt.my;
  tilt.x += (tx - tilt.x) * 0.08; tilt.y += (ty - tilt.y) * 0.08;
}

/* ---------- 소리 (Web Audio 합성) ---------- */
let ac, master, amb, soundOn = false;
const sndBtn = $('.ss-snd');
function audio() {
  if (ac) return ac;
  ac = new (window.AudioContext || window.webkitAudioContext)();
  master = ac.createGain(); master.gain.value = 0.9;
  // 잔향: 짧은 노이즈 임펄스
  const conv = ac.createConvolver(), len = ac.sampleRate * 3.2, ir = ac.createBuffer(2, len, ac.sampleRate);
  for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
  conv.buffer = ir; const wet = ac.createGain(); wet.gain.value = 0.45;
  master.connect(ac.destination); master.connect(conv).connect(wet).connect(ac.destination);
  amb = ac.createGain(); amb.gain.value = 0; amb.connect(master);
  const noise = (sec, brown) => { const b = ac.createBuffer(1, ac.sampleRate * sec, ac.sampleRate), d = b.getChannelData(0); let l = 0; for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; if (brown) { l = (l + 0.02 * w) / 1.02; d[i] = l * 3.5; } else d[i] = w; } return b; };
  const src = (buf) => { const s = ac.createBufferSource(); s.buffer = buf; s.loop = true; s.start(); return s; };
  const filt = (type, f, q = 0.7) => { const b = ac.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; };
  // 바람
  const wind = src(noise(4)), wf = filt('lowpass', 500), wg = ac.createGain(); wg.gain.value = 0.08;
  wind.connect(wf).connect(wg).connect(amb);
  const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = 0.07; lg.gain.value = 260; lfo.connect(lg).connect(wf.frequency); lfo.start();
  // 계곡 물소리
  const water = src(noise(5, true)), bf = filt('bandpass', 900, 0.6), bg = ac.createGain(); bg.gain.value = 0.16;
  water.connect(filt('highpass', 300)).connect(bf).connect(bg).connect(amb);
  // 새소리
  (function bird() { if (soundOn && Math.random() < 0.6) { const n = 2 + (Math.random() * 4 | 0), base = 2400 + Math.random() * 1600; for (let i = 0; i < n; i++) setTimeout(() => blip(base * (1 + Math.random() * 0.15), base * (1.25 + Math.random() * 0.4), 0.06 + Math.random() * 0.06, 0.025), i * 120); } setTimeout(bird, 2500 + Math.random() * 6000); })();
  return ac;
}
function blip(f0, f1, dur, vol) { const t0 = ac.currentTime, o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(f0, t0); o.frequency.exponentialRampToValueAtTime(f1, t0 + dur); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur); o.connect(g).connect(amb); o.start(t0); o.stop(t0 + dur + 0.05); }
function partials(base, ratios, dur, vol, out = master) {
  if (!ac || !soundOn) return;
  const t0 = ac.currentTime;
  ratios.forEach(([r, a], i) => { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = base * r; g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol * a, t0 + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur * (1 - i * 0.08)); o.connect(g).connect(out); o.start(t0); o.stop(t0 + dur + 0.1); });
}
const sound = {
  bell() { partials(82, [[1, 1], [2.0, 0.55], [2.41, 0.5], [2.98, 0.35], [4.17, 0.22], [5.43, 0.15], [0.5, 0.4]], 12, 0.22); },
  chime(f) { partials(f, [[1, 1], [2.76, 0.4], [5.4, 0.2], [8.93, 0.08]], 3.2, 0.09); },
  mok() { if (!ac || !soundOn) return; const t0 = ac.currentTime, o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(820, t0); o.frequency.exponentialRampToValueAtTime(560, t0 + 0.08); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(0.5, t0 + 0.003); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22); o.connect(g).connect(master); o.start(t0); o.stop(t0 + 0.25); },
  bowl() { partials(196, [[1, 1], [2.71, 0.4], [5.1, 0.2]], 9, 0.12); },
};
function setSound(on) {
  soundOn = on; audio(); ac.resume();
  amb.gain.setTargetAtTime(on ? 1 : 0, ac.currentTime, 0.8);
  sndBtn.setAttribute('aria-pressed', String(on));
}
sndBtn.addEventListener('click', () => setSound(!soundOn));

/* ---------- 산과 안개 (배경) ---------- */
const mtn = $('#mtn'), mx = mtn.getContext('2d');
let MW, MH, ridges = [];
function sizeMtn() {
  const d = Math.min(2, devicePixelRatio || 1); MW = innerWidth; MH = innerHeight; mtn.width = MW * d; mtn.height = MH * d; mx.setTransform(d, 0, 0, d, 0, 0);
  ridges = Array.from({ length: 5 }, (_, i) => { // 먼 산 → 가까운 산
    const pts = [], seed = 13 + i * 31; let y = 0, v = 0;
    for (let x = -0.2; x <= 1.2; x += 0.01) { v += (Math.sin(x * (7 + i * 3) + seed) * 0.5 + Math.sin(x * (19 + i * 5) + seed * 2) * 0.25 + Math.sin(x * 47 + seed) * 0.08) * 0.02; v *= 0.96; y = v; pts.push([x, y]); }
    return { pts, base: 0.42 + i * 0.12, amp: 0.9 + i * 0.5, depth: 6 + i * 10, col: [[196, 207, 198], [166, 182, 170], [129, 150, 135], [92, 114, 99], [56, 72, 61]][i] };
  });
}
sizeMtn(); addEventListener('resize', sizeMtn);
let fogT = 0;
function drawMtn(now) {
  const sy = scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight);
  const g = mx.createLinearGradient(0, 0, 0, MH);
  const dark = zenOn ? 1 : 0;
  g.addColorStop(0, dark ? '#10140f' : '#eef1ea'); g.addColorStop(1, dark ? '#0b0e0b' : '#d7ded5');
  mx.fillStyle = g; mx.fillRect(0, 0, MW, MH);
  if (!dark) {
    // 해
    const sunY = MH * (0.2 + sy * 0.25);
    const sg = mx.createRadialGradient(MW * 0.72, sunY, 0, MW * 0.72, sunY, MW * 0.35); sg.addColorStop(0, 'rgba(255,236,205,.9)'); sg.addColorStop(0.12, 'rgba(255,230,195,.5)'); sg.addColorStop(1, 'rgba(255,230,195,0)');
    mx.fillStyle = sg; mx.fillRect(0, 0, MW, MH);
    ridges.forEach((r, i) => {
      const ox = tilt.x * r.depth, oy = tilt.y * r.depth * 0.5 + sy * r.depth * 4;
      mx.beginPath(); mx.moveTo(-50, MH);
      r.pts.forEach(([x, y]) => mx.lineTo(x * MW + ox, MH * r.base - y * MH * r.amp * 2.2 + oy));
      mx.lineTo(MW + 50, MH); mx.closePath();
      mx.fillStyle = `rgb(${r.col})`; mx.fill();
      // 산 사이 안개
      const fy = MH * r.base + oy + 20, fg = mx.createLinearGradient(0, fy - 60, 0, fy + 40);
      fg.addColorStop(0, 'rgba(232,237,230,0)'); fg.addColorStop(0.6, `rgba(232,237,230,${0.55 - i * 0.07})`); fg.addColorStop(1, 'rgba(232,237,230,0)');
      mx.fillStyle = fg; mx.fillRect(0, fy - 60, MW, 100);
    });
    // 흐르는 안개 띠
    fogT += 0.0002;
    for (let k = 0; k < 3; k++) { const y = MH * (0.55 + k * 0.12), x = ((fogT * (40 + k * 25) + k * 0.3) % 1.6 - 0.3) * MW; const fg = mx.createRadialGradient(x, y, 0, x, y, MW * 0.6); fg.addColorStop(0, 'rgba(240,243,238,.45)'); fg.addColorStop(1, 'rgba(240,243,238,0)'); mx.fillStyle = fg; mx.fillRect(0, y - MW * 0.3, MW, MW * 0.6); }
  }
}

/* ---------- 위 효과층: 연등 · 떨어지는 잎 ---------- */
const fx = $('#fx'), fxx = fx.getContext('2d');
const lanterns = [], leaves = Array.from({ length: 14 }, () => ({ x: Math.random(), y: Math.random(), s: 0.5 + Math.random(), r: Math.random() * 6, v: 0.02 + Math.random() * 0.03 }));
function sizeFx() { const d = Math.min(2, devicePixelRatio || 1); fx.width = innerWidth * d; fx.height = innerHeight * d; fxx.setTransform(d, 0, 0, d, 0, 0); }
sizeFx(); addEventListener('resize', sizeFx);
function drawFx(dt) {
  const w = innerWidth, h = innerHeight; fxx.clearRect(0, 0, w, h);
  if (!zenOn) for (const l of leaves) {
    l.y += l.v * dt * 0.06; l.x += Math.sin(l.y * 6 + l.r) * 0.0006 * dt + tilt.x * 0.0004 * dt; l.r += 0.002 * dt;
    if (l.y > 1.05) { l.y = -0.05; l.x = Math.random(); } if (l.x < -0.05) l.x = 1.05; if (l.x > 1.05) l.x = -0.05;
    fxx.save(); fxx.translate(l.x * w, l.y * h); fxx.rotate(l.r); fxx.fillStyle = 'rgba(111,143,120,.35)'; fxx.beginPath(); fxx.ellipse(0, 0, 5 * l.s, 2.2 * l.s, 0, 0, 6.283); fxx.fill(); fxx.restore();
  }
  const lift = IS_MOBILE && sensor.on ? Math.max(0, -sensor.tiltY) * 2.2 : 0; // 뒤로 젖히면 더 높이
  for (let i = lanterns.length - 1; i >= 0; i--) {
    const L = lanterns[i]; L.age += dt;
    L.y -= (0.035 + lift * 0.06) * dt * L.sp; L.x += Math.sin(L.age / 900 + L.ph) * 0.15 + tilt.x * 0.3;
    if (L.y < -120) { lanterns.splice(i, 1); continue; }
    const a = Math.min(1, L.age / 600), sc = L.sc * (1 - Math.max(0, (innerHeight * 0.6 - L.y) / innerHeight) * 0.5);
    fxx.save(); fxx.translate(L.x, L.y); fxx.scale(sc, sc); fxx.globalAlpha = a;
    const gl = fxx.createRadialGradient(0, 0, 0, 0, 0, 60); gl.addColorStop(0, 'rgba(255,200,150,.55)'); gl.addColorStop(1, 'rgba(255,200,150,0)'); fxx.fillStyle = gl; fxx.fillRect(-60, -60, 120, 120);
    // 연꽃 등
    for (let p = 0; p < 8; p++) { fxx.save(); fxx.rotate(-Math.PI / 2 + (p - 3.5) * 0.32); fxx.fillStyle = p % 2 ? '#f2b8b0' : '#e79a92'; fxx.beginPath(); fxx.ellipse(0, -14, 7, 18, 0, 0, 6.283); fxx.fill(); fxx.restore(); }
    fxx.fillStyle = '#fff4dc'; fxx.beginPath(); fxx.arc(0, -4, 6, 0, 6.283); fxx.fill();
    if (L.text) { fxx.globalAlpha = a * Math.max(0, 1 - L.age / 6000); fxx.fillStyle = '#3d2f25'; fxx.font = '13px Pretendard, sans-serif'; fxx.textAlign = 'center'; fxx.fillText(L.text, 0, 34); }
    fxx.restore();
  }
}

/* ---------- 장면 표시 · 점 내비게이션 ---------- */
const scenes = [...document.querySelectorAll('.sc')], dots = $('.ss-dots');
scenes.forEach((s, i) => { const b = document.createElement('button'); b.setAttribute('aria-label', s.dataset.sc); b.addEventListener('click', () => s.scrollIntoView({ behavior: 'smooth' })); dots.appendChild(b); });
let curScene = 'gate';
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); curScene = e.target.dataset.sc; [...dots.children].forEach((d, i) => d.classList.toggle('on', scenes[i] === e.target)); if (curScene === 'end') showStay(); } }), { threshold: 0.55 });
scenes.forEach((s) => io.observe(s));
const inView = (name) => curScene === name;

/* ---------- 0. 일주문 ---------- */
$('[data-enter]').addEventListener('click', async () => {
  setSound(true); keepAwake();
  if (IS_MOBILE) await sensor.enable();
  sound.bowl();
  $('[data-sc="breath"]').scrollIntoView({ behavior: 'smooth' });
});

/* ---------- 1. 숨 고르기 ---------- */
const core = $('.br-core'), say = $('.br-say'), bcount = $('.br-count');
let brOn = false, brTimer = 0, breaths = 0;
const PHASES = [['들이쉬고', 4000, 1.35], ['머물고', 2000, 1.35], ['내쉬고', 6000, 0.7]];
function breathStep(i) {
  if (!brOn) return;
  const [word, ms, sc] = PHASES[i];
  say.textContent = t(word); core.style.transitionDuration = ms + 'ms'; core.style.transform = `scale(${sc})`;
  if (IS_MOBILE) sensor.vibrate(i === 0 ? 30 : i === 2 ? [10, 60, 10] : 0);
  if (i === 0 && soundOn) sound.chime(523.25);
  if (i === 2) { breaths++; bcount.textContent = `${breaths}${t('번째 숨')}`; }
  brTimer = setTimeout(() => breathStep((i + 1) % 3), ms);
}
$('.br-ring').addEventListener('click', () => { brOn = !brOn; clearTimeout(brTimer); if (brOn) { audio(); breathStep(0); } else { say.textContent = t('원을 누르면 시작해요'); core.style.transform = 'scale(.7)'; } });
// 촛불: 마이크로 '후~' 불면 흔들림
const cnd = $('.candle'), cx2 = cnd.getContext('2d'); let micOn = false, flick = 0;
$('[data-mic]').addEventListener('click', async (e) => { try { await startMic(); micOn = true; e.currentTarget.classList.add('on'); } catch (er) { e.currentTarget.textContent = '—'; } });
function drawCandle(now) {
  const w = 120, h = 180; cx2.clearRect(0, 0, w, h);
  const blow = micOn ? sensor.blow : 0; flick += (blow - flick) * 0.2;
  const sway = Math.sin(now / 140) * (1.5 + flick * 14) + tilt.x * 6, fh = 46 * (1 - flick * 0.55) + Math.sin(now / 90) * 2;
  cx2.fillStyle = '#efe6d2'; cx2.fillRect(46, 104, 28, 70); cx2.fillStyle = '#26302a'; cx2.fillRect(59, 96, 2, 10);
  const gl = cx2.createRadialGradient(60 + sway, 80, 0, 60 + sway, 80, 60); gl.addColorStop(0, `rgba(255,210,140,${0.45 - flick * 0.3})`); gl.addColorStop(1, 'rgba(255,210,140,0)'); cx2.fillStyle = gl; cx2.fillRect(0, 0, w, h);
  cx2.fillStyle = '#ffb347'; cx2.beginPath(); cx2.moveTo(60, 98); cx2.quadraticCurveTo(48, 80, 60 + sway, 98 - fh); cx2.quadraticCurveTo(72, 80, 60, 98); cx2.fill();
  cx2.fillStyle = '#fff3d6'; cx2.beginPath(); cx2.ellipse(60 + sway * 0.4, 88, 3.5, 9 * (1 - flick * 0.5), 0, 0, 6.283); cx2.fill();
}

/* ---------- 2. 풍경 ---------- */
const chCv = $('.chime-cv'), chx = chCv.getContext('2d');
const chime = { a: 0, v: 0, last: 0 }, PENTA = [783.99, 880, 1046.5, 1174.66, 1318.5];
function sizeChime() { const d = Math.min(2, devicePixelRatio || 1); chCv.width = chCv.clientWidth * d; chCv.height = chCv.clientHeight * d; chx.setTransform(d, 0, 0, d, 0, 0); }
sizeChime(); addEventListener('resize', sizeChime);
let lastPX = null;
chCv.addEventListener('pointerdown', () => { chime.v += (Math.random() < 0.5 ? -1 : 1) * 0.06; });
chCv.addEventListener('pointermove', (e) => { if (lastPX != null) chime.v += (e.clientX - lastPX) * 0.0012; lastPX = e.clientX; });
chCv.addEventListener('pointerleave', () => { lastPX = null; });
function stepChime(dt, now) {
  const w = chCv.clientWidth, h = chCv.clientHeight; if (!w) return;
  // 바람: 휴대폰 기울기(좌우) + 흔들림
  if (IS_MOBILE && sensor.on && inView('chime')) chime.v += (sensor.tiltX * 0.0016 + (Math.random() - 0.5) * sensor.shake * 0.02) * dt / 16;
  chime.v += (-chime.a * 0.0022 - chime.v * 0.012) * dt / 16 + Math.sin(now / 1700) * 0.00005 * dt; chime.a += chime.v * dt / 16;
  chime.a = Math.max(-0.9, Math.min(0.9, chime.a));
  if (Math.abs(chime.v) > 0.018 && now - chime.last > 380 && inView('chime')) { chime.last = now; sound.chime(PENTA[(Math.random() * PENTA.length) | 0]); if (IS_MOBILE) sensor.vibrate(8); }
  chx.clearRect(0, 0, w, h);
  // 처마
  chx.strokeStyle = '#3a3227'; chx.lineWidth = 5; chx.beginPath(); chx.moveTo(w * 0.05, 34); chx.quadraticCurveTo(w * 0.5, 14, w * 0.95, 4); chx.stroke();
  const px = w * 0.5, py = 24;
  chx.save(); chx.translate(px, py); chx.rotate(chime.a * 0.35);
  chx.strokeStyle = '#4a3f30'; chx.lineWidth = 1.5; chx.beginPath(); chx.moveTo(0, 0); chx.lineTo(0, 36); chx.stroke();
  // 종 몸체
  chx.fillStyle = '#5d6b55'; chx.beginPath(); chx.moveTo(-26, 96); chx.quadraticCurveTo(-28, 40, 0, 36); chx.quadraticCurveTo(28, 40, 26, 96); chx.closePath(); chx.fill();
  chx.strokeStyle = '#c3a160'; chx.lineWidth = 1.5; chx.beginPath(); chx.moveTo(-24, 84); chx.lineTo(24, 84); chx.stroke();
  // 추 + 물고기
  chx.rotate(chime.a * 0.9); chx.strokeStyle = '#4a3f30'; chx.lineWidth = 1.2; chx.beginPath(); chx.moveTo(0, 60); chx.lineTo(0, 150); chx.stroke();
  chx.fillStyle = '#3a3227'; chx.beginPath(); chx.arc(0, 98, 5, 0, 6.283); chx.fill();
  chx.translate(0, 168); chx.fillStyle = '#7d8f73';
  chx.beginPath(); chx.moveTo(0, -18); chx.quadraticCurveTo(16, 0, 0, 22); chx.quadraticCurveTo(-16, 0, 0, -18); chx.fill();
  chx.beginPath(); chx.moveTo(0, 20); chx.lineTo(-10, 36); chx.lineTo(10, 36); chx.closePath(); chx.fill();
  chx.fillStyle = '#f4f1e6'; chx.beginPath(); chx.arc(-4, -6, 2.4, 0, 6.283); chx.fill();
  chx.restore();
}

/* ---------- 3. 범종 ---------- */
const bellBtn = $('[data-bell]'), bellN = $('.bell-n b');
function strike() {
  audio(); if (!soundOn) setSound(true); sound.bell(); stats.bell++; bellN.textContent = stats.bell;
  bellBtn.classList.remove('ring'); void bellBtn.offsetWidth; bellBtn.classList.add('ring');
  if (IS_MOBILE) sensor.vibrate([60, 120, 40, 200, 20]);
}
bellBtn.addEventListener('click', strike);
sensor.onShake((f) => { if (inView('bell') && f > 0.35) strike(); });

/* ---------- 4. 목탁 ---------- */
const mokBtn = $('[data-mok]'), beats = $('.mok-beats'), mokHint = $('.moktak .hint'); const hits = [];
function knock() {
  audio(); if (!soundOn) setSound(true); sound.mok();
  mokBtn.classList.remove('hit'); void mokBtn.offsetWidth; mokBtn.classList.add('hit');
  const i = document.createElement('i'); beats.appendChild(i); setTimeout(() => i.remove(), 900);
  if (IS_MOBILE) sensor.vibrate(12);
  const now = performance.now(); hits.push(now); if (hits.length > 8) hits.shift();
  if (hits.length >= 6) { const iv = hits.slice(1).map((x, k) => x - hits[k]), m = iv.reduce((a, b) => a + b) / iv.length, sd = Math.sqrt(iv.reduce((a, b) => a + (b - m) ** 2, 0) / iv.length); if (sd / m < 0.12 && m > 250) mokHint.textContent = t('고른 박자예요. 마음도 고르게.'); }
}
mokBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); knock(); });
addEventListener('keydown', (e) => { if (e.code === 'Space' && inView('moktak')) { e.preventDefault(); knock(); } });

/* ---------- 5. 세 번의 절 ---------- */
const bowDots = [...document.querySelectorAll('.bow-dots i')], bowSay = $('.bow-say');
const BOWS = ['첫 번째 절 — 나를 낮추며', '두 번째 절 — 곁의 사람을 생각하며', '세 번째 절 — 모든 생명이 평안하기를'];
let wasDown = false;
function bow() {
  const n = stats.bow % 3; stats.bow++;
  bowDots.forEach((d, i) => d.classList.toggle('on', i <= n));
  bowSay.textContent = t(BOWS[n]);
  if (soundOn) n === 2 ? sound.bowl() : sound.chime(392);
  if (IS_MOBILE) sensor.vibrate(n === 2 ? [40, 80, 40, 80, 160] : 40);
  if (n === 2) setTimeout(() => bowDots.forEach((d) => d.classList.remove('on')), 4000);
}
$('[data-bow]').addEventListener('click', bow);
sensor.onFaceDown((down) => { if (!inView('bow')) { wasDown = false; return; } if (down) wasDown = true; else if (wasDown) { wasDown = false; bow(); } });

/* ---------- 6. 연등 ---------- */
$('[data-wish]').addEventListener('submit', (e) => {
  e.preventDefault(); const inp = e.currentTarget.querySelector('input'), text = (inp.value.trim() || t('모두가 평안하기를')).slice(0, 40);
  lanterns.push({ x: innerWidth * (0.3 + Math.random() * 0.4), y: innerHeight * 0.75, age: 0, ph: Math.random() * 6, sp: 0.8 + Math.random() * 0.4, sc: 1.1, text });
  for (let k = 0; k < 4; k++) lanterns.push({ x: innerWidth * Math.random(), y: innerHeight * (0.85 + Math.random() * 0.3), age: 0, ph: Math.random() * 6, sp: 0.5 + Math.random() * 0.5, sc: 0.5 + Math.random() * 0.4 });
  stats.lantern++; inp.value = ''; inp.blur(); if (soundOn) sound.chime(659.25); if (IS_MOBILE) sensor.vibrate(20);
});

/* ---------- 7. 좌선 ---------- */
const veil = $('.zen-veil'), zvT = $('.zv-t'), zenTime = $('.zen-time');
let zenOn = false, zenEnd = 0, zenStart = 0, zenTick = 0;
const fmt = (ms) => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
function stopZen(done) {
  if (!zenOn) return; zenOn = false; clearInterval(zenTick); veil.hidden = true;
  stats.zen += Math.round((Date.now() - zenStart) / 1000);
  if (ac) amb.gain.setTargetAtTime(soundOn ? 1 : 0, ac.currentTime, 1.2);
  if (done) { audio(); if (soundOn) sound.bell(); if (IS_MOBILE) sensor.vibrate([200, 150, 200]); zenTime.textContent = t('좌선을 마쳤어요'); }
}
document.querySelectorAll('[data-zen]').forEach((b) => b.addEventListener('click', () => {
  audio(); if (!soundOn) setSound(true);
  const min = +b.dataset.zen; zenOn = true; zenStart = Date.now(); zenEnd = zenStart + min * 60000; veil.hidden = false; zvT.textContent = fmt(min * 60000);
  amb.gain.setTargetAtTime(0.35, ac.currentTime, 2); sound.bowl(); keepAwake();
  zenTick = setInterval(() => { const left = zenEnd - Date.now(); zvT.textContent = fmt(left); if (left <= 0) stopZen(true); }, 500);
}));
$('[data-zen-stop]').addEventListener('click', () => stopZen(false));

/* ---------- 8. 회향 ---------- */
function showStay() {
  const m = Math.max(1, Math.round((Date.now() - enteredAt) / 60000));
  $('.stay').textContent = `${t('머문 시간')} ${m}${t('분')} · ${t('범종')} ${stats.bell} · ${t('절')} ${stats.bow} · ${t('연등')} ${stats.lantern}`;
}

/* ---------- 매 프레임 ---------- */
let last = performance.now();
(function frame(now) {
  const dt = Math.min(50, now - last); last = now;
  tickTilt(); drawMtn(now); drawFx(dt); stepChime(dt, now); drawCandle(now);
  requestAnimationFrame(frame);
})(last);
