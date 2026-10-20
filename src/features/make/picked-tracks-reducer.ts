import TRACK_COUNT from "@/lib/schema/track-count";
import type { Track } from "@/lib/schema/track";

export type PickedTracksAction =
  | { type: "add"; track: Track }
  | { type: "remove"; id: number }
  | { type: "move"; from: number; to: number };

export default function pickedTracksReducer(tracks: Track[], action: PickedTracksAction): Track[] {
  switch (action.type) {
    case "add": {
      if (tracks.length >= TRACK_COUNT) return tracks;
      if (tracks.some((track) => track.id === action.track.id)) return tracks;
      return [...tracks, action.track];
    }
    case "remove":
      return tracks.filter((track) => track.id !== action.id);
    case "move": {
      const { from, to } = action;
      if (from === to) return tracks;
      if (from < 0 || from >= tracks.length || to < 0 || to >= tracks.length) return tracks;
      const next = [...tracks];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    }
  }
}
