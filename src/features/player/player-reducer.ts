export type PlayerStatus = "idle" | "loading" | "playing" | "paused" | "ended";

export type PlayerState = {
  status: PlayerStatus;
  index: number;
  trackCount: number;
  // 재생하지 못하고 건너뛴 곡의 위치
  failed: number[];
};

// 오디오 이벤트에서 오는 액션은 index를 함께 받는다
// 곡을 넘긴 뒤에 이전 곡의 이벤트가 늦게 도착하면 무시하기 위해서다
export type PlayerAction =
  | { type: "insert" }
  | { type: "pause" }
  | { type: "resume" }
  | { type: "next" }
  | { type: "prev" }
  | { type: "loaded"; index: number }
  | { type: "blocked"; index: number }
  | { type: "trackEnd"; index: number }
  | { type: "trackError"; index: number };

function load(state: PlayerState, index: number): PlayerState {
  if (index >= state.trackCount) return { ...state, status: "ended" };
  return { ...state, status: "loading", index };
}

export default function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  const { status, index } = state;
  const isActive = status === "loading" || status === "playing" || status === "paused";

  switch (action.type) {
    case "insert":
      if (status !== "idle" && status !== "ended") return state;
      if (state.trackCount === 0) return { ...state, status: "ended" };
      return { ...state, status: "loading", index: 0, failed: [] };
    case "pause":
      return status === "playing" ? { ...state, status: "paused" } : state;
    case "resume":
      return status === "paused" ? { ...state, status: "playing" } : state;
    case "next":
      return isActive ? load(state, index + 1) : state;
    case "prev": {
      if (!isActive) return state;
      // 이미 실패한 곡으로 가면 곧바로 다시 앞으로 넘어오므로 건너뛴다
      let target = index - 1;
      while (target >= 0 && state.failed.includes(target)) target--;
      // 앞에 들을 곡이 없으면 지금 곡을 처음부터 듣는다. 이미 불러오는 중이면 그대로 둔다
      if (target < 0) return status === "loading" ? state : load(state, index);
      return load(state, target);
    }
  }

  if (action.index !== index) return state;

  switch (action.type) {
    case "loaded":
      return status === "loading" ? { ...state, status: "playing" } : state;
    // 자동 재생이 막히면 멈춘 상태로 두고 사용자가 다시 누르게 한다
    case "blocked":
      return status === "loading" || status === "playing" ? { ...state, status: "paused" } : state;
    case "trackEnd":
      return status === "playing" ? load(state, index + 1) : state;
    case "trackError":
      if (!isActive) return state;
      return load({ ...state, failed: [...state.failed, index] }, index + 1);
  }
}
