// VELVET VAULT — game state. One job: own every entity, run the update, decide win/lose.
// v2: lasers, particles, alarm peak + 1-3 star rating on win, ambient dust motes.
import { CONFIG } from './config.js';
import { LEVEL } from './level.js';
import { Thief } from './thief.js';
import { Guard } from './guard.js';
import { Camera } from './camera.js';
import { Laser } from './laser.js';
import { Particles } from './particles.js';
import { Alarm } from './alarm.js';
import { AudioFX } from './audio.js';
import { dist } from './geom.js';
export class World {
  constructor() { this.reset(); }
  reset() {
    this.thief = new Thief(LEVEL.thiefStart);
    this.guards = LEVEL.guards.map((g) => new Guard(g));
    this.cameras = LEVEL.cameras.map((c) => new Camera(c));
    this.lasers = LEVEL.lasers.map((l) => new Laser(l));
    this.particles = new Particles();
    this.loot = LEVEL.loot.map((l) => ({ ...l, taken: false }));
    this.alarm = new Alarm();
    this.coins = []; // {x, y, t} landed coins guards investigate
    this.smokes = []; // {x, y, t}
    this.status = 'title'; // title | playing | caught | won
    this.time = 0;
    this.score = 0;
    this.lootTaken = 0;
    this.spotted = { guard: false, camera: false };
    this.alarmPeak = 0;
    this.stars = 0;
    this.laserFlash = 0; // red flash timer after a laser hit
    this.dustTimer = 0;
  }
  get allLootTaken() { return this.lootTaken >= this.loot.length; }
  computeStars() {
    const t = this.time, p = this.alarmPeak;
    if (t <= CONFIG.stars3.time && p <= CONFIG.stars3.alarmPeak) return 3;
    if (t <= CONFIG.stars2.time && p <= CONFIG.stars2.alarmPeak) return 2;
    return 1;
  }
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
    if (smoke) { this.smokes.push(smoke); this.particles.smoke(smoke.x, smoke.y); }
    const emp = this.thief.useEmp(input);
    if (emp > 0) for (const c of this.cameras) c.disabled = emp;
    this.thief.useShoes(input);
    // guards + cameras + lasers
    let guardSees = false, cameraSees = false;
    for (const g of this.guards) if (g.update(dt, this.thief, LEVEL.walls, this.smokes, this.coins)) guardSees = true;
    for (const c of this.cameras) if (c.update(dt, this.thief, LEVEL.walls, this.smokes)) cameraSees = true;
    for (const l of this.lasers) {
      l.update(dt);
      if (l.hits(this.thief.x, this.thief.y, this.thief.r) && l.cooldown <= 0) {
        l.cooldown = CONFIG.laserHitCooldown;
        this.alarm.value = Math.min(CONFIG.alarmCaught, this.alarm.value + CONFIG.laserHitAlarm);
        this.laserFlash = 0.5;
        this.particles.burst(this.thief.x, this.thief.y, '#ff2e4d', 16, 120);
        AudioFX.laser();
      }
    }
    if (this.laserFlash > 0) this.laserFlash -= dt;
    this.spotted = { guard: guardSees, camera: cameraSees };
    if ((guardSees || cameraSees) && this.alarm.value > 60) AudioFX.alarm();
    this.alarm.update(dt, this.spotted);
    this.alarmPeak = Math.max(this.alarmPeak, this.alarm.value);
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
        this.particles.burst(l.x, l.y, l.color, 18, 110);
        this.particles.ring(l.x, l.y, '#f4d35e');
      }
    }
    // ambient dust motes drifting in the dark
    this.dustTimer -= dt;
    if (this.dustTimer <= 0) {
      this.dustTimer = 0.35;
      this.particles.dust(30 + Math.random() * 1220, 50 + Math.random() * 640);
    }
    this.particles.update(dt);
    // getaway: all loot, then touch the exit
    if (this.allLootTaken) {
      const e = LEVEL.exit;
      if (this.thief.x > e.x - 6 && this.thief.x < e.x + e.w + 6 && this.thief.y > e.y - 6 && this.thief.y < e.y + e.h + 6) {
        this.status = 'won';
        this.stars = this.computeStars();
        AudioFX.win();
      }
    }
  }
}
