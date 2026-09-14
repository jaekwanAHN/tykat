"use client";

import { useCallback, useRef, useState } from "react";
import { GameCanvas } from "./GameCanvas";
import { SkillInput } from "./SkillInput";
import { ENEMY_ATTACK_INTERVAL, ENEMY_MAX_HP, GameEngine, initialBattle, PLAYER_MAX_HP } from "@/game/engine/GameEngine";

export function Game() {
  const engine = useRef<GameEngine | null>(null);
  const [battle, setBattle] = useState(initialBattle);
  const [round, setRound] = useState(0);
  const [ready, setReady] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const onReady = useCallback((value: GameEngine | null) => { engine.current = value; setReady(value !== null); }, []);
  const playing = battle.status === "playing";
  const message = { idle: "전투 준비", playing: "적의 공격 타이밍을 확인하세요", victory: "오우거 처치 · 전투 종료", gameover: "플레이어 쓰러짐 · 전투 종료" }[battle.status];

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-3" onClick={(event) => {
      if (playing && !(event.target instanceof Element && event.target.closest("button, input, a"))) inputRef.current?.focus({ preventScroll: true });
    }}>
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-black tracking-[.16em]">SKILL <span className="text-orange-300">/</span> CAST</h1>
        <span className="text-xs tracking-[.15em] text-slate-400">PHASE 04 <span className="mx-2 text-slate-600">/</span> PERFECT CAST</span>
      </header>
      <p className="mb-3 text-sm text-amber-200 lg:hidden">이 게임은 키보드를 사용하는 Desktop 환경을 권장합니다.</p>
      <section aria-label="전투" className="arena relative min-h-[340px] overflow-hidden rounded-t-xl border border-slate-700/60">
        <GameCanvas onReady={onReady} onChange={setBattle} />
        <div className="pointer-events-none absolute left-6 top-5">
          <p className="eyebrow">TRAINING GROUND</p><p className="mt-1 text-lg font-semibold">STAGE <span className="text-orange-300">01</span></p>
        </div>
        <div className="pointer-events-none absolute left-1/2 top-5 w-72 -translate-x-1/2 text-center">
          <div className="mb-2 flex items-end justify-between"><h2 className="text-lg font-bold">오우거</h2><span data-testid="enemy-hp" className="font-mono text-xs text-slate-300">{battle.enemyHp} / {ENEMY_MAX_HP}</span></div>
          <progress aria-label="오우거 HP" className="hp enemy" max={ENEMY_MAX_HP} value={battle.enemyHp} />
          <div className="mt-2 flex items-center gap-3">
            <progress aria-label="적 공격까지 남은 시간" className={`timer ${battle.attackRemaining < 1500 ? "danger" : ""}`} max={ENEMY_ATTACK_INTERVAL} value={battle.attackRemaining} />
            <span className="whitespace-nowrap font-mono text-xs text-orange-200">{(battle.attackRemaining / 1000).toFixed(1)}s</span>
          </div>
          <p className="mt-1 text-[10px] tracking-widest text-slate-400">다음 공격까지</p>
        </div>
        <div className="absolute bottom-5 left-6 w-48">
          <div className="mb-2 flex justify-between text-xs"><span className="tracking-widest text-sky-200">PLAYER</span><span data-testid="player-hp" className="font-mono">{battle.playerHp} / {PLAYER_MAX_HP}</span></div>
          <progress aria-label="플레이어 HP" className="hp player" max={PLAYER_MAX_HP} value={battle.playerHp} />
        </div>
        <div className="absolute bottom-5 right-6 text-right text-xs leading-6 text-slate-400">공격 주기 <span className="text-slate-200">5.0초</span><br />공격 피해 <span className="text-slate-200">20</span></div>
      </section>
      <section className="rounded-b-xl border border-t-0 border-slate-700/60 bg-[#121621] px-5 py-3" aria-label="기술 입력">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div><p data-testid="battle-status" className="text-sm font-semibold">{message}</p><p role="status" aria-live="polite" className={`mt-1 text-xs ${battle.feedback.startsWith("CAST FAILED") ? "text-red-300" : "text-orange-200"}`}><span key={battle.feedbackId}>{battle.feedback || "짧은 기술과 긴 기술, 지금 필요한 기술을 선택하세요."}</span></p></div>
          <button className="secondary" disabled={!ready} onClick={() => { engine.current?.start(); setRound((value) => value + 1); }}>{battle.status === "idle" ? "전투 시작" : "전투 초기화"}</button>
        </div>
        <SkillInput key={`${round}-${battle.status}`} enabled={playing} inputRef={inputRef} onCast={(input, attempt) => engine.current?.cast(input, attempt)} />
        <div className="mt-2 flex flex-wrap justify-between gap-2 font-mono text-xs text-slate-300" aria-label="타이핑 통계">
          <span data-testid="combo" className="text-orange-200">COMBO {battle.combo} <span className="text-slate-500">/ MAX {battle.maxCombo}</span></span>
          <span data-testid="accuracy">ACC {battle.accuracy.toFixed(1)}%</span>
          <span data-testid="wpm">WPM {battle.wpm}</span>
          <span>CAST {battle.lastCast ? `${(battle.lastCast.duration / 1000).toFixed(2)}s` : "—"}</span>
          <span data-testid="perfect-count">PERFECT {battle.perfectCasts}</span>
        </div>
      </section>
      <footer className="mt-4 flex justify-between text-[10px] tracking-[.12em] text-slate-500"><span>TYPE YOUR POWER.</span><span>PROTOTYPE · SINGLE PLAYER</span></footer>
    </main>
  );
}
