import { describe, expect, it } from "vitest";

import song from "./__fixtures__/itunes-song";
import toTrack from "./to-track";

describe("toTrack", () => {
  it("iTunes 응답을 Track으로 바꾸고 받은 스토어를 붙인다", () => {
    expect(toTrack(song({ trackId: 7, trackName: "밤편지", artistName: "아이유" }), "kr")).toEqual({
      id: 7,
      country: "kr",
      title: "밤편지",
      artist: "아이유",
      album: "Palette",
      artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/a/b/cover.jpg/100x100bb.jpg",
      previewUrl: "https://audio-ssl.itunes.apple.com/preview.m4a",
      appleMusicUrl: "https://music.apple.com/us/album/x?i=1",
    });
  });

  it("미리듣기가 없는 곡은 null", () => {
    expect(toTrack(song({ previewUrl: undefined }), "us")).toBeNull();
  });

  it("곡이 아닌 항목(뮤직비디오, 앨범 등)은 null", () => {
    expect(toTrack(song({ kind: "music-video" }), "us")).toBeNull();
    expect(toTrack(song({ wrapperType: "collection" }), "us")).toBeNull();
  });

  it("앨범명·커버가 없으면 빈 문자열", () => {
    const track = toTrack(song({ collectionName: undefined, artworkUrl100: undefined }), "us");
    expect(track?.album).toBe("");
    expect(track?.artworkUrl).toBe("");
  });
});
