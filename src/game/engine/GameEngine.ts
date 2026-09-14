export const PLAYER_MAX_HP = 100;
export const ENEMY_MAX_HP = 200;
export const ENEMY_ATTACK_DAMAGE = 20;
export const ENEMY_ATTACK_INTERVAL = 5_000;
export const DEBUG_ATTACK_DAMAGE = 10;
export const MAX_DELTA_MS = 100;
const HUD_INTERVAL_MS = 100;

export type GameStatus = "idle" | "playing" | "victory" | "gameover";
export type BattleSnapshot = {
  status: GameStatus;
  playerHp: number;
  enemyHp: number;
  attackRemaining: number;
};

export function applyDamage(hp: number, damage: number): number {
  return Math.max(0, hp - Math.max(0, damage));
}

export function initialBattle(): BattleSnapshot {
  return { status: "idle", playerHp: PLAYER_MAX_HP, enemyHp: ENEMY_MAX_HP, attackRemaining: ENEMY_ATTACK_INTERVAL };
}

// Battle calculations live here; neither React nor Canvas is a dependency.
export class GameEngine {
  private state = initialBattle();
  private hudElapsed = 0;
  constructor(private readonly onChange: (state: BattleSnapshot) => void) {}

  get snapshot(): BattleSnapshot { return { ...this.state }; }

  start() {
    this.state = { ...initialBattle(), status: "playing" };
    this.hudElapsed = 0;
    this.publish();
  }

  attack() {
    if (this.state.status !== "playing") return;
    this.state.enemyHp = applyDamage(this.state.enemyHp, DEBUG_ATTACK_DAMAGE);
    if (this.state.enemyHp === 0) this.state.status = "victory";
    this.publish();
  }

  update(deltaMs: number) {
    if (this.state.status !== "playing" || !Number.isFinite(deltaMs)) return;
    const elapsed = Math.max(0, Math.min(deltaMs, MAX_DELTA_MS));
    this.state.attackRemaining -= elapsed;
    this.hudElapsed += elapsed;
    if (this.state.attackRemaining <= 0) {
      this.state.playerHp = applyDamage(this.state.playerHp, ENEMY_ATTACK_DAMAGE);
      this.state.attackRemaining += ENEMY_ATTACK_INTERVAL;
      if (this.state.playerHp === 0) this.state.status = "gameover";
      this.publish();
    } else if (this.hudElapsed >= HUD_INTERVAL_MS) {
      this.publish();
    }
  }

  private publish() {
    this.hudElapsed = 0;
    this.onChange(this.snapshot);
  }
}
