// VELVET VAULT — bootstrap + game loop. One job: run the world at 60fps.
import { CONFIG } from './config.js';
import { World } from './world.js';
import { Input } from './input.js';
import { render } from './render.js';
const canvas = document.getElementById('game');
canvas.width = CONFIG.canvasW;
canvas.height = CONFIG.canvasH;
const ctx = canvas.getContext('2d');
const world = new World();
window.__vv = world; // debug/test handle: lets headless tests stage states + screenshots
Input.init(canvas);
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  world.update(dt, Input);
  render(ctx, world);
  Input.clearPressed();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
