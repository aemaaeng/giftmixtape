import { fireEvent, render, screen } from "@testing-library/react";
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

function search(term: string) {
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: term } });
  fireEvent.submit(screen.getByRole("search"));
}

describe("TrackSearch", () => {
  it("제출하면 검색하고 결과를 보여준다", async () => {
    searchMock.mockResolvedValue([TRACK]);
    render(<TrackSearch />);

    search("밤편지");

    expect(await screen.findByText("밤편지")).toBeInTheDocument();
    expect(screen.getByText("아이유 · 팔레트")).toBeInTheDocument();
    expect(searchMock).toHaveBeenCalledWith("밤편지", expect.anything());
  });

  it("결과가 0건이면 다시 검색하라고 안내한다", async () => {
    searchMock.mockResolvedValue([]);
    render(<TrackSearch />);

    search("없는 곡");

    expect(await screen.findByText(/결과가 없어요/)).toBeInTheDocument();
  });

  it("검색이 실패하면 에러를 보여준다", async () => {
    searchMock.mockRejectedValue(new Error("503"));
    render(<TrackSearch />);

    search("밤편지");

    expect(await screen.findByText(/검색에 실패했어요/)).toBeInTheDocument();
  });

  it("빈 검색어는 검색하지 않는다", () => {
    render(<TrackSearch />);

    search("   ");

    expect(searchMock).not.toHaveBeenCalled();
  });
});
