// 결제창에서 돌아오는 페이지 (토스페이먼츠 successUrl / failUrl)
// 성공: 서버에 승인 요청(서버가 주문 금액과 비교) → 주문 완료 표시. 실패: 사유 표시 + 다시 시도.
import { confirm, orders } from './shop-pay.js?v=1';
import { lang } from './i18n.js?v=5';
import { esc } from './data.js?v=26';

const W = {
  ko: { ok: '주문이 완료됐어요', okT: '작품 포장과 배송 일정은 입력한 연락처로 안내해 드려요. 주문 내역은 마이 → 나의 컬렉트에서 볼 수 있어요.', fail: '결제가 완료되지 않았어요', failT: '결제가 취소되었거나 실패했어요. 작품 예약은 잠시 뒤 풀려요.', err: '결제 확인에 실패했어요', errT: '결제가 승인되지 않았다면 자동으로 취소돼요. 문제가 계속되면 고객센터로 주문번호를 알려 주세요.', no: '주문번호', amt: '결제 금액', work: '작품', reason: '사유', back: '앱으로 돌아가기', test: '시험 모드 — 실제 결제가 아니에요' },
  en: { ok: 'Your order is complete', okT: 'We’ll contact you about packing and delivery. See your orders in My → My collect.', fail: 'Payment was not completed', failT: 'The payment was cancelled or failed. The artwork hold will be released shortly.', err: 'We couldn’t confirm the payment', errT: 'If it wasn’t approved, it will be cancelled automatically. If this continues, contact us with your order number.', no: 'Order no.', amt: 'Amount', work: 'Artwork', reason: 'Reason', back: 'Back to the app', test: 'Test mode — not a real payment' },
  zh: { ok: '订单已完成', okT: '我们会通过你填写的联系方式告知包装与配送安排。订单可在“我的 → 我的收藏”查看。', fail: '支付未完成', failT: '支付已取消或失败，作品预留将很快解除。', err: '支付确认失败', errT: '若未获批准将自动取消。如问题持续，请把订单号告诉客服。', no: '订单号', amt: '金额', work: '作品', reason: '原因', back: '返回应用', test: '测试模式 — 并非真实支付' },
  ja: { ok: 'ご注文が完了しました', okT: '梱包と配送の日程は、ご入力の連絡先にご案内します。注文履歴はマイ → マイコレクトで確認できます。', fail: '決済が完了しませんでした', failT: '決済がキャンセルされたか失敗しました。作品の取り置きはまもなく解除されます。', err: '決済の確認に失敗しました', errT: '承認されていない場合は自動的に取り消されます。解決しない場合は注文番号をお知らせください。', no: '注文番号', amt: 'お支払い金額', work: '作品', reason: '理由', back: 'アプリに戻る', test: 'テストモード — 実際の決済ではありません' },
};
const t = (k) => (W[lang] || W.en)[k];
const q = new URLSearchParams(location.search), box = document.getElementById('co');
const backTo = (() => { try { return sessionStorage.getItem('nebula-shop-back') || 'app.html'; } catch (e) { return 'app.html'; } })();
const mark = '<img class="mark" src="assets/nebula-mark.svg" alt="">';
const won = (n) => `${Number(n || 0).toLocaleString('ko-KR')}${lang === 'ko' ? '원' : ' KRW'}`;
function show(title, text, rows) {
  box.innerHTML = `${mark}<h1>${esc(title)}</h1><p>${esc(text)}</p>${q.get('test') ? `<p class="small">${esc(t('test'))}</p>` : ''}
    ${rows.length ? `<dl>${rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>` : ''}
    <a class="btn black" href="${esc(backTo)}#orders">${esc(t('back'))}</a>`;
}
const orderId = q.get('orderId') || '', o = orders().find((x) => x.orderId === orderId) || {};
if (q.get('result') === 'success' && q.get('paymentKey') && orderId) {
  // 같은 주소를 새로 고쳐도 승인을 두 번 부르지 않게
  const done = o.status === 'paid' ? Promise.resolve(o) : confirm({ paymentKey: q.get('paymentKey'), orderId, amount: q.get('amount') });
  done.then(() => show(t('ok'), t('okT'), [[t('no'), orderId], [t('work'), o.title || ''], [t('amt'), won(q.get('amount'))]].filter(([, v]) => v)))
    .catch(() => show(t('err'), t('errT'), [[t('no'), orderId]]));
  history.replaceState(null, '', location.pathname + '?result=done&orderId=' + encodeURIComponent(orderId)); // 결제 키를 주소창에 남기지 않음
} else if (q.get('result') === 'done' && orderId) {
  show(o.status === 'paid' ? t('ok') : t('err'), o.status === 'paid' ? t('okT') : t('errT'), [[t('no'), orderId], [t('work'), o.title || ''], [t('amt'), o.amount ? won(o.amount) : '']].filter(([, v]) => v));
} else {
  show(t('fail'), t('failT'), [[t('no'), orderId], [t('reason'), q.get('message') || q.get('code') || '']].filter(([, v]) => v));
}
