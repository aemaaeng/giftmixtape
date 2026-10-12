import { expect, test } from "@playwright/test";

// 만들기 → 링크 → 재생 흐름이 생기면 이 테스트를 그 흐름으로 교체한다.
test("홈 페이지가 열린다", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.ok()).toBe(true);
});
