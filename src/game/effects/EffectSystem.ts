import type { CombatEffect } from "./CombatEffect";

export const MAX_PARTICLES = 240;
export const MAX_EFFECTS = 24;
type Particle = { x: number; y: number; vx: number; vy: number; age: number; life: number; size: number; color: string };
type Visual = { event: Exclude<CombatEffect, { type: "reset" }>; age: number; life: number; lane: number };

// Animation state belongs to the Canvas lifecycle, never React state.
export class EffectSystem {
  readonly particles: Particle[] = [];
  readonly visuals: Visual[] = [];
  private nextLane = 0;

  play(event: CombatEffect) {
    if (event.type === "reset") {
      this.particles.length = 0;
      this.visuals.length = 0;
      this.nextLane = 0;
      return;
    }
    this.visuals.push({ event, age: 0, life: 1000, lane: this.nextLane++ % 3 });
    if (this.visuals.length > MAX_EFFECTS) this.visuals.shift();
    if (event.type === "perfect") return;
    const heavy = event.type === "heavySlash";
    const heal = event.type === "heal";
    const attack = "name" in event;
    const color = heal ? "#86efac" : event.type === "hit" ? "#ff647c" : attack && event.type !== "slash" ? "#ffae55" : "#b9efff";
    const count = heavy ? 70 : event.type === "fireSlash" ? 32 : 14;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (heavy ? 110 : 50) + Math.random() * 160;
      this.particles.push({
        x: 500 + (Math.random() - .5) * (heal ? 70 : 24), y: attack ? 230 : 425,
        vx: heal ? (Math.random() - .5) * 30 : Math.cos(angle) * speed,
        vy: heal ? -60 - Math.random() * 70 : Math.sin(angle) * speed,
        age: 0, life: 400 + Math.random() * 500, size: heavy ? 3 + Math.random() * 5 : 2 + Math.random() * 3, color,
      });
    }
    this.particles.splice(0, Math.max(0, this.particles.length - MAX_PARTICLES));
  }

  update(deltaMs: number) {
    if (!Number.isFinite(deltaMs) || deltaMs <= 0) return;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.age += deltaMs;
      particle.x += particle.vx * deltaMs / 1000;
      particle.y += particle.vy * deltaMs / 1000;
      if (particle.age >= particle.life) this.particles.splice(i, 1);
    }
    for (let i = this.visuals.length - 1; i >= 0; i--) {
      this.visuals[i].age += deltaMs;
      if (this.visuals[i].age >= this.visuals[i].life) this.visuals.splice(i, 1);
    }
  }

  get motion() {
    let shake = 0, playerX = 0, playerY = 0, enemyX = 0;
    for (const { event, age } of this.visuals) {
      const impact = Math.max(0, 1 - age / 300);
      const strength = event.type === "heavySlash" ? 14 : event.type === "hit" ? 8 : event.type === "fireSlash" ? 4 : event.type === "slash" ? 2 : 0;
      shake = Math.max(shake, strength * impact);
      if ("name" in event) enemyX = Math.sin(age / 25) * 12 * impact;
      if (event.type === "hit") playerY = Math.sin(age / 40) * 16 * impact;
      if (event.type === "evade" || event.type === "dodge") playerX = Math.max(playerX, 85 * Math.sin(Math.PI * Math.min(age / 600, 1)));
    }
    return { shake, playerX, playerY, enemyX };
  }
}
