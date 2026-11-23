import { describe, expect, it } from "vitest";

import playerReducer, { type PlayerAction, type PlayerState } from "./player-reducer";

function state(overrides: Partial<PlayerState> = {}): PlayerState {
  return { status: "idle", index: 0, trackCount: 5, failed: [], ...overrides };
}

function run(initial: PlayerState, actions: PlayerAction[]): PlayerState {
  return actions.reduce(playerReducer, initial);
}

describe("playerReducer", () => {
  it("테이프를 넣으면 첫 곡을 불러오고, 불러오면 재생한다", () => {
    expect(run(state(), [{ type: "insert" }])).toMatchObject({ status: "loading", index: 0 });
    expect(run(state(), [{ type: "insert" }, { type: "loaded", index: 0 }])).toMatchObject({
      status: "playing",
      index: 0,
    });
  });

  it("재생 중에만 멈추고, 멈춘 상태에서만 다시 재생한다", () => {
    const playing = state({ status: "playing", index: 2 });

    const paused = playerReducer(playing, { type: "pause" });
    expect(paused).toMatchObject({ status: "paused", index: 2 });
    expect(playerReducer(paused, { type: "resume" })).toMatchObject({ status: "playing" });

    const loading = state({ status: "loading" });
    expect(playerReducer(loading, { type: "pause" })).toBe(loading);
    expect(playerReducer(playing, { type: "resume" })).toBe(playing);
  });

  it("곡이 끝나면 다음 곡을 불러오고, 마지막 곡이 끝나면 끝난다", () => {
    expect(
      playerReducer(state({ status: "playing", index: 1 }), { type: "trackEnd", index: 1 }),
    ).toMatchObject({ status: "loading", index: 2 });
    expect(
      playerReducer(state({ status: "playing", index: 4 }), { type: "trackEnd", index: 4 }),
    ).toMatchObject({ status: "ended" });
  });

  it("다음은 재생·멈춤·불러오는 중 어디서든 넘어간다", () => {
    for (const status of ["playing", "paused", "loading"] as const) {
      expect(playerReducer(state({ status, index: 1 }), { type: "next" })).toMatchObject({
        status: "loading",
        index: 2,
      });
    }
    expect(playerReducer(state({ status: "paused", index: 4 }), { type: "next" })).toMatchObject({
      status: "ended",
    });
  });

  it("이전은 앞 곡으로 가고, 첫 곡이면 처음부터 다시 듣는다", () => {
    expect(playerReducer(state({ status: "playing", index: 3 }), { type: "prev" })).toMatchObject({
      status: "loading",
      index: 2,
    });
    expect(playerReducer(state({ status: "playing", index: 0 }), { type: "prev" })).toMatchObject({
      status: "loading",
      index: 0,
    });

    const loadingFirst = state({ status: "loading", index: 0 });
    expect(playerReducer(loadingFirst, { type: "prev" })).toBe(loadingFirst);
  });

  it("이전은 재생하지 못한 곡을 건너뛰고, 앞에 들을 곡이 없으면 지금 곡을 처음부터 듣는다", () => {
    expect(
      playerReducer(state({ status: "playing", index: 2, failed: [1] }), { type: "prev" }),
    ).toMatchObject({ status: "loading", index: 0 });
    expect(
      playerReducer(state({ status: "paused", index: 1, failed: [0] }), { type: "prev" }),
    ).toMatchObject({ status: "loading", index: 1 });
  });

  it("재생하지 못한 곡은 기록하고 건너뛴다", () => {
    const next = playerReducer(state({ status: "loading", index: 1 }), {
      type: "trackError",
      index: 1,
    });

    expect(next).toMatchObject({ status: "loading", index: 2, failed: [1] });
  });

  it("모든 곡을 재생하지 못하면 끝난 상태에 실패한 곡이 다 남는다", () => {
    const actions: PlayerAction[] = [{ type: "insert" }];
    for (let index = 0; index < 5; index++) actions.push({ type: "trackError", index });

    expect(run(state(), actions)).toMatchObject({ status: "ended", failed: [0, 1, 2, 3, 4] });
  });

  it("곡을 넘긴 뒤 도착한 이전 곡의 이벤트는 무시한다", () => {
    const loadingNext = state({ status: "loading", index: 2 });

    expect(playerReducer(loadingNext, { type: "loaded", index: 1 })).toBe(loadingNext);
    expect(playerReducer(loadingNext, { type: "trackError", index: 1 })).toBe(loadingNext);
    expect(playerReducer(loadingNext, { type: "trackEnd", index: 1 })).toBe(loadingNext);
  });

  it("같은 곡의 오류가 두 번 와도 한 곡만 건너뛴다", () => {
    const actions: PlayerAction[] = [
      { type: "trackError", index: 1 },
      { type: "trackError", index: 1 },
    ];

    expect(run(state({ status: "loading", index: 1 }), actions)).toMatchObject({
      status: "loading",
      index: 2,
      failed: [1],
    });
  });

  it("자동 재생이 막히면 멈춘 상태가 된다", () => {
    expect(
      playerReducer(state({ status: "loading", index: 2 }), { type: "blocked", index: 2 }),
    ).toMatchObject({ status: "paused", index: 2 });
  });

  it("끝난 뒤 다시 넣으면 처음부터 듣고 실패 기록을 지운다", () => {
    const ended = state({ status: "ended", index: 4, failed: [3] });

    expect(playerReducer(ended, { type: "insert" })).toMatchObject({
      status: "loading",
      index: 0,
      failed: [],
    });
  });

  it("재생 중에는 다시 넣어도 그대로다", () => {
    const playing = state({ status: "playing", index: 2 });

    expect(playerReducer(playing, { type: "insert" })).toBe(playing);
  });

  it("넣기 전과 끝난 뒤에는 이전·다음을 무시한다", () => {
    const idle = state();
    const ended = state({ status: "ended", index: 4 });

    expect(playerReducer(idle, { type: "next" })).toBe(idle);
    expect(playerReducer(ended, { type: "prev" })).toBe(ended);
  });
});
