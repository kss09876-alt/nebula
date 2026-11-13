// ARTMOS 로그인·회원가입 — 소셜(카카오·Apple·구글) + 이메일 회원가입 (Supabase Auth)
// config.auth.supabaseUrl · supabaseAnonKey 를 채우면 실제로 동작. 비어 있으면 '곧 열려요' 안내 후 둘러보기.
// ?authtest=1 → 이 기기에서만 로그인·가입을 흉내 냄(실제 계정 아님). 설정·순서: docs/auth/README.md
// 비밀번호는 이 코드에서 저장하지 않음(Supabase가 암호화해 보관). 개인정보 동의 기록은 서버 profiles 표에.
import { CONFIG } from './config.js?v=25';
import { lang } from './i18n.js?v=6';

const A = CONFIG.auth || {};
export const AUTH_TEST = new URLSearchParams(location.search).has('authtest') || (() => { try { return sessionStorage.getItem('artmos-authtest') === '1'; } catch (e) { return false; } })();
if (AUTH_TEST) { try { sessionStorage.setItem('artmos-authtest', '1'); } catch (e) {} }
export const AUTH_ON = AUTH_TEST || !!(A.supabaseUrl && A.supabaseAnonKey);
export const PROVIDERS = (A.providers || ['kakao', 'apple', 'google']).filter((p) => ['kakao', 'apple', 'google'].includes(p));

