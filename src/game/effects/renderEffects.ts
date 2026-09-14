import type { EffectSystem } from "./EffectSystem";

export function renderEffects(ctx: CanvasRenderingContext2D, effects: EffectSystem) {
  ctx.save();
  for (const { event, age } of effects.visuals) {
    if ((event.type === "heavySlash" || event.type === "hit") && age < 220) {
      ctx.globalAlpha = (1 - age / 220) * .28;
      ctx.fillStyle = event.type === "hit" ? "#f5284b" : "#ffd5a2";
      ctx.fillRect(-20, -20, 1040, 560);
    }
    if ("name" in event && age < 300) {
      ctx.globalAlpha = 1 - age / 300;
      ctx.save(); ctx.translate(500, 235); ctx.rotate(-.55);
      const heavy = event.type === "heavySlash";
      const reach = (heavy ? 250 : 150) * Math.min(1, .5 + age / 80);
      ctx.strokeStyle = event.type === "slash" ? "#b9efff" : "#ff862f";
      ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 24;
      ctx.lineCap = "round";
      ctx.lineWidth = heavy ? 26 : 12;
      ctx.beginPath(); ctx.moveTo(-reach, 20); ctx.quadraticCurveTo(0, -45, reach, 0); ctx.stroke();
      ctx.strokeStyle = "#fff5df"; ctx.lineWidth = heavy ? 7 : 3; ctx.stroke();
      if (heavy) {
        ctx.rotate(1.3); ctx.beginPath(); ctx.moveTo(-reach, 0); ctx.lineTo(reach, 0); ctx.stroke();
      }
      ctx.restore();
    }
    if (event.type === "heal" || event.type === "evade" || event.type === "dodge") {
      ctx.globalAlpha = Math.max(0, 1 - age / 650);
      ctx.strokeStyle = event.type === "heal" ? "#86efac" : "#b9efff";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(500, 450, 35 + age / 10, 10 + age / 40, 0, 0, Math.PI * 2); ctx.stroke();
    }
  }
  for (const particle of effects.particles) {
    ctx.globalAlpha = 1 - particle.age / particle.life;
    ctx.fillStyle = particle.color;
    ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
  }
  ctx.textAlign = "center"; ctx.lineJoin = "round";
  const latestAttack = effects.visuals.findLast((visual) => "name" in visual.event);
  for (const visual of effects.visuals) {
    const { event, age, lane } = visual;
    if (event.type === "perfect") {
      ctx.globalAlpha = Math.min(1, (1000 - age) / 350);
      ctx.font = "900 38px Arial, sans-serif";
      ctx.fillStyle = "#fde68a"; ctx.strokeStyle = "#080b12"; ctx.lineWidth = 5;
      ctx.strokeText("PERFECT!", 500, 285 - age * .015);
      ctx.fillText("PERFECT!", 500, 285 - age * .015);
      continue;
    }
    const attack = "name" in event;
    const heavy = event.type === "heavySlash";
    ctx.globalAlpha = Math.min(1, (1000 - age) / 350);
    const label = "amount" in event ? `${event.type === "heal" ? "+" : "-"}${event.amount}` : event.type === "dodge" ? "DODGE!" : "회피";
    ctx.fillStyle = event.type === "heal" ? "#86efac" : event.type === "hit" ? "#ff8297" : "#fff0cf";
    ctx.strokeStyle = "#080b12"; ctx.lineWidth = 5;
    ctx.font = `900 ${heavy ? 46 : 32}px Arial, sans-serif`;
    const y = (attack ? 200 : 385) - age * .065;
    const x = (attack ? 605 : 580) + lane * 65;
    ctx.strokeText(label, x, y); ctx.fillText(label, x, y);
    if (attack && visual === latestAttack) {
      ctx.font = `900 ${heavy ? 30 : 22}px Arial, sans-serif`;
      ctx.strokeText(event.name, 500, 340 - age * .025); ctx.fillText(event.name, 500, 340 - age * .025);
    }
  }
  ctx.restore();
}
