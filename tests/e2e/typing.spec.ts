import { expect, test } from "@playwright/test";

test("exact matching, IME confirmation, repeated Enter, focus and reset", async ({ page }) => {
  await page.goto("/");
  await page.clock.install();
  await page.getByRole("button", { name: "전투 시작" }).click();
  const input = page.getByRole("textbox", { name: "기술명 입력" });
  const hp = page.getByTestId("enemy-hp");
  await expect(input).toBeFocused();
  await input.fill("화염");
  await expect(page.locator("mark")).toHaveText("화염");
  await input.fill("화염참격");
  await input.dispatchEvent("compositionstart", { data: "격" });
  await input.dispatchEvent("compositionupdate", { data: "격" });
  await input.press("Enter");
  await expect(hp).toHaveText("200 / 200");
  await expect(input).toHaveValue("화염참격");
  await input.dispatchEvent("compositionend", { data: "격" });
  // Browsers may dispatch the IME Enter after compositionend, marked as 229.
  await input.dispatchEvent("keydown", { key: "Enter", keyCode: 229 });
  await expect(hp).toHaveText("200 / 200");
  await input.dispatchEvent("keydown", { key: "Enter", isComposing: true });
  await expect(hp).toHaveText("200 / 200");
  await input.press("Enter");
  await expect(hp).toHaveText("175 / 200");
  await expect(input).toHaveValue("");
  await input.press("Enter");
  await expect(page.getByRole("status")).toContainText("CAST FAILED");
  await expect(hp).toHaveText("175 / 200");
  for (const invalid of [" ", "참격 ", "화염참걱"]) {
    await input.fill(invalid); await input.press("Enter");
    await expect(input).toHaveValue("");
    await expect(page.getByRole("status")).toContainText("CAST FAILED");
  }
  await input.fill("참격");
  await input.dispatchEvent("keydown", { key: "Enter", repeat: true });
  await expect(hp).toHaveText("175 / 200");
  await input.press("Enter");
  await input.fill("참격"); await input.press("Enter");
  await expect(hp).toHaveText("155 / 200");
  await page.locator("canvas").click({ position: { x: 300, y: 200 } });
  await expect(input).toBeFocused();
  await input.fill("폭염");
  await page.getByRole("button", { name: "전투 초기화" }).click();
  await expect(input).toHaveValue("");
  await expect(input).toBeFocused();
  await expect(hp).toHaveText("200 / 200");
  await expect(input).toBeInViewport();
});

test("timed evade and healing through the input", async ({ page }) => {
  await page.goto("/"); await page.clock.install();
  await page.getByRole("button", { name: "전투 시작" }).click();
  const input = page.getByRole("textbox", { name: "기술명 입력" });
  await page.clock.runFor(4300);
  await input.fill("회피"); await input.press("Enter");
  await page.clock.runFor(800);
  await expect(page.getByTestId("player-hp")).toHaveText("100 / 100");
  await expect(page.getByRole("status")).toContainText("DODGE!");
  await page.clock.runFor(5000);
  await expect(page.getByTestId("player-hp")).toHaveText("80 / 100");
  await input.fill("치유"); await input.press("Enter");
  await expect(page.getByTestId("player-hp")).toHaveText("100 / 100");
  await expect(page.getByRole("status")).toContainText("+20 HP");
});
