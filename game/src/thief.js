// VELVET VAULT — the thief. One job: move, throw coins, use tools.
import { CONFIG } from './config.js';
import { moveCircle } from './geom.js';
export class Thief {
  constructor(start) {
    this.x = start.x; this.y = start.y;
    this.r = CONFIG.thiefRadius;
    this.coins = CONFIG.coinsStart;
    this.smoke = CONFIG.smokeStart;
    this.emp = CONFIG.empStart;
    this.shoes = CONFIG.shoesStart;
    this.shoesTimer = 0;
    this.facing = -Math.PI / 2;
  }
  get speed() { return this.shoesTimer > 0 ? CONFIG.shoesSpeed : CONFIG.thiefSpeed; }
  update(dt, input, walls) {
    const a = input.axis();
    if (a.x || a.y) this.facing = Math.atan2(a.y, a.x);
    moveCircle(this, a.x * this.speed * dt, a.y * this.speed * dt, this.r, walls);
    if (this.shoesTimer > 0) this.shoesTimer -= dt;
  }
  // Returns a coin target {x,y} when the player clicks and has coins left.
  throwCoin(input) {
    const c = input.consumeClick();
    if (!c || this.coins <= 0) return null;
    this.coins -= 1;
    return { x: c.x, y: c.y, t: 0 };
  }
  useSmoke(input) {
    if (input.consumePressed('1') && this.smoke > 0) {
      this.smoke -= 1;
      return { x: this.x, y: this.y, t: CONFIG.smokeDuration };
    }
    return null;
  }
  useEmp(input) {
    if (input.consumePressed('2') && this.emp > 0) {
      this.emp -= 1;
      return CONFIG.empDuration;
    }
    return 0;
  }
  useShoes(input) {
    if (input.consumePressed('3') && this.shoes > 0 && this.shoesTimer <= 0) {
      this.shoes -= 1;
      this.shoesTimer = CONFIG.shoesDuration;
      return true;
    }
    return false;
  }
}
