"use client";

import { use, useEffect, useState } from "react";

import lookupTracks from "@/lib/itunes/lookup-tracks";

import PreviewPlayer from "./PreviewPlayer";
import type { PlayerTrack } from "./use-preview-player";

// 밤편지, Ditto, 주저하는 연인들을 위해, EVERYTHING, Square (2017)
const SAMPLE_IDS = [1219218446, 1657231962, 1456103133, 1242155576, 1490544823];

type PlayPrototypeProps = {
  searchParams: Promise<{ ids?: string | string[] }>;
};

function parseIds(ids: string | string[] | undefined): number[] {
  if (typeof ids !== "string") return SAMPLE_IDS;
  const parsed = ids
    .split(",")
    .map(Number)
    .filter((id) => Number.isInteger(id) && id > 0);
  return parsed.length > 0 ? parsed : SAMPLE_IDS;
}

// 받는 화면을 만들기 전 재생 확인용 임시 화면. 받는 화면이 생기면 지운다
// 곡은 모두 kr 스토어에서 찾는다. 찾지 못한 곡은 재생할 차례에 건너뛴다
export default function PlayPrototype({ searchParams }: PlayPrototypeProps) {
  const { ids } = use(searchParams);
  // 배열은 렌더마다 새로 만들어져서 effect 의존성으로 문자열을 쓴다
  const idsKey = parseIds(ids).join(",");
  const [tracks, setTracks] = useState<PlayerTrack[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const trackIds = idsKey.split(",").map(Number);
    lookupTracks(
      trackIds.map((id) => ({ id, country: "kr" as const })),
      { signal: controller.signal },
    ).then(
      (found) =>
        setTracks(
          trackIds.map((id) => {
            const track = found.get(id);
            return track
              ? { id, title: track.title, artist: track.artist, previewUrl: track.previewUrl }
              : { id, title: `곡 ${id}`, artist: "찾지 못함", previewUrl: null };
          }),
        ),
      () => {
        if (!controller.signal.aborted) setError(true);
      },
    );
    return () => controller.abort();
  }, [idsKey]);

  if (error) return <p>곡 정보를 불러오지 못했어요. 새로고침해 보세요.</p>;
  if (!tracks) return <p>곡 정보를 불러오는 중이에요.</p>;
  return <PreviewPlayer tracks={tracks} />;
}
