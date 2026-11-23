import { useEffect, useRef, useState } from "react";

import playerReducer, { type PlayerAction, type PlayerState } from "./player-reducer";

export type PlayerTrack = {
  id: number;
  title: string;
  artist: string;
  // lookup에서 곡을 찾지 못하면 null. 재생할 차례가 오면 건너뛴다
  previewUrl: string | null;
};

function isDomError(error: unknown, name: string) {
  return error instanceof DOMException && error.name === name;
}

// <audio> 하나를 곡마다 src만 바꿔 계속 쓴다
// 모바일은 처음 탭할 때 받은 재생 허용이 이 요소에 묶여서, 같은 요소여야 다음 곡이 이어서 재생된다
export default function usePreviewPlayer(tracks: PlayerTrack[]) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [state, setState] = useState<PlayerState>(() => ({
    status: "idle",
    index: 0,
    trackCount: tracks.length,
    failed: [],
  }));
  // 오디오 이벤트와 play()의 Promise는 렌더 밖에서 오므로 최신 상태를 ref로 읽는다
  const stateRef = useRef(state);

  useEffect(() => {
    const audio = audioRef.current;
    return () => audio?.pause();
  }, []);

  // 오디오 조작은 effect로 미루지 않고 전이 직후 여기서 한다
  // iOS는 탭 이벤트 핸들러 안에서 부른 play()만 허용한다
  function send(action: PlayerAction) {
    const prev = stateRef.current;
    const next = playerReducer(prev, action);
    if (next === prev) return;
    stateRef.current = next;
    setState(next);

    const audio = audioRef.current;
    if (!audio) return;
    if (next.status === "loading" && (prev.status !== "loading" || prev.index !== next.index)) {
      start(audio, next.index);
    } else if (next.status === "playing" && prev.status === "paused") {
      play(audio, next.index);
    } else if (next.status === "paused" || next.status === "ended") {
      audio.pause();
    }
  }

  function start(audio: HTMLAudioElement, index: number) {
    const url = tracks[index]?.previewUrl;
    if (!url) {
      send({ type: "trackError", index });
      return;
    }
    audio.src = url;
    play(audio, index);
  }

  function play(audio: HTMLAudioElement, index: number) {
    audio.play().then(
      () => send({ type: "loaded", index }),
      (error: unknown) => {
        // 곡을 넘기면 이전 곡의 play()가 AbortError로 끝난다. 정상 흐름이다
        if (isDomError(error, "AbortError")) return;
        if (isDomError(error, "NotAllowedError")) send({ type: "blocked", index });
        else send({ type: "trackError", index });
      },
    );
  }

  return {
    state,
    audioRef,
    audioEvents: {
      onEnded: () => send({ type: "trackEnd", index: stateRef.current.index }),
      onError: () => send({ type: "trackError", index: stateRef.current.index }),
    },
    insert: () => send({ type: "insert" }),
    pause: () => send({ type: "pause" }),
    resume: () => send({ type: "resume" }),
    next: () => send({ type: "next" }),
    prev: () => send({ type: "prev" }),
  };
}
