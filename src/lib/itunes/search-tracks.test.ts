import { afterEach, describe, expect, it, vi } from "vitest";

import song from "./__fixtures__/itunes-song";
import mockItunes from "./__fixtures__/mock-itunes";
import searchTracks from "./search-tracks";

afterEach(() => {
  vi.unstubAllGlobals();
});

const US = [
  song({ trackId: 1, trackName: "Through the Night", artistName: "IU" }),
  song({ trackId: 2, trackName: "APT.", artistName: "ROSÉ & Bruno Mars" }),
];
const KR = [song({ trackId: 1, trackName: "밤편지", artistName: "아이유" })];

describe("searchTracks", () => {
  it("us에서 검색하고, 결과 ID를 묶어 kr로 한 번 lookup한다", async () => {
    const fetchMock = mockItunes((url) => (url.pathname === "/search" ? US : KR));

    await searchTracks("밤편지");

    const [search, lookup] = fetchMock.mock.calls.map(([u]) => new URL(String(u)));
    expect(search.pathname).toBe("/search");
    expect(search.searchParams.get("country")).toBe("us");
    expect(search.searchParams.get("term")).toBe("밤편지");
    expect(search.searchParams.get("entity")).toBe("song");
    expect(lookup.pathname).toBe("/lookup");
    expect(lookup.searchParams.get("country")).toBe("kr");
    expect(lookup.searchParams.get("id")).toBe("1,2");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("kr에 있는 곡은 kr 정보로, 없는 곡은 us 정보로 돌려준다 (순서는 검색 결과 그대로)", async () => {
    mockItunes((url) => (url.pathname === "/search" ? US : KR));

    const tracks = await searchTracks("밤편지");

    expect(tracks.map((t) => [t.id, t.country, t.title, t.artist])).toEqual([
      [1, "kr", "밤편지", "아이유"],
      [2, "us", "APT.", "ROSÉ & Bruno Mars"],
    ]);
  });

  it("미리듣기가 없는 곡은 결과에서 뺀다", async () => {
    mockItunes((url) =>
      url.pathname === "/search" ? [...US, song({ trackId: 3, previewUrl: undefined })] : [],
    );

    const tracks = await searchTracks("밤편지");

    expect(tracks.map((t) => t.id)).toEqual([1, 2]);
  });

  it("기본으로 15곡까지 요청한다", async () => {
    const fetchMock = mockItunes(() => US);

    await searchTracks("밤편지");

    expect(new URL(String(fetchMock.mock.calls[0][0])).searchParams.get("limit")).toBe("15");
  });

  it("검색 결과가 0건이면 다시 검색하지 않고, lookup도 하지 않는다", async () => {
    const fetchMock = mockItunes(() => []);

    expect(await searchTracks("竹内まりや")).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("kr lookup이 실패해도 us 결과를 돌려준다", async () => {
    mockItunes((url) => (url.pathname === "/search" ? US : "network-error"));

    const tracks = await searchTracks("밤편지");

    expect(tracks.map((t) => t.country)).toEqual(["us", "us"]);
  });

  it("us 검색이 실패하면 에러를 던진다", async () => {
    mockItunes(() => 503);

    await expect(searchTracks("밤편지")).rejects.toThrow();
  });

  it("공백만 있는 검색어는 호출하지 않는다", async () => {
    const fetchMock = mockItunes(() => US);

    expect(await searchTracks("   ")).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("signal로 취소하면 kr lookup으로 넘어가지 않고 AbortError를 던진다", async () => {
    const controller = new AbortController();
    mockItunes((url) => {
      if (url.pathname === "/search") controller.abort();
      return US;
    });

    await expect(searchTracks("밤편지", { signal: controller.signal })).rejects.toThrow(
      expect.objectContaining({ name: "AbortError" }),
    );
  });
});