const W = {
  ko: { head: '세상의 예술을\n가까이 만나는 공간', sub: '로그인하고 나만의 전시 기록을 남겨 보세요', kakao: '카카오로 시작하기', apple: 'Apple로 계속하기', google: 'Google로 계속하기', or: '또는', email: '이메일로 가입하기', haveAcc: '이미 계정이 있어요', login: '로그인', browse: '로그인 없이 둘러보기', soon: '로그인은 곧 열려요. 지금은 둘러보기로 시작할게요.',
    signupT: '이메일로 가입하기', loginT: '이메일로 로그인', mail: '이메일', pw: '비밀번호', pw2: '비밀번호 확인', pwHint: '영문과 숫자를 섞어 8자 이상', all: '전체 동의', a1: '[필수] 이용약관', a2: '[필수] 개인정보 수집·이용', a3: '[필수] 만 14세 이상이에요', a4: '[선택] 새 전시·이벤트 소식 받기', view: '보기', signup: '가입하기', forgot: '비밀번호를 잊었어요', reset: '재설정 메일 보내기', resetT: '비밀번호 재설정', resetSent: '재설정 메일을 보냈어요. 메일함을 확인해 주세요.',
    eMail: '이메일 주소를 확인해 주세요.', ePw: '비밀번호는 영문과 숫자를 섞어 8자 이상이어야 해요.', ePw2: '비밀번호가 서로 달라요.', eAgree: '필수 항목에 동의해 주세요.', eLogin: '이메일 또는 비밀번호가 맞지 않아요.', eExist: '이미 가입된 이메일이에요. 로그인해 주세요.', eNet: '연결이 불안정해요. 잠시 뒤 다시 시도해 주세요.', eConfirm: '메일 인증을 먼저 마쳐 주세요.',
    verifyT: '메일함을 확인해 주세요', verify: '{m} 으로 인증 메일을 보냈어요.\n메일의 링크를 누르면 가입이 끝나요.', verified: '인증을 마쳤어요', back: '뒤로', welcome: '환영해요!', test: '시험 모드 — 실제 계정이 아니에요',
    acc: '계정', loggedIn: '로그인됨', logout: '로그아웃', del: '계정 삭제', delT: '계정을 삭제할까요?', delB: '계정과 함께 소장 내역·구매 기록을 제외한 모든 정보가 지워지고 되돌릴 수 없어요. 법에 따라 보관해야 하는 결제 기록은 정해진 기간 뒤 지워져요.', delGo: '계정 삭제', cancel: '취소', deleted: '계정을 삭제했어요.', loggedOut: '로그아웃했어요.', signin: '로그인 / 회원가입', guest: '둘러보는 중', nickOk: '사용할 수 있는 이름이에요', nickTaken: '이미 다른 항해자가 쓰고 있는 이름이에요', nickBad: '2~20자, 한글·영문·숫자·띄어쓰기만 쓸 수 있어요', nickReserved: '쓸 수 없는 이름이에요', nickGuest: '로그인하면 다른 사람과 겹치지 않는 나만의 이름으로 지켜져요', nickChecking: '확인 중…' },
  en: { head: 'A space to meet\nthe world’s art up close', sub: 'Sign in to keep your own exhibition journal', kakao: 'Continue with Kakao', apple: 'Continue with Apple', google: 'Continue with Google', or: 'or', email: 'Sign up with email', haveAcc: 'I already have an account', login: 'Log in', browse: 'Look around without signing in', soon: 'Sign-in is coming soon. Let’s start by looking around.',
    signupT: 'Sign up with email', loginT: 'Log in with email', mail: 'Email', pw: 'Password', pw2: 'Confirm password', pwHint: 'At least 8 characters with letters and numbers', all: 'Agree to all', a1: '[Required] Terms of Service', a2: '[Required] Collection and use of personal data', a3: '[Required] I am 14 or older', a4: '[Optional] News about new exhibitions and events', view: 'View', signup: 'Sign up', forgot: 'Forgot password', reset: 'Send reset email', resetT: 'Reset password', resetSent: 'We sent a reset email. Please check your inbox.',
    eMail: 'Please check your email address.', ePw: 'Use at least 8 characters with letters and numbers.', ePw2: 'Passwords don’t match.', eAgree: 'Please agree to the required items.', eLogin: 'Email or password is incorrect.', eExist: 'This email is already registered. Please log in.', eNet: 'Connection problem. Please try again shortly.', eConfirm: 'Please confirm your email first.',
    verifyT: 'Check your inbox', verify: 'We sent a confirmation email to {m}.\nTap the link in it to finish signing up.', verified: 'I’ve confirmed', back: 'Back', welcome: 'Welcome!', test: 'Test mode — not a real account',
    acc: 'Account', loggedIn: 'Signed in', logout: 'Log out', del: 'Delete account', delT: 'Delete your account?', delB: 'Your account and all its data will be erased and cannot be restored. Payment records we must keep by law are deleted after the required period.', delGo: 'Delete account', cancel: 'Cancel', deleted: 'Your account was deleted.', loggedOut: 'You’ve logged out.', signin: 'Log in / Sign up', guest: 'Browsing as guest', nickOk: 'This name is available', nickTaken: 'Another voyager already uses this name', nickBad: '2–20 characters: letters, numbers and spaces only', nickReserved: 'This name can’t be used', nickGuest: 'Sign in to keep this name yours alone', nickChecking: 'Checking…' },
  zh: { head: '近距离遇见\n世界艺术的空间', sub: '登录后记录属于你的观展足迹', kakao: '使用 Kakao 开始', apple: '通过 Apple 继续', google: '通过 Google 继续', or: '或', email: '用邮箱注册', haveAcc: '我已有账号', login: '登录', browse: '不登录先看看', soon: '登录功能即将开放，先随便看看吧。',
    signupT: '用邮箱注册', loginT: '用邮箱登录', mail: '邮箱', pw: '密码', pw2: '确认密码', pwHint: '至少 8 位，包含字母和数字', all: '全部同意', a1: '[必选] 服务条款', a2: '[必选] 个人信息收集与使用', a3: '[必选] 我已满 14 岁', a4: '[可选] 接收新展览与活动消息', view: '查看', signup: '注册', forgot: '忘记密码', reset: '发送重置邮件', resetT: '重置密码', resetSent: '已发送重置邮件，请查收。',
    eMail: '请检查邮箱地址。', ePw: '密码至少 8 位，需包含字母和数字。', ePw2: '两次输入的密码不一致。', eAgree: '请同意必选项目。', eLogin: '邮箱或密码不正确。', eExist: '该邮箱已注册，请直接登录。', eNet: '网络不稳定，请稍后再试。', eConfirm: '请先完成邮箱验证。',
    verifyT: '请查收邮件', verify: '已向 {m} 发送验证邮件。\n点击邮件中的链接即可完成注册。', verified: '我已完成验证', back: '返回', welcome: '欢迎！', test: '测试模式 — 并非真实账号',
    acc: '账号', loggedIn: '已登录', logout: '退出登录', del: '注销账号', delT: '确定注销账号吗？', delB: '账号及所有信息将被删除且无法恢复。依法需保存的支付记录会在规定期限后删除。', delGo: '注销账号', cancel: '取消', deleted: '账号已注销。', loggedOut: '已退出登录。', signin: '登录 / 注册', guest: '以访客身份浏览', nickOk: '这个名字可以使用', nickTaken: '这个名字已被其他航行者使用', nickBad: '2–20 个字，只能使用文字、数字和空格', nickReserved: '不能使用这个名字', nickGuest: '登录后，这个名字只属于你', nickChecking: '确认中…' },
  ja: { head: '世界のアートに\nもっと近くで出会える場所', sub: 'ログインして、自分だけの観覧記録を残しましょう', kakao: 'Kakaoではじめる', apple: 'Appleで続ける', google: 'Googleで続ける', or: 'または', email: 'メールで登録', haveAcc: 'アカウントをお持ちの方', login: 'ログイン', browse: 'ログインせずに見る', soon: 'ログインはまもなく公開します。まずは見てみましょう。',
    signupT: 'メールで登録', loginT: 'メールでログイン', mail: 'メールアドレス', pw: 'パスワード', pw2: 'パスワード（確認）', pwHint: '英字と数字を含む8文字以上', all: 'すべてに同意', a1: '[必須] 利用規約', a2: '[必須] 個人情報の収集・利用', a3: '[必須] 14歳以上です', a4: '[任意] 新しい展示・イベントのお知らせ', view: '見る', signup: '登録する', forgot: 'パスワードを忘れた', reset: '再設定メールを送る', resetT: 'パスワードの再設定', resetSent: '再設定メールを送りました。メールをご確認ください。',
    eMail: 'メールアドレスを確認してください。', ePw: 'パスワードは英字と数字を含む8文字以上にしてください。', ePw2: 'パスワードが一致しません。', eAgree: '必須項目に同意してください。', eLogin: 'メールアドレスまたはパスワードが違います。', eExist: 'このメールアドレスは登録済みです。ログインしてください。', eNet: '接続が不安定です。しばらくしてからお試しください。', eConfirm: '先にメール認証を完了してください。',
    verifyT: 'メールをご確認ください', verify: '{m} に認証メールを送りました。\nメールのリンクを押すと登録が完了します。', verified: '認証しました', back: '戻る', welcome: 'ようこそ！', test: 'テストモード — 実際のアカウントではありません',
    acc: 'アカウント', loggedIn: 'ログイン中', logout: 'ログアウト', del: 'アカウント削除', delT: 'アカウントを削除しますか？', delB: 'アカウントとすべての情報が削除され、元に戻せません。法律で保管が必要な決済記録は所定の期間後に削除されます。', delGo: 'アカウントを削除', cancel: 'キャンセル', deleted: 'アカウントを削除しました。', loggedOut: 'ログアウトしました。', signin: 'ログイン / 新規登録', guest: 'ゲストとして閲覧中', nickOk: 'この名前は使えます', nickTaken: 'ほかの航海者がすでに使っている名前です', nickBad: '2〜20文字、文字・数字・スペースのみ使えます', nickReserved: 'この名前は使えません', nickGuest: 'ログインすると、ほかの人と重ならない自分だけの名前として守られます', nickChecking: '確認中…' },
};
export const at = (k, o) => { let s = (W[lang] || W.ko)[k] ?? W.ko[k] ?? k; if (o) s = s.replace(/\{(\w+)\}/g, (_, x) => o[x] ?? ''); return s; };
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const br = (s) => esc(s).replace(/\n/g, '<br>');

