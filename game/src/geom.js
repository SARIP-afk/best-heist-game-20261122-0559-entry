// VELVET VAULT — geometry helpers. One job: circles vs walls, sight lines.
export function circleHitsWall(x, y, r, walls) {
  for (const w of walls) {
    const cx = Math.max(w.x, Math.min(x, w.x + w.w));
    const cy = Math.max(w.y, Math.min(y, w.y + w.h));
    if ((x - cx) ** 2 + (y - cy) ** 2 < r * r) return true;
  }
  return false;
}
// Move a circle axis by axis so it slides along walls instead of sticking.
export function moveCircle(pos, dx, dy, r, walls) {
  const nx = pos.x + dx;
  if (!circleHitsWall(nx, pos.y, r, walls)) pos.x = nx;
  const ny = pos.y + dy;
  if (!circleHitsWall(pos.x, ny, r, walls)) pos.y = ny;
}
function segHitsRect(x1, y1, x2, y2, w) {
  // Liang-Barsky: does segment (x1,y1)-(x2,y2) cross rect w?
  const dx = x2 - x1, dy = y2 - y1;
  let t0 = 0, t1 = 1;
  const p = [-dx, dx, -dy, dy];
  const q = [x1 - w.x, w.x + w.w - x1, y1 - w.y, w.y + w.h - y1];
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) { if (q[i] < 0) return false; }
    else {
      const t = q[i] / p[i];
      if (p[i] < 0) { if (t > t1) return false; if (t > t0) t0 = t; }
      else { if (t < t0) return false; if (t < t1) t1 = t; }
    }
  }
  return true;
}
export function hasLineOfSight(x1, y1, x2, y2, walls) {
  for (const w of walls) if (segHitsRect(x1, y1, x2, y2, w)) return false;
  return true;
}
export function angleTo(ax, ay, bx, by) { return Math.atan2(by - ay, bx - ax); }
export function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}
export function dist(ax, ay, bx, by) { return Math.hypot(bx - ax, by - ay); }
