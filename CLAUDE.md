# XPACE (엑스페이스) — 작업 안내서

온라인 인터랙티브 전시 플랫폼. "온라인에서 마주하는 무한한 가치의 공간."
VALIX의 X(Value X) = 무한한 우주. 전시 하나가 행성 하나. 미시적 삶보다 거시적인 것을 바라보며 생각과 마음의 폭을 넓히자는 의미.

- 사이트: https://kss09876-alt.github.io/the-cell/ (GitHub Pages, main 브랜치 루트에서 바로 배포, 빌드 없음)
- 저장소 이름은 아직 `the-cell` (옛 이름 THE CELL). 바꾸면 주소가 바뀌니 주의.
- 소유자 언어: 한국어. 답변은 한국어로, 짧고 쉽게.

## 구조
| 파일 | 역할 |
|---|---|
| `index.html` + `js/main.js` | 홈 행성계 (Three.js, `js/vendor/three.module.js` importmap) |
| `js/home-mobile.js` | 홈 모바일 전용: 나침반 고리(행성계가 방위에 맞춰 회전), 기울이기, 흔들기, 좌우 스와이프, 하단 행성 시트 |
| `cell.html` + `js/cell.js` | 전시 페이지. 블록 렌더러(cover, text, quote, sticky, timeline, quantum, prism, shadow, soundmap, listen, piano, wave, video …). `?id=g001`이면 기획전(방 여러 개를 한 페이지로) |
| `bitssal.html` + `js/bitssal.js` | X-003 빛쌀 단독 스크롤 스토리 (캔버스 쌀알 1,900개, 14장면). 끝부분에 모바일 전용 블록(흔들기·AR) |
| `js/sensors.js` | 모바일 센서 공용: `IS_MOBILE`, `sensor`(tiltX/tiltY/heading/shake/spin/faceDown/blow, onShake/onSpin/onFaceDown/onBlow, vibrate, enable), `startCamera`, `startMic`, `getPosition`/`distanceKm`, `keepAwake`(화면 꺼짐 방지), `onPinch` |
| `js/data.js` | 데이터 로드: 구글 시트(gviz) → 실패 시 `data/cells.json`. 기획전 묶기, 번호 재부여(X-001…), 다국어 적용 |
| `js/config.js` | 시트 ID, `groups`(기획전: g001 최초의 행성 = c001·c002·c003) |
| `js/i18n.js`, `js/i18n-dict.js` | 다국어(ko/en/zh/ja). `tr(한국어문장)`으로 화면 문구 번역, 언어 선택 버튼 |
| `data/i18n.json` | 전시 본문 번역 (키 `셀ID:순서`). 시트에 `title_en` 같은 칸이 있으면 그게 우선 |
| `js/bitssal-i18n-{en,zh,ja}.js` | 빛쌀 장면 번역 (장면 id · 카드 순서 기준 덮어쓰기) |
| `js/home-sound.js`, `js/bitssal-sound.js` | Web Audio 실시간 합성 사운드 (음원 파일 없음). 자동재생 시도 → 막히면 입장 화면 |
| `css/style.css`, `css/bitssal.css` | 스타일 (끝부분에 모바일 블록) |
| `first.html` | 예전 기획전 허브 → `cell.html?id=g001`로 이동만 함 |
| `app.html` + `js/app.js` + `css/app.css` | **VALIX 앱 화면** (앱 껍데기가 불러오는 웹, 검은 우주 테마). 첫 실행: 시작 화면 → 소개 2장 → 로그인(카카오·Apple은 아직 안내만) → 항해명(우주 방랑자 이름 자동 생성 `NAMES`, 주사위로 다시 뽑기). 탭: 전시(WEEKLY PLANET Vol.N, 2026-10-05 주를 Vol.1로 계산) · 플레이(주말까지 카운트다운, 체험 문구는 `PLAYS`) · 리워드(주차별 책, 주 3곳 스탬프) · 마이 + 오른쪽 둥근 버튼(이번 주 행성 바로 입장). 착륙 로딩(우주인→행성) 뒤 전시는 iframe으로 기존 페이지를 띄움. 기록·닉네임은 기기 안(localStorage `valix-*`)에만. 시트에 `ends`(YYYY-MM-DD)가 있으면 카운트다운이 그 날짜까지 |

