import type { Track } from "@/lib/schema/track";

import type { ItunesItem } from "./types";

// 곡이 아니거나 미리듣기가 없으면 테이프에 담을 수 없으므로 null
export default function toTrack(item: ItunesItem, country: Track["country"]): Track | null {
  if (item.wrapperType !== "track" || item.kind !== "song" || !item.previewUrl) {
    return null;
  }

  return {
    id: item.trackId,
    country,
    title: item.trackName,
    artist: item.artistName,
    album: item.collectionName ?? "",
    artworkUrl: item.artworkUrl100 ?? "",
    previewUrl: item.previewUrl,
    appleMusicUrl: item.trackViewUrl,
  };
}
