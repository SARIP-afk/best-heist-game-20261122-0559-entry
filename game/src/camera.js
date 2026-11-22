// VELVET VAULT — wall cameras. One job: sweep a cone, spot the thief.
import { CONFIG } from './config.js';
import { hasLineOfSight, angleTo, angleDiff, dist } from './geom.js';
export class Camera {
  constructor(def) {
    this.name = def.name;
    this.x = def.x; this.y = def.y;
    this.baseAngle = def.baseAngle;
    this.angle = def.baseAngle;
    this.sweepT = Math.random() * 6;
    this.disabled = 0; // seconds left of EMP
    this.detect = 0;
  }
  canSee(tx, ty, walls, smokes) {
    if (this.disabled > 0) return false;
    const d = dist(this.x, this.y, tx, ty);
    if (d > CONFIG.cameraRange) return false;
    if (Math.abs(angleDiff(angleTo(this.x, this.y, tx, ty), this.angle)) > CONFIG.cameraHalfAngle) return false;
    if (!hasLineOfSight(this.x, this.y, tx, ty, walls)) return false;
    for (const s of smokes) {
      const mx = (this.x + tx) / 2, my = (this.y + ty) / 2;
      if (dist(mx, my, s.x, s.y) < CONFIG.smokeRadius) return false;
    }
    return true;
  }
  update(dt, thief, walls, smokes) {
    if (this.disabled > 0) this.disabled -= dt;
    this.sweepT += dt;
    this.angle = this.baseAngle + Math.sin(this.sweepT * CONFIG.cameraSweepSpeed) * CONFIG.cameraSweepArc;
    const sees = this.canSee(thief.x, thief.y, walls, smokes);
    this.detect = sees
      ? Math.min(1, this.detect + CONFIG.cameraDetectRate * dt)
      : Math.max(0, this.detect - CONFIG.guardForgetRate * dt);
    return sees;
  }
}
