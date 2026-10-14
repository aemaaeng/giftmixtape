import { vi } from "vitest";

import type { ItunesItem } from "../types";

type Reply = ItunesItem[] | "network-error" | number;

// fetch를 가짜로 바꾸고, 요청 URL마다 handler가 정한 응답을 돌려준다.
// handler가 숫자를 돌려주면 그 HTTP 상태로 실패 응답을 만든다.
export default function mockItunes(handler: (url: URL) => Reply) {
  const fetchMock = vi.fn(async (input: string | URL) => {
    const reply = handler(new URL(String(input)));
    if (reply === "network-error") throw new TypeError("Failed to fetch");
    if (typeof reply === "number") return new Response("", { status: reply });
    return Response.json({ resultCount: reply.length, results: reply });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}
