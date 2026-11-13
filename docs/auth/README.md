# 로그인·회원가입 (Supabase Auth)

앱 흐름: **ARTMOS 인트로 → 로그인 화면 → (로그인/가입) → 항해명 정하기 → 앱**

로그인 화면에서 할 수 있는 것:
- 카카오로 시작하기
- Apple로 계속하기
- Google로 계속하기
- 이메일로 가입하기 / 이메일로 로그인 / 비밀번호 재설정
- 로그인 없이 둘러보기

**항해명(닉네임)은 겹치지 않아요.**
- 서버 `profiles.nickname`이 유일값이에요. 대소문자와 띄어쓰기 차이는 같은 이름으로 봐요.
- 입력하는 동안 '사용할 수 있어요 / 이미 쓰고 있어요'를 바로 알려 줘요.
- 저장할 때 서버가 마지막으로 한 번 더 확인해요.
- 2~20자, 글자·숫자·띄어쓰기만 돼요. 'ARTMOS', '관리자' 같은 이름은 막아 둬요.
- 로그인하지 않고 둘러보는 사람은 이름이 기기 안에만 저장돼서 겹침을 확인할 수 없어요. 화면에 그렇게 안내해요.

**마이 → 계정**에서 로그인 상태 확인, 로그아웃, **계정 삭제**를 할 수 있어요. 계정 삭제는 앱스토어 필수 조건이에요.

## 지금 상태
`config.auth`가 비어 있어서 실제 로그인은 꺼져 있어요. 버튼을 누르면 '곧 열려요' 안내 뒤 둘러보기로 넘어가요.

시험: `app.html?authtest=1`을 열면 이 기기에서만 로그인·가입·이름 겹침·계정 삭제를 흉내 내요. 예를 들어 '고요한 성운'은 이미 쓰는 이름으로 나와요.

## 켜는 순서
1. supabase.com에서 프로젝트를 만들어요. 지역은 Seoul(ap-northeast-2)로 해요.
2. SQL 편집기에서 `docs/auth/schema.sql`을 실행해요.
3. Authentication → Providers에서 로그인 방식을 켜요.
   - **Email**: 켜고, 'Confirm email'(메일 인증)도 켜요.
   - **Kakao**: 카카오 개발자 콘솔에서 앱을 만들어요 → REST API 키와 Client Secret을 넣어요. 동의 항목은 닉네임과 이메일(비즈 앱 전환 필요)이에요.
   - **Apple**: 애플 개발자에서 Services ID, Key(.p8), Team ID를 만들어 넣어요.
   - **Google**: Google Cloud에서 OAuth 클라이언트(웹)를 만들어 Client ID와 Secret을 넣어요.
   - 세 곳 모두 Redirect URL은 `https://<프로젝트>.supabase.co/auth/v1/callback`이에요.
4. Authentication → URL Configuration에 사이트 주소(`https://vailixlab.github.io/nebula/app.html`)와 앱 주소(`artmos://auth`)를 넣어요.
5. Edge Function `delete-account`(`docs/auth/delete-account.ts`)를 배포해요.
6. `js/config.js`의 `auth.supabaseUrl`과 `auth.supabaseAnonKey`를 채워요.
   - anon 키는 공개돼도 괜찮은 키예요.
   - **service_role 키는 절대 넣지 마세요.**
7. 앱 껍데기(Capacitor)도 손봐야 해요.
   - Google은 앱 안 웹뷰 로그인을 막아요. 그래서 로그인은 `@capacitor/browser`로 시스템 브라우저에서 하고, `artmos://auth` 딥링크로 앱에 돌아오게 해요. `config.auth.appRedirect = 'artmos://auth'`
   - Apple은 iOS에서 네이티브 'Apple로 로그인'을 권장해요. `@capacitor-community/apple-sign-in`을 쓰고, 받은 토큰은 `supabase.auth.signInWithIdToken`으로 넘겨요.

## 규정 메모
- 카카오나 구글 로그인을 넣으면 iOS에서는 **Apple 로그인도 꼭 함께** 넣어야 해요(App Store 4.8). 지금 넣어 뒀어요.
- 만 14세 미만은 법정대리인 동의가 필요해서, 가입할 때 '만 14세 이상' 확인을 필수로 받아요.
- 마케팅 수신은 선택 항목으로 따로 받고, 동의 시각을 기록해요.
- 개인정보처리방침에 가입 정보(이메일, 소셜 계정 식별자, 항해명)를 적어 뒀어요. 회사 정보 등 대괄호 부분은 채워야 해요.
