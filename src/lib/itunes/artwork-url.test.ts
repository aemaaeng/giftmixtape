import { describe, expect, it } from "vitest";

import artworkUrl from "./artwork-url";

describe("artworkUrl", () => {
  it("URL 끝의 크기를 원하는 크기로 바꾼다", () => {
    expect(artworkUrl("https://x.mzstatic.com/a/cover.jpg/100x100bb.jpg", 600)).toBe(
      "https://x.mzstatic.com/a/cover.jpg/600x600bb.jpg",
    );
  });

  it("크기 표기가 없으면 그대로 돌려준다", () => {
    expect(artworkUrl("https://example.com/cover.jpg", 600)).toBe("https://example.com/cover.jpg");
  });
});
