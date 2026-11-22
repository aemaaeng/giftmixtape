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
  openSheet();
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "노래" } });
  fireEvent.submit(screen.getByRole("search"));
  await screen.findByRole("button", { name: "밤편지 담기" });
}

function openSheet() {
  fireEvent.click(screen.getAllByRole("button", { name: /번 칸에 곡 담기$/ })[0]);
}

function closeSheet() {
  fireEvent.click(screen.getByRole("button", { name: "닫기" }));
}

function pick(title: string) {
  fireEvent.click(screen.getByRole("button", { name: `${title} 담기` }));
}

function select(title: string) {
  fireEvent.click(screen.getByRole("button", { name: new RegExp(`^${title} · `) }));
}

function pickedTitles() {
  const list = within(screen.getByRole("region", { name: /담은 곡/ })).queryAllByRole("listitem");
  return list
    .map((item) => item.textContent ?? "")
    .filter((text) => text.includes(" · "))
    .map((text) => text.split(" · ")[0]);
}

describe("MakeTape", () => {
  it("검색 결과에서 담은 곡이 담은 곡 목록에 순서대로 들어간다", async () => {
    await searchAll();

    pick("밤편지");
    pick("Ditto");

    expect(pickedTitles()).toEqual(["밤편지", "Ditto"]);
    expect(screen.getByRole("heading", { name: "담은 곡 2/5" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "밤편지 담음" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("시트를 띄운 채로 연달아 담고, 담을 때마다 남은 곡 수를 알린다", async () => {
    await searchAll();

    pick("밤편지");
    pick("Ditto");

    expect(screen.getByRole("dialog", { name: "곡 담기 2/5" })).toBeInTheDocument();
    expect(screen.getByText("Ditto: 담았어요. 3곡 남았어요.")).toBeInTheDocument();
  });

  it("5곡을 담으면 시트가 닫히고 담은 곡 제목으로 포커스가 간다", async () => {
    await searchAll();

    ["밤편지", "Ditto", "Hype Boy", "OMG", "Supernova"].forEach(pick);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText("5곡을 다 담았어요.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /번 칸에 곡 담기$/ })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "담은 곡 5/5" })).toHaveFocus();
  });

  it("빈 칸을 누르면 시트가 열리고 검색창에 포커스가 간다", () => {
    render(<MakeTape />);

    expect(screen.getAllByRole("button", { name: /번 칸에 곡 담기$/ })).toHaveLength(5);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    openSheet();

    expect(screen.getByRole("dialog", { name: "곡 담기 0/5" })).toBeInTheDocument();
    expect(screen.getByRole("searchbox")).toHaveFocus();
  });

  it("닫으면 남은 빈 칸으로 포커스가 가고, 다시 열면 검색 결과가 남아 있다", async () => {
    await searchAll();
    pick("밤편지");

    closeSheet();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2번 칸에 곡 담기" })).toHaveFocus();

    openSheet();

    expect(screen.getByRole("button", { name: "Ditto 담기" })).toBeInTheDocument();
    expect(searchMock).toHaveBeenCalledTimes(1);
  });

  it("처음에는 아무 곡도 선택하지 않아 옮기기·빼기를 쓸 수 없다", async () => {
    await searchAll();
    pick("밤편지");
    closeSheet();

    expect(screen.getByRole("button", { name: /^밤편지 · / })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("button", { name: "위로" })).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("button", { name: "아래로" })).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("button", { name: "빼기" })).toHaveAttribute("aria-disabled", "true");
  });

  it("선택한 곡을 다시 누르면 선택이 풀린다", async () => {
    await searchAll();
    pick("밤편지");
    closeSheet();

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
    closeSheet();

    select("Hype Boy");
    fireEvent.click(screen.getByRole("button", { name: "Hype Boy 위로" }));
    expect(pickedTitles()).toEqual(["밤편지", "Hype Boy", "Ditto"]);
    expect(screen.getByText("Hype Boy: 2번으로 옮겼어요.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Hype Boy 위로" }));
    expect(pickedTitles()).toEqual(["Hype Boy", "밤편지", "Ditto"]);
    expect(screen.getByRole("button", { name: "Hype Boy 위로" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );

    // 막힌 버튼을 눌러도 순서는 그대로다
    fireEvent.click(screen.getByRole("button", { name: "Hype Boy 위로" }));
    expect(pickedTitles()).toEqual(["Hype Boy", "밤편지", "Ditto"]);

    fireEvent.click(screen.getByRole("button", { name: "Hype Boy 아래로" }));
    expect(pickedTitles()).toEqual(["밤편지", "Hype Boy", "Ditto"]);
  });

  it("맨 아래 곡은 아래로 옮길 수 없다", async () => {
    await searchAll();
    pick("밤편지");
    pick("Ditto");
    closeSheet();

    select("Ditto");
    fireEvent.click(screen.getByRole("button", { name: "Ditto 아래로" }));

    expect(screen.getByRole("button", { name: "Ditto 아래로" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(pickedTitles()).toEqual(["밤편지", "Ditto"]);
  });

  it("선택한 곡을 빼면 목록에서 사라지고 선택이 풀리며 다시 담을 수 있다", async () => {
    await searchAll();
    pick("밤편지");
    pick("Ditto");
    closeSheet();

    select("밤편지");
    fireEvent.click(screen.getByRole("button", { name: "밤편지 빼기" }));

    expect(pickedTitles()).toEqual(["Ditto"]);
    expect(screen.getByRole("button", { name: "빼기" })).toHaveAttribute("aria-disabled", "true");
    openSheet();
    expect(screen.getByRole("button", { name: "밤편지 담기" })).toHaveAttribute(
      "aria-disabled",
      "false",
    );
  });

  it("곡이 하나도 없어도 옮기기·빼기 버튼은 남아 있다", async () => {
    await searchAll();
    pick("밤편지");
    closeSheet();

    select("밤편지");
    fireEvent.click(screen.getByRole("button", { name: "밤편지 빼기" }));

    expect(pickedTitles()).toEqual([]);
    expect(screen.getByRole("button", { name: "빼기" })).toBeInTheDocument();
    expect(screen.getByText("빈 칸을 눌러 곡을 담아 보세요.")).toBeInTheDocument();
  });
});
