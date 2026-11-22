// VELVET VAULT — procedural WebAudio bleeps. One job: tiny sounds, no files.
export const AudioFX = {
  ctx: null,
  enabled: true,
  ensure() {
    if (!this.ctx) {
      try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { this.ctx = null; }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },
  blip(freq, dur = 0.08, type = 'sine', gain = 0.05) {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.ctx.destination);
    o.start(t); o.stop(t + dur);
  },
  pickup() { this.blip(880, 0.09, 'sine', 0.06); setTimeout(() => this.blip(1320, 0.12, 'sine', 0.05), 70); },
  coin() { this.blip(1568, 0.05, 'triangle', 0.04); },
  laser() { this.blip(180, 0.22, 'sawtooth', 0.07); setTimeout(() => this.blip(140, 0.2, 'sawtooth', 0.06), 90); },
  alarm() { this.blip(220, 0.18, 'square', 0.04); },
  caught() { this.blip(110, 0.4, 'sawtooth', 0.06); setTimeout(() => this.blip(82, 0.5, 'sawtooth', 0.06), 180); },
  win() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.blip(f, 0.16, 'sine', 0.06), i * 110)); },
};
