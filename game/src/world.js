// VELVET VAULT — game state. One job: own every entity, run the update, decide win/lose.
import { CONFIG } from './config.js';
import { LEVEL } from './level.js';
import { Thief } from './thief.js';
import { Guard } from './guard.js';
import { Camera } from './camera.js';
import { Alarm } from './alarm.js';
import { AudioFX } from './audio.js';
import { dist } from './geom.js';
export class World {
  constructor() { this.reset(); }
  reset() {
    this.thief = new Thief(LEVEL.thiefStart);
    this.guards = LEVEL.guards.map((g) => new Guard(g));
    this.cameras = LEVEL.cameras.map((c) => new Camera(c));
    this.loot = LEVEL.loot.map((l) => ({ ...l, taken: false }));
    this.alarm = new Alarm();
    this.coins = []; // {x, y, t} landed coins guards investigate
    this.smokes = []; // {x, y, t}
    this.status = 'title'; // title | playing | caught | won
    this.time = 0;
    this.score = 0;
    this.lootTaken = 0;
    this.spotted = { guard: false, camera: false };
  }
  get allLootTaken() { return this.lootTaken >= this.loot.length; }
  update(dt, input) {
    if (this.status === 'title') {
      if (input.consumePressed('enter')) { this.status = 'playing'; AudioFX.ensure(); }
      return;
    }
    if (this.status === 'caught' || this.status === 'won') {
      if (input.consumePressed('r')) this.reset();
      return;
    }
    // playing
    this.time += dt;
    AudioFX.ensure();
    this.thief.update(dt, input, LEVEL.walls);
    const coin = this.thief.throwCoin(input);
    if (coin) { coin.landed = true; coin.t = 4; this.coins.push(coin); AudioFX.coin(); }
    const smoke = this.thief.useSmoke(input);
    if (smoke) this.smokes.push(smoke);
    const emp = this.thief.useEmp(input);
    if (emp > 0) for (const c of this.cameras) c.disabled = emp;
    this.thief.useShoes(input);
    // guards + cameras
    let guardSees = false, cameraSees = false;
    for (const g of this.guards) if (g.update(dt, this.thief, LEVEL.walls, this.smokes, this.coins)) guardSees = true;
    for (const c of this.cameras) if (c.update(dt, this.thief, LEVEL.walls, this.smokes)) cameraSees = true;
    this.spotted = { guard: guardSees, camera: cameraSees };
    if ((guardSees || cameraSees) && this.alarm.value > 60) AudioFX.alarm();
    this.alarm.update(dt, this.spotted);
    if (this.alarm.caught) { this.status = 'caught'; AudioFX.caught(); return; }
    // coins + smoke expire
    for (const c of this.coins) c.t -= dt;
    this.coins = this.coins.filter((c) => c.t > 0);
    for (const s of this.smokes) s.t -= dt;
    this.smokes = this.smokes.filter((s) => s.t > 0);
    // loot pickup
    for (const l of this.loot) {
      if (!l.taken && dist(this.thief.x, this.thief.y, l.x, l.y) < 30) {
        l.taken = true; this.lootTaken += 1; this.score += l.value; AudioFX.pickup();
      }
    }
    // getaway: all loot, then touch the exit
    if (this.allLootTaken) {
      const e = LEVEL.exit;
      if (this.thief.x > e.x - 6 && this.thief.x < e.x + e.w + 6 && this.thief.y > e.y - 6 && this.thief.y < e.y + e.h + 6) {
        this.status = 'won'; AudioFX.win();
      }
    }
  }
}
