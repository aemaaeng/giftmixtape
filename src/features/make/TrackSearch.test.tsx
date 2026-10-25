import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import searchTracks from "@/lib/itunes/search-tracks";
import type { Track } from "@/lib/schema/track";

import TrackSearch from "./TrackSearch";

vi.mock("@/lib/itunes/search-tracks", () => ({ default: vi.fn() }));
const searchMock = vi.mocked(searchTracks);

afterEach(() => {
  searchMock.mockReset();
});

const TRACK: Track = {
  id: 1,
  country: "kr",
  title: "밤편지",
  artist: "아이유",
  album: "팔레트",
  artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/a/100x100bb.jpg",
  previewUrl: "https://audio-ssl.itunes.apple.com/a.m4a",
  appleMusicUrl: "https://music.apple.com/kr/song/1",
};

function renderSearch(props: Partial<React.ComponentProps<typeof TrackSearch>> = {}) {
  const onPick = vi.fn();
  render(<TrackSearch pickedIds={[]} isFull={false} onPick={onPick} {...props} />);
  return { onPick };
}

function search(term: string) {
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: term } });
  fireEvent.submit(screen.getByRole("search"));
}

describe("TrackSearch", () => {
  it("제출하면 검색하고 결과를 보여준다", async () => {
    searchMock.mockResolvedValue([TRACK]);
    renderSearch();

    search("밤편지");

    expect(await screen.findByText("밤편지")).toBeInTheDocument();
    expect(screen.getByText("아이유 · 팔레트")).toBeInTheDocument();
    expect(searchMock).toHaveBeenCalledWith("밤편지", expect.anything());
  });

  it("결과가 0건이면 다시 검색하라고 안내한다", async () => {
    searchMock.mockResolvedValue([]);
    renderSearch();

    search("없는 곡");

    expect(await screen.findByText(/결과가 없어요/)).toBeInTheDocument();
  });

  it("검색이 실패하면 에러를 보여준다", async () => {
    searchMock.mockRejectedValue(new Error("503"));
    renderSearch();

    search("밤편지");

    expect(await screen.findByText(/검색에 실패했어요/)).toBeInTheDocument();
  });

  it("먼저 한 검색이 늦게 끝나도 나중 검색의 결과를 덮어쓰지 않는다", async () => {
    let resolveFirst: (tracks: Track[]) => void = () => {};
    searchMock
      .mockReturnValueOnce(new Promise((resolve) => (resolveFirst = resolve)))
      .mockResolvedValueOnce([{ ...TRACK, id: 2, title: "Ditto" }]);
    renderSearch();

    search("밤편지");
    search("Ditto");
    expect(await screen.findByText("Ditto")).toBeInTheDocument();

    await act(async () => resolveFirst([TRACK]));

    expect(screen.getByText("Ditto")).toBeInTheDocument();
    expect(screen.queryByText("밤편지")).not.toBeInTheDocument();
  });

  it("같은 검색어로 검색 중이면 다시 제출해도 요청하지 않는다", () => {
    searchMock.mockReturnValue(new Promise(() => {}));
    renderSearch();

    search("밤편지");
    search("밤편지");

    expect(searchMock).toHaveBeenCalledTimes(1);
  });

  it("한글 조합 중 Enter는 제출을 막는다", () => {
    renderSearch();
    const input = screen.getByRole("searchbox");

    const composing = fireEvent.keyDown(input, { key: "Enter", isComposing: true });
    const safariCommit = fireEvent.keyDown(input, { key: "Enter", keyCode: 229 });
    const plain = fireEvent.keyDown(input, { key: "Enter", keyCode: 13 });

    expect(composing).toBe(false);
    expect(safariCommit).toBe(false);
    expect(plain).toBe(true);
  });

  it("담기를 누르면 곡을 넘긴다", async () => {
    searchMock.mockResolvedValue([TRACK]);
    const { onPick } = renderSearch();

    search("밤편지");
    fireEvent.click(await screen.findByRole("button", { name: "밤편지 담기" }));

    expect(onPick).toHaveBeenCalledWith(TRACK);
  });

  it("이미 담은 곡은 담음으로 표시하고 다시 담을 수 없다", async () => {
    searchMock.mockResolvedValue([TRACK]);
    const { onPick } = renderSearch({ pickedIds: [TRACK.id] });

    search("밤편지");
    const button = await screen.findByRole("button", { name: "밤편지 담음" });
    fireEvent.click(button);

    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(onPick).not.toHaveBeenCalled();
  });

  it("5곡을 다 담았으면 담기를 막는다", async () => {
    searchMock.mockResolvedValue([TRACK]);
    const { onPick } = renderSearch({ isFull: true });

    search("밤편지");
    const button = await screen.findByRole("button", { name: "밤편지 담기" });
    fireEvent.click(button);

    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(onPick).not.toHaveBeenCalled();
  });

  it("빈 검색어는 검색하지 않는다", () => {
    renderSearch();

    search("   ");

    expect(searchMock).not.toHaveBeenCalled();
  });
});