// ---------- 제공자: 시험 / Supabase ----------
const TKEY = 'artmos-authtest-user';
const testProvider = {
  async user() { try { return JSON.parse(localStorage.getItem(TKEY)); } catch (e) { return null; } },
  async oauth(p) { const u = { id: 'test-' + p, email: `${p}@test.local`, provider: p, at: Date.now() }; localStorage.setItem(TKEY, JSON.stringify(u)); return u; },
  async signUp(email) { return { needsConfirm: true, email }; },
  async signIn(email) { const u = { id: 'test-mail', email, provider: 'email', at: Date.now() }; localStorage.setItem(TKEY, JSON.stringify(u)); return u; },
  async reset() { return true; },
  async signOut() { localStorage.removeItem(TKEY); },
  async remove() { try { const u = JSON.parse(localStorage.getItem(TKEY)) || {}; localStorage.setItem(NKEY, JSON.stringify(testNicks().filter((x) => nickKey(x) !== nickKey(u.nick)))); } catch (e) {} localStorage.removeItem(TKEY); },
};
let sb = null;
async function supa() {
  if (sb) return sb;
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
  sb = createClient(A.supabaseUrl, A.supabaseAnonKey, { auth: { persistSession: true, detectSessionInUrl: true, flowType: 'pkce' } });
  sb.auth.onAuthStateChange(() => listeners.forEach((f) => f()));
  return sb;
}
const back = () => A.redirectTo || (location.origin + location.pathname); // 로그인 뒤 돌아올 주소(앱 껍데기는 자체 스킴 사용, docs 참고)
const supaProvider = {
  async user() { const c = await supa(); const { data } = await c.auth.getUser(); const u = data && data.user; return u ? { id: u.id, email: u.email, provider: (u.app_metadata && u.app_metadata.provider) || 'email' } : null; },
  async oauth(p) {
    const c = await supa(); const native = window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform();
    // 앱(WebView) 안에서는 구글이 로그인을 막으므로 시스템 브라우저로 열고 앱 스킴으로 돌아옴
    const { data, error } = await c.auth.signInWithOAuth({ provider: p, options: { redirectTo: native && A.appRedirect ? A.appRedirect : back(), skipBrowserRedirect: !!native, scopes: p === 'kakao' ? 'profile_nickname account_email' : undefined } });
    if (error) throw error;
    if (native && data && data.url) { const B = window.Capacitor.Plugins && window.Capacitor.Plugins.Browser; if (B) await B.open({ url: data.url }); else location.href = data.url; }
    return null; // 다녀온 뒤 onAuth 로 알게 됨
  },
  async signUp(email, pw, meta) { const c = await supa(); const { data, error } = await c.auth.signUp({ email, password: pw, options: { emailRedirectTo: back(), data: meta } }); if (error) throw error; return { needsConfirm: !data.session, email }; },
  async signIn(email, pw) { const c = await supa(); const { data, error } = await c.auth.signInWithPassword({ email, password: pw }); if (error) throw error; return { id: data.user.id, email: data.user.email, provider: 'email' }; },
  async reset(email) { const c = await supa(); const { error } = await c.auth.resetPasswordForEmail(email, { redirectTo: back() }); if (error) throw error; return true; },
  async signOut() { const c = await supa(); await c.auth.signOut(); },
  async remove() { const c = await supa(); const { error } = await c.functions.invoke('delete-account'); if (error) throw error; await c.auth.signOut(); },
};
const P = AUTH_TEST ? testProvider : supaProvider;
const listeners = new Set();
export const onAuth = (f) => { listeners.add(f); return () => listeners.delete(f); };
const emit = () => listeners.forEach((f) => f());
let cached = null;
export async function currentUser() { if (!AUTH_ON) return null; try { cached = await P.user(); } catch (e) { cached = null; } return cached; }
export const cachedUser = () => cached;

