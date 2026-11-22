// VELVET VAULT — drawing. One job: paint the museum, the cones, the HUD, the screens.
// v2 (Solmarina standard): layered lighting (darkness + light pools), polished marble
// with veins, panelled wood walls with brass trim, framed paintings, glass display
// cases, velvet ropes, faceted gems, shaped characters with soft shadows, particles.
import { CONFIG } from './config.js';
import { LEVEL } from './level.js';
const C = CONFIG.colors;

// deterministic RNG so the marble looks the same every run
function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let staticLayer = null;
let lightCanvas = null;

function drawStar(ctx, cx, cy, r, fill) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r : r * 0.45;
    const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function drawPaintingArt(ctx, x, y, w, h, art) {
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  if (art === 'landscape') {
    const g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, '#2b4a6b'); g.addColorStop(0.6, '#7a6a4a'); g.addColorStop(1, '#2a2118');
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#f4d35e';
    ctx.beginPath(); ctx.arc(x + w * 0.7, y + h * 0.28, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1d2f45';
    ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(x + w * 0.3, y + h * 0.35); ctx.lineTo(x + w * 0.6, y + h); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#16222f';
    ctx.beginPath(); ctx.moveTo(x + w * 0.4, y + h); ctx.lineTo(x + w * 0.75, y + h * 0.45); ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(180,200,220,0.35)';
    ctx.fillRect(x, y + h * 0.82, w, 3);
  } else if (art === 'portrait') {
    ctx.fillStyle = '#3a2a1e'; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#6b4a2f';
    ctx.beginPath(); ctx.ellipse(x + w / 2, y + h * 0.78, w * 0.3, h * 0.22, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#d9a06b';
    ctx.beginPath(); ctx.arc(x + w / 2, y + h * 0.42, w * 0.17, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1c1410';
    ctx.beginPath(); ctx.arc(x + w / 2, y + h * 0.34, w * 0.18, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#1c1410';
    ctx.beginPath(); ctx.arc(x + w * 0.44, y + h * 0.42, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + w * 0.56, y + h * 0.42, 2, 0, Math.PI * 2); ctx.fill();
  } else { // abstract
    ctx.fillStyle = '#241a2e'; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#ef476f'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(x + w * 0.35, y + h * 0.5, w * 0.22, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#06d6a0'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(x + w * 0.5, y + h * 0.1); ctx.lineTo(x + w * 0.85, y + h * 0.8); ctx.stroke();
    ctx.fillStyle = '#f4d35e';
    ctx.beginPath(); ctx.arc(x + w * 0.7, y + h * 0.3, 6, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function buildStaticLayer() {
  const W = CONFIG.canvasW, H = CONFIG.canvasH;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  const rnd = mulberry32(1337);
  // --- marble floor: alternating tiles, veins, grout ---
  ctx.fillStyle = C.floor;
  ctx.fillRect(0, 0, W, H);
  const TS = 160;
  for (let tx = 0; tx < W / TS; tx++) {
    for (let ty = 0; ty < H / TS; ty++) {
      const x = tx * TS, y = ty * TS;
      ctx.fillStyle = (tx + ty) % 2 === 0 ? C.floorTileA : C.floorTileB;
      ctx.fillRect(x, y, TS, TS);
      // subtle per-tile light shift
      ctx.fillStyle = `rgba(255,255,255,${rnd() * 0.02})`;
      ctx.fillRect(x, y, TS, TS);
      // veins
      ctx.strokeStyle = C.floorVein;
      ctx.lineWidth = 1.2;
      for (let v = 0; v < 3; v++) {
        const sx = x + rnd() * TS, sy = y + rnd() * TS;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.bezierCurveTo(
          sx + (rnd() - 0.5) * 90, sy + (rnd() - 0.5) * 90,
          sx + (rnd() - 0.5) * 90, sy + (rnd() - 0.5) * 90,
          sx + (rnd() - 0.5) * 130, sy + (rnd() - 0.5) * 130,
        );
        ctx.stroke();
      }
      // polished sheen diagonal
      ctx.fillStyle = 'rgba(255,255,255,0.012)';
      ctx.beginPath();
      ctx.moveTo(x, y + TS); ctx.lineTo(x + TS, y); ctx.lineTo(x + TS, y + 26); ctx.lineTo(x + 26, y + TS);
      ctx.closePath(); ctx.fill();
    }
  }
  ctx.strokeStyle = C.grout;
  ctx.lineWidth = 2;
  for (let x = 0; x <= W; x += TS) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y <= H; y += TS) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  // --- velvet carpets with gold border + diamond pattern ---
  for (const cp of LEVEL.decor.carpets) {
    ctx.fillStyle = C.carpet;
    ctx.fillRect(cp.x, cp.y, cp.w, cp.h);
    ctx.strokeStyle = C.carpetEdge;
    ctx.lineWidth = 3;
    ctx.strokeRect(cp.x + 4, cp.y + 4, cp.w - 8, cp.h - 8);
    ctx.strokeStyle = C.carpetPattern;
    ctx.lineWidth = 1.5;
    const step = 44;
    for (let px = cp.x + step; px < cp.x + cp.w - 8; px += step) {
      for (let py = cp.y + step; py < cp.y + cp.h - 8; py += step) {
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(Math.PI / 4);
        ctx.strokeRect(-7, -7, 14, 14);
        ctx.restore();
      }
    }
    // centre sheen
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(cp.x + cp.w / 2 - 6, cp.y, 12, cp.h);
  }
  // --- gold floor medallions (inlaid marble circles, gallery centres) ---
  for (const [mx, my] of [[230, 360], [1070, 360], [640, 480]]) {
    ctx.strokeStyle = 'rgba(201,162,39,0.55)';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(mx, my, 46, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(mx, my, 36, 0, Math.PI * 2); ctx.stroke();
    ctx.save();
    ctx.translate(mx, my);
    ctx.rotate(Math.PI / 4);
    ctx.strokeStyle = 'rgba(201,162,39,0.4)';
    ctx.strokeRect(-18, -18, 36, 36);
    ctx.restore();
    ctx.fillStyle = 'rgba(201,162,39,0.5)';
    ctx.beginPath(); ctx.arc(mx, my, 4, 0, Math.PI * 2); ctx.fill();
  }
  // --- benches against the south wall (wood + brass) ---
  for (const [bx, by] of [[240, 668], [1040, 668]]) {
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath(); ctx.ellipse(bx, by + 12, 52, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#332216';
    ctx.fillRect(bx - 48, by - 10, 96, 20);
    ctx.fillStyle = C.gold;
    ctx.fillRect(bx - 48, by - 10, 96, 3);
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 1;
    for (const lx of [-40, 0, 40]) {
      ctx.beginPath(); ctx.moveTo(bx + lx, by - 7); ctx.lineTo(bx + lx, by + 7); ctx.stroke();
    }
  }
  // --- loot pedestals (gold ring + shadow) ---
  for (const l of LEVEL.loot) {
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath(); ctx.ellipse(l.x, l.y + 14, 24, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.gold;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(l.x, l.y + 12, 20, 7, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#241d33';
    ctx.beginPath(); ctx.ellipse(l.x, l.y + 11, 18, 6, 0, 0, Math.PI * 2); ctx.fill();
  }
  // --- walls: panelled wood + brass trim + drop shadow ---
  for (const w of LEVEL.walls) {
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(w.x + 3, w.y + 4, w.w, w.h);
    ctx.fillStyle = C.wall;
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.fillStyle = C.wallPanel;
    ctx.fillRect(w.x + 3, w.y + 3, w.w - 6, w.h - 6);
    // vertical wood panels
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 1;
    const vertical = w.w >= w.h;
    const span = vertical ? w.w : w.h;
    for (let p = 44; p < span; p += 44) {
      ctx.beginPath();
      if (vertical) { ctx.moveTo(w.x + p, w.y + 3); ctx.lineTo(w.x + p, w.y + w.h - 3); }
      else { ctx.moveTo(w.x + 3, w.y + p); ctx.lineTo(w.x + w.w - 3, w.y + p); }
      ctx.stroke();
    }
    ctx.fillStyle = C.wallTop;
    if (vertical) ctx.fillRect(w.x, w.y, w.w, 4);
    else ctx.fillRect(w.x, w.y, 4, w.h);
    ctx.strokeStyle = C.wallEdge;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(w.x + 1.5, w.y + 1.5, w.w - 3, w.h - 3);
  }
  // --- framed paintings on the walls ---
  for (const p of LEVEL.decor.paintings) {
    ctx.fillStyle = '#0d0a08';
    ctx.fillRect(p.x - 5, p.y - 5, p.w + 10, p.h + 10);
    ctx.fillStyle = C.gold;
    ctx.fillRect(p.x - 4, p.y - 4, p.w + 8, p.h + 8);
    ctx.fillStyle = '#7a5c14';
    ctx.fillRect(p.x - 2, p.y - 2, p.w + 4, p.h + 4);
    drawPaintingArt(ctx, p.x, p.y, p.w, p.h, p.art);
    // plaque
    ctx.fillStyle = C.gold;
    ctx.fillRect(p.x + p.w / 2 - 10, p.y + p.h + 7, 20, 4);
  }
  // --- glass display cases ---
  for (const cs of LEVEL.decor.cases) {
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath(); ctx.ellipse(cs.x, cs.y + 26, 26, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#332216';
    ctx.fillRect(cs.x - 20, cs.y + 8, 40, 20);
    ctx.strokeStyle = C.gold; ctx.lineWidth = 1.5;
    ctx.strokeRect(cs.x - 20, cs.y + 8, 40, 20);
    const g = ctx.createLinearGradient(cs.x - 18, cs.y - 22, cs.x + 18, cs.y + 8);
    g.addColorStop(0, 'rgba(200,220,255,0.28)');
    g.addColorStop(0.5, 'rgba(200,220,255,0.06)');
    g.addColorStop(1, 'rgba(200,220,255,0.18)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(cs.x - 18, cs.y + 8);
    ctx.lineTo(cs.x - 14, cs.y - 20);
    ctx.quadraticCurveTo(cs.x, cs.y - 28, cs.x + 14, cs.y - 20);
    ctx.lineTo(cs.x + 18, cs.y + 8);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cs.x - 8, cs.y - 18); ctx.lineTo(cs.x + 2, cs.y + 4); ctx.stroke();
    // tiny gem inside
    ctx.fillStyle = '#7ad0ff';
    ctx.beginPath();
    ctx.moveTo(cs.x, cs.y - 6); ctx.lineTo(cs.x + 7, cs.y + 2); ctx.lineTo(cs.x, cs.y + 8); ctx.lineTo(cs.x - 7, cs.y + 2);
    ctx.closePath(); ctx.fill();
  }
  // --- velvet ropes: brass posts + sagging crimson rope ---
  for (const r of LEVEL.decor.ropes) {
    for (const [px, py] of [[r.x1, r.y1], [r.x2, r.y2]]) {
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath(); ctx.ellipse(px, py + 4, 7, 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.gold;
      ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f4d35e';
      ctx.beginPath(); ctx.arc(px, py - 2, 2, 0, Math.PI * 2); ctx.fill();
    }
    const mx = (r.x1 + r.x2) / 2, my = (r.y1 + r.y2) / 2 + 16;
    ctx.strokeStyle = '#5c0a18';
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(r.x1, r.y1); ctx.quadraticCurveTo(mx, my + 2, r.x2, r.y2); ctx.stroke();
    ctx.strokeStyle = '#8e1226';
    ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.moveTo(r.x1, r.y1); ctx.quadraticCurveTo(mx, my, r.x2, r.y2); ctx.stroke();
  }
  // --- sconce fixtures (glow comes from the lighting pass) ---
  for (const s of LEVEL.decor.sconces) {
    ctx.fillStyle = '#3a2c10';
    ctx.fillRect(s.x - 8, s.y - 5, 16, 10);
    ctx.fillStyle = C.gold;
    ctx.fillRect(s.x - 6, s.y - 3, 12, 6);
    ctx.fillStyle = '#ffe9a8';
    ctx.beginPath(); ctx.arc(s.x, s.y, 3, 0, Math.PI * 2); ctx.fill();
  }
  // --- soft vignette over the whole floor ---
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.62);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.28)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);
  return cv;
}

function sectorPath(ctx, x, y, angle, half, range) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, angle - half, angle + half);
  ctx.closePath();
}
// Vision cone with a radial gradient: hot at the eye, fading to nothing.
function drawCone(ctx, x, y, angle, half, range, rgb, alphaMax) {
  ctx.save();
  sectorPath(ctx, x, y, angle, half, range);
  ctx.clip();
  const g = ctx.createRadialGradient(x, y, 8, x, y, range);
  g.addColorStop(0, `rgba(${rgb},${alphaMax})`);
  g.addColorStop(0.55, `rgba(${rgb},${alphaMax * 0.55})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(x - range, y - range, range * 2, range * 2);
  ctx.restore();
  // crisp rim
  ctx.save();
  ctx.strokeStyle = `rgba(${rgb},${Math.min(0.5, alphaMax + 0.15)})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y, range, angle - half, angle + half);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + Math.cos(angle - half) * range, y + Math.sin(angle - half) * range);
  ctx.moveTo(x, y);
  ctx.lineTo(x + Math.cos(angle + half) * range, y + Math.sin(angle + half) * range);
  ctx.stroke();
  ctx.restore();
}

function drawGem(ctx, l, t) {
  const bob = Math.sin(t * 2 + l.x * 0.01) * 2.5;
  const y = l.y + bob;
  // halo
  const g = ctx.createRadialGradient(l.x, y, 4, l.x, y, 36);
  g.addColorStop(0, l.color + 'cc');
  g.addColorStop(0.4, l.color + '44');
  g.addColorStop(1, l.color + '00');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(l.x, y, 36, 0, Math.PI * 2); ctx.fill();
  // faceted diamond
  ctx.save();
  ctx.translate(l.x, y);
  ctx.shadowColor = l.color;
  ctx.shadowBlur = 10;
  ctx.fillStyle = l.color;
  ctx.beginPath();
  ctx.moveTo(-12, -5); ctx.lineTo(12, -5); ctx.lineTo(15, 1);
  ctx.lineTo(0, 15); ctx.lineTo(-15, 1);
  ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0;
  // facets
  ctx.strokeStyle = l.dark;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-12, -5); ctx.lineTo(0, 1); ctx.lineTo(12, -5);
  ctx.moveTo(0, 1); ctx.lineTo(0, 15);
  ctx.moveTo(-15, 1); ctx.lineTo(0, 1); ctx.lineTo(15, 1);
  ctx.stroke();
  // table + sparkle
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.beginPath();
  ctx.moveTo(-8, -5); ctx.lineTo(8, -5); ctx.lineTo(4, 0); ctx.lineTo(-4, 0);
  ctx.closePath(); ctx.fill();
  const tw = 0.6 + 0.4 * Math.sin(t * 4 + l.y);
  ctx.fillStyle = `rgba(255,255,255,${0.85 * tw})`;
  ctx.fillRect(-1.5, -11, 3, 3);
  ctx.restore();
  ctx.fillStyle = C.hudText;
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(l.label, l.x, l.y + 32);
  ctx.fillStyle = 'rgba(244,211,94,0.85)';
  ctx.font = '10px system-ui, sans-serif';
  ctx.fillText(`$${l.value}`, l.x, l.y + 45);
}

function drawLoot(ctx, l, t) {
  if (l.kind === 'gem') { drawGem(ctx, l, t); return; }
  const bob = Math.sin(t * 2 + l.x * 0.01) * 2.5;
  const y = l.y + bob;
  const g = ctx.createRadialGradient(l.x, y, 4, l.x, y, 40);
  g.addColorStop(0, 'rgba(244,211,94,0.55)');
  g.addColorStop(1, 'rgba(244,211,94,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(l.x, y, 40, 0, Math.PI * 2); ctx.fill();
  ctx.save();
  ctx.translate(l.x, y);
  if (l.kind === 'painting') {
    ctx.fillStyle = C.gold;
    ctx.fillRect(-19, -23, 38, 46);
    ctx.fillStyle = '#7a5c14';
    ctx.fillRect(-16, -20, 32, 40);
    drawPaintingArt(ctx, -14, -18, 28, 36, 'portrait');
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-12, -16); ctx.lineTo(-2, 16); ctx.stroke();
  } else if (l.kind === 'crown') {
    ctx.fillStyle = l.color;
    ctx.beginPath();
    ctx.moveTo(-14, 10); ctx.lineTo(-14, -4); ctx.lineTo(-7, 4);
    ctx.lineTo(0, -10); ctx.lineTo(7, 4); ctx.lineTo(14, -4); ctx.lineTo(14, 10);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = l.dark;
    ctx.fillRect(-14, 8, 28, 4);
    ctx.fillStyle = '#ef476f';
    ctx.beginPath(); ctx.arc(0, 3, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-9, 3, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(9, 3, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.beginPath(); ctx.arc(0, -10, 2, 0, Math.PI * 2); ctx.fill();
  } else if (l.kind === 'mask') {
    ctx.fillStyle = l.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, 13, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = l.dark;
    ctx.beginPath(); ctx.ellipse(-5, -3, 3.5, 2, -0.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(5, -3, 3.5, 2, 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = l.dark;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, -1); ctx.lineTo(0, 7); ctx.stroke();
    ctx.strokeStyle = C.gold;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(0, 0, 13, 16, 0, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
  ctx.fillStyle = C.hudText;
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(l.label, l.x, l.y + 32);
  ctx.fillStyle = 'rgba(244,211,94,0.85)';
  ctx.font = '10px system-ui, sans-serif';
  ctx.fillText(`$${l.value}`, l.x, l.y + 45);
}

function drawGuard(ctx, g, t) {
  // soft shadow
  const bob = Math.sin(g.walkPhase) * 1.2;
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath(); ctx.ellipse(g.x, g.y + g.r + 3, g.r + 2, 5, 0, 0, Math.PI * 2); ctx.fill();
  // body: navy uniform with brass ring
  ctx.beginPath(); ctx.arc(g.x, g.y + bob * 0.4, g.r, 0, Math.PI * 2);
  ctx.fillStyle = g.kind === 'elite' ? '#2c4a73' : C.guard; ctx.fill();
  ctx.strokeStyle = C.guardTrim; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.strokeStyle = 'rgba(201,162,39,0.8)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(g.x, g.y + bob * 0.4, g.r - 3.5, 0, Math.PI * 2); ctx.stroke();
  // face toward facing
  const fx = Math.cos(g.angle), fy = Math.sin(g.angle);
  ctx.fillStyle = '#d9a06b';
  ctx.beginPath(); ctx.arc(g.x + fx * 4, g.y + fy * 4 + bob * 0.4, 5, 0, Math.PI * 2); ctx.fill();
  // cap
  ctx.fillStyle = '#101c2e';
  ctx.beginPath(); ctx.arc(g.x + fx * 2, g.y + fy * 2 + bob * 0.4, 6.5, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = C.goldBright; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(g.x + fx * 2, g.y + fy * 2 + bob * 0.4, 6.5, g.angle - 1.1, g.angle + 1.1); ctx.stroke();
  // detection ring
  if (g.detect > 0.03) {
    ctx.strokeStyle = g.detect > 0.65 ? '#ff2e4d' : '#ffd166';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(g.x, g.y, g.r + 5, -Math.PI / 2, -Math.PI / 2 + g.detect * Math.PI * 2);
    ctx.stroke();
  }
  // ! or ?
  if (g.detect > 0.65) {
    ctx.fillStyle = '#ff2e4d';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('!', g.x, g.y - g.r - 14);
  } else if (g.detect > 0.15) {
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('?', g.x, g.y - g.r - 14);
  }
  // name pill
  ctx.font = '10px system-ui, sans-serif';
  const w = ctx.measureText(g.name).width + 10;
  ctx.fillStyle = 'rgba(8,7,14,0.75)';
  ctx.beginPath();
  ctx.roundRect(g.x - w / 2, g.y - g.r - 30, w, 13, 6);
  ctx.fill();
  ctx.fillStyle = C.hudText;
  ctx.textAlign = 'center';
  ctx.fillText(g.name, g.x, g.y - g.r - 20);
}

function drawThief(ctx, th, t) {
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath(); ctx.ellipse(th.x, th.y + th.r + 3, th.r + 2, 5, 0, 0, Math.PI * 2); ctx.fill();
  const fx = Math.cos(th.facing), fy = Math.sin(th.facing);
  // cloak (deep violet so the hero pops against the dark floor, like Kumala's hero)
  ctx.beginPath(); ctx.arc(th.x, th.y, th.r, 0, Math.PI * 2);
  ctx.fillStyle = C.thief; ctx.fill();
  ctx.strokeStyle = C.thiefTrim; ctx.lineWidth = 2.5; ctx.stroke();
  // warm rim light on the cloak edge
  ctx.strokeStyle = 'rgba(255,200,120,0.55)';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(th.x, th.y, th.r - 1, th.facing - 2.2, th.facing - 0.6); ctx.stroke();
  // hood point toward facing
  ctx.fillStyle = '#171222';
  ctx.beginPath();
  ctx.moveTo(th.x + fx * (th.r + 7), th.y + fy * (th.r + 7));
  ctx.lineTo(th.x + Math.cos(th.facing + 2.5) * th.r * 0.8, th.y + Math.sin(th.facing + 2.5) * th.r * 0.8);
  ctx.lineTo(th.x + Math.cos(th.facing - 2.5) * th.r * 0.8, th.y + Math.sin(th.facing - 2.5) * th.r * 0.8);
  ctx.closePath(); ctx.fill();
  // face + eye glints
  ctx.fillStyle = '#0d0a14';
  ctx.beginPath(); ctx.arc(th.x + fx * 3, th.y + fy * 3, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffe9a8';
  ctx.beginPath(); ctx.arc(th.x + fx * 4 + Math.cos(th.facing + 1.57) * 2.5, th.y + fy * 4 + Math.sin(th.facing + 1.57) * 2.5, 1.6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(th.x + fx * 4 - Math.cos(th.facing + 1.57) * 2.5, th.y + fy * 4 - Math.sin(th.facing + 1.57) * 2.5, 1.6, 0, Math.PI * 2); ctx.fill();
  // gold clasp
  ctx.fillStyle = C.goldBright;
  ctx.beginPath(); ctx.arc(th.x - fx * (th.r - 2), th.y - fy * (th.r - 2), 2, 0, Math.PI * 2); ctx.fill();
  // silent shoes ring
  if (th.shoesTimer > 0) {
    ctx.strokeStyle = `rgba(244,211,94,${0.5 + 0.4 * Math.sin(t * 6)})`;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(th.x, th.y, th.r + 5, 0, Math.PI * 2); ctx.stroke();
  }
}

function applyLighting(ctx, world) {
  const W = CONFIG.canvasW, H = CONFIG.canvasH;
  if (!lightCanvas) {
    lightCanvas = document.createElement('canvas');
    lightCanvas.width = W; lightCanvas.height = H;
  }
  const l = lightCanvas.getContext('2d');
  l.clearRect(0, 0, W, H);
  l.globalCompositeOperation = 'source-over';
  l.fillStyle = C.darkness;
  l.fillRect(0, 0, W, H);
  l.globalCompositeOperation = 'destination-out';
  const hole = (x, y, r, strength) => {
    const g = l.createRadialGradient(x, y, 4, x, y, r);
    g.addColorStop(0, `rgba(0,0,0,${strength})`);
    g.addColorStop(0.6, `rgba(0,0,0,${strength * 0.85})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    l.fillStyle = g;
    l.beginPath(); l.arc(x, y, r, 0, Math.PI * 2); l.fill();
  };
  const th = world.thief;
  hole(th.x, th.y, 250, 1); // thief lantern light
  for (const lt of world.loot) if (!lt.taken) hole(lt.x, lt.y, 95, 0.9);
  const e = LEVEL.exit;
  hole(e.x + e.w / 2, e.y + e.h / 2, world.allLootTaken ? 140 : 90, world.allLootTaken ? 0.95 : 0.5);
  for (const s of LEVEL.decor.sconces) hole(s.x, s.y, 130, 0.55);
  for (const g of world.guards) hole(g.x, g.y, 70, 0.4);
  for (const c of world.cameras) hole(c.x, c.y, 55, 0.35);
  // Kumala warmth: golden-hour tint inside every lit pool (warm, not cold dark)
  l.globalCompositeOperation = 'source-over';
  const warm = (x, y, r, a) => {
    const g = l.createRadialGradient(x, y, 4, x, y, r);
    g.addColorStop(0, `rgba(255,180,90,${a})`);
    g.addColorStop(1, 'rgba(255,180,90,0)');
    l.fillStyle = g;
    l.beginPath(); l.arc(x, y, r, 0, Math.PI * 2); l.fill();
  };
  warm(th.x, th.y, 260, 0.16);
  for (const s of LEVEL.decor.sconces) warm(s.x, s.y, 150, 0.18);
  for (const lt of world.loot) if (!lt.taken) warm(lt.x, lt.y, 110, 0.1);
  ctx.drawImage(lightCanvas, 0, 0);
}

function goldText(ctx, text, x, y, font) {
  const g = ctx.createLinearGradient(x - 260, y, x + 260, y);
  g.addColorStop(0, '#8a6d1f');
  g.addColorStop(0.35, '#f4d35e');
  g.addColorStop(0.6, '#fff3c4');
  g.addColorStop(0.85, '#c9a227');
  g.addColorStop(1, '#8a6d1f');
  ctx.fillStyle = g;
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.fillText(text, x, y);
}

function drawVaultDoor(ctx, cx, cy, r, t) {
  ctx.save();
  ctx.translate(cx, cy);
  // outer brass ring
  ctx.fillStyle = '#241d0e';
  ctx.beginPath(); ctx.arc(0, 0, r + 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#c9a227';
  ctx.beginPath(); ctx.arc(0, 0, r + 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1a1a22';
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  // steel rings
  ctx.strokeStyle = '#3d3d4d'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(0, 0, r * 0.72, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2); ctx.stroke();
  // spokes (slowly turning)
  ctx.rotate(Math.sin(t * 0.4) * 0.06);
  ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 5;
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * r * 0.18, Math.sin(a) * r * 0.18);
    ctx.lineTo(Math.cos(a) * r * 0.95, Math.sin(a) * r * 0.95);
    ctx.stroke();
  }
  // hub + gem
  ctx.fillStyle = '#c9a227';
  ctx.beginPath(); ctx.arc(0, 0, r * 0.18, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ff4d6d';
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.1); ctx.lineTo(r * 0.09, 0); ctx.lineTo(0, r * 0.1); ctx.lineTo(-r * 0.09, 0);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

export function render(ctx, world) {
  const W = CONFIG.canvasW, H = CONFIG.canvasH;
  const t = world.time;
  const titleT = performance.now() / 1000;
  if (!staticLayer) staticLayer = buildStaticLayer();
  ctx.drawImage(staticLayer, 0, 0);
  // ---- exit door ----
  const e = LEVEL.exit;
  const active = world.allLootTaken;
  if (active) {
    const g = ctx.createRadialGradient(e.x + e.w / 2, e.y + e.h / 2, 6, e.x + e.w / 2, e.y + e.h / 2, 110);
    g.addColorStop(0, 'rgba(6,214,160,0.5)');
    g.addColorStop(1, 'rgba(6,214,160,0)');
    ctx.fillStyle = g;
    ctx.fillRect(e.x - 70, e.y - 70, e.w + 140, e.h + 140);
  }
  ctx.fillStyle = active ? '#0d5c46' : '#232833';
  ctx.fillRect(e.x, e.y, e.w, e.h);
  ctx.strokeStyle = active ? C.exit : '#5a6478';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(e.x + 1.5, e.y + 1.5, e.w - 3, e.h - 3);
  ctx.fillStyle = active ? '#7dffd4' : '#8a94a8';
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(e.label, e.x + e.w / 2, e.y + e.h / 2 - 2);
  ctx.fillStyle = active ? '#7dffd4' : '#5a6478';
  ctx.font = '9px system-ui, sans-serif';
  ctx.fillText(active ? 'OPEN — GO!' : `${world.lootTaken}/${world.loot.length} LOOT`, e.x + e.w / 2, e.y + e.h / 2 + 12);
  // ---- loot ----
  for (const l of world.loot) if (!l.taken) drawLoot(ctx, l, t);
  // ---- coins on the floor ----
  for (const c of world.coins) {
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath(); ctx.ellipse(c.x, c.y + 4, 7, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.coin;
    ctx.beginPath(); ctx.arc(c.x, c.y, 6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#8a6d1f'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = '#8a6d1f';
    ctx.font = 'bold 8px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('$', c.x, c.y + 3);
  }
  // ---- smoke clouds (layered puffs) ----
  for (const s of world.smokes) {
    const fade = Math.min(1, s.t / 1.2);
    for (let i = 0; i < 5; i++) {
      const ox = Math.sin(s.x * 0.7 + i * 2.4) * 34;
      const oy = Math.cos(s.y * 0.6 + i * 1.9) * 30;
      ctx.fillStyle = `rgba(200,200,214,${0.22 * fade})`;
      ctx.beginPath();
      ctx.arc(s.x + ox, s.y + oy, CONFIG.smokeRadius * (0.45 + i * 0.1), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // ---- lasers ----
  for (const lz of world.lasers) {
    // emitters
    for (const [ex, ey] of [[lz.x1, lz.y1], [lz.x2, lz.y2]]) {
      ctx.fillStyle = '#1a1a22';
      ctx.fillRect(ex - 5, ey - 5, 10, 10);
      ctx.strokeStyle = lz.active ? C.laser : '#5a2028';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(ex - 5, ey - 5, 10, 10);
      ctx.fillStyle = lz.active ? '#ff5c72' : '#7a2a35';
      ctx.beginPath(); ctx.arc(ex, ey, 2.5, 0, Math.PI * 2); ctx.fill();
    }
    if (lz.active) {
      ctx.save();
      ctx.shadowColor = C.laser;
      ctx.shadowBlur = 12;
      ctx.strokeStyle = C.laser;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(lz.x1, lz.y1); ctx.lineTo(lz.x2, lz.y2); ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(lz.x1, lz.y1); ctx.lineTo(lz.x2, lz.y2); ctx.stroke();
      ctx.restore();
    } else {
      ctx.save();
      ctx.strokeStyle = 'rgba(255,46,77,0.28)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 8]);
      ctx.beginPath(); ctx.moveTo(lz.x1, lz.y1); ctx.lineTo(lz.x2, lz.y2); ctx.stroke();
      ctx.restore();
    }
  }
  // ---- camera cones + bodies ----
  for (const cam of world.cameras) {
    if (cam.disabled <= 0) drawCone(ctx, cam.x, cam.y, cam.angle, CONFIG.cameraHalfAngle, CONFIG.cameraRange, '6,214,160', cam.detect > 0.4 ? 0.34 : 0.2);
    ctx.fillStyle = '#1a1a22';
    ctx.fillRect(cam.x - 8, cam.y - 8, 16, 16);
    ctx.strokeStyle = cam.disabled > 0 ? '#4a5568' : C.camera;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cam.x - 8, cam.y - 8, 16, 16);
    ctx.fillStyle = cam.disabled > 0 ? '#4a5568' : C.camera;
    ctx.beginPath(); ctx.arc(cam.x, cam.y, 4, 0, Math.PI * 2); ctx.fill();
    // lens glint toward sweep
    ctx.fillStyle = '#0b0b12';
    ctx.beginPath(); ctx.arc(cam.x + Math.cos(cam.angle) * 3, cam.y + Math.sin(cam.angle) * 3, 1.5, 0, Math.PI * 2); ctx.fill();
    if (cam.detect > 0.4 && cam.disabled <= 0) {
      ctx.fillStyle = '#ff2e4d';
      ctx.beginPath(); ctx.arc(cam.x, cam.y - 12, 3 + Math.sin(t * 10) * 1, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = C.hudText;
    ctx.font = '9px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(cam.disabled > 0 ? 'OFF' : 'CAM', cam.x, cam.y - 13);
  }
  // ---- guard cones + bodies ----
  for (const g of world.guards) {
    const alert = g.detect > 0.4;
    drawCone(ctx, g.x, g.y, g.angle, g.visionHalfAngle, g.visionRange, '255,77,109', alert ? 0.42 : 0.22);
  }
  for (const g of world.guards) drawGuard(ctx, g, t);
  // ---- thief ----
  drawThief(ctx, world.thief, t);
  // ---- particles ----
  world.particles.draw(ctx);
  // ---- layered darkness + light pools ----
  if (world.status !== 'title') applyLighting(ctx, world);
  else {
    // title: dim the scene a little less so the museum shows through
    ctx.fillStyle = 'rgba(5,5,13,0.35)';
    ctx.fillRect(0, 0, W, H);
  }
  // ---- laser hit flash ----
  if (world.laserFlash > 0) {
    ctx.fillStyle = `rgba(255,46,77,${world.laserFlash * 0.35})`;
    ctx.fillRect(0, 0, W, H);
  }
  // ---- HUD top bar ----
  ctx.fillStyle = C.hudBg;
  ctx.fillRect(0, 0, W, 44);
  ctx.fillStyle = C.gold;
  ctx.fillRect(0, 44, W, 2);
  ctx.fillStyle = C.hudText;
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillStyle = C.goldBright;
  ctx.fillText(`LOOT ${world.lootTaken}/${world.loot.length}`, 16, 28);
  ctx.fillStyle = C.hudText;
  ctx.fillText(`$${world.score}`, 130, 28);
  ctx.fillText(`TIME ${Math.floor(world.time)}s`, 250, 28);
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText(`COINS ${world.thief.coins}  •  SMOKE ${world.thief.smoke} [1]  •  EMP ${world.thief.emp} [2]  •  SHOES ${world.thief.shoes} [3]`, 420, 28);
  // alarm meter
  const ax = 980, ay = 14, aw = 220, ah = 16;
  ctx.fillStyle = '#1a1a22';
  ctx.fillRect(ax, ay, aw, ah);
  const frac = world.alarm.value / 100;
  const ag = ctx.createLinearGradient(ax, ay, ax + aw, ay);
  ag.addColorStop(0, C.alarmLow);
  ag.addColorStop(0.5, C.alarmMid);
  ag.addColorStop(1, C.alarmHigh);
  ctx.fillStyle = ag;
  ctx.fillRect(ax, ay, aw * frac, ah);
  if (world.alarm.level === 'high') {
    ctx.save();
    ctx.shadowColor = C.alarmHigh; ctx.shadowBlur = 10;
    ctx.strokeStyle = C.alarmHigh; ctx.lineWidth = 1.5;
    ctx.strokeRect(ax, ay, aw, ah);
    ctx.restore();
  } else {
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1;
    ctx.strokeRect(ax, ay, aw, ah);
  }
  ctx.fillStyle = C.hudText;
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.fillText('ALARM', ax - 62, ay + 13);
  // objective line
  ctx.fillStyle = 'rgba(242,240,247,0.8)';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText(
    world.allLootTaken ? 'All loot taken — reach the GETAWAY door!' : 'Collect all 8 treasures, dodge cones, cameras and lasers, then escape.',
    16, 68,
  );
  // ---- status screens ----
  if (world.status === 'title') {
    const vg = ctx.createLinearGradient(0, 0, 0, H);
    vg.addColorStop(0, 'rgba(8,7,14,0.82)');
    vg.addColorStop(0.5, 'rgba(8,7,14,0.55)');
    vg.addColorStop(1, 'rgba(8,7,14,0.88)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);
    goldText(ctx, 'VELVET VAULT', W / 2, 132, 'bold 68px Georgia, serif');
    ctx.fillStyle = '#e8dcc0';
    ctx.font = 'italic 20px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('A museum heist — steal every treasure, outsmart the night shift.', W / 2, 172);
    drawVaultDoor(ctx, W / 2, 350, 82, titleT);
    // gems row under the vault door
    const gems = ['#3aa7ff', '#ff4d6d', '#2fd67a', '#ffb020', '#cfeeff'];
    gems.forEach((col, i) => {
      const gx = W / 2 - 96 + i * 48;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(gx, 452); ctx.lineTo(gx + 8, 460); ctx.lineTo(gx, 470); ctx.lineTo(gx - 8, 460);
      ctx.closePath(); ctx.fill();
    });
    ctx.fillStyle = C.goldBright;
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.fillText('8 TREASURES  •  $1,680  •  5 GUARDS  •  3 CAMERAS  •  LASER GRIDS', W / 2, 512);
    ctx.fillStyle = C.hudText;
    ctx.font = '16px system-ui, sans-serif';
    ctx.fillText('WASD / arrows — move    •    Click — throw a coin to distract a guard', W / 2, 548);
    ctx.fillText('1 — smoke bomb    2 — EMP (cameras off)    3 — silent shoes', W / 2, 576);
    ctx.fillStyle = 'rgba(244,211,94,0.85)';
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText('Time the lasers. Watch the cones. Don\'t let the alarm hit 100.', W / 2, 606);
    ctx.fillStyle = `rgba(255,209,102,${0.65 + 0.35 * Math.sin(titleT * 3)})`;
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillText('—  PRESS ENTER TO START  —', W / 2, 656);
  } else if (world.status === 'caught') {
    ctx.fillStyle = 'rgba(60,8,16,0.72)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#ff6b81';
    ctx.font = 'bold 56px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('CAUGHT!', W / 2, 290);
    ctx.fillStyle = C.hudText;
    ctx.font = '20px system-ui, sans-serif';
    ctx.fillText(`The alarm hit 100. Loot kept: $${world.score} — press R to try again.`, W / 2, 340);
    ctx.fillStyle = 'rgba(242,240,247,0.7)';
    ctx.font = '15px system-ui, sans-serif';
    ctx.fillText('Tip: throw a coin to pull a guard away, or smoke through a cone.', W / 2, 380);
  } else if (world.status === 'won') {
    ctx.fillStyle = 'rgba(6,40,28,0.78)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#06d6a0';
    ctx.font = 'bold 56px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('CLEAN GETAWAY!', W / 2, 250);
    // stars
    for (let i = 0; i < 3; i++) {
      const sx = W / 2 - 90 + i * 90;
      drawStar(ctx, sx, 320, 30, i < world.stars ? '#f4d35e' : 'rgba(255,255,255,0.18)');
      if (i < world.stars) {
        ctx.strokeStyle = '#8a6d1f'; ctx.lineWidth = 2;
        ctx.beginPath();
        for (let k = 0; k < 10; k++) {
          const a = -Math.PI / 2 + (k * Math.PI) / 5;
          const rr = k % 2 === 0 ? 30 : 13.5;
          const x = sx + Math.cos(a) * rr, y = 320 + Math.sin(a) * rr;
          if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath(); ctx.stroke();
      }
    }
    ctx.fillStyle = C.hudText;
    ctx.font = '20px system-ui, sans-serif';
    ctx.fillText(`All loot secured: $${world.score}  •  ${Math.floor(world.time)}s  •  alarm peak ${Math.floor(world.alarmPeak)}`, W / 2, 400);
    ctx.fillStyle = 'rgba(242,240,247,0.75)';
    ctx.font = '16px system-ui, sans-serif';
    ctx.fillText(
      world.stars === 3 ? 'Flawless — the perfect heist.' : world.stars === 2 ? 'Smooth job — one more star was in reach.' : 'Made it out — but the museum noticed.',
      W / 2, 436,
    );
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillText('Press R to play again', W / 2, 486);
  }
  ctx.textAlign = 'left';
}
