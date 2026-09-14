"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { skills } from "@/game/data/skills";
import { AttemptTracker } from "@/lib/typing/TypingAttempt";
import type { TypingAttempt } from "@/lib/typing/metrics";

type Props = {
  enabled: boolean;
  paused?: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  onCast: (input: string, attempt: TypingAttempt) => void;
};

export function SkillInput({ enabled, paused = false, inputRef, onCast }: Props) {
  const [value, setValue] = useState("");
  const [composing, setComposing] = useState(false);
  const compositionRef = useRef(false);
  const tracker = useRef(new AttemptTracker());
  useEffect(() => { tracker.current.setPaused(paused, performance.now()); }, [paused]);

  useEffect(() => {
    if (!enabled) return;
    const focus = () => inputRef.current?.focus({ preventScroll: true });
    focus();
    window.addEventListener("focus", focus);
    return () => window.removeEventListener("focus", focus);
  }, [enabled, inputRef]);

  return <>
    <ul aria-label="사용 가능한 기술" className="mb-3 grid grid-cols-5 gap-2">
      {skills.map((skill) => {
        const matching = value.length > 0 && skill.name.startsWith(value);
        return <li key={skill.id} className={`rounded border px-3 py-2 ${matching ? "border-orange-300 bg-orange-300/10" : "border-slate-700 bg-slate-950/40"}`}>
          <p className="font-bold">{matching ? <><mark className="bg-transparent text-orange-300">{value}</mark>{skill.name.slice(value.length)}</> : skill.name}</p>
          <p className="mt-1 text-[10px] text-slate-400">{skill.type === "attack" ? `${skill.damage} DAMAGE` : skill.type === "heal" ? "+30 HP" : "1초 회피"}</p>
          <p className="text-[10px] text-orange-200/70">PERFECT ≤ {skill.castTimeTarget / 1000}s</p>
        </li>;
      })}
    </ul>
    <label htmlFor="skill-input" className="sr-only">기술명 입력</label>
    <div className="flex items-center gap-3 rounded-md border border-slate-600 bg-[#080b12] px-4 focus-within:border-orange-300">
      <input id="skill-input" ref={inputRef} value={value} disabled={!enabled}
        className="min-w-0 flex-1 py-3 text-lg outline-none disabled:opacity-40"
        placeholder={paused ? "일시정지 중" : enabled ? "기술명을 입력하세요" : "전투를 시작하세요"}
        autoComplete="off" autoCorrect="off" spellCheck={false} maxLength={40}
        aria-describedby="input-help"
        onChange={(event) => {
          if (event.target.value) tracker.current.change(performance.now());
          if (!compositionRef.current && !(event.nativeEvent as InputEvent).isComposing) {
            tracker.current.committed(event.target.value, skills.map((skill) => skill.name));
          }
          setValue(event.target.value);
        }}
        onPaste={() => { tracker.current.begin(performance.now()); tracker.current.assist(); }}
        onDrop={() => { tracker.current.begin(performance.now()); tracker.current.assist(); }}
        onCut={() => tracker.current.correct()}
        onCompositionStart={() => { tracker.current.begin(performance.now()); compositionRef.current = true; setComposing(true); }}
        onCompositionUpdate={() => { compositionRef.current = true; }}
        onCompositionEnd={(event) => {
          compositionRef.current = false;
          setComposing(false);
          setValue(event.currentTarget.value);
          tracker.current.committed(event.currentTarget.value, skills.map((skill) => skill.name));
        }}
        onBlur={() => { compositionRef.current = false; setComposing(false); }}
        onKeyDown={(event) => {
          if (event.key === "Backspace" || event.key === "Delete") tracker.current.correct();
          if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) tracker.current.begin(performance.now());
          if (event.key !== "Enter" || !enabled) return;
          // keyCode 229 covers IME confirmation even when compositionend fires first.
          if (compositionRef.current || event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) return;
          event.preventDefault();
          if (event.repeat) return;
          const submitted = event.currentTarget.value;
          // Clear the DOM too: consecutive Enter events cannot resubmit stale state.
          event.currentTarget.value = "";
          setValue("");
          onCast(submitted, tracker.current.finish(performance.now()));
        }} />
      <span className="text-xs text-slate-400">{composing ? "한글 조합 중" : "ENTER ↵"}</span>
    </div>
    <p id="input-help" className="mt-2 text-[11px] text-slate-400">기술명 입력 후 Enter · 한글 조합 중 Enter는 글자만 확정합니다. 전투장을 클릭하면 입력창으로 돌아옵니다.</p>
  </>;
}
