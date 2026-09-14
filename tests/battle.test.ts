import { describe, expect, it } from "vitest";
import { applyDamage, GameEngine, initialBattle } from "../src/game/engine/GameEngine";
import { applyHeal, matchSkill } from "../src/game/data/skills";

function advance(engine: GameEngine, milliseconds: number, step = 20) {
  for (let elapsed = 0; elapsed < milliseconds; elapsed += step) engine.update(Math.min(step, milliseconds - elapsed));
}

describe("Phase 1 battle", () => {
  it("starts with 100/200 HP and ignores idle attacks", () => {
    const engine = new GameEngine(() => {});
    engine.cast("참격"); advance(engine, 5000);
    expect(engine.snapshot).toEqual(initialBattle());
    engine.start(); engine.cast("참격");
    expect(engine.snapshot.enemyHp).toBe(190);
  });
  it.each([10, 20, 50, 100])("deals 20 damage every five seconds with %d ms frames", (step) => {
    const engine = new GameEngine(() => {}); engine.start();
    advance(engine, 4990, step); expect(engine.snapshot.playerHp).toBe(100);
    engine.update(10); expect(engine.snapshot.playerHp).toBe(80);
    advance(engine, 5000, step); expect(engine.snapshot.playerHp).toBe(60);
  });
  it("clamps delayed frames and ignores invalid deltas", () => {
    const engine = new GameEngine(() => {}); engine.start();
    engine.update(60000); engine.update(-100); engine.update(NaN);
    expect(engine.snapshot.attackRemaining).toBe(4900);
    expect(engine.snapshot.playerHp).toBe(100);
  });
  it("stops combat after either side reaches zero and resets all state", () => {
    const engine = new GameEngine(() => {}); engine.start();
    for (let i = 0; i < 25; i++) engine.cast("참격");
    advance(engine, 10000);
    expect(engine.snapshot).toMatchObject({ status: "victory", enemyHp: 0, playerHp: 100 });
    engine.start(); advance(engine, 25000); engine.cast("참격");
    expect(engine.snapshot).toMatchObject({ status: "gameover", playerHp: 0, enemyHp: 200 });
    engine.start();
    expect(engine.snapshot).toEqual({ ...initialBattle(), status: "playing" });
  });
  it("publishes timer changes at 10 Hz instead of every frame", () => {
    let notifications = 0;
    const engine = new GameEngine(() => { notifications++; });
    engine.start(); advance(engine, 1000, 10);
    expect(notifications).toBe(11);
  });
  it("clamps HP at zero and does not heal from negative damage", () => {
    expect(applyDamage(5, 10)).toBe(0);
    expect(applyDamage(100, -20)).toBe(100);
  });
});

describe("Phase 2 skills", () => {
  it.each(["", " ", " 참격", "참격 ", "화염참걱", "참ㄱ", "참격\n"])("rejects exact mismatch %j", (input) => {
    expect(matchSkill(input)).toBeUndefined();
    const engine = new GameEngine(() => {}); engine.start(); engine.cast(input);
    expect(engine.snapshot.enemyHp).toBe(200);
    expect(engine.snapshot.feedback).toContain("CAST FAILED");
  });
  it("applies all three attacks immediately, including consecutive casts", () => {
    const engine = new GameEngine(() => {}); engine.start();
    engine.cast("참격"); expect(engine.snapshot.enemyHp).toBe(190);
    engine.cast("화염참격"); expect(engine.snapshot.enemyHp).toBe(165);
    engine.cast("폭염연옥참"); expect(engine.snapshot.enemyHp).toBe(115);
    engine.cast("참격"); engine.cast("참격"); expect(engine.snapshot.enemyHp).toBe(95);
  });
  it("heals by 30, clamps at max HP and cannot revive after gameover", () => {
    expect(applyHeal(50, 30, 100)).toBe(80);
    expect(applyHeal(90, 30, 100)).toBe(100);
    const engine = new GameEngine(() => {}); engine.start(); advance(engine, 10000);
    engine.cast("치유"); expect(engine.snapshot.playerHp).toBe(90);
    engine.cast("치유"); expect(engine.snapshot.playerHp).toBe(100);
    advance(engine, 25000); const ended = engine.snapshot;
    engine.cast("치유"); engine.cast("회피"); engine.cast("없는기술");
    expect(engine.snapshot).toEqual(ended);
  });
  it("dodges at the expiry boundary but not after expiry", () => {
    const engine = new GameEngine(() => {}); engine.start(); advance(engine, 4000);
    engine.cast("회피"); advance(engine, 1000);
    expect(engine.snapshot.playerHp).toBe(100);
    expect(engine.snapshot.feedback).toContain("DODGE!");
    engine.cast("회피"); advance(engine, 5000);
    expect(engine.snapshot.playerHp).toBe(80);
  });
  it("recasting evade refreshes without stacking and resetting clears it", () => {
    const engine = new GameEngine(() => {}); engine.start(); engine.cast("회피");
    advance(engine, 500); engine.cast("회피");
    expect(engine.snapshot.evadeRemaining).toBe(1000);
    engine.start(); expect(engine.snapshot.evadeRemaining).toBe(0);
  });
});
