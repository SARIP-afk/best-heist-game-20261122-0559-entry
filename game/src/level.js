// VELVET VAULT — the museum floor. One job: walls, loot, patrols, cameras, exit.
export const LEVEL = {
  // border + interior cover. {x, y, w, h} in pixels.
  walls: [
    { x: 0, y: 0, w: 1280, h: 20 }, // top
    { x: 0, y: 700, w: 1280, h: 20 }, // bottom
    { x: 0, y: 0, w: 20, h: 720 }, // left
    { x: 1260, y: 0, w: 20, h: 720 }, // right
    { x: 420, y: 120, w: 24, h: 300 }, // west gallery wall
    { x: 640, y: 360, w: 360, h: 24 }, // south hall wall
    { x: 800, y: 150, w: 80, h: 80 }, // display case
    { x: 200, y: 500, w: 60, h: 60 }, // pillar
    { x: 980, y: 470, w: 24, h: 160 }, // east wing wall
    { x: 560, y: 90, w: 160, h: 24 }, // north alcove
  ],
  // loot: id, label, x, y, value. The vault core is the big prize.
  loot: [
    { id: 'gem-blue', label: 'Sapphire', x: 120, y: 120, value: 100 },
    { id: 'gem-red', label: 'Ruby', x: 1140, y: 120, value: 150 },
    { id: 'painting', label: 'Portrait', x: 640, y: 210, value: 300 },
    { id: 'gem-green', label: 'Emerald', x: 180, y: 620, value: 120 },
    { id: 'vault', label: 'Velvet Diamond', x: 640, y: 90, value: 500 },
  ],
  // guards: name, patrol loop of waypoints.
  guards: [
    { name: 'Marco', waypoints: [[300, 200], [560, 200], [560, 470], [300, 470]] },
    { name: 'Lena', waypoints: [[900, 300], [1150, 300], [1150, 600], [900, 600]] },
    { name: 'Otto', waypoints: [[640, 500], [640, 640], [300, 640], [300, 500]] },
  ],
  // cameras: mounted on a wall, sweeping around baseAngle.
  cameras: [
    { name: 'Cam A', x: 640, y: 24, baseAngle: Math.PI / 2 },
    { name: 'Cam B', x: 1256, y: 360, baseAngle: Math.PI },
  ],
  exit: { x: 1180, y: 640, w: 64, h: 48, label: 'GETAWAY' },
  thiefStart: { x: 80, y: 640 },
};
