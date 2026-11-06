// 공용 영상 플레이어 — 가볍게, 끊김 없이
// 1) 처음엔 썸네일+재생 버튼만 (무거운 플레이어를 미리 띄우지 않음)
// 2) 화면에 가까워지면 영상 서버에 미리 연결(preconnect)
// 3) 구글 드라이브 영상은 기본 <video>로 바로 스트리밍 → 안 되면 드라이브 플레이어로 자동 전환 → 그래도 안 되면 '드라이브에서 열기'
// 4) 한 번에 하나만 재생 (다른 영상은 멈추고 정리)
const L = {
  ko: { load: '영상을 불러오는 중…', slow: '느리면 여기서 열어 보세요', open: 'Google Drive에서 열기 ↗', yt: 'YouTube에서 열기 ↗', play: '영상 재생' },
  en: { load: 'Loading video…', slow: 'If it’s slow, open it here', open: 'Open in Google Drive ↗', yt: 'Open on YouTube ↗', play: 'Play video' },
  zh: { load: '正在加载视频…', slow: '如果太慢，请在这里打开', open: '在 Google Drive 中打开 ↗', yt: '在 YouTube 中打开 ↗', play: '播放视频' },
  ja: { load: '動画を読み込み中…', slow: '遅いときはこちらで開いてください', open: 'Google Driveで開く ↗', yt: 'YouTubeで開く ↗', play: '動画を再生' },
};
const words = () => L[(document.documentElement.lang || 'ko').slice(0, 2)] || L.ko; // 페이지 언어를 그때그때 읽음
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function parseVideo(v) {
  const s = String(v || '').trim(); if (!s) return null;
  let m = s.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/); if (m) return { kind: 'yt', id: m[1] };
  m = s.match(/vimeo\.com\/(?:video\/)?(\d+)/); if (m) return { kind: 'vimeo', id: m[1] };
  m = s.match(/\/d\/([\w-]{20,})/) || s.match(/[?&]id=([\w-]{20,})/) || s.match(/^([\w-]{25,})$/); if (m) return { kind: 'drive', id: m[1] };
  if (/\.(mp4|webm|m4v|mov)(\?|$)/i.test(s)) return { kind: 'file', url: s };
  return { kind: 'frame', url: s };
}
const poster = (p, w = 1000) => p.kind === 'yt' ? `https://i.ytimg.com/vi/${p.id}/${w > 600 ? 'hqdefault' : 'mqdefault'}.jpg` : p.kind === 'drive' ? `https://drive.google.com/thumbnail?id=${p.id}&sz=w${w}` : '';
const HOSTS = { yt: ['https://www.youtube-nocookie.com', 'https://i.ytimg.com'], vimeo: ['https://player.vimeo.com'], drive: ['https://drive.usercontent.google.com', 'https://drive.google.com'] };

// 썸네일 + 재생 버튼 (cls로 페이지 스타일을 붙임)
export function videoHTML(src, { title = '', cls = '', btn = 'vx-btn', w = 1000 } = {}) {
  const p = parseVideo(src); if (!p) return '';
  const img = poster(p, w);
  return `<div class="vx-v ${cls}" data-vsrc="${esc(src)}">${img ? `<img src="${img}" alt="" loading="lazy" decoding="async" onerror="this.remove()">` : ''}<button class="${btn}" aria-label="${esc(title || words().play)}"><span>▶</span>${esc(title)}</button></div>`;
}

let active = null; // { el, stop }
const hooks = { play: [], stop: [] };
export function onVideo(ev, fn) { hooks[ev].push(fn); }
export function stopVideos() { if (active) { const a = active; active = null; a.stop(); hooks.stop.forEach((f) => f()); } }

