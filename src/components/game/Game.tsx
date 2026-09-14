"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GameAudio } from "@/game/audio/GameAudio";
import type { CombatEffect } from "@/game/effects/CombatEffect";
import type { BattleSnapshot, GameStatus } from "@/game/engine/GameEngine";
import { GameCanvas } from "./GameCanvas";
import { SkillInput } from "./SkillInput";
import { ResultScreen } from "./ResultScreen";
import { PauseMenu } from "./PauseMenu";
import { formatTime } from "@/lib/game/formatTime";
import { ENEMY_ATTACK_INTERVAL, ENEMY_MAX_HP, GameEngine, initialBattle, PLAYER_MAX_HP } from "@/game/engine/GameEngine";

export function Game() {
  const engine = useRef<GameEngine | null>(null);
  const [battle, setBattle] = useState(initialBattle);
  const audio = useRef<GameAudio | null>(null);
  const statusRef = useRef<GameStatus>("idle");
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [effectsEnabled, setEffectsEnabled] = useState(true);
  useEffect(() => {
    const sound = new GameAudio(); audio.current = sound;
    const visibility = () => sound.visibility(document.hidden);
    document.addEventListener("visibilitychange", visibility);
    return () => { document.removeEventListener("visibilitychange", visibility); sound.dispose(); audio.current = null; };
  }, []);
  const onEffect = useCallback((event: CombatEffect) => {
    if (event.type !== "reset") audio.current?.play(event.type);
  }, []);
  const onChange = useCallback((snapshot: BattleSnapshot) => {
    audio.current?.setPaused(snapshot.paused);
    if (snapshot.status !== statusRef.current && (snapshot.status === "victory" || snapshot.status === "gameover")) audio.current?.finish(snapshot.status === "victory");
    statusRef.current = snapshot.status;
    setBattle(snapshot);
  }, []);
  const [round, setRound] = useState(0);
  const [ready, setReady] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const onReady = useCallback((value: GameEngine | null) => { engine.current = value; setReady(value !== null); }, []);
  const playing = battle.status === "playing" && !battle.paused;
  const ended = battle.status === "victory" || battle.status === "gameover";
  const restart = useCallback(() => { audio.current?.start(); engine.current?.start(); setRound((value) => value + 1); }, []);
  const resume = useCallback(() => { engine.current?.setPaused(false); }, []);
  useEffect(() => {
    const pauseOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.repeat || event.isComposing || event.keyCode === 229 || event.defaultPrevented) return;
      const current = engine.current?.snapshot;
      if (current?.status !== "playing" || current.paused) return;
      event.preventDefault(); engine.current?.setPaused(true);
    };
    window.addEventListener("keydown", pauseOnEscape);
    return () => window.removeEventListener("keydown", pauseOnEscape);
  }, []);
  useEffect(() => {
    if (!ready || battle.status !== "idle") return;
    const startOnEnter = (event: KeyboardEvent) => {
      if (event.key !== "Enter" || event.repeat || event.isComposing || event.keyCode === 229 || event.defaultPrevented || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) return;
      // Focused controls retain their native Enter behavior (including audio toggles).
      if (event.target instanceof Element && event.target.closest("button, input, textarea, select, a, [contenteditable]")) return;
      if (engine.current?.snapshot.status !== "idle") return;
      event.preventDefault();
      restart();
    };
    window.addEventListener("keydown", startOnEnter);
    return () => window.removeEventListener("keydown", startOnEnter);
  }, [ready, battle.status, restart]);
  const message = { idle: "전투 준비", playing: "적의 공격 타이밍을 확인하세요", victory: "오우거 처치 · 전투 종료", gameover: "플레이어 쓰러짐 · 전투 종료" }[battle.status];

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-3" onClick={(event) => {
      if (playing && !(event.target instanceof Element && event.target.closest("button, input, a"))) inputRef.current?.focus({ preventScroll: true });
    }}>
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-black tracking-[.16em]">TY<span className="text-orange-300">K</span>AT</h1>
        <div className="flex items-center gap-4">
          {playing && <button className="text-xs text-slate-300" onClick={() => engine.current?.setPaused(true)}>일시정지 · Esc</button>}
          <button className="text-xs text-slate-300" aria-label="배경음악" aria-pressed={musicEnabled} onClick={() => { audio.current?.setMusic(!musicEnabled); setMusicEnabled(!musicEnabled); if (playing) inputRef.current?.focus(); }}>BGM {musicEnabled ? "ON" : "OFF"}</button>
          <button className="text-xs text-slate-300" aria-label="효과음" aria-pressed={effectsEnabled} onClick={() => { audio.current?.setEffects(!effectsEnabled); setEffectsEnabled(!effectsEnabled); if (playing) inputRef.current?.focus(); }}>SFX {effectsEnabled ? "ON" : "OFF"}</button>
          <span className="text-xs tracking-[.15em] text-slate-400">STAGE 01 / {formatTime(battle.elapsedMs)}</span>
        </div>
      </header>
      <p className="mb-3 text-sm text-amber-200 lg:hidden">이 게임은 키보드를 사용하는 Desktop 환경을 권장합니다.</p>
      <section aria-label="전투" className="arena relative min-h-[340px] overflow-hidden rounded-t-xl border border-slate-700/60">
        <GameCanvas onReady={onReady} onChange={onChange} onEffect={onEffect} />
        {battle.status === "idle" && <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#080b12]/80 px-6 text-center">
          <p className="eyebrow">TYPE YOUR POWER</p>
          <h2 className="mt-3 text-3xl font-black text-orange-100">기술명을 외쳐라</h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">기술명 입력 후 Enter로 발동합니다.<br />적은 5초마다 공격합니다. 공격 직전에는 회피, 위험할 때는 치유.<br />빠르고 정확한 입력으로 PERFECT에 도전하세요.</p>
          <button className="attack mt-6" disabled={!ready} onClick={restart}>전투 시작</button>
          <p className="mt-2 text-xs text-slate-400">Enter 키로도 시작할 수 있습니다.</p>
        </div>}
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
          <div><p data-testid="battle-status" className="text-sm font-semibold">{message}</p>{!ended && <p role="status" aria-live="polite" className={`mt-1 text-xs ${battle.feedback.startsWith("CAST FAILED") ? "text-red-300" : "text-orange-200"}`}><span key={battle.feedbackId}>{battle.feedback || "짧은 기술과 긴 기술, 지금 필요한 기술을 선택하세요."}</span></p>}</div>
          {playing && <button className="secondary" disabled={!ready} onClick={restart}>전투 초기화</button>}
        </div>
        {ended ? <ResultScreen battle={battle} onRetry={restart} /> : <>
        <SkillInput key={`${round}-${battle.status}`} enabled={playing} paused={battle.paused} inputRef={inputRef} onCast={(input, attempt) => engine.current?.cast(input, attempt)} />
        <div className="mt-2 flex flex-wrap justify-between gap-2 font-mono text-xs text-slate-300" aria-label="타이핑 통계">
          <span data-testid="combo" className="text-orange-200">COMBO {battle.combo} <span className="text-slate-500">/ MAX {battle.maxCombo}</span></span>
          <span data-testid="accuracy">ACC {battle.accuracy.toFixed(1)}%</span>
          <span data-testid="wpm">WPM {battle.wpm}</span>
          <span>CAST {battle.lastCast ? `${(battle.lastCast.duration / 1000).toFixed(2)}s` : "—"}</span>
          <span data-testid="perfect-count">PERFECT {battle.perfectCasts}</span>
        </div>
        </>}
      </section>
      <footer className="mt-4 flex justify-between text-[10px] tracking-[.12em] text-slate-500"><span>TYPE YOUR POWER.</span><span>PROTOTYPE · SINGLE PLAYER</span></footer>
      {battle.paused && <PauseMenu onResume={resume} onRestart={restart} />}
    </main>
  );
}
