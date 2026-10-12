# giftmixtape

노래 5곡을 골라 카세트테이프를 만들고, 링크로 친구에게 선물하는 웹 서비스.

## 시작하기

```bash
pnpm install
pnpm dev
```

## 검사

```bash
pnpm lint          # ESLint
pnpm format:check  # Prettier
pnpm typecheck     # tsc
pnpm test          # Vitest
pnpm test:e2e      # Playwright (처음 한 번: pnpm exec playwright install chromium)
```

커밋할 때 lint-staged, 타입 체크, 단위 테스트가 자동으로 돈다(husky). PR과 main push에는 GitHub Actions가 전체 검사를 돌린다.
