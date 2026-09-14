import { expect, it } from "vitest";
import { stages, getStage, STAGE_COUNT } from "../src/game/data/stages";
import { GameEngine } from "../src/game/engine/GameEngine";

it("has ten distinct enemies with strictly increasing combat pressure", () => {
  expect(STAGE_COUNT).toBe(10);
  expect(new Set(stages.map((stage) => stage.name)).size).toBe(10);
  expect(new Set(stages.map((stage) => stage.shape)).size).toBe(10);
  for (let i = 1; i < stages.length; i++) {
    expect(stages[i].maxHp).toBeGreaterThan(stages[i-1].maxHp);
    expect(stages[i].attackDamage).toBeGreaterThan(stages[i-1].attackDamage);
    expect(stages[i].attackInterval).toBeLessThan(stages[i-1].attackInterval);
  }
  expect(() => getStage(11)).toThrow(); expect(() => getStage(0)).toThrow();
});

it("advances only from victory and ends after ten stages, retry stays on current stage", () => {
  const engine = new GameEngine(() => {});
  expect(engine.nextStage()).toBe(false); engine.start(); expect(engine.nextStage()).toBe(false);
  for (let stage = 1; stage <= 10; stage++) {
    expect(engine.snapshot.stage).toBe(stage); expect(engine.snapshot.enemyHp).toBe(getStage(stage).maxHp);
    for (let i = 0; i < Math.ceil(getStage(stage).maxHp / 50); i++) engine.cast("폭염연옥참");
    expect(engine.snapshot.status).toBe("victory");
    expect(engine.nextStage()).toBe(stage < 10);
    if (stage < 10) expect(engine.snapshot).toMatchObject({ playerHp: 100, maxCombo: 0, elapsedMs: 0 });
  }
  expect(engine.snapshot).toMatchObject({ stage: 10, status: "victory" });
  engine.start(); expect(engine.snapshot).toMatchObject({ stage: 10, enemyHp: 750, status: "playing" });
  engine.start(1); expect(engine.snapshot.stage).toBe(1);
});

it.each(stages.map((stage, index) => ({ ...stage, stage: index+1 })))("stage $stage uses its attack interval and damage", ({ stage, attackInterval, attackDamage }) => {
  const engine = new GameEngine(() => {}); engine.start(stage);
  for(let elapsed = 0; elapsed < attackInterval; elapsed += 100) engine.update(100);
  expect(engine.snapshot.playerHp).toBe(100 - attackDamage);
  engine.setPaused(true); engine.update(100); engine.start();
  expect(engine.snapshot).toMatchObject({ stage, playerHp: 100, attackRemaining: attackInterval, paused: false });
});
