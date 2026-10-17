"use client";

import { useRef, useState } from "react";

import artworkUrl from "@/lib/itunes/artwork-url";
import searchTracks from "@/lib/itunes/search-tracks";
import type { Track } from "@/lib/schema/track";

import styles from "./TrackSearch.module.css";

type SearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; tracks: Track[] }
  | { status: "error" };

export default function TrackSearch() {
  const [term, setTerm] = useState("");
  const [state, setState] = useState<SearchState>({ status: "idle" });
  const controllerRef = useRef<AbortController | null>(null);

  // 입력할 때마다가 아니라 제출할 때만 검색한다. 호출 제한이 사용자 IP별로 분당 약 20회다
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!term.trim()) return;

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setState({ status: "loading" });
    try {
      const tracks = await searchTracks(term, { signal: controller.signal });
      setState({ status: "done", tracks });
    } catch {
      if (controller.signal.aborted) return;
      setState({ status: "error" });
    }
  }

  return (
    <section className={styles.search}>
      <form role="search" onSubmit={handleSubmit} className={styles.form}>
        <input
          type="search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="곡 이름이나 가수"
          aria-label="곡 검색"
          className={styles.input}
        />
        <button type="submit">검색</button>
      </form>

      {state.status === "loading" && <p>검색 중…</p>}
      {state.status === "error" && <p>검색에 실패했어요. 다시 시도해 주세요.</p>}
      {state.status === "done" && state.tracks.length === 0 && (
        <p>결과가 없어요. 다시 검색해 보세요.</p>
      )}
      {state.status === "done" && state.tracks.length > 0 && (
        <ul className={styles.list}>
          {state.tracks.map((track) => (
            <li key={track.id} className={styles.item}>
              {/* iTunes CDN 이미지를 그대로 쓴다. next/image 최적화를 거치면 호스팅 서버가 이미지를 다시 받아 변환한다 */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={artworkUrl(track.artworkUrl, 120)} alt="" width={60} height={60} />
              <div>
                <p className={styles.title}>{track.title}</p>
                <p className={styles.meta}>
                  {track.artist} · {track.album}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
