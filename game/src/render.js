// VELVET VAULT — drawing. One job: paint the museum, the cones, the HUD, the screens.
import { CONFIG } from './config.js';
import { LEVEL } from './level.js';
const C = CONFIG.colors;
function sector(ctx, x, y, angle, half, range, fill) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, angle - half, angle + half);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}
function drawCone(ctx, x, y, angle, half, range, fill) { sector(ctx, x, y, angle, half, range, fill); }
function drawLoot(ctx, l, t) {
  const pulse = 0.7 + 0.3 * Math.sin(t * 3 + l.x);
  ctx.save();
  ctx.translate(l.x, l.y);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = C.lootGlow;
  ctx.fillRect(-16 * pulse, -16 * pulse, 32 * pulse, 32 * pulse);
  ctx.fillStyle = C.loot;
  ctx.fillRect(-9, -9, 18, 18);
  ctx.restore();
  ctx.fillStyle = C.hudText;
  ctx.font = '11px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(l.label, l.x, l.y + 30);
}
export function render(ctx, world) {
  const W = CONFIG.canvasW, H = CONFIG.canvasH;
  const t = world.time;
  // floor
  ctx.fillStyle = C.floor;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = C.floorTile;
  for (let x = 0; x < W; x += 80) for (let y = 0; y < H; y += 80) {
    if (((x + y) / 80) % 2 === 0) ctx.fillRect(x, y, 80, 80);
  }
  // carpet runner down the middle
  ctx.fillStyle = C.carpet;
  ctx.fillRect(560, 20, 160, 660);
  // walls
  for (const w of LEVEL.walls) {
    ctx.fillStyle = C.wall;
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.strokeStyle = C.wallEdge;
    ctx.lineWidth = 2;
    ctx.strokeRect(w.x + 1, w.y + 1, w.w - 2, w.h - 2);
  }
  // exit
  const e = LEVEL.exit;
  ctx.fillStyle = world.allLootTaken ? C.exit : C.exitInactive;
  ctx.fillRect(e.x, e.y, e.w, e.h);
  ctx.fillStyle = '#0b0b12';
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(e.label, e.x + e.w / 2, e.y + e.h / 2 + 4);
  // loot
  for (const l of world.loot) if (!l.taken) drawLoot(ctx, l, t);
  // coins on the floor
  for (const c of world.coins) {
    ctx.beginPath(); ctx.arc(c.x, c.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = C.coin; ctx.fill();
    ctx.strokeStyle = '#8a6d1f'; ctx.lineWidth = 1.5; ctx.stroke();
  }
  // smoke clouds
  for (const s of world.smokes) {
    ctx.beginPath(); ctx.arc(s.x, s.y, CONFIG.smokeRadius, 0, Math.PI * 2);
    ctx.fillStyle = C.smoke; ctx.fill();
  }
  // camera cones + bodies
  for (const cam of world.cameras) {
    if (cam.disabled <= 0) drawCone(ctx, cam.x, cam.y, cam.angle, CONFIG.cameraHalfAngle, CONFIG.cameraRange, C.cameraCone);
    ctx.fillStyle = cam.disabled > 0 ? '#4a5568' : C.camera;
    ctx.fillRect(cam.x - 7, cam.y - 7, 14, 14);
    ctx.fillStyle = '#0b0b12';
    ctx.font = '9px system-ui, sans-serif';
    ctx.fillText(cam.disabled > 0 ? 'OFF' : 'CAM', cam.x, cam.y - 12);
  }
  // guard cones + bodies
  for (const g of world.guards) {
    const alert = g.detect > 0.4;
    drawCone(ctx, g.x, g.y, g.angle, CONFIG.guardVisionHalfAngle, CONFIG.guardVisionRange, alert ? C.guardConeAlert : C.guardCone);
    ctx.beginPath(); ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2);
    ctx.fillStyle = C.guard; ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(g.x, g.y);
    ctx.lineTo(g.x + Math.cos(g.angle) * 20, g.y + Math.sin(g.angle) * 20);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = C.hudText;
    ctx.font = '10px system-ui, sans-serif';
    ctx.fillText(g.name, g.x, g.y - g.r - 6);
  }
  // thief
  const th = world.thief;
  ctx.beginPath(); ctx.arc(th.x, th.y, th.r + 3, 0, Math.PI * 2);
  ctx.strokeStyle = C.thiefRing; ctx.lineWidth = 2; ctx.stroke();
  ctx.beginPath(); ctx.arc(th.x, th.y, th.r, 0, Math.PI * 2);
  ctx.fillStyle = C.thief; ctx.fill();
  ctx.beginPath(); ctx.moveTo(th.x, th.y);
  ctx.lineTo(th.x + Math.cos(th.facing) * 18, th.y + Math.sin(th.facing) * 18);
  ctx.strokeStyle = '#7a5b00'; ctx.lineWidth = 3; ctx.stroke();
  // HUD top bar
  ctx.fillStyle = C.hudBg;
  ctx.fillRect(0, 0, W, 44);
  ctx.fillStyle = C.hudText;
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`LOOT ${world.lootTaken}/${world.loot.length}  •  $${world.score}`, 16, 28);
  ctx.fillText(`TIME ${Math.floor(world.time)}s`, 330, 28);
  ctx.fillText(`COINS ${th.coins}  •  SMOKE ${th.smoke} [1]  •  EMP ${th.emp} [2]  •  SHOES ${th.shoes} [3]`, 520, 28);
  // alarm meter
  const ax = 980, ay = 14, aw = 220, ah = 16;
  ctx.fillStyle = '#222';
  ctx.fillRect(ax, ay, aw, ah);
  const frac = world.alarm.value / 100;
  ctx.fillStyle = world.alarm.level === 'low' ? C.alarmLow : world.alarm.level === 'mid' ? C.alarmMid : C.alarmHigh;
  ctx.fillRect(ax, ay, aw * frac, ah);
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.strokeRect(ax, ay, aw, ah);
  ctx.fillStyle = C.hudText;
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.fillText('ALARM', ax - 62, ay + 13);
  // objective line
  ctx.fillStyle = 'rgba(242,240,247,0.75)';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText(world.allLootTaken ? 'All loot taken — reach the GETAWAY door!' : 'Collect all loot, dodge cones and cameras, then escape.', 16, 66);
  // status screens
  if (world.status === 'title') {
    ctx.fillStyle = 'rgba(8,7,14,0.78)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#f4d35e';
    ctx.font = 'bold 64px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VELVET VAULT', W / 2, 250);
    ctx.fillStyle = C.hudText;
    ctx.font = '20px system-ui, sans-serif';
    ctx.fillText('A museum heist. Steal every treasure. Dodge the guards, the cameras, the alarm.', W / 2, 300);
    ctx.font = '17px system-ui, sans-serif';
    ctx.fillText('WASD / arrows — move    •    Mouse click — throw a coin to distract', W / 2, 350);
    ctx.fillText('1 — smoke bomb    2 — EMP (cameras off)    3 — silent shoes', W / 2, 382);
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillText('Press ENTER to start', W / 2, 450);
  } else if (world.status === 'caught') {
    ctx.fillStyle = 'rgba(60,8,16,0.72)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#ff6b81';
    ctx.font = 'bold 56px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CAUGHT!', W / 2, 300);
    ctx.fillStyle = C.hudText;
    ctx.font = '20px system-ui, sans-serif';
    ctx.fillText(`The alarm hit 100. Loot kept: $${world.score} — press R to try again.`, W / 2, 350);
  } else if (world.status === 'won') {
    ctx.fillStyle = 'rgba(6,40,28,0.75)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#06d6a0';
    ctx.font = 'bold 56px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CLEAN GETAWAY!', W / 2, 300);
    ctx.fillStyle = C.hudText;
    ctx.font = '20px system-ui, sans-serif';
    ctx.fillText(`All loot secured: $${world.score} in ${Math.floor(world.time)}s — press R to play again.`, W / 2, 350);
  }
  ctx.textAlign = 'left';
}
