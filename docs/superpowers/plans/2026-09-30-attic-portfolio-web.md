# 다락방포트폴리오 (Attic Portfolio) 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 14명의 멤버가 보유 주식과 부동산 투자 종목 및 평단가를 입력하면 현재 시세와 비교하여 실시간 수익률 랭킹, 재미있는 칭호, 시상대 연출, 한줄 사자후를 제공하는 GitHub Pages 호스팅용 반응형 웹 애플리케이션을 구축한다.

**Architecture:** React 18/19 + TypeScript + Vite + Tailwind CSS 기반의 클라이언트 SPA 구조로, 무설치 즉시 사용 가능한 LocalStorage 모드와 클라우드 실시간 동기화(Supabase) 모드를 동시에 지원하는 하이브리드 아키텍처를 채택한다. 시세는 공개 시세 API 및 멤버 직접 평가액 입력 방식을 결합한다.

**Tech Stack:** React, TypeScript, Vite, Tailwind CSS, Lucide React, Canvas-Confetti, Vitest

**Spec:** `docs/superpowers/specs/2026-09-30-attic-portfolio-design.md`

## Global Constraints

- 모든 UI 텍스트, 메시지, 칭호, 코드 주석은 한국어로 작성한다 (`RULE[user_global]`).
- 모바일(스마트폰 웹)과 데스크탑 브라우저 모두에서 레이아웃이 깨지지 않는 반응형(Tailwind CSS)을 준수한다.
- Vite `base` 경로를 `'./'`로 설정하여 GitHub Pages 서브디렉토리 배포 시에도 에셋 경로가 온전하도록 한다.
- 외부 API 장애 발생 시에도 Fallback 시세(기본값 또는 최근 저장값)로 부드럽게 복구되어 화면이 정지되지 않아야 한다.

## Review Focus

1. **투자원금이 0원이거나 비어 있는 경우의 수익률 계산**: 분모가 0이 되어 `NaN`이나 `Infinity`가 발생하는 현상을 방지하고 `0%`로 안전하게 표시되어야 함.
2. **부동산 종목과 주식 종목의 시세 갱신 분리**: 주식 시세 자동 새로고침 시 멤버가 직접 기입한 부동산 평가액이 초기화되거나 덮어씌워지지 않아야 함.
3. **14명 멤버 간 간이 PIN 인증**: 다른 멤버의 자산을 임의로 조작하지 못하도록 4자리 PIN 검증을 거쳐야 자산 수정 모달에 진입할 수 있어야 함.
4. **동일 수익률 또는 동순위 발생 시 랭킹 처리**: 수익률이 완전히 같을 경우 총 자산 규모 또는 최근 업데이트 기준으로 안정적인 정렬 순위를 보장해야 함.
5. **네트워크 오프라인 또는 Supabase 미설정 상태**: Supabase 키가 없어도 자동으로 LocalStorage 14인 샘플 모드로 부드럽게 대체 동작해야 함.

---

