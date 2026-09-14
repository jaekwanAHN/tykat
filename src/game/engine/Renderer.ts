import { ENEMY_ATTACK_INTERVAL, type BattleSnapshot } from "./GameEngine";

// Coordinates use a fixed design space, scaled to the available canvas.
export function renderBattle(ctx: CanvasRenderingContext2D, width: number, height: number, state: BattleSnapshot, time: number) {
  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.scale(width / 1000, height / 520);
  const glow = ctx.createRadialGradient(500, 225, 10, 500, 225, 430);
  glow.addColorStop(0, "#24243a"); glow.addColorStop(1, "#0b0e17");
  ctx.fillStyle = glow; ctx.fillRect(0, 0, 1000, 520);

  ctx.strokeStyle = "#252938"; ctx.lineWidth = 1;
  for (let x = -500; x <= 1500; x += 100) {
    ctx.beginPath(); ctx.moveTo(500 + (x - 500) * 0.15, 280); ctx.lineTo(x, 520); ctx.stroke();
  }
  for (let y = 300; y < 520; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1000, y); ctx.stroke();
  }
  ctx.strokeStyle = "#454053";
  ctx.beginPath(); ctx.ellipse(500, 340, 250, 52, 0, 0, Math.PI * 2); ctx.stroke();

  const bob = state.status === "playing" ? Math.sin(time / 400) * 3 : 0;
  const warning = state.status === "playing" && state.attackRemaining < 1500;
  // Ogre: heavy body, angular horns and luminous eyes, without image assets.
  ctx.save(); ctx.translate(500, 233 + bob);
  ctx.globalAlpha = state.enemyHp > 0 ? 1 : 0.25;
  ctx.fillStyle = "#080a10"; ctx.beginPath(); ctx.ellipse(0, 99 - bob, 93, 17, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = warning ? "#8b4653" : "#665774";
  ctx.beginPath(); ctx.roundRect(-65, -50, 130, 134, 32); ctx.fill();
  ctx.fillStyle = warning ? "#b35c68" : "#85708f";
  ctx.beginPath(); ctx.roundRect(-47, -91, 94, 87, 23); ctx.fill();
  ctx.fillStyle = "#c9b9b7";
  for (const side of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(side * 28, -81); ctx.lineTo(side * 55, -119); ctx.lineTo(side * 48, -61); ctx.fill();
    ctx.fillStyle = warning ? "#ffb09d" : "#fb967e";
    ctx.fillRect(side < 0 ? -30 : 13, -56, 17, 5);
    ctx.fillStyle = "#c9b9b7";
  }
  ctx.fillStyle = "#4b405a";
  ctx.fillRect(-83, -26, 27, 85); ctx.fillRect(56, -26, 27, 85);
  ctx.fillRect(-51, 62, 36, 34); ctx.fillRect(15, 62, 36, 34);
  ctx.restore();

  ctx.save(); ctx.translate(500, 437);
  ctx.globalAlpha = state.playerHp > 0 ? 1 : 0.25;
  ctx.fillStyle = "#050910"; ctx.beginPath(); ctx.ellipse(0, 31, 44, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#719dba"; ctx.beginPath(); ctx.moveTo(0, -24); ctx.lineTo(-25, 27); ctx.lineTo(25, 27); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#c2e7ee"; ctx.beginPath(); ctx.arc(0, -30, 12, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#e0f6ff"; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(20, 14); ctx.lineTo(48, -30); ctx.stroke();
  ctx.restore();

  // A quiet arena ring mirrors the DOM attack gauge.
  ctx.strokeStyle = warning ? "#fb967e" : "#665774"; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(500, 340, 250, 52, 0, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * state.attackRemaining / ENEMY_ATTACK_INTERVAL); ctx.stroke();
  ctx.restore();
}
