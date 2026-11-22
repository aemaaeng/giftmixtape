"use client";

import { useState } from "react";

import TRACK_COUNT from "@/lib/schema/track-count";
import type { Track } from "@/lib/schema/track";

import styles from "./PickedTracks.module.css";

type PickedTracksProps = {
  tracks: Track[];
  headingRef: React.Ref<HTMLHeadingElement>;
  onOpenSearch: (opener: HTMLButtonElement) => void;
  onRemove: (id: number) => void;
  onMove: (from: number, to: number) => void;
};

export default function PickedTracks({
  tracks,
  headingRef,
  onOpenSearch,
  onRemove,
  onMove,
}: PickedTracksProps) {
  // 순서를 바꿔도 같은 곡이 선택된 채로 남도록 위치가 아니라 id로 기억한다
  const [selectedId, setSelectedId] = useState<number | null>(null);
  // 받침 유무로 조사가 갈려서 "제목: 결과" 형태로 알린다
  const [announcement, setAnnouncement] = useState("");

  const selectedIndex = tracks.findIndex((track) => track.id === selectedId);
  const selected = selectedIndex === -1 ? null : tracks[selectedIndex];

  const canMoveUp = selected !== null && selectedIndex > 0;
  const canMoveDown = selected !== null && selectedIndex < tracks.length - 1;

  // 버튼을 disabled로 바꾸면 누른 버튼에서 포커스가 빠져나간다
  // aria-disabled로 표시만 하고 누르면 여기서 무시한다
  function move(to: number) {
    if (!selected || to < 0 || to >= tracks.length) return;
    onMove(selectedIndex, to);
    setAnnouncement(`${selected.title}: ${to + 1}번으로 옮겼어요.`);
  }

  function remove() {
    if (!selected) return;
    onRemove(selected.id);
    setSelectedId(null);
    setAnnouncement(`${selected.title}: 뺐어요.`);
  }

  return (
    <section className={styles.picked} aria-labelledby="picked-tracks-heading">
      {/* 빈 칸이 다 채워진 채로 시트가 닫히면 포커스가 여기로 온다 */}
      <h2 id="picked-tracks-heading" ref={headingRef} tabIndex={-1} className={styles.heading}>
        담은 곡 {tracks.length}/{TRACK_COUNT}
      </h2>
      <div role="status">
        {tracks.length === 0 && <p>빈 칸을 눌러 곡을 담아 보세요.</p>}
        {tracks.length === TRACK_COUNT && <p>{TRACK_COUNT}곡을 다 담았어요.</p>}
        {announcement && <p className={styles.announcement}>{announcement}</p>}
      </div>
      <ol className={styles.list}>
        {tracks.map((track) => (
          <li key={track.id}>
            <button
              type="button"
              onClick={() => setSelectedId(track.id === selectedId ? null : track.id)}
              aria-pressed={track.id === selectedId}
              className={styles.track}
            >
              {track.title} · {track.artist}
            </button>
          </li>
        ))}
        {Array.from({ length: TRACK_COUNT - tracks.length }, (_, index) => {
          const slot = tracks.length + index + 1;
          return (
            <li key={`empty-${slot}`}>
              <button
                type="button"
                onClick={(event) => onOpenSearch(event.currentTarget)}
                aria-label={`${slot}번 칸에 곡 담기`}
                data-empty-slot
                className={styles.empty}
              >
                + 곡 담기
              </button>
            </li>
          );
        })}
      </ol>
      {/* 곡이 0개여도 남겨 둔다. 마지막 곡을 빼는 순간 버튼이 사라지면 포커스가 빠져나간다 */}
      <div className={styles.controls}>
        <button
          type="button"
          onClick={() => move(selectedIndex - 1)}
          aria-disabled={!canMoveUp}
          aria-label={selected ? `${selected.title} 위로` : "위로"}
        >
          ▲
        </button>
        <button
          type="button"
          onClick={() => move(selectedIndex + 1)}
          aria-disabled={!canMoveDown}
          aria-label={selected ? `${selected.title} 아래로` : "아래로"}
        >
          ▼
        </button>
        <button
          type="button"
          onClick={remove}
          aria-disabled={!selected}
          aria-label={selected ? `${selected.title} 빼기` : "빼기"}
        >
          ⏏ 빼기
        </button>
      </div>
    </section>
  );
}
