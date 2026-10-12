# 테스트

## 단위 테스트 (Vitest)

- 위치: 테스트 대상 옆에 `*.test.ts` / `*.test.tsx` (`src/**`만 수집)
- 환경: jsdom, Testing Library. `toBeInTheDocument` 같은 jest-dom 매처를 쓸 수 있다
- 전역 API를 켜지 않았다. `describe`, `it`, `expect`, `vi`는 `vitest`에서 import한다
- 우선 대상: 순수 로직 (ID 생성, 색 추출, 입력 검증, 재생 상태 머신의 reducer)

## e2e (Playwright)

- 위치: `e2e/*.spec.ts`
- 데스크톱(Chrome)과 모바일(Pixel 7) 뷰포트에서 모두 돈다. 주 사용 환경이 카톡 인앱 브라우저 같은 모바일이다
- 로컬은 `pnpm dev`, CI는 빌드 결과물(`pnpm start`)로 서버를 띄운다
- 지금은 홈 페이지 스모크 테스트만 있다. 만들기 → 링크 → 재생 흐름이 생기면 그 흐름으로 교체한다
- 처음 실행 전 한 번: `pnpm exec playwright install chromium`

## 외부 API

- 단위 테스트에서 iTunes API나 Upstash를 실제로 호출하지 않는다. 경계에서 mock한다
