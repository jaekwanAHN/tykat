import { expect, it } from "vitest";
import { GameEngine } from "../src/game/engine/GameEngine";
import { AttemptTracker } from "../src/lib/typing/TypingAttempt";

it("pause freezes combat, evade and statistics and rejects casts", () => {
  const engine = new GameEngine(() => {}); engine.setPaused(true);
  expect(engine.snapshot.paused).toBe(false);
  engine.start(); engine.cast("회피"); engine.update(100); engine.setPaused(true);
  const paused = engine.snapshot;
  for (let i = 0; i < 100; i++) engine.update(100);
  engine.cast("폭염연옥참"); expect(engine.snapshot).toEqual(paused);
  engine.setPaused(false); engine.update(100);
  expect(engine.snapshot.elapsedMs).toBe(200); expect(engine.snapshot.evadeRemaining).toBe(800);
  engine.setPaused(true); engine.start(); expect(engine.snapshot.paused).toBe(false);
  for (let i = 0; i < 4; i++) engine.cast("폭염연옥참");
  engine.setPaused(true); expect(engine.snapshot.paused).toBe(false);
});

it("excludes repeated pause intervals from cast time without clearing edits", () => {
  const tracker = new AttemptTracker(); tracker.begin(0); tracker.correct();
  tracker.setPaused(true, 200); tracker.setPaused(true, 250);
  tracker.setPaused(false, 5200);
  tracker.setPaused(true, 5400); tracker.setPaused(false, 7400);
  expect(tracker.finish(7600)).toMatchObject({ duration: 600, corrections: 1 });
});
