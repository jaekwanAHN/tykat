"use client";

import { useEffect, useRef } from "react";

export function PauseMenu({ onResume, onRestart }: { onResume: () => void; onRestart: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);
  return <dialog ref={dialog} aria-labelledby="pause-title" onCancel={(event) => { event.preventDefault(); onResume(); }}
    onKeyDown={(event) => {
      if (event.key === "Escape" && (event.repeat || event.nativeEvent.isComposing)) event.preventDefault();
      if (event.nativeEvent.isComposing || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      event.preventDefault();
      const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"));
      if (!buttons.length) return;
      const current = buttons.findIndex((button) => button === document.activeElement);
      const direction = event.key === "ArrowDown" ? 1 : -1;
      const next = current < 0 ? (direction === 1 ? 0 : buttons.length - 1) : (current + direction + buttons.length) % buttons.length;
      buttons[next].focus({ preventScroll: true });
    }}
    className="fixed inset-0 m-auto w-[min(420px,90vw)] rounded-xl border border-slate-600 bg-[#121621] p-8 text-slate-100 shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm">
    <p className="eyebrow">TAKE A BREATH</p>
    <h2 id="pause-title" className="mt-3 text-3xl font-black text-orange-100">일시정지</h2>
    <p className="mt-3 text-sm leading-6 text-slate-400">전투와 음악이 멈췄습니다.<br />입력하던 기술은 그대로 이어갈 수 있습니다.</p>
    <div className="mt-6 flex flex-col gap-3">
      <button className="attack justify-center" onClick={onResume}>이어하기 · Esc</button>
      <button className="secondary" onClick={onRestart}>처음부터 다시 시작</button>
    </div>
    <p className="mt-4 text-center text-xs text-slate-400">↑ ↓ 이동 · Enter 선택 · Esc 이어하기</p>
  </dialog>;
}
