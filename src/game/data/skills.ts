export type Skill = { castTimeTarget: number } & (
  | { id: string; name: string; type: "attack"; damage: number; effect: "slash" | "fireSlash" | "heavySlash" }
  | { id: string; name: string; type: "heal"; heal: number }
  | { id: string; name: string; type: "evade" });

export const skills: readonly Skill[] = [
  { id: "slash", name: "참격", type: "attack", damage: 10, effect: "slash", castTimeTarget: 900 },
  { id: "fire-slash", name: "화염참격", type: "attack", damage: 25, effect: "fireSlash", castTimeTarget: 1500 },
  { id: "inferno-slash", name: "폭염연옥참", type: "attack", damage: 50, effect: "heavySlash", castTimeTarget: 2000 },
  { id: "evade", name: "회피", type: "evade", castTimeTarget: 900 },
  { id: "heal", name: "치유", type: "heal", heal: 30, castTimeTarget: 900 },
];

// Deliberately exact: whitespace, incomplete syllables and unknown names fail.
export function matchSkill(input: string): Skill | undefined {
  return skills.find((skill) => skill.name === input);
}

export function applyHeal(hp: number, heal: number, maxHp: number): number {
  return Math.min(maxHp, hp + Math.max(0, heal));
}
