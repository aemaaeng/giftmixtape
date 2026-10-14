import type { Track, TrackRef } from "@/lib/schema/track";

import itunesRequest from "./request";
import toTrack from "./to-track";

type LookupRef = Pick<TrackRef, "id" | "country">;

// lookup은 스토어 단위로만 되므로 스토어별로 묶어 한 번씩 부른다
export default async function lookupTracks(
  refs: LookupRef[],
  options: { signal?: AbortSignal } = {},
): Promise<Map<number, Track>> {
  const idsByCountry = new Map<Track["country"], number[]>();
  for (const { id, country } of refs) {
    idsByCountry.set(country, [...(idsByCountry.get(country) ?? []), id]);
  }

  const tracks = new Map<number, Track>();
  await Promise.all(
    [...idsByCountry].map(async ([country, ids]) => {
      const { results } = await itunesRequest(
        "lookup",
        { id: ids.join(","), country },
        options.signal,
      );
      for (const item of results) {
        const track = toTrack(item, country);
        if (track) tracks.set(track.id, track);
      }
    }),
  );
  return tracks;
}
