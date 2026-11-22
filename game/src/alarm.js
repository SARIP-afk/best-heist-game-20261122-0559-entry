// VELVET VAULT — the alarm meter. One job: 0..100, rises when spotted, decays hidden.
import { CONFIG } from './config.js';
export class Alarm {
  constructor() { this.value = 0; }
  update(dt, spotted) {
    if (spotted.guard) this.value += CONFIG.alarmGuardRate * dt;
    if (spotted.camera) this.value += CONFIG.alarmCameraRate * dt;
    if (!spotted.guard && !spotted.camera) this.value -= CONFIG.alarmDecay * dt;
    this.value = Math.max(0, Math.min(CONFIG.alarmCaught, this.value));
  }
  get caught() { return this.value >= CONFIG.alarmCaught; }
  get level() {
    if (this.value < 35) return 'low';
    if (this.value < 70) return 'mid';
    return 'high';
  }
}
