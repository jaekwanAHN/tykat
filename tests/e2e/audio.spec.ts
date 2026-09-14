import { expect, test } from "@playwright/test";

test("audio starts on gesture, independent mute, victory stops loop and retry starts one loop", async ({ page }) => {
  await page.addInitScript(() => {
    const Original = window.AudioContext;
    const record = { contexts: 0, loops: 0, sounds: 0, activeLoops: 0 };
    Object.assign(window, { audioRecord: record });
    window.AudioContext = class extends Original {
      constructor(options?: AudioContextOptions) { super(options); record.contexts++; }
      createBufferSource() {
        const source = super.createBufferSource();
        const start = source.start.bind(source); const stop = source.stop.bind(source);
        let active = false;
        source.start = (...args: Parameters<typeof source.start>) => {
          if (source.loop) { record.loops++; record.activeLoops++; active = true; } else record.sounds++;
          start(...args);
        };
        source.stop = (...args: Parameters<typeof source.stop>) => {
          if (active) { record.activeLoops--; active = false; } stop(...args);
        };
        return source;
      }
    };
  });
  const errors: string[] = []; page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const state = () => page.evaluate(() => (window as unknown as { audioRecord: { contexts: number; loops: number; sounds: number; activeLoops: number } }).audioRecord);
  expect((await state()).contexts).toBe(0);
  await page.getByRole("button", { name: "전투 시작" }).click();
  await expect.poll(async () => (await state()).activeLoops).toBe(1);
  const input = page.getByRole("textbox", { name: "기술명 입력" });
  await input.fill("참격"); await input.press("Enter");
  await expect.poll(async () => (await state()).sounds).toBeGreaterThan(0);
  await page.getByRole("button", { name: "배경음악", exact: true }).click();
  expect((await state()).activeLoops).toBe(0); await expect(input).toBeFocused();
  await page.getByRole("button", { name: "효과음", exact: true }).click();
  const muted = (await state()).sounds;
  await input.fill("치유"); await input.press("Enter"); expect((await state()).sounds).toBe(muted);
  await page.getByRole("button", { name: "효과음", exact: true }).click();
  await page.getByRole("button", { name: "배경음악", exact: true }).click();
  for (let i = 0; i < 4; i++) { await input.fill("폭염연옥참"); await input.press("Enter"); }
  await expect(page.getByTestId("result-screen")).toBeVisible();
  expect((await state()).activeLoops).toBe(0);
  await page.getByRole("button", { name: "RETRY · 다시 시작" }).click();
  expect((await state()).activeLoops).toBe(1); expect((await state()).contexts).toBe(1);
  expect(errors).toEqual([]);
});
