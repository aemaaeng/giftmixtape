import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import searchTracks from "@/lib/itunes/search-tracks";
import type { Track } from "@/lib/schema/track";

import MakeTape from "./MakeTape";

vi.mock("@/lib/itunes/search-tracks", () => ({ default: vi.fn() }));
const searchMock = vi.mocked(searchTracks);

afterEach(() => {
  searchMock.mockReset();
});

const TRACKS: Track[] = ["밤편지", "Ditto", "Hype Boy", "OMG", "Supernova", "Magnetic"].map(
  (title, index) => ({
    id: index + 1,
    country: "kr",
    title,
    artist: "가수",
    album: "앨범",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/a/100x100bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/a.m4a",
    appleMusicUrl: `https://music.apple.com/kr/song/${index + 1}`,
  }),
);

async function searchAll() {
  searchMock.mockResolvedValue(TRACKS);
  render(<MakeTape />);
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "노래" } });
  fireEvent.submit(screen.getByRole("search"));
  await screen.findByRole("button", { name: "밤편지 담기" });
}

function pick(title: string) {
  fireEvent.click(screen.getByRole("button", { name: `${title} 담기` }));
}

function select(title: string) {
  fireEvent.click(screen.getByRole("button", { name: new RegExp(`^${title} · `) }));
}

function pickedTitles() {
  const list = within(screen.getByRole("region", { name: /담은 곡/ })).queryAllByRole("listitem");
  return list.map((item) => item.textContent?.split(" · ")[0]);
}

describe("MakeTape", () => {
  it("검색 결과에서 담은 곡이 담은 곡 목록에 순서대로 들어간다", async () => {
    await searchAll();

    pick("밤편지");
    pick("Ditto");

    expect(pickedTitles()).toEqual(["밤편지", "Ditto"]);
    expect(screen.getByRole("heading", { name: "담은 곡 2/5" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "밤편지 담음" })).toBeDisabled();
  });

  it("5곡을 담으면 나머지 곡은 담을 수 없다", async () => {
    await searchAll();

    ["밤편지", "Ditto", "Hype Boy", "OMG", "Supernova"].forEach(pick);

    expect(screen.getByText("5곡을 다 담았어요.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Magnetic 담기" })).toBeDisabled();
  });

  it("처음에는 아무 곡도 선택하지 않아 옮기기·빼기를 쓸 수 없다", async () => {
    await searchAll();
    pick("밤편지");

    expect(screen.getByRole("button", { name: /^밤편지 · / })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("button", { name: "위로" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "아래로" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "빼기" })).toBeDisabled();
  });

  it("선택한 곡을 다시 누르면 선택이 풀린다", async () => {
    await searchAll();
    pick("밤편지");

    select("밤편지");
    expect(screen.getByRole("button", { name: /^밤편지 · / })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    select("밤편지");
    expect(screen.getByRole("button", { name: /^밤편지 · / })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("선택한 곡을 위·아래로 옮기고, 옮겨도 선택이 유지된다", async () => {
    await searchAll();
    pick("밤편지");
    pick("Ditto");
    pick("Hype Boy");

    select("Hype Boy");
    fireEvent.click(screen.getByRole("button", { name: "Hype Boy 위로" }));
    expect(pickedTitles()).toEqual(["밤편지", "Hype Boy", "Ditto"]);
    expect(screen.getByText("Hype Boy: 2번으로 옮겼어요.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Hype Boy 위로" }));
    expect(pickedTitles()).toEqual(["Hype Boy", "밤편지", "Ditto"]);
    expect(screen.getByRole("button", { name: "Hype Boy 위로" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Hype Boy 아래로" }));
    expect(pickedTitles()).toEqual(["밤편지", "Hype Boy", "Ditto"]);
  });

  it("맨 아래 곡은 아래로 옮길 수 없다", async () => {
    await searchAll();
    pick("밤편지");
    pick("Ditto");

    select("Ditto");

    expect(screen.getByRole("button", { name: "Ditto 아래로" })).toBeDisabled();
  });

  it("선택한 곡을 빼면 목록에서 사라지고 선택이 풀리며 다시 담을 수 있다", async () => {
    await searchAll();
    pick("밤편지");
    pick("Ditto");

    select("밤편지");
    fireEvent.click(screen.getByRole("button", { name: "밤편지 빼기" }));

    expect(pickedTitles()).toEqual(["Ditto"]);
    expect(screen.getByRole("button", { name: "빼기" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "밤편지 담기" })).toBeEnabled();
  });
});
