import { applyHeal, matchSkill, skills } from "../data/skills";
import { calculateAccuracy, calculateDamage, calculatePerfect, calculateWpm, countCorrectCharacters, type CastResult, type TypingAttempt } from "../../lib/typing/metrics";
import type { CombatEffect } from "../effects/CombatEffect";

export const PLAYER_MAX_HP = 100;
export const ENEMY_MAX_HP = 200;
export const ENEMY_ATTACK_DAMAGE = 20;
export const ENEMY_ATTACK_INTERVAL = 5_000;
export const EVADE_DURATION = 1_000;
export const MAX_DELTA_MS = 100;
const HUD_INTERVAL_MS = 100;

export type GameStatus = "idle" | "playing" | "victory" | "gameover";
export type BattleSnapshot = {
  status: GameStatus;
  playerHp: number;
  enemyHp: number;
  attackRemaining: number;
  evadeRemaining: number;
  feedback: string;
  feedbackId: number;
  combo: number;
  maxCombo: number;
  accuracy: number;
  wpm: number;
  perfectCasts: number;
  lastCast: CastResult | null;
  elapsedMs: number;
};

export function applyDamage(hp: number, damage: number): number {
  return Math.max(0, hp - Math.max(0, damage));
}

export function initialBattle(): BattleSnapshot {
  return { status: "idle", playerHp: PLAYER_MAX_HP, enemyHp: ENEMY_MAX_HP, attackRemaining: ENEMY_ATTACK_INTERVAL, evadeRemaining: 0, feedback: "", feedbackId: 0, combo: 0, maxCombo: 0, accuracy: 100, wpm: 0, perfectCasts: 0, lastCast: null, elapsedMs: 0 };
}

// Battle calculations live here; neither React nor Canvas is a dependency.
export class GameEngine {
  private state = initialBattle();
  private hudElapsed = 0;
  private totalCharacters = 0;
  private correctCharacters = 0;
  private typedCharacters = 0;
  private typingDuration = 0;
  constructor(
    private readonly onChange: (state: BattleSnapshot) => void,
    private readonly onEffect: (effect: CombatEffect) => void = () => {},
  ) {}

  get snapshot(): BattleSnapshot { return { ...this.state }; }

  start() {
    this.state = { ...initialBattle(), status: "playing" };
    this.hudElapsed = 0;
    this.totalCharacters = 0; this.correctCharacters = 0; this.typedCharacters = 0; this.typingDuration = 0;
    this.onEffect({ type: "reset" });
    this.publish();
  }

  cast(input: string, attempt?: TypingAttempt) {
    if (this.state.status !== "playing") return;
    const skill = matchSkill(input);
    const correct = countCorrectCharacters(input, skills.map((candidate) => candidate.name));
    const total = [...input].length + Math.max(0, attempt?.corrections ?? 0);
    this.totalCharacters += total; this.correctCharacters += correct;
    if (attempt && Number.isFinite(attempt.duration) && attempt.duration > 0 && !attempt.assisted) {
      this.typedCharacters += [...input].length;
      this.typingDuration += attempt.duration;
    }
    this.state.accuracy = calculateAccuracy(this.correctCharacters, this.totalCharacters);
    this.state.wpm = calculateWpm(this.typedCharacters, this.typingDuration);
    const perfect = !!skill && !!attempt && calculatePerfect(attempt, skill.castTimeTarget);
    this.state.lastCast = skill ? { skillId: skill.id, duration: attempt?.duration ?? 0, accuracy: calculateAccuracy(correct, total), isPerfect: perfect } : null;
    this.state.combo = skill ? this.state.combo + 1 : 0;
    this.state.maxCombo = Math.max(this.state.maxCombo, this.state.combo);
    if (perfect) this.state.perfectCasts++;
    if (!skill) {
      this.setFeedback("CAST FAILED · 기술명을 확인하세요");
    } else if (skill.type === "attack") {
      const damage = calculateDamage(skill.damage, perfect);
      this.state.enemyHp = applyDamage(this.state.enemyHp, damage);
      this.setFeedback(`${perfect ? "PERFECT CAST · " : ""}${skill.name} · ${damage} DAMAGE`);
      this.onEffect({ type: skill.effect, amount: damage, name: skill.name });
      if (this.state.enemyHp === 0) this.state.status = "victory";
    } else if (skill.type === "heal") {
      const previousHp = this.state.playerHp;
      this.state.playerHp = applyHeal(previousHp, skill.heal, PLAYER_MAX_HP);
      this.setFeedback(`치유 · +${this.state.playerHp - previousHp} HP`);
      this.onEffect({ type: "heal", amount: this.state.playerHp - previousHp });
    } else {
      this.state.evadeRemaining = EVADE_DURATION;
      this.setFeedback("회피 · 1초 동안 공격 무효");
      this.onEffect({ type: "evade" });
    }
    if (perfect) this.onEffect({ type: "perfect" });
    this.publish();
  }

  update(deltaMs: number) {
    if (this.state.status !== "playing" || !Number.isFinite(deltaMs)) return;
    const elapsed = Math.max(0, Math.min(deltaMs, MAX_DELTA_MS));
    this.state.elapsedMs += this.state.playerHp <= ENEMY_ATTACK_DAMAGE && this.state.evadeRemaining < this.state.attackRemaining
      ? Math.min(elapsed, this.state.attackRemaining) : elapsed;
    // Compare expiry at the actual attack instant, before consuming this frame.
    const dodged = this.state.evadeRemaining > 0 && this.state.evadeRemaining >= this.state.attackRemaining;
    this.state.evadeRemaining = Math.max(0, this.state.evadeRemaining - elapsed);
    this.state.attackRemaining -= elapsed;
    this.hudElapsed += elapsed;
    if (this.state.attackRemaining <= 0) {
      if (dodged) {
        this.setFeedback("DODGE! · 공격 회피 성공");
        this.onEffect({ type: "dodge" });
      } else {
        this.state.playerHp = applyDamage(this.state.playerHp, ENEMY_ATTACK_DAMAGE);
        this.state.combo = 0;
        this.setFeedback(`피격 · -${ENEMY_ATTACK_DAMAGE} HP`);
        this.onEffect({ type: "hit", amount: ENEMY_ATTACK_DAMAGE });
      }
      this.state.attackRemaining += ENEMY_ATTACK_INTERVAL;
      if (this.state.playerHp === 0) this.state.status = "gameover";
      this.publish();
    } else if (this.hudElapsed >= HUD_INTERVAL_MS) {
      this.publish();
    }
  }

  private setFeedback(message: string) {
    this.state.feedback = message;
    this.state.feedbackId++;
  }

  private publish() {
    this.hudElapsed = 0;
    this.onChange(this.snapshot);
  }
}
