import { expect, it } from "vitest";
import { LOOP_SECONDS, synthMusic, synthSound, type SoundName } from "../src/game/audio/synth";

it("creates a bounded seamless four-bar loop with a continuing beat", () => {
  const rate = 8000;
  const data = synthMusic(rate);
  expect(data.length).toBe(Math.ceil(LOOP_SECONDS * rate));
  expect(data[0]).toBeCloseTo(0); expect(data.at(-1)).toBeCloseTo(0);
  expect(data.every((value) => Number.isFinite(value) && Math.abs(value) <= 1)).toBe(true);
  for (let bar = 0; bar < 4; bar++) {
    const segment = data.slice(Math.floor(bar * data.length / 4), Math.floor((bar + 1) * data.length / 4));
    expect(segment.reduce((sum, value) => sum + value * value, 0) / segment.length).toBeGreaterThan(.001);
  }
});

it.each<SoundName>(["slash", "fireSlash", "heavySlash", "heal", "hit", "evade", "dodge", "perfect", "victory", "gameover"])("renders audible, finite %s with a silent tail", (name) => {
  const data = synthSound(name, 8000);
  expect(data.some((value) => Math.abs(value) > .05)).toBe(true);
  expect(data.every(Number.isFinite)).toBe(true);
  expect(data.at(-1)).toBe(0);
});
