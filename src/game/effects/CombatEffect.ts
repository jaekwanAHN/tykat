export type CombatEffect =
  | { type: "reset" }
  | { type: "slash" | "fireSlash" | "heavySlash"; amount: number; name: string }
  | { type: "heal" | "hit"; amount: number }
  | { type: "evade" | "dodge" | "perfect" };
