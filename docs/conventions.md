# 코드 컨벤션

## 도구가 강제하는 것

- 포맷은 Prettier가 정한다 (`.prettierrc.json`: 세미콜론, 큰따옴표, trailing comma, 100자)
- 린트는 eslint-config-next(core-web-vitals, typescript) 규칙을 따른다
- import 경로는 `@/` 별칭을 쓴다 (`@/*` → `src/*`)

## 스타일

- 컴포넌트 스타일은 같은 폴더의 `*.module.css`에 둔다
- 색·간격·폰트는 CSS 변수로 정의하고 컴포넌트에서는 변수만 참조한다

## 파일과 export

- 컴포넌트는 `PascalCase.tsx`, 스타일은 같은 이름의 `PascalCase.module.css`. 그 외 파일은 `kebab-case.ts`
- 파일 하나에 대표 하나를 default export 한다. named export는 타입만 허용한다 (ESLint가 강제)
- 예외: `src/app/`의 Next 특수 파일은 `metadata`, `generateMetadata`, `GET` 같은 named export를 쓴다
- 여러 값을 내보내야 하면 파일을 나눈다

## 서버·클라이언트 컴포넌트

- 기본은 서버 컴포넌트
- 상호작용이나 브라우저 API(오디오, localStorage, 입력)가 필요한 가장 작은 컴포넌트에만 `"use client"`를 붙인다
- 받는 화면의 테이프 조회는 서버에서 한다. 미리보기 봇이 JS를 실행하지 않기 때문이다

## 주석

- 코드만 봐서는 알 수 없는 것만 쓴다: 이유, 함정, 외부 제약
  - 예: `// country=kr은 검색 결과가 0건이라 us를 쓴다`
- 코드가 하는 일을 다시 설명하는 주석은 쓰지 않는다
