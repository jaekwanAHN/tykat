import { expect, it } from "vitest";
import { GameEngine, initialBattle } from "../src/game/engine/GameEngine";
import { formatTime } from "../src/lib/game/formatTime";

it("formats elapsed time without wrapping minutes", () => {
  expect(formatTime(0)).toBe("00:00"); expect(formatTime(84_900)).toBe("01:24");
  expect(formatTime(3_600_000)).toBe("60:00");
});

it("freezes victory time and metrics, and retry resets everything", () => {
  const engine = new GameEngine(() => {});
  engine.update(100); expect(engine.snapshot.elapsedMs).toBe(0);
  engine.start(); for (let i = 0; i < 12; i++) engine.update(100);
  const attempt = { duration: 400, corrections: 0, assisted: false, hadError: false };
  for (let i = 0; i < 3; i++) engine.cast("폭염연옥참", attempt);
  const result = engine.snapshot;
  expect(result).toMatchObject({ status: "victory", elapsedMs: 1200, maxCombo: 3, perfectCasts: 3 });
  engine.update(100); engine.cast("참격", attempt);
  expect(engine.snapshot).toEqual(result);
  engine.start(); expect(engine.snapshot).toEqual({ ...initialBattle(), status: "playing" });
});

it("records the lethal attack instant even inside a frame", () => {
  const engine = new GameEngine(() => {}); engine.start();
  for (let i = 0; i < 249; i++) engine.update(100);
  engine.update(90); engine.update(100);
  expect(engine.snapshot).toMatchObject({ status: "gameover", elapsedMs: 25_000 });
  engine.update(100); expect(engine.snapshot.elapsedMs).toBe(25_000);
});
