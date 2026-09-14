import { expect, test } from "@playwright/test";
import { stages } from "../../src/game/data/stages";

test("plays through all ten stages, previews each silhouette and ends with all clear", async ({ page }) => {
  test.setTimeout(120_000);
  const errors: string[] = []; page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const start = new Date("2026-01-01T00:00:00Z");
  await page.clock.install({ time: start }); await page.clock.pauseAt(new Date(start.getTime() + 1000));
  await page.getByRole("button", { name: "전투 시작", exact: true }).click();
  const input = page.getByRole("textbox", { name: "기술명 입력" });
  for (let index = 0; index < stages.length; index++) {
    const enemy = stages[index];
    await expect(page.getByTestId("enemy-name")).toHaveText(enemy.name);
    await expect(page.getByTestId("enemy-hp")).toHaveText(`${enemy.maxHp} / ${enemy.maxHp}`);
    await expect(input).toBeFocused();
    await page.clock.runFor(32);
    await page.screenshot({ path: `test-results/stage-${index+1}.png` });
    if (index === 5) {
      await page.clock.runFor(enemy.attackInterval * 4);
      await expect(page.getByTestId("battle-status")).toContainText("플레이어 쓰러짐");
      await expect(page.getByRole("button", { name: "다음 스테이지 →" })).toHaveCount(0);
      await page.getByRole("button", { name: "RETRY · 다시 시작" }).click();
      await expect(page.getByTestId("enemy-name")).toHaveText(enemy.name);
    }
    for (let hit = 0; hit < Math.ceil(enemy.maxHp / 50); hit++) { await input.fill("폭염연옥참"); await input.press("Enter"); }
    if (index < 9) {
      const next = page.getByRole("button", { name: "다음 스테이지 →" });
      await expect(next).toBeVisible();
      const heading = page.getByTestId("result-screen").getByRole("heading");
      await expect(heading).toBeFocused();
      await heading.dispatchEvent("keydown", { key: "Enter", repeat: true });
      await heading.dispatchEvent("keydown", { key: "Enter", isComposing: true });
      await heading.dispatchEvent("keydown", { key: "Enter", keyCode: 229 });
      await expect(next).toBeVisible();
      if (index === 0) {
        const music = page.getByRole("button", { name: "배경음악" });
        await music.focus(); await page.keyboard.press("Enter");
        await expect(next).toBeVisible();
        await heading.focus();
      }
      await page.keyboard.press("Enter");
      await expect(page.getByTestId("player-hp")).toHaveText("100 / 100");
      await expect(page.getByTestId("combo")).toHaveText("COMBO 0 / MAX 0");
    }
  }
  await page.clock.runFor(1100);
  await expect(page.getByRole("heading", { name: "ALL CLEAR · 10 스테이지 정복" })).toBeVisible();
  await expect(page.getByRole("button", { name: "다음 스테이지 →" })).toHaveCount(0);
  await page.screenshot({ path: "test-results/all-clear.png" });
  await page.getByRole("button", { name: "1 스테이지부터 다시 도전" }).click();
  await expect(page.getByTestId("enemy-name")).toHaveText("오우거");
  await expect(page.getByTestId("enemy-hp")).toHaveText("200 / 200");
  expect(errors).toEqual([]);
});
