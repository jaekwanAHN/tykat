import { describe, expect, it } from "vitest";
import { EffectSystem, MAX_EFFECTS, MAX_PARTICLES } from "../src/game/effects/EffectSystem";
import { GameEngine } from "../src/game/engine/GameEngine";
import type { CombatEffect } from "../src/game/effects/CombatEffect";

describe("combat feedback lifecycle", () => {
  it("emits every cast immediately, including repeated casts and the killing blow", () => {
    const events: CombatEffect[] = [];
    const engine = new GameEngine(() => {}, (event) => events.push(event));
    engine.cast("참격"); expect(events).toHaveLength(0);
    engine.start(); engine.cast("없는기술");
    expect(events).toEqual([{ type: "reset" }]);
    for (let i = 0; i < 4; i++) engine.cast("폭염연옥참");
    expect(events.filter((event) => event.type === "heavySlash")).toHaveLength(4);
    expect(engine.snapshot.status).toBe("victory");
    engine.cast("치유"); expect(events).toHaveLength(5);
  });
  it("emits actual healing and distinguishes a dodge from damage", () => {
    const events: CombatEffect[] = [];
    const engine = new GameEngine(() => {}, (event) => events.push(event));
    const advance = (ms: number) => { for (let i = 0; i < ms; i += 100) engine.update(100); };
    engine.start(); advance(5000); engine.cast("치유");
    expect(events).toContainEqual({ type: "hit", amount: 20 });
    expect(events).toContainEqual({ type: "heal", amount: 20 });
    advance(4200); engine.cast("회피"); advance(800);
    expect(events.at(-1)).toEqual({ type: "dodge" });
  });
  it("moves particles with elapsed time, expires effects and clears on reset", () => {
    const effects = new EffectSystem(); effects.play({ type: "heal", amount: 30 });
    const particle = effects.particles[0]; const y = particle.y;
    effects.update(100);
    expect(particle.y).toBeCloseTo(y + particle.vy * .1);
    effects.update(900);
    expect(effects.particles).toHaveLength(0); expect(effects.visuals).toHaveLength(0);
    effects.play({ type: "heavySlash", amount: 50, name: "폭염연옥참" });
    effects.play({ type: "reset" });
    expect(effects.motion.shake).toBe(0); expect(effects.particles).toHaveLength(0);
  });
  it("bounds rapid bursts and makes heavy impact stronger than slash", () => {
    const effects = new EffectSystem(); effects.play({ type: "slash", amount: 10, name: "참격" });
    const lightShake = effects.motion.shake;
    for (let i = 0; i < 100; i++) effects.play({ type: "heavySlash", amount: 50, name: "폭염연옥참" });
    expect(effects.motion.shake).toBeGreaterThan(lightShake);
    expect(effects.particles.length).toBeLessThanOrEqual(MAX_PARTICLES);
    expect(effects.visuals.length).toBeLessThanOrEqual(MAX_EFFECTS);
    effects.update(1000); expect(effects.motion.shake).toBe(0);
  });
});
