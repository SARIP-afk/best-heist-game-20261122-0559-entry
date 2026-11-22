// VELVET VAULT — keyboard + mouse. One job: what the player is pressing.
export const Input = {
  keys: new Set(),
  mouse: { x: 0, y: 0, clicked: false, clickX: 0, clickY: 0 },
  pressed: new Set(), // keys pressed since last consume (edge-triggered tools)
  init(canvas) {
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
      if (!e.repeat) this.pressed.add(e.key.toLowerCase());
      this.keys.add(e.key.toLowerCase());
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
    canvas.addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect();
      this.mouse.x = (e.clientX - r.left) * (canvas.width / r.width);
      this.mouse.y = (e.clientY - r.top) * (canvas.height / r.height);
    });
    canvas.addEventListener('mousedown', (e) => {
      const r = canvas.getBoundingClientRect();
      this.mouse.clickX = (e.clientX - r.left) * (canvas.width / r.width);
      this.mouse.clickY = (e.clientY - r.top) * (canvas.height / r.height);
      this.mouse.clicked = true;
    });
  },
  axis() {
    let x = 0, y = 0;
    if (this.keys.has('a') || this.keys.has('arrowleft')) x -= 1;
    if (this.keys.has('d') || this.keys.has('arrowright')) x += 1;
    if (this.keys.has('w') || this.keys.has('arrowup')) y -= 1;
    if (this.keys.has('s') || this.keys.has('arrowdown')) y += 1;
    if (x && y) { x *= Math.SQRT1_2; y *= Math.SQRT1_2; }
    return { x, y };
  },
  consumePressed(key) {
    const k = key.toLowerCase();
    if (this.pressed.has(k)) { this.pressed.delete(k); return true; }
    return false;
  },
  consumeClick() {
    if (this.mouse.clicked) { this.mouse.clicked = false; return { x: this.mouse.clickX, y: this.mouse.clickY }; }
    return null;
  },
  clearPressed() { this.pressed.clear(); },
};
