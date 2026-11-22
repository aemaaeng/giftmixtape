import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// 전역 API(globals)를 켜지 않아서 Testing Library의 자동 cleanup이 등록되지 않는다
afterEach(() => {
  cleanup();
});

// jsdom은 dialog의 showModal·close를 구현하지 않는다. 열림 상태와 close 이벤트만 흉내 낸다
HTMLDialogElement.prototype.showModal = function () {
  this.open = true;
};
HTMLDialogElement.prototype.close = function () {
  if (!this.open) return;
  this.open = false;
  this.dispatchEvent(new Event("close"));
};
