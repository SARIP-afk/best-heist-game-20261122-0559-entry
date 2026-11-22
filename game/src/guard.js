// VELVET VAULT — museum guards. One job: patrol, see, chase, investigate.
// v2: per-guard variety — heavy (slow, wide), elite (fast, sharp eyes),
// roamer (crosses galleries). Speed / vision / detection come from the level def.
import { CONFIG } from './config.js';
import { moveCircle, hasLineOfSight, angleTo, angleDiff, dist } from './geom.js';
export class Guard {
  constructor(def) {
    this.name = def.name;
    this.kind = def.kind || 'patrol';
    this.waypoints = def.waypoints;
    this.wp = 0;
    this.x = def.waypoints[0][0]; this.y = def.waypoints[0][1];
    this.r = def.radius || CONFIG.guardRadius;
    this.patrolSpeed = def.patrolSpeed || CONFIG.guardPatrolSpeed;
    this.chaseSpeed = def.chaseSpeed || CONFIG.guardChaseSpeed;
    this.visionRange = def.visionRange || CONFIG.guardVisionRange;
    this.visionHalfAngle = def.visionHalfAngle || CONFIG.guardVisionHalfAngle;
    this.detectRate = def.detectRate || CONFIG.guardDetectRate;
    this.angle = 0;
    this.state = 'patrol'; // patrol | investigate | chase
    this.detect = 0; // 0..1, how sure the guard is
    this.target = null; // {x,y} to investigate
    this.investigateTimer = 0;
    this.lastSeen = null;
    this.walkPhase = Math.random() * 6; // bob while walking
  }
  // Can this guard see point (tx,ty)? Cone + range + line of sight + smoke.
  canSee(tx, ty, walls, smokes) {
    const d = dist(this.x, this.y, tx, ty);
    if (d > this.visionRange) return false;
    if (Math.abs(angleDiff(angleTo(this.x, this.y, tx, ty), this.angle)) > this.visionHalfAngle) return false;
    if (!hasLineOfSight(this.x, this.y, tx, ty, walls)) return false;
    for (const s of smokes) {
      // a smoke cloud between guard and target blocks the view
      const mx = (this.x + tx) / 2, my = (this.y + ty) / 2;
      if (dist(mx, my, s.x, s.y) < CONFIG.smokeRadius) return false;
    }
    return true;
  }
  update(dt, thief, walls, smokes, coins) {
    const sees = this.canSee(thief.x, thief.y, walls, smokes);
    if (sees) {
      this.detect = Math.min(1, this.detect + this.detectRate * dt);
      this.lastSeen = { x: thief.x, y: thief.y };
    } else {
      this.detect = Math.max(0, this.detect - CONFIG.guardForgetRate * dt);
    }
    // A landed coin pulls a nearby guard to investigate it.
    for (const c of coins) {
      if (c.landed && dist(this.x, this.y, c.x, c.y) < CONFIG.coinRadius && this.state !== 'chase') {
        this.state = 'investigate';
        this.target = { x: c.x, y: c.y };
        this.investigateTimer = CONFIG.guardInvestigateTime;
      }
    }
    if (this.detect > 0.65) this.state = 'chase';
    else if (this.state === 'chase' && this.detect < 0.15) this.state = 'patrol';
    const speed = this.state === 'chase' ? this.chaseSpeed : this.patrolSpeed;
    let tx, ty;
    if (this.state === 'chase' && this.lastSeen) { tx = this.lastSeen.x; ty = this.lastSeen.y; }
    else if (this.state === 'investigate' && this.target) {
      tx = this.target.x; ty = this.target.y;
      this.investigateTimer -= dt;
      if (this.investigateTimer <= 0) { this.state = 'patrol'; this.target = null; }
    } else {
      const wp = this.waypoints[this.wp];
      tx = wp[0]; ty = wp[1];
      if (dist(this.x, this.y, tx, ty) < 8) this.wp = (this.wp + 1) % this.waypoints.length;
    }
    const a = angleTo(this.x, this.y, tx, ty);
    this.angle = a;
    const ox = this.x, oy = this.y;
    moveCircle(this, Math.cos(a) * speed * dt, Math.sin(a) * speed * dt, this.r, walls);
    if (Math.hypot(this.x - ox, this.y - oy) > 0.01) this.walkPhase += dt * 9;
    return sees;
  }
}
