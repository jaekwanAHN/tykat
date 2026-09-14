import { expect, test } from "@playwright/test";

test("tab icon, Escape pauses timers/audio and preserves typing through resume and retry", async ({ page }) => {
  await page.addInitScript(() => {
    const Original = window.AudioContext;
    window.AudioContext = class extends Original {
      constructor(options?: AudioContextOptions) { super(options); Object.assign(window, { testAudioContext: this }); }
    };
  });
  await page.goto("/");
  const href = await page.locator('link[rel="icon"]').first().getAttribute("href");
  expect(href).toContain("icon.svg");
  const icon = await page.request.get(href!); expect(icon.ok()).toBe(true); expect(await icon.text()).toContain("<svg");
  const clockStart = new Date("2026-01-01T00:00:00Z");
  await page.clock.install({ time: clockStart });
  await page.clock.pauseAt(new Date(clockStart.getTime() + 1000));
  await page.keyboard.press("Escape"); await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "전투 시작", exact: true })).toBeEnabled();
  await page.keyboard.press("Enter");
  const input = page.getByRole("textbox", { name: "기술명 입력" });
  await expect(input).toBeFocused();
  await input.dispatchEvent("compositionstart"); await input.fill("화염"); await page.clock.runFor(200);
  await input.dispatchEvent("keydown", { key: "Escape", isComposing: true });
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await input.dispatchEvent("compositionend");
  await page.keyboard.press("Escape");
  const dialog = page.getByRole("dialog", { name: "일시정지", exact: true });
  await expect(dialog).toBeVisible(); await expect(input).toBeDisabled();
  const timer = await page.getByRole("progressbar", { name: "적 공격까지 남은 시간" }).getAttribute("value");
  await expect.poll(() => page.evaluate(() => (window as unknown as { testAudioContext: AudioContext }).testAudioContext.state)).toBe("suspended");
  await page.clock.runFor(10000);
  await expect(page.getByTestId("player-hp")).toHaveText("100 / 100");
  expect(await page.getByRole("progressbar", { name: "적 공격까지 남은 시간" }).getAttribute("value")).toBe(timer);
  await page.screenshot({ path: "test-results/pause-menu.png" });
  await page.keyboard.press("Escape"); await expect(dialog).toHaveCount(0);
  await expect(input).toBeFocused(); await expect(input).toHaveValue("화염");
  await expect.poll(() => page.evaluate(() => (window as unknown as { testAudioContext: AudioContext }).testAudioContext.state)).toBe("running");
  await input.dispatchEvent("compositionstart"); await input.fill("화염참격");
  await page.clock.runFor(300); await input.dispatchEvent("compositionend"); await input.press("Enter");
  await expect(page.getByTestId("enemy-hp")).toHaveText("162 / 200");
  await expect(page.getByTestId("perfect-count")).toHaveText("PERFECT 1");
  await page.getByRole("button", { name: "일시정지 · Esc", exact: true }).click();
  await dialog.getByRole("button", { name: "처음부터 다시 시작" }).click();
  await expect(input).toBeFocused(); await expect(input).toHaveValue("");
  await expect(page.getByTestId("enemy-hp")).toHaveText("200 / 200");
  await expect(page.getByTestId("perfect-count")).toHaveText("PERFECT 0");
});
