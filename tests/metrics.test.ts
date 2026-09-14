import { expect, it } from "vitest";
import { calculateAccuracy, calculateDamage, calculatePerfect, calculateWpm, countCorrectCharacters, type TypingAttempt } from "../src/lib/typing/metrics";
import { AttemptTracker } from "../src/lib/typing/TypingAttempt";
import { GameEngine, initialBattle } from "../src/game/engine/GameEngine";

const fast: TypingAttempt = { duration: 500, corrections: 0, assisted: false, hadError: false };
it("perfect has an inclusive target and rejects edits, assistance and invalid time", () => {
  expect(calculatePerfect({ ...fast, duration: 900 }, 900)).toBe(true);
  for (const attempt of [{ ...fast, duration: 901 }, { ...fast, duration: 0 }, { ...fast, duration: NaN }, { ...fast, corrections: 1 }, { ...fast, assisted: true }, { ...fast, hadError: true }]) expect(calculatePerfect(attempt, 900)).toBe(false);
  expect(calculateDamage(25, true)).toBe(38); expect(calculateDamage(50, true)).toBe(75);
});
it("accuracy and WPM handle no input and compare failed names by character", () => {
  expect(calculateAccuracy(0, 0)).toBe(100); expect(calculateAccuracy(3, 4)).toBe(75);
  expect(countCorrectCharacters("화염참걱", ["참격", "화염참격"])).toBe(3);
  expect(calculateWpm(10, 2000)).toBe(60); expect(calculateWpm(10, 0)).toBe(0);
});
it("tracks initial composition, correction even after clearing and resets attempts", () => {
  const tracker = new AttemptTracker(); tracker.begin(0); tracker.begin(300);
  tracker.committed("화염참걱", ["화염참격"]); tracker.correct();
  expect(tracker.finish(800)).toEqual({ duration: 800, corrections: 1, assisted: false, hadError: true });
  tracker.begin(1000); expect(tracker.finish(1500)).toEqual(fast);
  tracker.change(2000); expect(tracker.finish(2100).assisted).toBe(true);
});
it("applies perfect damage, counts combos, breaks on failure/hit and resets", () => {
  const engine = new GameEngine(() => {}); engine.start();
  engine.cast("화염참격", fast); expect(engine.snapshot.enemyHp).toBe(162);
  expect(engine.snapshot).toMatchObject({ combo: 1, maxCombo: 1, perfectCasts: 1, accuracy: 100, wpm: 96 });
  engine.cast("화염참걱", fast);
  expect(engine.snapshot).toMatchObject({ combo: 0, maxCombo: 1, accuracy: 87.5 });
  engine.cast("치유", { ...fast, corrections: 1 }); expect(engine.snapshot.perfectCasts).toBe(1);
  for (let i = 0; i < 50; i++) engine.update(100);
  expect(engine.snapshot.combo).toBe(0);
  engine.start(); expect(engine.snapshot).toEqual({ ...initialBattle(), status: "playing" });
});
it("dodging preserves combo, terminal casts cannot change metrics", () => {
  const engine = new GameEngine(() => {}); engine.start();
  for (let i = 0; i < 43; i++) engine.update(100);
  engine.cast("회피", fast);
  for (let i = 0; i < 7; i++) engine.update(100);
  expect(engine.snapshot.combo).toBe(1);
  for (let i = 0; i < 3; i++) engine.cast("폭염연옥참", fast);
  const ended = engine.snapshot; engine.cast("참격", fast);
  expect(engine.snapshot).toEqual(ended);
});
