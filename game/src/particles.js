// VELVET VAULT — particles. One job: sparkles, smoke puffs, dust motes.
// v2: pickup sparkle bursts, coin glints, smoke clouds, ambient dust in the dark.
export class Particles {
  constructor() { this.list = []; }
  burst(x, y, color, n = 14, speed = 90) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = speed * (0.4 + Math.random() * 0.8);
      this.list.push({
        type: 'spark', x, y,
        vx: Math.cos(a) * v, vy: Math.sin(a) * v - 30,
        t: 0, life: 0.5 + Math.random() * 0.4,
        size: 2 + Math.random() * 3, color,
      });
    }
  }
  ring(x, y, color) {
    this.list.push({ type: 'ring', x, y, vx: 0, vy: 0, t: 0, life: 0.45, size: 6, color });
  }
  smoke(x, y) {
    for (let i = 0; i < 7; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = Math.random() * 26;
      this.list.push({
        type: 'puff', x: x + Math.cos(a) * d, y: y + Math.sin(a) * d,
        vx: Math.cos(a) * 12, vy: Math.sin(a) * 12 - 6,
        t: 0, life: 0.9 + Math.random() * 0.5,
        size: 14 + Math.random() * 18, color: '200,200,214',
      });
    }
  }
  dust(x, y) {
    this.list.push({
      type: 'dust', x, y,
      vx: (Math.random() - 0.5) * 6, vy: -4 - Math.random() * 6,
      t: 0, life: 2.5 + Math.random() * 2,
      size: 1 + Math.random() * 1.4, color: '255,240,200',
    });
  }
  update(dt) {
    for (const p of this.list) {
      p.t += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.type === 'spark') { p.vy += 160 * dt; p.vx *= 0.98; }
      if (p.type === 'puff') { p.size += 22 * dt; }
    }
    this.list = this.list.filter((p) => p.t < p.life);
  }
  draw(ctx) {
    for (const p of this.list) {
      const f = 1 - p.t / p.life; // 1 -> 0 fade
      if (p.type === 'spark') {
        ctx.save();
        ctx.globalAlpha = f;
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.t * 6);
        const s = p.size * (0.5 + f * 0.5);
        ctx.fillRect(-s, -s * 0.28, s * 2, s * 0.56);
        ctx.fillRect(-s * 0.28, -s, s * 0.56, s * 2);
        ctx.restore();
      } else if (p.type === 'ring') {
        ctx.save();
        ctx.globalAlpha = f * 0.9;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size + (1 - f) * 46, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      } else if (p.type === 'puff') {
        ctx.save();
        ctx.globalAlpha = f * 0.32;
        ctx.fillStyle = `rgb(${p.color})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (p.type === 'dust') {
        ctx.save();
        ctx.globalAlpha = f * 0.5;
        ctx.fillStyle = `rgb(${p.color})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }
}
