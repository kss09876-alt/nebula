# 컬렉트 (온라인 아트 판매)

앱 탭 **컬렉트**. Artsy를 참고해 넣은 것:

- **작품 둘러보기:** 종류(회화·종이·조각·설치·사진·판화)·가격대·정렬·구매 가능만 거르기
- **이번 주 추천 작품**, **작가 줄**(팔로우)
- **작품 상세:** 크기(cm·in), 재료, 에디션 남은 수, 보증서·액자·발송지, 가격(또는 '가격 문의'), 상태(구매 가능·예약 중·판매 완료), 관련 전시로 가기, 같은 작가의 다른 작품
- **작품 저장(하트)**, **작가 팔로우**, **구매 문의 / 가격 제안**
- **마이 → 나의 컬렉트:** 저장한 작품·팔로우한 작가·문의한 작품

저장·팔로우·문의 기록은 이 기기에만 남는다(`nebula-shop-*`).

## 작품 넣는 법

1. cells 시트(`1hezkf…`)에 탭을 두 개 만든다. 탭 이름은 **artworks**, **artists**.
2. 첫 줄에 아래 칸 이름을 적는다. `work_id`·`artist_id` 칸이 있어야 시트로 인식한다. 없으면 `data/artworks.json`을 쓴다.
3. 실제 작품이 들어가면 `js/config.js`의 `shop.showSamples`를 `false`로 바꾼다. 그러면 예시 작품이 사라진다.

**artworks**

| 칸 | 내용 |
|---|---|
| `work_id` | 고유 번호 (예: w001) |
| `artist` | 작가 `artist_id` |
| `title`, `title_en` (`title_zh`, `title_ja`) | 제목 |
| `year` | 제작 연도 |
| `medium` | painting / work-on-paper / sculpture / installation / photography / print |
| `material`, `material_en` | 재료 |
| `w`, `h`, `d` | 크기(cm) |
| `edition`, `edition_left` | 에디션 총수·남은 수 |
| `price_krw`, `price_usd` | 가격. 둘 다 비우거나 `price_request`=1이면 '가격 문의' |
| `status` | available / reserved / sold |
| `certificate`, `frame`, `offer`, `featured` | 1이면 보증서 있음·액자 포함·가격 제안 받음·추천 |
| `ships_from`, `ships_from_en` | 발송지 |
| `image` | 드라이브 파일 주소 또는 id |
| `cell` | 관련 전시 id (예: c005) |
| `desc`, `desc_en` | 작품 설명 |

**artists**: `artist_id`, `name`, `name_en`, `born`, `base`, `base_en`, `bio`, `bio_en`

## 문의와 결제

- 지금은 **문의 방식**이다. `config.shop.inquiryEmail`에 받는 메일 주소를 넣으면, 문의를 보낼 때 관람객의 메일 앱이 작품 정보가 채워진 채로 열린다.
- 메일 주소가 비어 있으면 화면에 '문의 창구 준비 중'이 뜬다.
- **실물 작품은 애플·구글 인앱결제 대상이 아니다**(실물 상품). 나중에 앱 안에서도 일반 결제(토스페이먼츠·포트원·Stripe)를 붙일 수 있다.
  - 순서: 서버에 주문 표를 만들고 → 결제 → 재고·상태를 `reserved`/`sold`로 바꾼다.
- 디지털 작품(파일)은 앱 안에서 팔면 인앱결제 대상이 된다. 그래서 지금은 종류에서 뺐다.
- 판매 전에 할 일:
  - 작가와 위탁·판매 계약(수수료, 가격 결정권)
  - 통신판매업 신고
  - 약관에 작품 판매 조항 추가(반품·환불: 미술품은 단순 변심 반품 제한을 미리 알려야 함)
  - 배송·보험·해외 배송 시 통관 안내
