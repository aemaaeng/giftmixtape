"use client";

import usePreviewPlayer, { type PlayerTrack } from "./use-preview-player";

import styles from "./PreviewPlayer.module.css";

type PreviewPlayerProps = {
  tracks: PlayerTrack[];
};

export default function PreviewPlayer({ tracks }: PreviewPlayerProps) {
  const { state, audioRef, audioEvents, insert, pause, resume, next, prev } =
    usePreviewPlayer(tracks);
  const { status, index, failed } = state;
  const isActive = status === "loading" || status === "playing" || status === "paused";
  const current = tracks[index];

  const main = {
    idle: { label: "테이프 넣기", onClick: insert },
    loading: { label: "불러오는 중", onClick: undefined },
    playing: { label: "일시정지", onClick: pause },
    paused: { label: "재생", onClick: resume },
    ended: { label: "처음부터 다시 듣기", onClick: insert },
  }[status];

  let message = "";
  if (status === "idle") message = "테이프를 넣으면 재생해요.";
  else if (status === "ended")
    message = failed.length === tracks.length ? "재생할 수 있는 곡이 없어요." : "다 들었어요.";
  else if (current) {
    const position = `${index + 1}/${tracks.length}`;
    const label = { loading: "불러오는 중", playing: "재생 중", paused: "멈춤" }[status];
    message = `${position} ${current.title} · ${current.artist} ${label}`;
  }

  return (
    <section className={styles.player} aria-labelledby="preview-player-heading">
      <h2 id="preview-player-heading">미리 듣기</h2>
      <ol className={styles.list}>
        {tracks.map((track, position) => (
          <li
            key={track.id}
            aria-current={isActive && position === index ? "true" : undefined}
            className={styles.track}
          >
            {track.title} · {track.artist}
            {failed.includes(position) && <span> (재생할 수 없어요)</span>}
          </li>
        ))}
      </ol>
      <p role="status">{message}</p>
      {/* 버튼을 없애거나 disabled로 바꾸면 누른 버튼에서 포커스가 빠져나간다. 상태에 맞지 않는 입력은 reducer가 무시한다 */}
      <div className={styles.controls}>
        <button type="button" onClick={prev} aria-disabled={!isActive} aria-label="이전 곡">
          ⏮
        </button>
        <button type="button" onClick={main.onClick} aria-disabled={!main.onClick}>
          {main.label}
        </button>
        <button type="button" onClick={next} aria-disabled={!isActive} aria-label="다음 곡">
          ⏭
        </button>
      </div>
      {/* Web Audio에 연결할 수 있게 CORS 모드로 받는다. 미리듣기 서버는 CORS를 허용한다 */}
      <audio ref={audioRef} crossOrigin="anonymous" preload="none" {...audioEvents} />
    </section>
  );
}
