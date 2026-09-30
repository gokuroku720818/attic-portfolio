## 2026-09-30 개선 사항

- 주식·ETF 시세는 GitHub Actions가 5분 주기로 네이버·야후에서 수집합니다. 스케줄은 GitHub 실행 상황에 따라 지연될 수 있으며 체결 단위 실시간 시세는 아닙니다.
- 갱신 버튼은 GitHub API → 원본 파일 → 배포 파일 순으로 최신 수집본을 조회합니다. 브라우저 메모리 캐시는 사용하지 않습니다.
- 공개 수집 대상은 `public/prices.json`의 종목 코드입니다. 새로운 종목은 올바른 코드·이름·유형·통화를 이 목록에 추가해야 합니다. 수집기는 개인 포트폴리오 DB를 읽지 않습니다.
- 코인은 입력한 업비트 KRW 마켓을 직접 조회합니다. 부동산·현금은 자동 갱신하지 않습니다.
- 30분보다 오래된 수집본, 조회 실패, 환율 실패는 기존 평가액을 유지합니다. 종목 상세에는 출처와 실제 가격 기준 시간이 표시됩니다.
- 갱신 결과는 최신 공유 데이터에 가격 필드만 병합합니다. 저장 충돌 시 재시도하며 저장 실패는 화면에 표시합니다.
- 원금이 없는 멤버는 참가 대기로 표시합니다. 순위와 평균에는 실제 참가자만 반영하며 자산 종류별 랭킹 분리는 하지 않습니다.
- 순위 변화와 누적 수익률은 이 브라우저에서 확인한 날짜별 기록입니다. 과거 데이터를 소급 생성하지 않으며 2일 이상 기록된 뒤 그래프가 표시됩니다.

# 🏠 다락방포트폴리오 (Attic Portfolio)

> 14인의 다락방 투자 모임 멤버들을 위한 실시간 투자 수익률 랭킹 & 포트폴리오 웹 대시보드

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-amber.svg)
![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-success.svg)

---

## ✨ 핵심 기능 & 게이미피케이션

1. 👑 **1·2·3위 시상대 (Podium) & 팡파르 폭죽**
   - 1위(금), 2위(은), 3위(동)가 높낮이가 다른 시상대에 등극합니다.
   - 1위 챔피언 트로피를 누르면 화면 가득 축하 **황금 폭죽(Confetti)**이 팡파르와 함께 터집니다!
2. 🛟 **오늘의 꼴찌 구출 위로석 (Rescue Station)**
   - "현재 한강 수온 18.5℃... 물타기 지원금이 시급합니다!"
   - 최하위 수익률 멤버에게 튜브와 함께 '따뜻한 응원 보내기 ❤️'로 힘을 실어줄 수 있습니다.
3. 🎖️ **유쾌한 칭호 & 훈장 배지 자동 부여**
   - 👑 **다락방 워런 버핏**: 현재 수익률 1위 챔피언
   - 🛟 **한강 수온 체크반장**: 현재 최하위 수익률
   - 💰 **다락방 만수르**: 전체 총 자산 규모 1위 (원금 깡패)
   - 🏢 **영끌 대마왕**: 자산 중 부동산 비중 70% 이상
   - 🚀 **야수형 불나방**: 자산 중 코인 비중 50% 이상
   - 🗽 **잠 못 드는 서학개미**: 미국 주식 비중 70% 이상
   - 🥶 **냉동인간 존버단**: 수익률 -20% 이하
4. 📣 **실시간 다락방 사자후 (전광판)**
   - 멤버들이 오늘의 절규, 환호, 도발, 조언을 자유롭게 남기고 서로 하트(공감)를 누를 수 있습니다.
5. 📊 **부동산 & 주식 맞춤형 포트폴리오 관리**
   - **주식 / 코인**: 종목명, 평단가, 수량 입력 시 실시간/최근 시세와 비교해 손익 계산.
   - **부동산**: 아파트, 분양권, 꼬마빌딩 등 취득가(매수가)와 현재 평가액(호가/실거래가)을 직접 입력 및 수시 수정.
   - **자산군 비중 SVG 도넛 차트**: 부동산, 국내주식, 미국주식, 코인 등의 비중을 한눈에 시각화.
6. 🔑 **4자리 간이 PIN 보안**
   - 멤버 각자 본인의 4자리 PIN(초기 기본값: `1234`)을 입력해야 자산 수정 모달에 진입할 수 있어 편리하면서도 안전합니다.

---

## 🚀 빠른 시작 (로컬 실행)

