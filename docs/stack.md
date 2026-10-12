# 스택과 명령어

## 스택

- Next.js 16 (App Router) + TypeScript
- 패키지 매니저: pnpm. npm·yarn 명령을 쓰지 않는다
- 스타일: CSS Modules + CSS 변수. Tailwind를 쓰지 않는다
- 저장소: Upstash Redis
- 오디오: Web Audio API
- 테스트: Vitest + Testing Library, Playwright
- 린트·포맷: ESLint (eslint-config-next) + Prettier
- 호스팅: 미정 (도메인 giftmixtape.com)

Next.js 16은 학습 데이터와 API가 다를 수 있다. Next.js 코드를 쓰기 전에 `AGENTS.md`의 안내대로 `node_modules/next/dist/docs/`를 확인한다.

## 의존성

- 새 의존성을 추가하기 전에 이유를 말하고 확인받는다
- 몇 줄로 직접 짤 수 있는 건 라이브러리를 쓰지 않는다
- pnpm은 package.json에 선언하지 않은 패키지를 import할 수 없다. 쓰는 패키지는 반드시 직접 추가한다

## 명령어

| 명령                                | 내용                                               |
| ----------------------------------- | -------------------------------------------------- |
| `pnpm dev`                          | 개발 서버                                          |
| `pnpm build`                        | 프로덕션 빌드                                      |
| `pnpm lint`                         | ESLint                                             |
| `pnpm format` / `pnpm format:check` | Prettier                                           |
| `pnpm typecheck`                    | 라우트 타입 생성(`next typegen`) 후 `tsc --noEmit` |
| `pnpm test`                         | Vitest                                             |
| `pnpm test:e2e`                     | Playwright                                         |