## 앱 (VALIX)
- iOS/Android 앱은 별도 폴더 `valix-app`(Capacitor). 앱은 `app.html`을 원격으로 불러오는 껍데기라, 웹만 고치면 앱에도 바로 반영됨.
- `app.html`의 주소가 바뀌면 앱 설정(`server.url`)도 바꿔서 앱을 다시 내야 하니 주소 변경은 신중히.

## PC / 모바일
- 같은 주소, 같은 데이터. `IS_MOBILE`(터치 기기)일 때만 모바일 전용 모듈과 효과가 켜짐. PC 화면은 건드리지 않는 게 원칙.
- iPhone 기울기 권한은 탭(click) 안에서만 요청 가능 → 첫 탭·입장 버튼에서 `sensor.enable()`.
- 진동은 안드로이드만 (iPhone 미지원).
- 빛쌀: 기울이기/흔들기 효과는 boundary·mine·truth 장(민간인 희생)에서는 끔. 그 장에서 폰을 엎으면 '묵념'으로 받아 소리를 낮추고, 다시 들면 머문 시간을 알려줌.
- 모바일 센서 체험 목록: 홈(나침반·기울이기·흔들기·돌리기=행성 넘김·스와이프·핀치·후 불기·엎어두기), 빛쌀(기울이면 쌀 쏟아짐·흔들기·후 불어 빛·여러 손가락 빛·돌려서 주먹밥 건네기·엎어 묵념·위치→대구 거리·카메라 AR), 최초의 행성(기울여 프리즘/그림자 빛·흔들어 양자 관측). 모든 페이지 화면 꺼짐 방지.
- 센서·마이크·카메라·위치 데이터는 기기 안에서만 쓰고 저장·전송하지 않음 (문구로도 안내).

## 콘텐츠(CMS)
- 구글 시트 2개 (링크가 있는 모든 사용자 보기 권한):
  - cells `1hezkf49jcPnoKdPU2gehtd-QzKsiqfDi4zNe1_RGAjY`
  - blocks `1-l-01Syw0RUxzIoZRDQaQzDjMHttL5gLlRBPUZyfzTk` (cell_id, order, type, title, body, media, caption, bg, align)
- 시트에 블록이 없는 전시는 `data/cells.json` 백업으로 채움.
- 이미지·영상은 드라이브 공개 폴더 `1J2Xv-H8n4ApUXavWH9c8NL2cnDfJ9BBm`.

## 지켜야 할 것
- **캐시 무효화**: JS/CSS를 바꾸면 HTML의 `?v=N`과 import 경로의 `?v=N`을 함께 올린다.
- **빛쌀 윤리 기준**: 폭력 재현 금지, 관람객이 사람을 떨어뜨리는 조작 금지, 민감 장 앞 선택지, 1946 대구10월사건과 1950 경산 코발트광산 사건 구분, 약도·일러스트·‘전시 문안’ 표기, 출처는 진실화해위원회(jinsil.go.kr/KoreanWar/30.do, 36.do). 수치(1,800명 이상 추정 / 유족회 3,500명 이상 / 신원 확인 127명 / 2009.11.17 결정 / 2010.3.30 결정)를 바꾸지 말 것.
- 확인 필요: 작가 로마자 표기(현재 Jin Siyoung · Kim Dongsun), 작품 제목 번역(Bitssal / 光之米 / 光の米), 작업 영상 01~06 제목.

## 로컬 확인
`python3 -m http.server 8000` 후 `http://localhost:8000/`. `?lang=en|zh|ja|ko`로 언어 전환. 모바일은 개발자 도구의 기기 모드(터치)로.
