// VELVET VAULT — timed laser grids. One job: beams that arm and disarm on a cycle.
// v2: crossing an armed beam spikes the alarm. Emitters sit at both ends.
import { dist } from './geom.js';
export class Laser {
  constructor(def) {
    this.x1 = def.x1; this.y1 = def.y1;
    this.x2 = def.x2; this.y2 = def.y2;
    this.period = def.period;
    this.onTime = def.onTime;
    this.t = def.phase || 0;
    this.active = false;
    this.cooldown = 0; // seconds before this beam can spike the alarm again
  }
  update(dt) {
    this.t += dt;
    this.active = (this.t % this.period) < this.onTime;
    if (this.cooldown > 0) this.cooldown -= dt;
  }
  // Is point (x,y) with radius r touching an ARMED beam?
  hits(x, y, r) {
    if (!this.active) return false;
    const dx = this.x2 - this.x1, dy = this.y2 - this.y1;
    const len2 = dx * dx + dy * dy;
    let tt = ((x - this.x1) * dx + (y - this.y1) * dy) / len2;
    tt = Math.max(0, Math.min(1, tt));
    const px = this.x1 + tt * dx, py = this.y1 + tt * dy;
    return dist(x, y, px, py) < r + 4;
  }
}