function frame(el, url) { const f = document.createElement('iframe'); f.src = url; f.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media'; f.allowFullscreen = true; f.title = 'video'; el.appendChild(f); return f; }
function busy(el) { const b = document.createElement('div'); b.className = 'vx-busy'; b.innerHTML = `<i></i><span>${words().load}</span>`; el.appendChild(b); return b; }
function escape(el, href, label) { const a = document.createElement('a'); a.className = 'vx-out'; a.href = href; a.target = '_blank'; a.rel = 'noopener'; a.innerHTML = `<small>${words().slow}</small>${label}`; el.appendChild(a); return a; }

// 재생 시작 (사용자가 누른 순간에 불러야 iPhone에서도 소리와 함께 재생됨)
export function playVideo(el) {
  const p = parseVideo(el.dataset.vsrc); if (!p) return;
  stopVideos();
  const saved = el.innerHTML; el.classList.add('vx-on');
  const restore = () => { el.innerHTML = saved; el.classList.remove('vx-on'); };
  el.innerHTML = '';
  const b = busy(el); let timers = [];
  const done = () => { b.remove(); };
  if (p.kind === 'drive') { // 구글이 외부 사이트의 직접 재생을 막아서(형식 오류) 바로 드라이브 플레이어로
    const f = frame(el, `https://drive.google.com/file/d/${p.id}/preview`);
    f.addEventListener('load', () => setTimeout(done, 700), { once: true });
    timers.push(setTimeout(() => escape(el, `https://drive.google.com/file/d/${p.id}/view`, words().open), 9000));
    active = { el, stop: () => { timers.forEach(clearTimeout); restore(); } };
  } else if (p.kind === 'file') {
    const v = document.createElement('video');
    v.controls = true; v.playsInline = true; v.setAttribute('playsinline', ''); v.setAttribute('webkit-playsinline', ''); v.preload = 'auto';
    const img = poster(p); if (img) v.poster = img;
    v.src = p.kind === 'file' ? p.url : `https://drive.usercontent.google.com/download?id=${p.id}&export=download&confirm=t`;
    el.insertBefore(v, b);
    let ok = false, swapped = false;
    const good = () => { ok = true; done(); };
    const toFrame = () => { // 기본 재생이 안 되면 드라이브 플레이어로
      if (ok || swapped || p.kind === 'file') return; swapped = true;
      v.pause(); v.removeAttribute('src'); v.load(); v.remove();
      const f = frame(el, `https://drive.google.com/file/d/${p.id}/preview`);
      f.addEventListener('load', () => setTimeout(done, 600), { once: true });
      timers.push(setTimeout(() => escape(el, `https://drive.google.com/file/d/${p.id}/view`, words().open), 9000));
    };
    v.addEventListener('loadeddata', good, { once: true }); v.addEventListener('playing', good, { once: true });
    let gotBytes = false; v.addEventListener('progress', () => { gotBytes = true; });
    v.addEventListener('error', toFrame, { once: true });
    timers.push(setTimeout(() => { if (ok) return; if (gotBytes) timers.push(setTimeout(() => { if (!ok) toFrame(); }, 8000)); else toFrame(); }, 9000)); // 받는 중이면 조금 더 기다림
    const pr = v.play(); if (pr) pr.catch(() => {});
    active = { el, stop: () => { timers.forEach(clearTimeout); try { v.pause(); v.removeAttribute('src'); v.load(); } catch (e) {} restore(); } };
  } else {
    const url = p.kind === 'yt' ? `https://www.youtube-nocookie.com/embed/${p.id}?autoplay=1&playsinline=1&rel=0&modestbranding=1` : p.kind === 'vimeo' ? `https://player.vimeo.com/video/${p.id}?autoplay=1&playsinline=1` : p.url;
    const f = frame(el, url); f.addEventListener('load', () => setTimeout(done, 400), { once: true });
    if (p.kind === 'yt') timers.push(setTimeout(() => escape(el, `https://www.youtube.com/watch?v=${p.id}`, words().yt), 10000));
    active = { el, stop: () => { timers.forEach(clearTimeout); restore(); } };
  }
  hooks.play.forEach((f) => f(el));
}

// 페이지 안의 영상 버튼 연결 + 가까워지면 미리 연결
const warmed = new Set();
function warm(kind) { (HOSTS[kind] || []).forEach((h) => { if (warmed.has(h)) return; warmed.add(h); const l = document.createElement('link'); l.rel = 'preconnect'; l.href = h; l.crossOrigin = ''; document.head.appendChild(l); }); }
const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { const p = parseVideo(e.target.dataset.vsrc); if (p) warm(p.kind); io.unobserve(e.target); } }), { rootMargin: '600px 0px' }) : null;
export function mountVideos(root = document) {
  root.querySelectorAll('.vx-v:not([data-vx])').forEach((el) => {
    el.dataset.vx = '1'; if (io) io.observe(el);
    el.addEventListener('click', (e) => { if (el.classList.contains('vx-on')) return; e.preventDefault(); e.stopPropagation(); playVideo(el); });
  });
}
// 화면이 가려지면 멈춤 (배터리·데이터 절약)
document.addEventListener('visibilitychange', () => { if (document.hidden && active) { const v = active.el.querySelector('video'); if (v) v.pause(); } });

// 공용 스타일 (한 번만)
if (!document.getElementById('vx-style')) {
  const s = document.createElement('style'); s.id = 'vx-style';
  s.textContent = `.vx-v{position:relative;aspect-ratio:16/9;background:#000;overflow:hidden;cursor:pointer}
.vx-v>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.72}
.vx-v video,.vx-v iframe{position:absolute;inset:0;width:100%;height:100%;border:0;background:#000}
.vx-v.vx-on{cursor:auto}
.vx-btn{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:#fff;font:700 14px/1.3 inherit;background:radial-gradient(circle,rgba(0,0,0,.15),rgba(0,0,0,.55));border:0;cursor:pointer}
.vx-btn span{display:grid;place-items:center;width:64px;height:64px;border-radius:50%;border:1px solid rgba(255,255,255,.75);font-size:20px;padding-left:4px;transition:background .2s,color .2s}
.vx-btn:hover span{background:#fff;color:#000}
.vx-busy{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;color:rgba(255,255,255,.8);font-size:13px;pointer-events:none;background:rgba(0,0,0,.35)}
.vx-busy i{width:34px;height:34px;border-radius:50%;border:2px solid rgba(255,255,255,.2);border-top-color:#fff;animation:vxspin .8s linear infinite}
@keyframes vxspin{to{transform:rotate(360deg)}}
.vx-out{position:absolute;left:50%;bottom:12px;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 14px;border-radius:999px;background:rgba(0,0,0,.75);color:#fff;font-size:13px;font-weight:700;text-decoration:none;white-space:nowrap;z-index:2}
.vx-out small{font-size:11px;font-weight:400;opacity:.75}`;
  document.head.appendChild(s);
}
