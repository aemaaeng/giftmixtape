import type { Track } from "@/lib/schema/track";

import lookupTracks from "./lookup-tracks";
import itunesRequest from "./request";
import toTrack from "./to-track";

// kr 스토어는 검색이 항상 0건이라 us에서 찾고, us가 영어로 주는 곡 이름은 kr lookup으로 바꾼다
export default async function searchTracks(
  term: string,
  options: { limit?: number; signal?: AbortSignal } = {},
): Promise<Track[]> {
  const { limit = 15, signal } = options;
  const query = term.trim();
  if (!query) return [];

  const params = { term: query, country: "us", entity: "song", limit };
  let found = await itunesRequest("search", params, signal);
  // 같은 검색어가 간헐적으로 0건으로 오고, 다시 부르면 정상이다
  if (found.resultCount === 0) {
    found = await itunesRequest("search", params, signal);
  }

  const usTracks = found.results
    .map((item) => toTrack(item, "us"))
    .filter((track) => track !== null);
  if (usTracks.length === 0) return [];

  signal?.throwIfAborted();
  const krTracks = await lookupKr(
    usTracks.map((track) => track.id),
    signal,
  );
  return usTracks.map((track) => krTracks.get(track.id) ?? track);
}

// 이름을 한글로 바꾸는 건 부가 기능이라, 실패해도 us 결과는 보여준다
async function lookupKr(ids: number[], signal?: AbortSignal) {
  try {
    return await lookupTracks(
      ids.map((id) => ({ id, country: "kr" as const })),
      { signal },
    );
  } catch (error) {
    if (signal?.aborted) throw error;
    return new Map<number, Track>();
  }
}
