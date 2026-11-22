"use client";

import { useEffect, useRef } from "react";

import TRACK_COUNT from "@/lib/schema/track-count";

import styles from "./TrackSearchSheet.module.css";

type TrackSearchSheetProps = {
  open: boolean;
  pickedCount: number;
  announcement: string;
  // dialog가 실제로 닫힌 뒤 한 번 불린다
  onClose: () => void;
  children: React.ReactNode;
};

// 닫혀도 화면에서 지우지 않는다. 다시 열면 검색어와 결과가 그대로 남아 있다
export default function TrackSearchSheet({
  open,
  pickedCount,
  announcement,
  onClose,
  children,
}: TrackSearchSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // React의 autoFocus는 마운트할 때만 동작해서, 열 때마다 검색창으로 직접 옮긴다
      dialog.querySelector<HTMLInputElement>("input[type=search]")?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  function close() {
    dialogRef.current?.close();
  }

  // 시트 바깥(::backdrop)을 누르면 이벤트 대상이 dialog 자신이 된다
  function handleClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) close();
  }

  // 닫는 길(닫기 버튼, 바깥, Esc, 5곡 다 참)이 모두 close 이벤트 하나로 모인다
  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="track-search-sheet-heading"
      onClose={onClose}
      onClick={handleClick}
      className={styles.sheet}
    >
      <div className={styles.body}>
        <div className={styles.header}>
          <h2 id="track-search-sheet-heading" className={styles.heading}>
            곡 담기 {pickedCount}/{TRACK_COUNT}
          </h2>
          <button type="button" onClick={close}>
            닫기
          </button>
        </div>
        <div className={styles.content}>{children}</div>
        <p role="status" className={styles.status}>
          {announcement}
        </p>
      </div>
    </dialog>
  );
}
