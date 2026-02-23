# My Alcohol Cocktail
보유한 술로 바로 만들 수 있는 칵테일을 찾는 PWA 웹 서비스입니다.

## 서비스 목적
- 사용자가 가진 술(`Inventory`)만 기준으로 제작 가능한 칵테일을 빠르게 찾습니다.
- 검색/상세/추천 흐름에서 레시피를 일관되게 제공하고, 외부 API 장애 시에도 정적 데이터와 DB를 통해 서비스를 유지합니다.
- 모바일 홈 화면 설치가 가능한 PWA로 제공하여 "앱처럼" 재사용 가능하도록 설계했습니다.

## 배경
기존 칵테일 검색 서비스는 "모든 레시피"를 보여주기 때문에 실제로 만들 수 없는 레시피가 많이 섞여 있습니다.
이 프로젝트는 다음 문제를 해결하기 위해 시작했습니다.
- 내가 가진 술 기준으로 필터되지 않는 추천 문제
- 외부 API 의존성이 높아 장애/응답지연 시 UX가 급격히 나빠지는 문제
- 검색, 상세, 가능 목록 간 데이터 소스가 달라 결과가 달라지는 일관성 문제

## 핵심 결과
- `available` 계산을 서버 API(`/api/available`)로 일원화해 결과 일관성을 강화했습니다.
- DB + 외부 API + 정적 JSON(`public/data.json`)을 병합해 가용성과 커버리지를 동시에 확보했습니다.
- `public/data.json`에 정규화된 1000개 레시피를 저장해 외부 API가 느리거나 실패해도 기본 데이터 제공이 가능합니다.
- 상세 라우트에 Suspense 기반 로딩/에러 UX를 추가해 느린 구간에서도 사용자 이탈을 줄였습니다.

## 서빙 주소
- Production: [https://my-alcohol-cocktail.vercel.app](https://my-alcohol-cocktail.vercel.app)
- Local: [http://localhost:3000](http://localhost:3000)

## 기술 스택
- Framework: Next.js 15 (App Router)
- Language: TypeScript
- UI: React 19, CSS, Mantine(core)
- Data Fetching: Axios
- DB: Neon(PostgreSQL)
- PWA: next-pwa + Service Worker
- Deploy: Vercel

## 주요 기능
- 내 술 관리: 로컬스토리지 기반 인벤토리 관리
- 칵테일 검색: 이름 기반 검색 및 상세 레시피 조회
- 제작 가능 목록: 보유한 술로 충족 가능한 레시피만 필터링
- 정적 레시피 fallback: `public/data.json` (1000개)
- 상세 캐시/저장: 조회한 레시피를 DB에 누적 저장

## 아키텍처 개요
- `app/api/search/[id]`
  - 상세/검색 API
  - 데이터 우선순위: DB -> 정적 JSON -> 외부 API
  - 외부 API 결과는 DB(`cocktailrecipe`)에 저장
- `app/api/available`
  - 보유 술 기반 제작 가능 레시피 계산 전용 API
  - 데이터 소스: DB + `public/data.json` + CocktailDB
  - 이름 정규화 dedupe + 필수 알코올 재료 매칭
- `public/data.json`
  - 정규화된 정적 레시피 저장소 (1000개)

## PWA 강화 포인트
- `manifest.json` + service worker 등록
- 홈 화면 설치(Installable)
- 캐시된 정적 리소스로 재방문 시 빠른 로드
- 네트워크 불안정 환경에서 기본 UX 유지
- Service Worker 충돌 제거:
  - 기존 커스텀 `/service-worker.js`와 `next-pwa`의 `/sw.js` 동시 등록 문제를 제거
  - 구형 SW는 자동 해제하고 `/sw.js` 단일 전략으로 통합
- API 캐시 전략 강화:
  - `/api/available` -> `StaleWhileRevalidate` (즉시 응답 + 백그라운드 최신화)
  - `/api/search/*` -> `NetworkFirst` + timeout (실시간 우선, 실패 시 캐시 fallback)
  - 현재는 정확도 우선으로 `/api/available`도 `NetworkFirst`로 운영하며, 오래된 빈 캐시 고착을 방지
  - 클라이언트 레벨 fallback(`public/data.json`)을 추가해 API 실패 시에도 리스트를 유지

## Next.js 강화 포인트
- App Router 기반 API/페이지 구조
- Route Segment `loading.tsx` + `error.tsx`로 Suspense/에러 UX 분리
- `generateMetadata`와 페이지 데이터 호출에 `cache()` 적용하여 중복 요청 최소화
- 서버 라우트에서 데이터 집계 로직을 중앙화하여 클라이언트 복잡도 감소

## UX 개선 포인트
- 상세/검색/가능 목록에 로딩 스켈레톤 디자인 적용
- 로딩 문구: "칵테일 레시피 가져오는 중..."
- 라우트별 에러 경계와 재시도 버튼 제공
- 느린 외부 API 구간은 서버 집계 API로 흡수
- `/api/available`는 DB + 정적 레시피로 먼저 계산 후, 부족할 때만 외부 API를 보강 조회하도록 최적화
- available/home에서 서버 API 실패 또는 빈 응답이면 `public/data.json`으로 즉시 재계산하는 이중 안전장치 적용

## 에러/엣지케이스 대응
- 빈 입력, 잘못된 ID, 조회 실패 시 안전한 fallback/빈 결과 처리
- DB 스키마 불일치 이슈를 실제 `cocktailrecipe` 스키마에 맞춰 정리
- 외부 API 실패 시에도 정적 데이터/DB 데이터로 서비스 지속
- 브라우저/서버 baseURL 분리로 배포 환경 포트/도메인 이슈 완화

## 데이터셋/레시피 소스
- TheCocktailDB: [https://www.thecocktaildb.com/api.php](https://www.thecocktaildb.com/api.php)
- API Ninjas Cocktail API: [https://api-ninjas.com/api/cocktail](https://api-ninjas.com/api/cocktail)
- Hugging Face Dataset: [erwanlc/cocktails_recipe_no_brand](https://huggingface.co/datasets/erwanlc/cocktails_recipe_no_brand)

## 로컬 실행
```bash
pnpm install
pnpm dev
```

## 데이터 생성 (정적 1000개)
```bash
pnpm generate:public-data
```

## 환경 변수
`.env.local` 예시:
```bash
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=https://my-alcohol-cocktail.vercel.app
DATABASE_URL=postgres://...
API_NINJAS_KEY=...
```

## 빌드/검증
```bash
pnpm lint
pnpm build
```

## 향후 개선 계획
- 이미지 최적화: `<img>` -> `next/image` 전환
- 레시피 품질 스코어링(중복/노이즈 제거 고도화)
- 사용자 맞춤 추천(선호 베이스/도수/맛 프로필)
- 레시피 번역/단위 자동 변환 강화
