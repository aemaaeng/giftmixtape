import { expect, test } from "@playwright/test";

// 포커스 가두기·Esc·포커스 되돌리기는 jsdom이 dialog를 구현하지 않아 실제 브라우저에서 확인한다
test("빈 칸으로 곡 담기 시트를 열고 Esc로 닫으면 연 칸으로 포커스가 돌아온다", async ({ page }) => {
  await page.goto("/");
  const slot = page.getByRole("button", { name: "1번 칸에 곡 담기" });

  await slot.click();
  const sheet = page.getByRole("dialog", { name: "곡 담기 0/5" });
  await expect(sheet).toBeVisible();
  await expect(page.getByRole("searchbox")).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();
  await expect(slot).toBeFocused();
});

test("시트 바깥을 누르면 닫힌다", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "1번 칸에 곡 담기" }).click();
  const sheet = page.getByRole("dialog");
  await expect(sheet).toBeVisible();

  await page.mouse.click(10, 10);
  await expect(sheet).toBeHidden();
});
