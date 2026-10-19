import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// 전역 API(globals)를 켜지 않아서 Testing Library의 자동 cleanup이 등록되지 않는다
afterEach(() => {
  cleanup();
});