// ---------- 항해명(닉네임): 다른 사람과 겹치지 않게 ----------
// 서버가 있으면 profiles.nickname(대소문자·띄어쓰기 무시 유일)으로 확인·저장. 로그인 안 한 둘러보기는 기기 안에만(겹침 확인 불가).
const RESERVED = /^(artmos|아트모스|valix|valix ?lab|admin|관리자|운영자|official|공식)$/i;
export const nickKey = (n) => String(n || '').normalize('NFC').trim().replace(/\s+/g, ' ').toLowerCase();
export function nickFormat(n) {
  const v = String(n || '').normalize('NFC').trim().replace(/\s+/g, ' ');
  if (v.length < 2 || v.length > 20 || !/^[\p{L}\p{N} ]+$/u.test(v)) return { ok: false, msg: at('nickBad') };
  if (RESERVED.test(v.replace(/\s/g, ''))) return { ok: false, msg: at('nickReserved') };
  return { ok: true, value: v };
}
const NKEY = 'artmos-authtest-nicks';
const testNicks = () => { try { return JSON.parse(localStorage.getItem(NKEY)) || ['떠도는 혜성', '고요한 성운', 'Quiet Comet']; } catch (e) { return []; } };
// 쓸 수 있으면 true, 겹치면 false, 확인할 수 없으면(서버 없음·둘러보기) null
const noTable = (e) => ['PGRST205', '42P01', 'PGRST202'].includes(e && e.code); // 서버에 회원 표가 아직 없음 → 기기 안에만 저장
export async function nickAvailable(n) {
  if (!AUTH_ON || !cached) return null;
  const key = nickKey(n);
  if (AUTH_TEST) { const mine = await profileNick(); return nickKey(mine) === key || !testNicks().some((x) => nickKey(x) === key); }
  try { const c = await supa(); const { data, error } = await c.rpc('nickname_available', { p_nick: n }); if (error) throw error; return !!data; } catch (e) { return null; }
}
export async function profileNick() {
  if (!AUTH_ON || !cached) return null;
  if (AUTH_TEST) { try { return (JSON.parse(localStorage.getItem(TKEY)) || {}).nick || null; } catch (e) { return null; } }
  try { const c = await supa(); const { data } = await c.from('profiles').select('nickname').eq('id', cached.id).maybeSingle(); return (data && data.nickname) || null; } catch (e) { return null; }
}
// 저장: 겹치면 { ok:false, taken:true } (서버의 유일 제약이 마지막 판단)
export async function saveNick(n) {
  if (!AUTH_ON || !cached) return { ok: true, local: true };
  if (AUTH_TEST) {
    if ((await nickAvailable(n)) === false) return { ok: false, taken: true };
    const u = JSON.parse(localStorage.getItem(TKEY)) || {}; const list = testNicks().filter((x) => nickKey(x) !== nickKey(u.nick)); list.push(n);
    localStorage.setItem(NKEY, JSON.stringify(list)); u.nick = n; localStorage.setItem(TKEY, JSON.stringify(u)); return { ok: true };
  }
  try { const c = await supa(); const { error } = await c.from('profiles').update({ nickname: n }).eq('id', cached.id); if (error) { if (error.code === '23505') return { ok: false, taken: true }; if (noTable(error)) return { ok: true, local: true }; throw error; } return { ok: true }; }
  catch (e) { return { ok: false, msg: at('eNet') }; }
}