### Task 1: 프로젝트 스캐폴딩 및 개발/테스트 환경 구축

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/index.css`
- Create: `src/test/setup.ts`

**Interfaces:**
- Consumes: 없음
- Produces: Vite 빌드 환경 및 Vitest 단위 테스트 실행 환경

- [ ] **Step 1: package.json 및 설정 파일 작성**
  React, TypeScript, Vite, Tailwind CSS, Lucide React, Canvas-Confetti, Vitest 의존성을 정의한 `package.json` 작성

- [ ] **Step 2: Vite, Tailwind, TypeScript 설정 파일 작성**
  `vite.config.ts` (base: './', vitest 설정), `tailwind.config.js`, `postcss.config.js`, `tsconfig.json`, `index.html`, `src/index.css` 작성

- [ ] **Step 3: 의존성 설치 실행**
  Run: `npm install`
  Expected: dependencies installed without error

- [ ] **Step 4: 스캐폴딩 스모크 테스트 작성 및 실행**
  Create `src/test/scaffold.test.ts`
  Run: `npx vitest run src/test/scaffold.test.ts`
  Expected: PASS

---

### Task 2: 데이터 타입 정의 및 14인 가상 시드 데이터 구축

**Files:**
- Create: `src/types/index.ts`
- Create: `src/data/seedData.ts`
- Test: `src/test/seedData.test.ts`

**Interfaces:**
- Consumes: 없음
- Produces: `Member`, `Asset`, `Shoutout`, `INITIAL_MEMBERS`, `INITIAL_ASSETS`, `INITIAL_SHOUTOUTS`

- [ ] **Step 1: Write the failing test for seed data**
  `src/test/seedData.test.ts` 작성: 14명의 멤버가 정확히 정의되어 있고, 각 멤버별 자산과 유효한 PIN, 아바타, 시드 사자후 메시지가 있는지 검증하는 테스트

- [ ] **Step 2: Run test to verify it fails**
  Run: `npx vitest run src/test/seedData.test.ts`
  Expected: FAIL (modules not found)

- [ ] **Step 3: Implement `src/types/index.ts` 및 `src/data/seedData.ts`**
  다락방 14인 멤버(개성 넘치는 닉네임과 투자 스타일), 주식(삼전, 애플, 테슬라 등), 코인(비트코인, 이더리움), 부동산(마포 아파트, 성수 꼬마빌딩, 분양권 등) 시드 데이터 구성

- [ ] **Step 4: Run test to verify it passes**
  Run: `npx vitest run src/test/seedData.test.ts`
  Expected: PASS

---

### Task 3: 비즈니스 로직 - 시세 연동 및 수익률 계산 엔진

**Files:**
- Create: `src/services/priceEngine.ts`
- Create: `src/utils/calculations.ts`
- Test: `src/test/calculations.test.ts`

**Interfaces:**
- Consumes: `Member`, `Asset` from `src/types/index.ts`
- Produces:
  - `calculateAssetMetrics(asset: Asset): AssetMetrics`
  - `calculateMemberMetrics(member: Member, assets: Asset[]): MemberMetrics`
  - `fetchLivePrices(assets: Asset[]): Promise<Record<string, number>>`

- [ ] **Step 1: Write failing tests for calculation logic**
  `src/test/calculations.test.ts` 작성: 평단가, 현재가, 수량에 따른 평가액/수익률 계산, 투자원금 0원 예외 처리, 총합 지표 계산 테스트

- [ ] **Step 2: Run test to verify it fails**
  Run: `npx vitest run src/test/calculations.test.ts`
  Expected: FAIL

- [ ] **Step 3: Implement calculation logic in `src/utils/calculations.ts` and fallback price engine in `src/services/priceEngine.ts`**
  정확한 원화 환산, 수익률(%) 포맷팅, 업비트 공개 API 및 Yahoo Finance 캐싱 연동 함수 구현

- [ ] **Step 4: Run test to verify it passes**
  Run: `npx vitest run src/test/calculations.test.ts`
  Expected: PASS

---

### Task 4: 비즈니스 로직 - 랭킹 및 유쾌한 칭호 부여 엔진

**Files:**
- Create: `src/utils/badges.ts`
- Create: `src/utils/ranking.ts`
- Test: `src/test/ranking.test.ts`

**Interfaces:**
- Consumes: `MemberMetrics` from `src/utils/calculations.ts`
- Produces:
  - `calculateRankings(membersWithMetrics: MemberWithMetrics[]): RankedMember[]`
  - `assignMemberBadges(metrics: MemberMetrics, rank: number, totalMembers: number): Badge[]`

- [ ] **Step 1: Write failing tests for ranking and badges**
  `src/test/ranking.test.ts` 작성: 1위 '다락방 워런 버핏', 꼴찌 '한강 수온 체크반장', '영끌 대마왕', '만수르' 등 칭호 부여 및 동순위 정렬 테스트

- [ ] **Step 2: Run test to verify it fails**
  Run: `npx vitest run src/test/ranking.test.ts`
  Expected: FAIL

- [ ] **Step 3: Implement `src/utils/badges.ts` and `src/utils/ranking.ts`**
  스펙에 정의된 게이미피케이션 칭호 및 순위 부여 알고리즘 구현

- [ ] **Step 4: Run test to verify it passes**
  Run: `npx vitest run src/test/ranking.test.ts`
  Expected: PASS

---

### Task 5: 하이브리드 스토어 (LocalStorage & Supabase 연동 레이어)

**Files:**
- Create: `src/services/supabaseClient.ts`
- Create: `src/services/storage.ts`
- Create: `src/context/AtticContext.tsx`
- Test: `src/test/storage.test.ts`

**Interfaces:**
- Consumes: `INITIAL_MEMBERS`, `INITIAL_ASSETS`, `INITIAL_SHOUTOUTS`
- Produces: `useAtticStore()` hook (`members`, `assets`, `shoutouts`, `updateAsset`, `addAsset`, `deleteAsset`, `addShoutout`, `verifyPin`)

- [ ] **Step 1: Write failing test for storage layer**
  `src/test/storage.test.ts` 작성: LocalStorage 초기화, 자산 CRUD, 사자후 추가 동작 검증

- [ ] **Step 2: Run test to verify it fails**
  Run: `npx vitest run src/test/storage.test.ts`
  Expected: FAIL

- [ ] **Step 3: Implement storage and React Context**
  `src/services/supabaseClient.ts` (선택적 연결), `src/services/storage.ts` (LocalStorage CRUD), `src/context/AtticContext.tsx` 구현

- [ ] **Step 4: Run test to verify it passes**
  Run: `npx vitest run src/test/storage.test.ts`
  Expected: PASS

---

### Task 6: UI - 헤더, 통계 티커 & 사자후(상태 메시지) 전광판

**Files:**
- Create: `src/components/Header.tsx`
- Create: `src/components/AtticStatsTicker.tsx`
- Create: `src/components/ShoutoutBoard.tsx`
- Create: `src/components/NewShoutoutModal.tsx`

**Interfaces:**
- Consumes: `useAtticStore` from `src/context/AtticContext.tsx`
- Produces: 상단 네비게이션, 14명 총 자산/수익률 티커, 실시간 한마디 롤링 및 등록 인터랙션

- [ ] **Step 1: Implement Header and AtticStatsTicker**
  다락방 앰버 테마의 헤더와 전체 모임 총자산, 평균수익률, 최고 수익률 요약 표시 바 구현

- [ ] **Step 2: Implement ShoutoutBoard and Modal**
  멤버들의 한마디를 티커로 노출하고 누구나 쉽게 새로운 사자후를 등록할 수 있는 모달 UI 구현

- [ ] **Step 3: Component rendering test**
  Run: `npx vitest run src/test/components.test.tsx` (스모크 렌더링 검증)
  Expected: PASS

---

### Task 7: UI - 1·2·3위 시상대(Podium) & 꼴찌 구출석

**Files:**
- Create: `src/components/Podium.tsx`
- Create: `src/components/RescueStation.tsx`
- Create: `src/utils/confetti.ts`

**Interfaces:**
- Consumes: `RankedMember[]` from `src/utils/ranking.ts`
- Produces: 시상대 비주얼, 1위 클릭 시 팡파르 폭죽 효과, 꼴찌 구출 위로석 및 응원하기 액션

- [ ] **Step 1: Implement canvas-confetti wrapper in `src/utils/confetti.ts`**
  1위 축하 및 트로피 클릭 시 화려한 황금빛 폭죽을 터뜨리는 유틸리티 함수 구현

- [ ] **Step 2: Implement `Podium.tsx`**
  2위 - 1위 - 3위 계단형 시상대, 각 순위별 메달/트로피 아이콘, 클릭 시 폭죽 인터랙션 구현

- [ ] **Step 3: Implement `RescueStation.tsx`**
  최하위 순위 멤버를 위한 구출 튜브(🛟) 비주얼, "오늘의 수온 체크반장" 위로 카드 및 '따뜻한 응원 보내기' 버튼 구현

---

### Task 8: UI - 랭킹 리스트 및 상세 포트폴리오 모달

**Files:**
- Create: `src/components/Leaderboard.tsx`
- Create: `src/components/LeaderboardCard.tsx`
- Create: `src/components/MemberDetailModal.tsx`
- Create: `src/components/PortfolioPieChart.tsx`

**Interfaces:**
- Consumes: `RankedMember[]`, `Asset[]`
- Produces: 1~14위 전체 순위표, 종목별 비중 도넛 차트 및 보유 주식/부동산 상세 모달

- [ ] **Step 1: Implement Leaderboard and Card components**
  데스크탑/모바일 반응형 순위 리스트, 칭호 배지 렌더링, 총 자산 및 수익률 시각화 구현

- [ ] **Step 2: Implement MemberDetailModal and PortfolioPieChart**
  선택된 멤버의 보유 주식(매수가, 현재가, 수익률) 및 부동산(평가액, 취득가) 상세 내역 및 자산 비중 SVG 도넛 차트 구현

---

### Task 9: UI - 내 포트폴리오 관리 모달 (자산 추가/수정/삭제)

**Files:**
- Create: `src/components/ManagePortfolioModal.tsx`
- Create: `src/components/AssetForm.tsx`

**Interfaces:**
- Consumes: `useAtticStore`
- Produces: 4자리 간이 PIN 인증을 거쳐 주식/코인/부동산을 추가, 수정, 삭제하는 직관적인 편집 폼

- [ ] **Step 1: Implement PIN verification step**
  멤버 선택 후 4자리 PIN 입력 및 유효성 검사 UI 구현 (틀렸을 시 재미있는 에러 메시지)

- [ ] **Step 2: Implement AssetForm for Stock & Real Estate**
  - 주식/코인: 종목명, 심볼, 매수평단, 보유수량 입력
  - 부동산: 부동산 이름(단지명), 취득가, 현재 평가액, 메모 입력
  - 실시간 예상 손익 미리보기 제공

- [ ] **Step 3: Implement Asset list management (수정/삭제)**
  본인 등록 종목 삭제 및 평단가 수정 기능 완료

---

### Task 10: 전체 통합, 빌드 검증, 배포 워크플로우 및 가이드 작성

**Files:**
- Modify: `src/App.tsx`
- Create: `.github/workflows/deploy.yml`
- Create: `supabase_schema.sql`
- Create: `README.md`

**Interfaces:**
- Consumes: 전체 컴포넌트 및 스토어
- Produces: 최종 프로덕션 빌드, GitHub Pages 자동 배포 CI/CD, Supabase 원클릭 SQL

- [ ] **Step 1: Implement `src/App.tsx` integration**
  헤더, 티커, 시상대, 꼴찌 구출석, 랭킹 리스트, 각종 모달을 결합한 완성형 메인 페이지 구성

- [ ] **Step 2: Run all unit and integration tests**
  Run: `npx vitest run`
  Expected: All tests pass (100% green)

- [ ] **Step 3: Run production build**
  Run: `npm run build`
  Expected: Successful bundle in `dist/` directory without TypeScript or CSS errors

- [ ] **Step 4: Create `.github/workflows/deploy.yml` & `supabase_schema.sql` & `README.md`**
  GitHub Pages 자동 배포 액션, Supabase 테이블 생성 SQL, 사용 및 깃허브 연동 상세 매뉴얼 작성
