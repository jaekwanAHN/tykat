export type Skill =
  | { id: string; name: string; type: "attack"; damage: number }
  | { id: string; name: string; type: "heal"; heal: number }
  | { id: string; name: string; type: "evade" };

export const skills: readonly Skill[] = [
  { id: "slash", name: "참격", type: "attack", damage: 10 },
  { id: "fire-slash", name: "화염참격", type: "attack", damage: 25 },
  { id: "inferno-slash", name: "폭염연옥참", type: "attack", damage: 50 },
  { id: "evade", name: "회피", type: "evade" },
  { id: "heal", name: "치유", type: "heal", heal: 30 },
];

// Deliberately exact: whitespace, incomplete syllables and unknown names fail.
export function matchSkill(input: string): Skill | undefined {
  return skills.find((skill) => skill.name === input);
}

export function applyHeal(hp: number, heal: number, maxHp: number): number {
  return Math.min(maxHp, hp + Math.max(0, heal));
}
