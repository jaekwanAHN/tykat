"use client";

import { useEffect, useRef } from "react";
import type { BattleSnapshot } from "@/game/engine/GameEngine";
import { formatTime } from "@/lib/game/formatTime";

export function ResultScreen({ battle, onRetry }: { battle: BattleSnapshot; onRetry: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, []);
  const victory = battle.status === "victory";
  const stats = [
    [victory ? "CLEAR TIME" : "SURVIVAL TIME", formatTime(battle.elapsedMs)],
    ["MAX COMBO", String(battle.maxCombo)],
    ["WPM", String(battle.wpm)],
    ["ACCURACY", `${battle.accuracy.toFixed(1)}%`],
    ["PERFECT CAST", String(battle.perfectCasts)],
  ];
  return <section aria-labelledby="result-title" className="py-3" data-testid="result-screen">
    <div className="mb-5 flex items-center justify-between gap-4">
      <div>
        <h2 id="result-title" ref={heading} tabIndex={-1} className={`text-xl font-black outline-none ${victory ? "text-orange-200" : "text-rose-300"}`}>{victory ? "VICTORY · 전투 승리" : "GAME OVER · 전투 패배"}</h2>
        <p className="mt-1 text-xs text-slate-400">{victory ? "기술명이 힘이 된 순간. 다음 전투에서는 더 빠르게." : "긴 기술의 욕심과 회피의 타이밍, 다시 도전하세요."}</p>
      </div>
      <button className="secondary" onClick={onRetry}>RETRY · 다시 시작</button>
    </div>
    <dl className="grid grid-cols-5 gap-3">
      {stats.map(([label, value]) => <div key={label} className="rounded-md border border-slate-700 bg-slate-950/40 px-3 py-4">
        <dt className="text-[10px] tracking-widest text-slate-400">{label}</dt>
        <dd className="mt-2 font-mono text-2xl text-slate-100">{value}</dd>
      </div>)}
    </dl>
  </section>;
}
