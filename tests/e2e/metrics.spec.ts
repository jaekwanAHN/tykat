import { expect, test } from "@playwright/test";

test("timed Korean composition gives Perfect; corrections and paste do not", async ({ page }) => {
  await page.goto("/"); await page.clock.install(); await page.clock.pauseAt(new Date());
  await page.getByRole("button", { name: "전투 시작" }).click();
  const input = page.getByRole("textbox", { name: "기술명 입력" });
  const typeKorean = async (text: string, ms: number) => {
    await input.dispatchEvent("compositionstart"); await input.fill(text);
    await page.clock.runFor(ms); await input.dispatchEvent("compositionend", { data: text });
  };
  await typeKorean("화염참격", 1000); await input.press("Enter");
  await expect(page.getByTestId("enemy-hp")).toHaveText("162 / 200");
  await expect(page.getByTestId("perfect-count")).toHaveText("PERFECT 1");
  await expect(page.getByTestId("wpm")).toHaveText("WPM 48");
  await page.clock.runFor(80);
  await page.screenshot({ path: "test-results/phase-4-perfect.png" });
  await typeKorean("참걱", 200); await input.press("Backspace");
  await input.dispatchEvent("compositionstart"); await input.fill("참격"); await input.dispatchEvent("compositionend"); await input.press("Enter");
  await expect(page.getByTestId("enemy-hp")).toHaveText("152 / 200");
  await expect(page.getByTestId("combo")).toContainText("COMBO 2");
  await expect(page.getByTestId("accuracy")).toHaveText("ACC 85.7%");
  await input.dispatchEvent("paste"); await input.fill("참격"); await page.clock.runFor(100); await input.press("Enter");
  await expect(page.getByTestId("enemy-hp")).toHaveText("142 / 200");
  await expect(page.getByTestId("perfect-count")).toHaveText("PERFECT 1");
  await input.press("Enter"); await expect(page.getByTestId("combo")).toContainText("COMBO 0");
  await page.getByRole("button", { name: "전투 초기화" }).click();
  await expect(page.getByTestId("wpm")).toHaveText("WPM 0");
  await expect(page.getByTestId("accuracy")).toHaveText("ACC 100.0%");
  await expect(page.getByTestId("perfect-count")).toHaveText("PERFECT 0");
});
