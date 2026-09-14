export type EnemyShape = "ogre" | "wolf" | "spider" | "golem" | "wraith" | "knight" | "serpent" | "phoenix" | "dragon" | "sovereign";
export type Stage = { name: string; shape: EnemyShape; color: string; maxHp: number; attackDamage: number; attackInterval: number; hint: string };

export const stages: readonly Readonly<Stage>[] = [
  { name: "오우거", shape: "ogre", color: "#85708f", maxHp: 200, attackDamage: 20, attackInterval: 5000, hint: "긴 공격 주기 동안 기술 입력에 익숙해지세요." },
  { name: "혈월 늑대", shape: "wolf", color: "#b96579", maxHp: 240, attackDamage: 22, attackInterval: 4700, hint: "짧은 참격과 긴 기술을 번갈아 사용해 보세요." },
  { name: "독안 거미", shape: "spider", color: "#8caf65", maxHp: 285, attackDamage: 24, attackInterval: 4400, hint: "공격 게이지가 얼마 남지 않았다면 회피를 준비하세요." },
  { name: "흑요 골렘", shape: "golem", color: "#689caf", maxHp: 335, attackDamage: 26, attackInterval: 4100, hint: "두꺼운 체력은 Perfect 공격으로 돌파하세요." },
  { name: "망각의 망령", shape: "wraith", color: "#86c9ca", maxHp: 390, attackDamage: 28, attackInterval: 3800, hint: "맞은 뒤에는 치유할 시간도 확보하세요." },
  { name: "가시 기사", shape: "knight", color: "#a8a3c1", maxHp: 450, attackDamage: 30, attackInterval: 3500, hint: "회피 성공으로 Combo를 지키세요." },
  { name: "심연의 대사", shape: "serpent", color: "#66b797", maxHp: 515, attackDamage: 32, attackInterval: 3200, hint: "공격 한 번 뒤에 바로 적의 타이머를 확인하세요." },
  { name: "잿불 불사조", shape: "phoenix", color: "#f6a05e", maxHp: 585, attackDamage: 34, attackInterval: 2900, hint: "긴 기술 욕심보다 안전한 회피가 중요합니다." },
  { name: "빙하룡", shape: "dragon", color: "#87bfea", maxHp: 660, attackDamage: 36, attackInterval: 2600, hint: "짧은 Perfect와 치유로 공격 사이를 버티세요." },
  { name: "공허의 군주", shape: "sovereign", color: "#c992f3", maxHp: 750, attackDamage: 40, attackInterval: 2300, hint: "최종전. 회피 직후의 시간을 강력한 공격에 사용하세요." },
];
export const STAGE_COUNT = stages.length;
export function getStage(stage: number): Readonly<Stage> {
  if (!Number.isInteger(stage) || stage < 1 || stage > STAGE_COUNT) throw new RangeError("Invalid stage");
  return stages[stage - 1];
}
