import { expect, test } from "@playwright/test";

test("all combat effects draw on Canvas while input and HUD stay fixed", async ({ page }) => {
  // Observe actual Canvas drawing, without exposing engine state to the browser.
  await page.addInitScript(() => {
    const original = CanvasRenderingContext2D.prototype.fillText;
    const labels = new Set<string>();
    Object.assign(window, { drawnLabels: labels });
    CanvasRenderingContext2D.prototype.fillText = function (text, x, y, maxWidth) {
      labels.add(text);
      if (maxWidth === undefined) original.call(this, text, x, y);
      else original.call(this, text, x, y, maxWidth);
    };
  });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/"); await page.clock.install();
  await page.clock.pauseAt(new Date());
  await page.getByRole("button", { name: "전투 시작" }).click();
  const input = page.getByRole("textbox", { name: "기술명 입력" });
  const before = await input.boundingBox();
  const cast = async (skill: string) => { await input.fill(skill); await input.press("Enter"); await page.clock.runFor(80); };
  for (const skill of ["참격", "화염참격", "폭염연옥참"]) await cast(skill);
  await expect(input).toBeFocused(); expect(await input.boundingBox()).toEqual(before);
  await page.screenshot({ path: "test-results/phase-3-heavy.png" });
  await page.clock.runFor(5100);
  await cast("치유");
  await page.screenshot({ path: "test-results/phase-3-heal.png" });
  await page.getByRole("button", { name: "전투 초기화" }).click();
  await page.clock.runFor(4300); await cast("회피"); await page.clock.runFor(800);
  await expect(page.getByRole("status")).toContainText("DODGE!");
  const labels = await page.evaluate(() => Array.from((window as unknown as { drawnLabels: Set<string> }).drawnLabels));
  for (const text of ["참격", "화염참격", "폭염연옥참", "-10", "-25", "-50", "-20", "+20", "회피", "DODGE!"]) expect(labels).toContain(text);
  expect(errors).toEqual([]);
});
