"use client";
import { useCallback, useRef, useState } from "react";
import { GameCanvas } from "./GameCanvas";
import { ENEMY_ATTACK_INTERVAL, ENEMY_MAX_HP, GameEngine, initialBattle, PLAYER_MAX_HP } from "@/game/engine/GameEngine";

export function Game() {
  const engine = useRef<GameEngine | null>(null);
  const [battle, setBattle] = useState(initialBattle);
  const onReady = useCallback((value: GameEngine | null) => { engine.current = value; }, []);
  const playing = battle.status === "playing";
  const message = { idle: "전투 준비", playing: "적의 공격 타이밍을 확인하세요", victory: "오우거 처치 · 전투 종료", gameover: "플레이어 쓰러짐 · 전투 종료" }[battle.status];
  return <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-5">
    <header className="mb-4 flex items-center justify-between"><h1 className="text-xl font-black tracking-[.16em]">SKILL <span className="text-orange-300">/</span> CAST</h1><span className="text-xs tracking-[.15em] text-slate-400">PHASE 01 <span className="mx-2 text-slate-600">/</span> COMBAT CORE</span></header>
    <p className="mb-3 text-sm text-amber-200 lg:hidden">이 게임은 키보드를 사용하는 Desktop 환경을 권장합니다.</p>
    <section aria-label="전투" className="arena relative min-h-[390px] overflow-hidden rounded-t-xl border border-slate-700/60">
      <GameCanvas onReady={onReady} onChange={setBattle} />
      <div className="pointer-events-none absolute left-6 top-5"><p className="eyebrow">TRAINING GROUND</p><p className="mt-1 text-lg font-semibold">STAGE <span className="text-orange-300">01</span></p></div>
      <div className="pointer-events-none absolute left-1/2 top-5 w-72 -translate-x-1/2 text-center">
        <div className="mb-2 flex items-end justify-between"><h2 className="text-lg font-bold">오우거</h2><span data-testid="enemy-hp" className="font-mono text-xs text-slate-300">{battle.enemyHp} / {ENEMY_MAX_HP}</span></div>
        <progress aria-label="오우거 HP" className="hp enemy" max={ENEMY_MAX_HP} value={battle.enemyHp} />
        <div className="mt-2 flex items-center gap-3"><progress aria-label="적 공격까지 남은 시간" className={`timer ${battle.attackRemaining < 1500 ? "danger" : ""}`} max={ENEMY_ATTACK_INTERVAL} value={battle.attackRemaining} /><span className="whitespace-nowrap font-mono text-xs text-orange-200">{(battle.attackRemaining / 1000).toFixed(1)}s</span></div>
        <p className="mt-1 text-[10px] tracking-widest text-slate-400">다음 공격까지</p>
      </div>
      <div className="absolute bottom-5 left-6 w-48"><div className="mb-2 flex justify-between text-xs"><span className="tracking-widest text-sky-200">PLAYER</span><span data-testid="player-hp" className="font-mono">{battle.playerHp} / {PLAYER_MAX_HP}</span></div><progress aria-label="플레이어 HP" className="hp player" max={PLAYER_MAX_HP} value={battle.playerHp} /></div>
      <div className="absolute bottom-5 right-6 text-right text-xs leading-6 text-slate-400">공격 주기 <span className="text-slate-200">5.0초</span><br />공격 피해 <span className="text-slate-200">20</span></div>
    </section>
    <section className="rounded-b-xl border border-t-0 border-slate-700/60 bg-[#121621] p-6" aria-label="전투 테스트 조작">
      <div className="mb-5 flex items-center justify-between gap-4"><div><p className="eyebrow">BATTLE CONTROL</p><p role="status" className="mt-2 text-lg font-semibold">{message}</p></div><button className="secondary" onClick={() => engine.current?.start()}>{battle.status === "idle" ? "전투 시작" : "전투 초기화"}</button></div>
      <button className="attack w-full" disabled={!playing} onClick={() => engine.current?.attack()}><span className="text-lg font-bold">참격</span><span className="mx-3 text-orange-200/70">/</span>임시 공격 <span className="ml-auto font-mono text-sm">10 DAMAGE <span className="ml-4">↗</span></span></button>
      <p className="mt-4 text-xs leading-5 text-slate-400">전투 Core 검증용 버튼입니다. 기술명 입력은 Phase 2에서 연결합니다. 탭을 벗어나면 전투 시간이 일시 정지됩니다.</p>
    </section>
    <footer className="mt-4 flex justify-between text-[10px] tracking-[.12em] text-slate-500"><span>TYPE YOUR POWER.</span><span>PROTOTYPE · SINGLE PLAYER</span></footer>
  </main>;
}