// ---------- 화면 ----------
const icon = {
  kakao: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#191600" d="M12 4C6.9 4 3 7.2 3 11.1c0 2.5 1.6 4.6 4 5.9l-.9 3.4 3.9-2.6c.6.1 1.3.1 2 .1 5.1 0 9-3.2 9-7.1S17.1 4 12 4z"/></svg>',
  apple: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.4 12.6c0-2 1.6-2.9 1.7-3-1-1.4-2.4-1.6-2.9-1.6-1.2-.1-2.4.7-3 .7s-1.6-.7-2.6-.7c-1.3 0-2.6.8-3.3 2-1.4 2.4-.4 6 1 8 .7 1 1.4 2 2.5 2 1 0 1.4-.6 2.6-.6s1.5.6 2.6.6c1.1 0 1.8-1 2.4-2 .8-1.1 1.1-2.2 1.1-2.3 0 0-2.1-.8-2.1-3.1zM14.5 6.6c.5-.7.9-1.6.8-2.6-.8 0-1.8.5-2.4 1.2-.5.6-1 1.6-.8 2.5.9.1 1.8-.4 2.4-1.1z"/></svg>',
  google: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.5l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z"/><path fill="#FBBC05" d="M6.4 13.9a6 6 0 0 1 0-3.8V7.5H3.1a10 10 0 0 0 0 9z"/><path fill="#EA4335" d="M12 6c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3.1 7.5l3.3 2.6C7.2 7.8 9.4 6 12 6z"/></svg>',
};
const testNote = () => (AUTH_TEST ? `<p class="au-test">${at('test')}</p>` : '');
const backBtn = (to) => `<button class="back" data-au="${to}" aria-label="${esc(at('back'))}"><svg viewBox="0 0 24 24"><path d="M20 12H4M10 6l-6 6 6 6"/></svg></button>`;
export function loginHTML() {
  return `${testNote()}<div class="au-top"><p class="au-logo">ARTMOS</p><h1>${br(at('head'))}</h1><p>${esc(at('sub'))}</p></div>
    <div class="ob-login au-login">
      ${PROVIDERS.map((p) => `<button class="btn au-${p}" data-au-social="${p}">${icon[p]}${esc(at(p))}</button>`).join('')}
      <div class="au-or"><span>${esc(at('or'))}</span></div>
      <button class="btn line" data-au="signup">${esc(at('email'))}</button>
      <p class="au-row"><span>${esc(at('haveAcc'))}</span><button class="link" data-au="login">${esc(at('login'))}</button></p>
      <button class="link au-browse" data-au="browse">${esc(at('browse'))} ›</button>
    </div>`;
}
const agreeRow = (n, k, href) => `<label class="au-chk"><input type="checkbox" name="${n}"><span>${esc(at(k))}</span>${href ? `<a href="${href}" target="_blank" rel="noopener">${esc(at('view'))}</a>` : ''}</label>`;
export function signupHTML() {
  return `${backBtn('login')}${testNote()}<h1 class="ob-h">${esc(at('signupT'))}</h1>
    <form class="au-form" data-au-form="signup" novalidate>
      <div class="field"><label for="au-mail">${esc(at('mail'))}</label><input id="au-mail" name="email" type="email" autocomplete="email" inputmode="email" required></div>
      <div class="field"><label for="au-pw">${esc(at('pw'))}</label><input id="au-pw" name="pw" type="password" autocomplete="new-password" minlength="8" required><p class="hint">${esc(at('pwHint'))}</p></div>
      <div class="field"><label for="au-pw2">${esc(at('pw2'))}</label><input id="au-pw2" name="pw2" type="password" autocomplete="new-password" required></div>
      <div class="au-agree">
        <label class="au-chk au-all"><input type="checkbox" name="all"><span>${esc(at('all'))}</span></label>
        ${agreeRow('a1', 'a1', 'terms.html')}${agreeRow('a2', 'a2', 'privacy.html')}${agreeRow('a3', 'a3')}${agreeRow('a4', 'a4')}
      </div>
      <p class="au-err" role="alert"></p>
      <button class="btn black" type="submit">${esc(at('signup'))}</button>
    </form>`;
}
export function loginFormHTML() {
  return `${backBtn('login')}${testNote()}<h1 class="ob-h">${esc(at('loginT'))}</h1>
    <form class="au-form" data-au-form="login" novalidate>
      <div class="field"><label for="au-mail">${esc(at('mail'))}</label><input id="au-mail" name="email" type="email" autocomplete="email" inputmode="email" required></div>
      <div class="field"><label for="au-pw">${esc(at('pw'))}</label><input id="au-pw" name="pw" type="password" autocomplete="current-password" required></div>
      <p class="au-err" role="alert"></p>
      <button class="btn black" type="submit">${esc(at('login'))}</button>
      <button class="link" type="button" data-au="reset">${esc(at('forgot'))}</button>
    </form>`;
}
export function resetHTML() {
  return `${backBtn('login-form')}<h1 class="ob-h">${esc(at('resetT'))}</h1>
    <form class="au-form" data-au-form="reset" novalidate>
      <div class="field"><label for="au-mail">${esc(at('mail'))}</label><input id="au-mail" name="email" type="email" autocomplete="email" inputmode="email" required></div>
      <p class="au-err" role="alert"></p><button class="btn black" type="submit">${esc(at('reset'))}</button></form>`;
}
export function verifyHTML(email) {
  return `${backBtn('login')}<div class="au-top au-verify"><svg viewBox="0 0 48 48" aria-hidden="true"><rect x="6" y="11" width="36" height="26" rx="4"/><path d="M7 13l17 13 17-13"/></svg><h1>${esc(at('verifyT'))}</h1><p>${br(at('verify', { m: email }))}</p></div>
    <div class="ob-login"><button class="btn black" data-au="login-form">${esc(at('verified'))}</button></div>`;
}

