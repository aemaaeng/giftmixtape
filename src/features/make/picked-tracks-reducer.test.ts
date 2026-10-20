import { describe, expect, it } from "vitest";

import type { Track } from "@/lib/schema/track";

import pickedTracksReducer from "./picked-tracks-reducer";

function track(id: number): Track {
  return {
    id,
    country: "kr",
    title: `곡 ${id}`,
    artist: "가수",
    album: "앨범",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/a/100x100bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/a.m4a",
    appleMusicUrl: `https://music.apple.com/kr/song/${id}`,
  };
}

const ids = (tracks: Track[]) => tracks.map((t) => t.id);

describe("pickedTracksReducer", () => {
  describe("add", () => {
    it("곡을 맨 뒤에 담는다", () => {
      const next = pickedTracksReducer([track(1)], { type: "add", track: track(2) });

      expect(ids(next)).toEqual([1, 2]);
    });

    it("이미 담은 곡은 다시 담지 않는다", () => {
      const tracks = [track(1)];

      expect(pickedTracksReducer(tracks, { type: "add", track: track(1) })).toBe(tracks);
    });

    it("5곡을 다 담았으면 더 담지 않는다", () => {
      const tracks = [1, 2, 3, 4, 5].map(track);

      expect(pickedTracksReducer(tracks, { type: "add", track: track(6) })).toBe(tracks);
    });
  });

  describe("remove", () => {
    it("해당 곡을 빼고 나머지 순서는 유지한다", () => {
      const next = pickedTracksReducer([1, 2, 3].map(track), { type: "remove", id: 2 });

      expect(ids(next)).toEqual([1, 3]);
    });
  });

  describe("move", () => {
    it("곡을 위로 옮긴다", () => {
      const next = pickedTracksReducer([1, 2, 3].map(track), { type: "move", from: 2, to: 1 });

      expect(ids(next)).toEqual([1, 3, 2]);
    });

    it("곡을 아래로 옮긴다", () => {
      const next = pickedTracksReducer([1, 2, 3].map(track), { type: "move", from: 0, to: 1 });

      expect(ids(next)).toEqual([2, 1, 3]);
    });

    it("범위를 벗어나면 그대로 둔다", () => {
      const tracks = [1, 2, 3].map(track);

      expect(pickedTracksReducer(tracks, { type: "move", from: 0, to: -1 })).toBe(tracks);
      expect(pickedTracksReducer(tracks, { type: "move", from: 2, to: 3 })).toBe(tracks);
    });
  });
});
