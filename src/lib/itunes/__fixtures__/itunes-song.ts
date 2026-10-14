import type { ItunesItem } from "../types";

export default function itunesSong(overrides: Partial<ItunesItem> = {}): ItunesItem {
  return {
    wrapperType: "track",
    kind: "song",
    trackId: 1,
    trackName: "Through the Night",
    artistName: "IU",
    collectionName: "Palette",
    artworkUrl100: "https://is1-ssl.mzstatic.com/image/thumb/a/b/cover.jpg/100x100bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/preview.m4a",
    trackViewUrl: "https://music.apple.com/us/album/x?i=1",
    ...overrides,
  };
}