```bash
# 1. 의존성 패키지 설치
npm install

# 2. 로컬 개발 서버 시작
npm run dev

# 3. 브라우저 접속
# http://localhost:5173
```

---

## 🌐 GitHub Pages 배포 방법 (3단계)

본 프로젝트는 GitHub Actions 워크플로우(`.github/workflows/deploy.yml`)가 완벽하게 준비되어 있어, 깃허브에 올리기만 하면 1~2분 만에 무료 웹사이트가 생성됩니다!

### 1단계: GitHub 새 저장소 생성
1. [GitHub](https://github.com/)에 로그인 후 `attic-portfolio`라는 이름으로 New Repository를 생성합니다.

### 2단계: 코드 푸시
```bash
git init
git add .
git commit -m "feat: initial release of attic portfolio"
git branch -M main
git remote add origin https://github.com/<본인아이디>/attic-portfolio.git
git push -u origin main
```

### 3단계: GitHub Pages 활성화
1. GitHub 저장소 페이지의 **Settings** → **Pages**로 이동합니다.
2. **Build and deployment** 섹션의 **Source**를 **GitHub Actions**로 선택합니다.
3. 잠시 후 상단에 배포된 사이트 주소(`https://<본인아이디>.github.io/attic-portfolio/`)가 생성되고, 14명의 멤버에게 링크를 공유하면 끝납니다!

---

## ☁️ 클라우드 실시간 동기화 (Supabase 연동 - 선택 사항)

> **기본 상태에서도 별도 서버/DB 없이 브라우저 LocalStorage로 14명 가상 데이터와 함께 100% 정상 작동합니다.**
> 14명이 스마트폰으로 각자 실시간 동기화하고 싶을 경우 아래 2가지만 진행하시면 됩니다:

1. [Supabase](https://supabase.com/)에서 무료 프로젝트를 1개 생성합니다.
2. `supabase_schema.sql` 파일의 내용을 Supabase 대시보드의 **SQL Editor**에 복사-붙여넣기 후 `RUN` 버튼을 누릅니다.
3. 프로젝트 루트에 `.env` 파일을 만들고 키를 입력합니다:
   ```env
   VITE_SUPABASE_URL=https://<your-project>.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-anon-key>
   ```

---

## 📁 프로젝트 구조

```text
attic-portfolio/
├── .github/workflows/deploy.yml  # GitHub Pages 자동 배포 CI/CD
├── src/
│   ├── components/               # UI 컴포넌트
│   │   ├── Header.tsx            # 다락방 글로벌 헤더
│   │   ├── AtticStatsTicker.tsx  # 총자산/평균수익률 지표
│   │   ├── ShoutoutBoard.tsx     # 실시간 사자후 전광판
│   │   ├── NewShoutoutModal.tsx  # 사자후 외치기 모달
│   │   ├── Podium.tsx            # 1·2·3위 시상대 & 폭죽
│   │   ├── RescueStation.tsx     # 꼴찌 구출석 & 응원
│   │   ├── Leaderboard.tsx       # 14인 랭킹 리그전
│   │   ├── LeaderboardCard.tsx   # 멤버 랭킹 카드
│   │   ├── PortfolioPieChart.tsx # SVG 자산 비중 도넛 차트
│   │   ├── MemberDetailModal.tsx # 멤버 상세 포트폴리오 팝업
│   │   ├── ManagePortfolioModal.tsx # 4자리 PIN 인증 & 자산 편집
│   │   └── AssetForm.tsx         # 주식/부동산 입력 폼
│   ├── context/
│   │   └── AtticContext.tsx      # 전역 상태 관리 & 훅
│   ├── data/
│   │   └── seedData.ts           # 14명 개성 넘치는 시드 데이터
│   ├── services/
│   │   ├── priceEngine.ts        # 코인/주식 시세 & 부동산 보존 엔진
│   │   ├── storage.ts            # LocalStorage CRUD & PIN 검증
│   │   └── supabaseClient.ts     # Supabase 연결 유틸
│   ├── test/                     # 단위 및 통합 테스트 (Vitest)
│   ├── types/                    # TypeScript 타입 정의
│   ├── utils/
│   │   ├── calculations.ts       # 원금, 평가액, 수익률 계산
│   │   ├── badges.ts             # 게이미피케이션 칭호 엔진
│   │   ├── ranking.ts            # 정렬 및 랭킹 엔진
│   │   └── confetti.ts           # 팡파르 폭죽 연출
│   ├── App.tsx                   # 메인 애플리케이션
│   └── main.tsx                  # 진입점
├── supabase_schema.sql           # Supabase DB 원클릭 스키마
└── package.json
```