// ---------- 폼 처리 ----------
const MAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PWOK = (p) => p.length >= 8 && /[A-Za-z]/.test(p) && /\d/.test(p);
function errMsg(e) {
  const m = String((e && (e.message || e.code)) || '').toLowerCase();
  if (m.includes('already') || m.includes('registered')) return at('eExist');
  if (m.includes('confirm')) return at('eConfirm');
  if (m.includes('invalid') || m.includes('credentials')) return at('eLogin');
  return at('eNet');
}
// 버튼 처리. done(user) = 로그인 끝, show(screen, arg) = 화면 바꾸기. 처리했으면 true
export async function handleClick(e, { show, done, browse, toast }) {
  const all = e.target.closest('input[name="all"]');
  if (all) { all.form.querySelectorAll('input[type=checkbox]').forEach((c) => { c.checked = all.checked; }); return true; }
  const chk = e.target.closest('.au-agree input'); if (chk) { const f = chk.form; f.all.checked = ['a1', 'a2', 'a3', 'a4'].every((n) => f[n].checked); return false; }
  const s = e.target.closest('[data-au-social]');
  if (s) {
    if (!AUTH_ON) { toast(at('soon')); setTimeout(browse, 900); return true; }
    s.disabled = true;
    try { const u = await P.oauth(s.dataset.auSocial); if (u) { cached = u; emit(); done(u); } } catch (x) { toast(errMsg(x)); } finally { s.disabled = false; }
    return true;
  }
  const b = e.target.closest('[data-au]'); if (!b) return false;
  const k = b.dataset.au;
  if (k === 'browse') { browse(); return true; }
  show(k); return true;
}
export async function handleSubmit(e, { show, done, toast }) {
  const f = e.target.closest('[data-au-form]'); if (!f) return false;
  e.preventDefault();
  const err = f.querySelector('.au-err'), btn = f.querySelector('[type=submit]'), kind = f.dataset.auForm;
  const email = f.email.value.trim().toLowerCase();
  const fail = (m, el) => { err.textContent = m; if (el) el.focus(); };
  if (!MAIL.test(email)) return fail(at('eMail'), f.email), true;
  if (kind === 'signup') {
    if (!PWOK(f.pw.value)) return fail(at('ePw'), f.pw), true;
    if (f.pw.value !== f.pw2.value) return fail(at('ePw2'), f.pw2), true;
    if (!['a1', 'a2', 'a3'].every((n) => f[n].checked)) return fail(at('eAgree')), true;
  }
  if (kind === 'login' && !f.pw.value) return fail(at('eLogin'), f.pw), true;
  if (!AUTH_ON) { toast(at('soon')); return true; }
  err.textContent = ''; btn.disabled = true;
  try {
    if (kind === 'signup') {
      const r = await P.signUp(email, f.pw.value, { marketing: !!f.a4.checked, agreed_at: new Date().toISOString(), lang });
      if (r.needsConfirm) show('verify', email); else { cached = await P.user(); emit(); done(cached); }
    } else if (kind === 'login') { const u = await P.signIn(email, f.pw.value); cached = u; emit(); done(u); }
    else if (kind === 'reset') { await P.reset(email); toast(at('resetSent')); show('login-form'); }
  } catch (x) { fail(errMsg(x)); } finally { btn.disabled = false; }
  return true;
}
export async function signOut() { if (!AUTH_ON) return; await P.signOut(); cached = null; emit(); }
export async function deleteAccount() { if (!AUTH_ON) return; await P.remove(); cached = null; emit(); }

