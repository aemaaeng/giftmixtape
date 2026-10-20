"use client";

import { useReducer } from "react";

import TRACK_COUNT from "@/lib/schema/track-count";

import PickedTracks from "./PickedTracks";
import pickedTracksReducer from "./picked-tracks-reducer";
import TrackSearch from "./TrackSearch";

export default function MakeTape() {
  const [pickedTracks, dispatch] = useReducer(pickedTracksReducer, []);

  return (
    <>
      <PickedTracks
        tracks={pickedTracks}
        onRemove={(id) => dispatch({ type: "remove", id })}
        onMove={(from, to) => dispatch({ type: "move", from, to })}
      />
      <TrackSearch
        pickedIds={pickedTracks.map((track) => track.id)}
        isFull={pickedTracks.length >= TRACK_COUNT}
        onPick={(track) => dispatch({ type: "add", track })}
      />
    </>
  );
}
