import TRACK_COUNT from "@/lib/schema/track-count";
import type { Track } from "@/lib/schema/track";

import styles from "./PickedTracks.module.css";

type PickedTracksProps = {
  tracks: Track[];
  onRemove: (id: number) => void;
  onMove: (from: number, to: number) => void;
};

export default function PickedTracks({ tracks, onRemove, onMove }: PickedTracksProps) {
  return (
    <section className={styles.picked} aria-labelledby="picked-tracks-heading">
      <h2 id="picked-tracks-heading" className={styles.heading}>
        담은 곡 {tracks.length}/{TRACK_COUNT}
      </h2>
      <div role="status">
        {tracks.length === 0 && <p>아직 담은 곡이 없어요. 검색해서 담아 보세요.</p>}
        {tracks.length === TRACK_COUNT && <p>{TRACK_COUNT}곡을 다 담았어요.</p>}
      </div>
      {tracks.length > 0 && (
        <ol className={styles.list}>
          {tracks.map((track, index) => (
            <li key={track.id} className={styles.item}>
              <span className={styles.title}>
                {track.title} · {track.artist}
              </span>
              <button
                type="button"
                onClick={() => onMove(index, index - 1)}
                disabled={index === 0}
                aria-label={`${track.title} 위로`}
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => onMove(index, index + 1)}
                disabled={index === tracks.length - 1}
                aria-label={`${track.title} 아래로`}
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => onRemove(track.id)}
                aria-label={`${track.title} 빼기`}
              >
                빼기
              </button>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
