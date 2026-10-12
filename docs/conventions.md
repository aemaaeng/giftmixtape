# 코드 컨벤션

## 도구가 강제하는 것

- 포맷은 Prettier가 정한다 (`.prettierrc.json`: 세미콜론, 큰따옴표, trailing comma, 100자)
- 린트는 eslint-config-next(core-web-vitals, typescript) 규칙을 따른다
- import 경로는 `@/` 별칭을 쓴다 (`@/*` → `src/*`)

## 스타일

- 컴포넌트 스타일은 같은 폴더의 `*.module.css`에 둔다
- 색·간격·폰트는 CSS 변수로 정의하고 컴포넌트에서는 변수만 참조한다

## 미정 (사람이 정한다)

- 컴포넌트·파일 이름 규칙
- export 방식 (default / named)
- 서버·클라이언트 컴포넌트 나누는 기준
- 주석 원칙

정해지면 이 문서에 반영한다.
