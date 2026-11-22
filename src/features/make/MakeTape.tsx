"use client";

import { useReducer, useRef, useState } from "react";

import TRACK_COUNT from "@/lib/schema/track-count";
import type { Track } from "@/lib/schema/track";

import PickedTracks from "./PickedTracks";
import pickedTracksReducer from "./picked-tracks-reducer";
import TrackSearch from "./TrackSearch";
import TrackSearchSheet from "./TrackSearchSheet";

export default function MakeTape() {
  const [pickedTracks, dispatch] = useReducer(pickedTracksReducer, []);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [pickAnnouncement, setPickAnnouncement] = useState("");
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  function openSheet(opener: HTMLButtonElement) {
    openerRef.current = opener;
    setPickAnnouncement("");
    setIsSheetOpen(true);
  }

  function pick(track: Track) {
    const remaining = TRACK_COUNT - pickedTracks.length - 1;
    dispatch({ type: "add", track });
    setPickAnnouncement(`${track.title}: 담았어요. ${remaining}곡 남았어요.`);
    if (remaining === 0) setIsSheetOpen(false);
  }

  // 시트를 연 빈 칸은 곡을 담는 순간 사라진다. 그러면 남은 빈 칸, 그것도 없으면 제목으로 보낸다
  function handleSheetClose() {
    setIsSheetOpen(false);
    const opener = openerRef.current;
    if (opener?.isConnected) {
      opener.focus();
      return;
    }
    const heading = headingRef.current;
    const emptySlot = heading
      ?.closest("section")
      ?.querySelector<HTMLButtonElement>("[data-empty-slot]");
    (emptySlot ?? heading)?.focus();
  }

  return (
    <>
      <PickedTracks
        tracks={pickedTracks}
        headingRef={headingRef}
        onOpenSearch={openSheet}
        onRemove={(id) => dispatch({ type: "remove", id })}
        onMove={(from, to) => dispatch({ type: "move", from, to })}
      />
      <TrackSearchSheet
        open={isSheetOpen}
        pickedCount={pickedTracks.length}
        announcement={pickAnnouncement}
        onClose={handleSheetClose}
      >
        <TrackSearch
          pickedIds={pickedTracks.map((track) => track.id)}
          isFull={pickedTracks.length >= TRACK_COUNT}
          onPick={pick}
        />
      </TrackSearchSheet>
    </>
  );
}
