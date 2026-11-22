// VELVET VAULT — the museum floor. One job: walls, loot, patrols, cameras, lasers, decor.
// v2: four galleries (West / Central Hall / East / North Vault alcove), 5 guards,
// 8 loot ($1,680), 3 cameras, 3 timed laser grids, framed paintings, velvet ropes.
export const LEVEL = {
  // border + interior cover. {x, y, w, h} in pixels.
  walls: [
    { x: 0, y: 0, w: 1280, h: 20 }, // top
    { x: 0, y: 700, w: 1280, h: 20 }, // bottom
    { x: 0, y: 0, w: 20, h: 720 }, // left
    { x: 1260, y: 0, w: 20, h: 720 }, // right
    // west / central divider, door gap y 300..400
    { x: 420, y: 20, w: 24, h: 280 },
    { x: 420, y: 400, w: 24, h: 300 },
    // central / east divider, door gap y 240..360
    { x: 860, y: 20, w: 24, h: 220 },
    { x: 860, y: 360, w: 24, h: 340 },
    // north vault alcove (opening at the bottom, y 210)
    { x: 560, y: 90, w: 24, h: 120 },
    { x: 736, y: 90, w: 24, h: 120 },
    { x: 560, y: 90, w: 200, h: 24 }, // alcove roof
    // display case + pillars (solid)
    { x: 800, y: 150, w: 80, h: 80 }, // display case
    { x: 200, y: 500, w: 60, h: 60 }, // pillar
    { x: 1040, y: 480, w: 60, h: 60 }, // pillar
  ],
  // loot: id, kind, label, x, y, value, color, dark. The vault core is the big prize.
  loot: [
    { id: 'gem-blue', kind: 'gem', label: 'Sapphire', x: 120, y: 120, value: 100, color: '#3aa7ff', dark: '#1c5fa8' },
    { id: 'gem-red', kind: 'gem', label: 'Ruby', x: 1140, y: 120, value: 150, color: '#ff4d6d', dark: '#a81e3c' },
    { id: 'painting', kind: 'painting', label: 'Portrait', x: 640, y: 300, value: 300, color: '#e8b64c', dark: '#8a6d1f' },
    { id: 'gem-green', kind: 'gem', label: 'Emerald', x: 180, y: 620, value: 120, color: '#2fd67a', dark: '#0f7a42' },
    { id: 'vault', kind: 'gem', label: 'Velvet Diamond', x: 660, y: 140, value: 500, color: '#cfeeff', dark: '#5a8fb0' },
    { id: 'gem-amber', kind: 'gem', label: 'Topaz', x: 1120, y: 620, value: 80, color: '#ffb020', dark: '#a86a00' },
    { id: 'crown', kind: 'crown', label: 'Golden Crown', x: 300, y: 380, value: 250, color: '#ffd166', dark: '#a87f1f' },
    { id: 'mask', kind: 'mask', label: 'Jade Mask', x: 980, y: 300, value: 180, color: '#39d0a5', dark: '#0d6e55' },
  ],
  // guards: name, kind, patrol loop. Variety: heavy (slow, tough vision),
  // elite (fast, sharp), roamer (crosses galleries through the door gaps).
  guards: [
    { name: 'Marco', kind: 'patrol', waypoints: [[120, 200], [360, 200], [360, 600], [120, 600]] },
    { name: 'Lena', kind: 'patrol', waypoints: [[920, 200], [1180, 200], [1180, 600], [920, 600]] },
    { name: 'Otto', kind: 'heavy', radius: 15, patrolSpeed: 55, chaseSpeed: 115, visionRange: 200, detectRate: 1.1, waypoints: [[500, 450], [800, 450], [800, 640], [500, 640]] },
    { name: 'Rosa', kind: 'elite', patrolSpeed: 85, chaseSpeed: 148, visionRange: 255, detectRate: 1.7, waypoints: [[500, 280], [780, 280], [780, 420], [500, 420]] },
    { name: 'Felix', kind: 'roamer', patrolSpeed: 95, chaseSpeed: 152, visionRange: 200, visionHalfAngle: 0.5, waypoints: [[300, 350], [640, 350], [980, 350]] },
  ],
  // cameras: mounted on a wall, sweeping around baseAngle.
  cameras: [
    { name: 'Cam A', x: 640, y: 24, baseAngle: Math.PI / 2 },
    { name: 'Cam B', x: 1256, y: 360, baseAngle: Math.PI },
    { name: 'Cam C', x: 24, y: 360, baseAngle: 0 },
  ],
  // lasers: timed beams. {x1,y1,x2,y2, period s, onTime s, phase s}
  lasers: [
    { x1: 560, y1: 210, x2: 760, y2: 210, period: 3.0, onTime: 1.8, phase: 0 }, // vault mouth
    { x1: 872, y1: 250, x2: 872, y2: 350, period: 2.4, onTime: 1.4, phase: 1.2 }, // east door
    { x1: 480, y1: 560, x2: 820, y2: 560, period: 3.6, onTime: 2.0, phase: 0.6 }, // south hall
  ],
  // decor (visual only, never blocks movement)
  decor: {
    carpets: [
      { x: 560, y: 20, w: 160, h: 660 }, // central runner
      { x: 60, y: 330, w: 320, h: 80 }, // west runner
      { x: 900, y: 330, w: 320, h: 80 }, // east runner
    ],
    paintings: [
      { x: 150, y: 52, w: 96, h: 66, art: 'landscape' },
      { x: 450, y: 52, w: 96, h: 66, art: 'portrait' },
      { x: 950, y: 52, w: 96, h: 66, art: 'abstract' },
      { x: 26, y: 150, w: 66, h: 96, art: 'portrait' },
      { x: 26, y: 430, w: 66, h: 96, art: 'landscape' },
      { x: 1188, y: 150, w: 66, h: 96, art: 'abstract' },
      { x: 1188, y: 430, w: 66, h: 96, art: 'landscape' },
    ],
    cases: [ // glass display pedestals with a tiny gem inside
      { x: 70, y: 300 },
      { x: 1210, y: 300 },
    ],
    ropes: [ // velvet rope in front of the big pieces (posts + sagging rope)
      { x1: 596, y1: 344, x2: 684, y2: 344 },
      { x1: 256, y1: 424, x2: 344, y2: 424 },
      { x1: 936, y1: 344, x2: 1024, y2: 344 },
    ],
    sconces: [ // wall lights (also light pools in the dark)
      { x: 300, y: 24 },
      { x: 640, y: 24 },
      { x: 980, y: 24 },
      { x: 24, y: 360 },
      { x: 1256, y: 360 },
    ],
  },
  exit: { x: 1180, y: 640, w: 64, h: 48, label: 'GETAWAY' },
  thiefStart: { x: 80, y: 640 },
};
