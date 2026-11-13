// ARTMOS — 데이터 소스 설정
// 구글 드라이브 'THE CELL (online exhibition)' 폴더(드라이브 폴더명은 그대로)의 시트 2개를 CMS로 사용합니다.
// 시트(또는 상위 폴더)는 '링크가 있는 모든 사용자 → 뷰어'로 공유되어 있어야 합니다.
export const CONFIG = {
  siteTitle: 'ARTMOS',
  cellsSheetId: '1hezkf49jcPnoKdPU2gehtd-QzKsiqfDi4zNe1_RGAjY',   // THE_CELL_cells
  blocksSheetId: '1-l-01Syw0RUxzIoZRDQaQzDjMHttL5gLlRBPUZyfzTk',  // THE_CELL_blocks
  // 시트를 읽지 못할 때 쓰는 저장소 내 백업 데이터
  fallbackUrl: 'data/cells.json',
  // 기획전: 여러 전시(셀)를 하나의 행성으로 묶음. members 순서가 방 순서입니다.
  groups: [
    // single: 방으로 나누지 않고 하나의 전시로 이어서 보여줌 (위성·방 목록 없음)
    { id: 'g001', title: '최초의 방', subtitle: '빛 · 소리 · 우주 — 하나로 이어지는 개관 전시', artist: 'ARTMOS 개관 전시', period: '2026.10 – 2026.12',
      color: '#c9d6ff', fx: 'stars', single: true, members: ['c001', 'c002', 'c003'] },
  ],
  // 메인 그리드 최소 큐브 수 (모자라면 빈 셀로 채움)
  minCubes: 12,
  // 유료화(멤버십) — 실제 결제를 붙이기 전까지 enabled: false (모든 전시 공개, 멤버십 화면은 '준비 중')
  // paid: 유료 전시 id 목록(시트 cells 의 paid 칸으로도 지정 가능), previewBlocks: 무료로 보여 줄 블록 수
  // 권리 정리 전에는 어떤 전시도 유료로 지정하지 말 것. 구성 설명: docs/paid/README.md
  paywall: { enabled: false, paid: ['c005'], previewBlocks: 3 }, // 유료 지정: c005 빛쌀(진시영·김동선, 작가 계약 완료). enabled가 false면 아무것도 잠기지 않음
  // 온라인 아트 판매(앱 '컬렉트' 탭) — 작품은 data/artworks.json, 또는 cells 시트에 'artworks' 탭을 만들면 그게 우선
  // inquiryEmail: 구매 문의를 받을 메일 주소(비어 있으면 '문의 창구 준비 중'), showSamples: 예시 작품 보이기(실제 작품이 생기면 false)
  // 실물 작품은 애플·구글 인앱결제 대상이 아님(실물 상품) → 나중에 토스페이먼츠 등 일반 결제 연결 가능. 지금은 문의 방식만.
  // pay: 실물 작품 일반 결제(토스페이먼츠 결제창). clientKey(test_ck_… / live_ck_…)와 서버 주소(api, Supabase Edge Functions)가 둘 다 있어야 켜짐.
  //      시크릿 키는 절대 여기에 넣지 말 것(서버 환경 변수). 시험은 ?shoptest=1. 설명 docs/shop/README.md
  // shippingKrw: 국내 배송비(작품가에 더해 결제). 해외 배송은 문의로. seller: 판매자 정보(전자상거래법 표시, 대괄호는 채울 것)
  shop: { enabled: true, sheetTab: 'artworks', inquiryEmail: '', showSamples: true,
    pay: { enabled: false, provider: 'toss', clientKey: '', api: '' },
    shippingKrw: 0,
    seller: { name: '[상호]', ceo: '[대표자]', bizNo: '[사업자등록번호]', mailOrderNo: '[통신판매업 신고번호]', address: '[사업장 주소]', contact: '[고객센터 연락처]' } },
  // 로그인·회원가입(Supabase Auth): 카카오·Apple·구글 + 이메일. 두 값을 채우면 켜짐(anon 키는 공개돼도 되는 키, 서비스 키는 절대 넣지 말 것)
  // appRedirect: 앱(Capacitor)에서 로그인 뒤 돌아올 앱 주소(예: 'artmos://auth'), redirectTo: 웹에서 돌아올 주소(비우면 지금 페이지)
  // 설정 순서: docs/auth/README.md
  auth: { supabaseUrl: 'https://tyuvosvhmvmlbbinhehz.supabase.co', supabaseAnonKey: 'sb_publishable_dwqT2vrjDRbADssUkt6iCA_xgTtTAKM', // 공개용(publishable) 키 — 비밀 키 아님
    providers: ['kakao', 'apple', 'google'], appRedirect: '', redirectTo: '' },
};
