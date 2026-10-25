"use client";

import { useEffect, useRef, useState } from "react";

import artworkUrl from "@/lib/itunes/artwork-url";
import searchTracks from "@/lib/itunes/search-tracks";
import type { Track } from "@/lib/schema/track";

import styles from "./TrackSearch.module.css";

type SearchState =
  | { status: "idle" }
  | { status: "loading"; query: string }
  | { status: "done"; tracks: Track[] }
  | { status: "error" };

type TrackSearchProps = {
  pickedIds: number[];
  isFull: boolean;
  onPick: (track: Track) => void;
};

export default function TrackSearch({ pickedIds, isFull, onPick }: TrackSearchProps) {
  const [term, setTerm] = useState("");
  const [searchState, setSearchState] = useState<SearchState>({ status: "idle" });
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  // 입력할 때마다가 아니라 제출할 때만 검색한다. 호출 제한이 사용자 IP별로 분당 약 20회다
  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = term.trim();
    if (!query) return;
    if (searchState.status === "loading" && searchState.query === query) return;

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setSearchState({ status: "loading", query });
    try {
      const tracks = await searchTracks(query, { signal: controller.signal });
      // 취소 직전에 끝난 이전 검색이 새 검색의 상태를 덮어쓰지 않게 한다
      if (controller.signal.aborted) return;
      setSearchState({ status: "done", tracks });
    } catch {
      if (controller.signal.aborted) return;
      setSearchState({ status: "error" });
    }
  }

  // 한글 조합 중 Enter는 조합을 끝내는 키다. 이때 제출하면 마지막 글자가 빠지거나 두 번 제출된다
  // Safari는 조합을 끝내는 Enter에서 isComposing이 false라 keyCode 229도 본다
  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    if (event.nativeEvent.isComposing || event.keyCode === 229) {
      event.preventDefault();
    }
  }

  return (
    <section className={styles.search}>
      <form role="search" onSubmit={handleSubmit} className={styles.form}>
        <input
          type="search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="곡 이름이나 가수"
          aria-label="곡 검색"
          className={styles.input}
        />
        <button type="submit">검색</button>
      </form>

      <div role="status">
        {searchState.status === "loading" && <p>검색 중…</p>}
        {searchState.status === "error" && <p>검색에 실패했어요. 다시 시도해 주세요.</p>}
        {searchState.status === "done" && searchState.tracks.length === 0 && (
          <p>결과가 없어요. 다시 검색해 보세요.</p>
        )}
      </div>
      {searchState.status === "done" && searchState.tracks.length > 0 && (
        <ul className={styles.list}>
          {searchState.tracks.map((track) => {
            const isPicked = pickedIds.includes(track.id);
            const canPick = !isPicked && !isFull;
            return (
              <li key={track.id} className={styles.item}>
                {/* iTunes CDN 이미지를 그대로 쓴다. next/image 최적화를 거치면 호스팅 서버가 이미지를 다시 받아 변환한다 */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={artworkUrl(track.artworkUrl, 120)} alt="" width={60} height={60} />
                <div className={styles.info}>
                  <p className={styles.title}>{track.title}</p>
                  <p className={styles.meta}>
                    {track.artist} · {track.album}
                  </p>
                </div>
                {/* 담으면 이 버튼이 바로 막힌다. disabled로 막으면 포커스가 빠져나가서 aria-disabled로 표시만 한다 */}
                <button
                  type="button"
                  onClick={() => canPick && onPick(track)}
                  aria-disabled={!canPick}
                  aria-label={`${track.title} ${isPicked ? "담음" : "담기"}`}
                >
                  {isPicked ? "담음" : "담기"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
