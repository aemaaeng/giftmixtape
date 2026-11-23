import { Suspense } from "react";

import PlayPrototype from "@/features/player/PlayPrototype";

export default function PlayPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string | string[] }>;
}) {
  return (
    <main>
      <h1>재생 확인 (임시)</h1>
      <Suspense fallback={<p>불러오는 중이에요.</p>}>
        <PlayPrototype searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
