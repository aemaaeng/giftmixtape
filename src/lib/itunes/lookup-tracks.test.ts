import { afterEach, describe, expect, it, vi } from "vitest";

import song from "./__fixtures__/itunes-song";
import mockItunes from "./__fixtures__/mock-itunes";
import lookupTracks from "./lookup-tracks";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("lookupTracks", () => {
  it("저장된 스토어별로 묶어서 lookup한다", async () => {
    const fetchMock = mockItunes((url) =>
      url.searchParams.get("country") === "kr"
        ? [song({ trackId: 1, trackName: "밤편지" }), song({ trackId: 3, trackName: "봄날" })]
        : [song({ trackId: 2, trackName: "APT." })],
    );

    const tracks = await lookupTracks([
      { id: 1, country: "kr" },
      { id: 2, country: "us" },
      { id: 3, country: "kr" },
    ]);

    const calls = fetchMock.mock.calls.map(([u]) => new URL(String(u)));
    expect(calls).toHaveLength(2);
    expect(
      calls.map((u) => [u.searchParams.get("country"), u.searchParams.get("id")]).sort(),
    ).toEqual([
      ["kr", "1,3"],
      ["us", "2"],
    ]);
    expect(tracks.get(1)?.title).toBe("밤편지");
    expect(tracks.get(2)?.country).toBe("us");
    expect(tracks.get(3)?.title).toBe("봄날");
  });

  it("찾지 못한 곡은 결과에서 빠진다", async () => {
    mockItunes(() => [song({ trackId: 1 })]);

    const tracks = await lookupTracks([
      { id: 1, country: "kr" },
      { id: 9, country: "kr" },
    ]);

    expect([...tracks.keys()]).toEqual([1]);
  });

  it("빈 목록이면 호출하지 않는다", async () => {
    const fetchMock = mockItunes(() => []);

    expect((await lookupTracks([])).size).toBe(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("요청이 실패하면 에러를 던진다", async () => {
    mockItunes(() => 500);

    await expect(lookupTracks([{ id: 1, country: "kr" }])).rejects.toThrow();
  });
});
