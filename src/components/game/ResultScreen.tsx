"use client";

import { useEffect, useRef } from "react";
import type { BattleSnapshot } from "@/game/engine/GameEngine";
import { formatTime } from "@/lib/game/formatTime";
import { getStage, STAGE_COUNT } from "@/game/data/stages";

export function ResultScreen({ battle, onRetry, onNext, onNewRun }: { battle: BattleSnapshot; onRetry: () => void; onNext: () => void; onNewRun: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, []);
  const victory = battle.status === "victory";
  const finalClear = victory && battle.stage === STAGE_COUNT;
  const next = victory && !finalClear ? getStage(battle.stage + 1) : null;
  useEffect(() => {
    if (!next) return;
    const advanceOnEnter = (event: KeyboardEvent) => {
      if (event.key !== "Enter" || event.repeat || event.isComposing || event.keyCode === 229 || event.defaultPrevented || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) return;
      // Ignore the finishing cast's bubbling event and preserve native control actions.
      if (event.target instanceof Element && event.target.closest("button, input, textarea, select, a, [contenteditable]")) return;
      event.preventDefault();
      onNext();
    };
    window.addEventListener("keydown", advanceOnEnter);
    return () => window.removeEventListener("keydown", advanceOnEnter);
  }, [next, onNext]);
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
        <h2 id="result-title" ref={heading} tabIndex={-1} className={`text-xl font-black outline-none ${victory ? "text-orange-200" : "text-rose-300"}`}>{finalClear ? "ALL CLEAR · 10 스테이지 정복" : victory ? "VICTORY · 전투 승리" : "GAME OVER · 전투 패배"}</h2>
        <p className="mt-1 text-xs text-slate-400">{next ? `다음 적: ${next.name} · HP ${next.maxHp} · 공격 ${next.attackDamage} / ${next.attackInterval / 1000}초` : finalClear ? "모든 적을 쓰러뜨렸습니다! 아래 통계는 최종 스테이지 기록입니다." : `스테이지 ${battle.stage}에서 재도전합니다. ${getStage(battle.stage).hint}`}</p>
        {next && <p className="mt-1 text-xs text-slate-400">{next.hint} · 다음 전투는 HP 100으로 시작합니다.</p>}
        {next && <p className="mt-2 text-xs text-orange-200">Enter 키로 다음 스테이지에 진입합니다.</p>}
      </div>
      <div className="flex shrink-0 flex-col gap-2">
        {next && <button className="attack justify-center" onClick={onNext}>다음 스테이지 →</button>}
        {finalClear ? <button className="attack justify-center" onClick={onNewRun}>1 스테이지부터 다시 도전</button> : <button className="secondary" onClick={onRetry}>RETRY · 다시 시작</button>}
      </div>
    </div>
    <dl className="grid grid-cols-5 gap-3">
      {stats.map(([label, value]) => <div key={label} className="rounded-md border border-slate-700 bg-slate-950/40 px-3 py-4">
        <dt className="text-[10px] tracking-widest text-slate-400">{label}</dt>
        <dd className="mt-2 font-mono text-2xl text-slate-100">{value}</dd>
      </div>)}
    </dl>
  </section>;
}
