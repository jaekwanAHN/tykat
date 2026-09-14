"use client";

import { useEffect, useRef } from "react";
import { GameEngine, MAX_DELTA_MS, type BattleSnapshot } from "@/game/engine/GameEngine";
import { EffectSystem } from "@/game/effects/EffectSystem";
import { renderBattle } from "@/game/engine/Renderer";
import type { CombatEffect } from "@/game/effects/CombatEffect";

type Props = {
  onReady: (engine: GameEngine | null) => void;
  onChange: (snapshot: BattleSnapshot) => void;
  onEffect: (event: CombatEffect) => void;
};

export function GameCanvas({ onReady, onChange, onEffect }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const effects = new EffectSystem();
    const engine = new GameEngine(onChange, (event) => { effects.play(event); onEffect(event); });
    onReady(engine);
    let width = 0, height = 0, dpr = 0;
    let frameId = 0;
    let previous: number | null = null;
    let animationTime = 0;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width; height = rect.height;
      dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    const loop = (timestamp: number) => {
      if (dpr !== (window.devicePixelRatio || 1)) resize();
      const delta = previous === null ? 0 : timestamp - previous;
      previous = timestamp;
      if (!document.hidden) {
        const elapsed = Math.max(0, Math.min(delta, MAX_DELTA_MS));
        effects.update(elapsed);
        engine.update(elapsed);
        animationTime += elapsed;
        // Finish the killing blow animation even after battle updates stop.
        renderBattle(ctx, width, height, engine.snapshot, animationTime, effects);
      }
      frameId = requestAnimationFrame(loop);
    };
    // Hidden tabs pause combat; returning never applies accumulated damage.
    const visibility = () => { previous = null; };
    document.addEventListener("visibilitychange", visibility);
    frameId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      onReady(null);
    };
  }, [onChange, onReady, onEffect]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" role="img" aria-label="상단의 오우거와 하단의 검사 플레이어가 마주 보는 전투장" />;
}
