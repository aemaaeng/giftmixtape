import type { ItunesResponse } from "./types";

const BASE_URL = "https://itunes.apple.com";

export default async function itunesRequest(
  path: "search" | "lookup",
  params: Record<string, string | number>,
  signal?: AbortSignal,
): Promise<ItunesResponse> {
  const url = new URL(`/${path}`, BASE_URL);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`iTunes ${path} 요청 실패: ${response.status}`);
  }
  return response.json();
}