// 마이 탭 '계정' 줄
export function accountHTML(u) {
  const label = u ? `${esc(u.email || '')}<small>${esc(at('loggedIn'))} · ${esc(u.provider === 'email' ? at('mail') : at(u.provider).replace(/(로 시작하기|로 계속하기|Continue with |使用 | 开始|通过 | 继续|ではじめる|で続ける)/g, '').trim())}</small>` : `${esc(at('guest'))}`;
  return `<section class="sec"><div class="sec-h"><h2 class="h20">${esc(at('acc'))}</h2></div><div class="list">
    <div class="row au-acc"><b>${label}</b></div>
    ${u ? `<button class="row" data-acct="logout"><b>${esc(at('logout'))}</b></button><button class="row au-del" data-acct="delete"><b>${esc(at('del'))}</b></button>`
      : `<button class="row" data-acct="login"><b>${esc(at('signin'))}</b><span class="v">›</span></button>`}</div></section>`;
}
export const deleteConfirmHTML = () => `<div class="sh-h"><h3>${esc(at('delT'))}</h3></div><div class="nb-danger"><p>${esc(at('delB'))}</p><div class="nb-confirm-actions"><button class="btn line" data-close>${esc(at('cancel'))}</button><button class="btn black" data-acct="delete-go">${esc(at('delGo'))}</button></div></div>`;
