# 구조

## 정해진 것

### 공유 링크와 저장

- 공유 링크는 `/t/{id}`. id는 추측할 수 없는 랜덤 문자열이다. 순번 금지
- 테이프 정보는 Upstash Redis에 저장하고 URL에는 담지 않는다. 형식은 아래 "데이터 스키마"
- 테이프는 공유 링크를 발급할 때 한 번만 저장한다. 수정 API는 없다
- 발급 전 편집 상태는 클라이언트에만 둔다 (서버 저장 없음)
  - localStorage에 임시 저장한다. 임시 저장본은 하나만 두고, 링크 발급에 성공하면 지운다
  - localStorage는 사생활 보호 모드 등에서 실패할 수 있다. 읽기·쓰기 실패가 화면을 깨뜨리지 않게 한다
- 테이프 만들기 API에는 IP당 요청 수 제한을 건다 (`@upstash/ratelimit`)
- 삭제 기능 대비: 만들 때 삭제 키를 발급하고, 저장소에는 해시만 저장한다

### 곡 데이터: iTunes Search API

- 인증 없이 브라우저에서 바로 호출할 수 있다 (API, 커버 이미지, 미리듣기 모두 CORS 허용)
- 검색은 `country=us`로 한다. `country=kr` 검색은 결과가 항상 0건이다. jp는 us보다 나은 점이 없다
- 한글 검색어도 us에서 잘 찾는다. 다만 us는 곡 이름을 영어·로마자로 준다 (밤편지 → Through the Night / IU)
- 그래서 검색 결과의 곡 ID들을 한 번에 묶어 `country=kr`로 lookup해 이름을 받는다. kr lookup은 한글 원제와 미리듣기, 한국 Apple Music 링크를 준다 (밤편지 / 아이유)
- kr lookup에 없는 곡(측정 23곡 중 2곡)은 us 정보를 그대로 쓴다
- 해외 곡은 kr에서도 대부분 원어 그대로 오지만, 일부 아티스트는 한글로 온다 (요네즈 켄시, 프랭크 시나트라). Apple Music 한국 앱 표기와 같으므로 그대로 쓴다
- 검색 한 번에 호출 2번(search + lookup)이다. 호출 제한(IP당 분당 약 20회) 때문에 입력이 멈춘 뒤에만 검색한다
- 간헐적으로 결과가 0건으로 오는 경우가 있었다 (같은 검색어 재시도 시 정상). 0건이면 한 번 재시도한다
- 받는 화면은 저장된 곡 ID로 lookup API를 호출해 곡 정보와 미리듣기 URL을 다시 가져온다
- lookup이 실패하거나 곡이 내려가도 저장해 둔 제목·아티스트로 보여준다. 커버 URL이 죽으면 기본 이미지로 대체한다

### 링크 미리보기

- 카톡 등 미리보기 봇은 JS를 실행하지 않는다. 제목은 `generateMetadata`로, 이미지는 `next/og`로 서버에서 만든다
- 9:16 저장 이미지는 OG 이미지 생성 코드를 재사용한다

### 재생

- Web Audio API로 직접 구현한다. 오디오 라이브러리를 추가하지 않는다
- 재생 상태는 `useReducer` 기반 상태 머신으로 관리한다
- 모바일은 첫 재생에 사용자 터치가 필요하다. "테이프 넣기" 동작을 그 터치로 쓴다

## 폴더 구조

```
src/
  app/            # 라우팅만 (page, layout, route, opengraph-image). 화면 코드는 features/에
  features/       # 화면 흐름별 UI·로직
    make/         # 곡 검색, 5곡 담기·순서, 꾸미기, 임시 저장
    player/       # 재생 상태 머신, Web Audio
    share/        # OG·9:16 이미지 렌더, 원곡 링크
  components/     # 여러 기능이 같이 쓰는 UI (카세트 등)
  lib/            # 화면 없는 코드. 다루는 대상별로 나눈다
    itunes/       # iTunes API 호출(검색·lookup), 응답 → Track 변환
    db/           # Upstash 연결, 테이프 저장·조회, rate limit
    schema/       # Tape·Track·Draft 타입과 검증. 서버·클라이언트 공용
    client-ip.ts  # 요청에서 클라이언트 IP 추출. 호스팅마다 다른 헤더를 여기서만 다룬다
  styles/         # CSS 변수(색·간격·폰트)
```

- `features/`는 화면 흐름 기준, `lib/`는 다루는 대상(외부 API, DB, 데이터 모양) 기준으로 나눈다
- `lib/schema/`는 클라이언트도 쓰므로 `lib/db/`를 import하지 않는다

### 라우트

| 경로                      | 내용                   |
| ------------------------- | ---------------------- |
| `/`                       | 테이프 만들기          |
| `/t/[id]`                 | 받는 화면              |
| `/t/[id]/opengraph-image` | 링크 미리보기 이미지   |
| `/t/[id]/story`           | 9:16 저장 이미지       |
| `POST /api/tapes`         | 테이프 저장, 링크 발급 |

## 데이터 스키마

### 저장하는 테이프 (Redis `tape:{id}`)

```ts
type Tape = {
  v: 1; // 스키마 버전
  title: string; // 1~30자
  from: string; // 보내는 사람, 1~12자
  to: string; // 받는 사람, 1~12자
  labelColor: string; // "#RRGGBB"
  tracks: TrackRef[]; // 정확히 5개. 배열 순서 = 재생 순서
  createdAt: string; // ISO 시각
  deleteKeyHash: string;
};

type TrackRef = {
  id: number; // iTunes trackId
  country: "kr" | "us"; // 곡 정보를 받은 스토어. kr lookup에 없는 곡만 us
  title: string; // lookup이 실패해도 보여줄 정보
  artist: string;
  artworkUrl: string; // iTunes 이미지 URL. 파일을 저장하지 않는다
};
```

- id는 추측할 수 없는 랜덤 10자
- 만료(TTL)는 두지 않는다
- 글자 수 제한은 OG 이미지·라벨 디자인에 맞춰 조정할 수 있다
- 미리듣기 URL은 저장하지 않고 lookup으로 받는다

### 편집 중 임시 저장 (localStorage `giftmixtape:draft`)

```ts
type Draft = {
  v: 1;
  tracks: Track[]; // 0~5개. Track은 lib/itunes가 검색 결과를 변환한 타입(미리듣기 URL 포함)
  title: string;
  from: string;
  to: string;
  labelColor: string;
  updatedAt: string;
};
```

## 미정 (사람이 정한다)

- 재생 상태 머신의 상태와 전이
- 입력 검증 방식 (zod 또는 직접 작성). `POST /api/tapes`를 만들 때 정한다
- 라벨 색: 팔레트에서 고를지, 자유롭게 고를지

정해지지 않은 부분이 필요한 작업이면 구현 전에 초안을 제안하고 확인받는다.
