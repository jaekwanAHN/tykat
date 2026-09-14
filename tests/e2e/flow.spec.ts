import { expect, test } from "@playwright/test";

test("start, frozen victory results, deliberate retry and gameover results", async ({ page }) => {
  await page.goto("/"); await page.clock.install(); await page.clock.pauseAt(new Date());
  await expect(page.getByRole("heading", { name: "기술명을 외쳐라" })).toBeVisible();
  await page.screenshot({ path: "test-results/phase-5-start.png" });
  await page.getByRole("button", { name: "전투 시작" }).click();
  const input = page.getByRole("textbox", { name: "기술명 입력" });
  await expect(input).toBeFocused();
  for (let i = 0; i < 3; i++) {
    await input.dispatchEvent("compositionstart"); await input.fill("폭염연옥참");
    await page.clock.runFor(500); await input.dispatchEvent("compositionend"); await input.press("Enter");
  }
  const result = page.getByTestId("result-screen");
  await expect(result.getByRole("heading")).toHaveText("VICTORY · 전투 승리");
  await expect(result.getByRole("heading")).toBeFocused();
  const values = result.locator("dd");
  await expect(values).toHaveText(["00:01", "3", "120", "100.0%", "3"]);
  await page.clock.runFor(6000);
  await expect(values).toHaveText(["00:01", "3", "120", "100.0%", "3"]);
  await page.screenshot({ path: "test-results/phase-5-victory.png" });
  await page.getByRole("button", { name: "RETRY · 다시 시작" }).click();
  await expect(result).toHaveCount(0); await expect(input).toBeFocused(); await expect(input).toHaveValue("");
  await expect(page.getByTestId("combo")).toHaveText("COMBO 0 / MAX 0");
  await expect(page.getByTestId("enemy-hp")).toHaveText("200 / 200");
  await page.clock.runFor(25_100);
  await expect(result.getByRole("heading")).toHaveText("GAME OVER · 전투 패배");
  await expect(values).toHaveText(["00:25", "0", "0", "100.0%", "0"]);
  await expect(result.getByText("SURVIVAL TIME")).toBeVisible();
  await page.screenshot({ path: "test-results/phase-5-gameover.png" });
  await page.clock.runFor(1000); await expect(values.first()).toHaveText("00:25");
  await page.getByRole("button", { name: "RETRY · 다시 시작" }).click();
  await expect(input).toBeFocused(); await expect(page.getByTestId("player-hp")).toHaveText("100 / 100");
});
