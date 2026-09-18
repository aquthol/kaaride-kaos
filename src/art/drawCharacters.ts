import Phaser from 'phaser';
import { PALETTE as P } from '../config/palette';
import type { HairStyle } from '../types';
import { TEX, hairBackKey, hairFrontKey, hairRearKey } from './textureKeys';
import { circle, makeTexture, poly, rrect } from './textureUtil';

type G = Phaser.GameObjects.Graphics;

// Tintable parts are drawn in white/grey so `setTint` gives the final color.
const HAIR = 0xffffff;
const HAIR_SHADE = 0xd2d2d2;
const HAIR_LINE = 0x8c8c8c;
const TINT_LINE = 0x9a9a9a;

/** Hair textures are 60x60 with the head center at (30, 30). */
const HAIR_SIZE = 60;
const C = 30;

function cap(g: G, fringe: [number, number][]): void {
  const pts: [number, number][] = [];
  for (let i = 0; i <= 18; i++) {
    const a = Math.PI + (i / 18) * Math.PI;
    pts.push([C + Math.cos(a) * 18, C + 1 + Math.sin(a) * 18]);
  }
  pts.push(...fringe);
  poly(g, pts, HAIR, HAIR_LINE, 2);
  g.fillStyle(0xffffff, 0.5);
  g.fillEllipse(24, 18, 12, 5);
}

const FRINGE_DEFAULT: [number, number][] = [
  [48, 31],
  [44, 24],
  [38, 27],
  [32, 21],
  [26, 26],
  [19, 22],
  [12, 31],
];

function puffs(g: G, circles: [number, number, number][], fill = HAIR): void {
  for (const [x, y, r] of circles) circle(g, x, y, r, fill, HAIR_LINE, 2);
  for (const [x, y, r] of circles) {
    g.fillStyle(fill, 1);
    g.fillCircle(x, y, r - 1.2);
  }
}

function arcPuffs(radius: number, count: number, puffR: number, from = Math.PI, to = Math.PI * 2) {
  const out: [number, number, number][] = [];
  for (let i = 0; i < count; i++) {
    const a = from + (i / (count - 1)) * (to - from);
    out.push([C + Math.cos(a) * radius, C + Math.sin(a) * radius, puffR]);
  }
  return out;
}

interface HairDrawers {
  front?: (g: G) => void;
  back?: (g: G) => void;
  rearExtra?: (g: G) => void;
}

const HAIR_DRAWERS: Record<HairStyle, HairDrawers> = {
  short: {
    front: (g) => cap(g, FRINGE_DEFAULT),
  },
  quiff: {
    front: (g) => {
      cap(g, [
        [48, 30],
        [45, 22],
        [36, 19],
        [26, 19],
        [16, 23],
        [12, 30],
      ]);
      poly(
        g,
        [
          [14, 22],
          [16, 10],
          [28, 3],
          [44, 4],
          [52, 12],
          [44, 14],
          [36, 12],
          [30, 18],
        ],
        HAIR,
        HAIR_LINE,
        2,
      );
      g.lineStyle(2, HAIR_SHADE, 1);
      g.lineBetween(22, 12, 36, 7);
      g.lineBetween(26, 16, 40, 10);
    },
    rearExtra: (g) => {
      poly(g, [[16, 16], [28, 3], [44, 4], [52, 12], [40, 14]], HAIR, HAIR_LINE, 2);
    },
  },
  bob: {
    back: (g) => rrect(g, 9, 18, 42, 36, 14, HAIR_SHADE, HAIR_LINE),
    front: (g) => {
      cap(g, [
        [48, 34],
        [42, 24],
        [30, 25],
        [18, 24],
        [12, 34],
      ]);
      rrect(g, 9, 24, 10, 28, 5, HAIR, HAIR_LINE);
      rrect(g, 41, 24, 10, 28, 5, HAIR, HAIR_LINE);
    },
  },
  bun: {
    front: (g) => {
      circle(g, C, 9, 9, HAIR, HAIR_LINE);
      g.lineStyle(2, HAIR_SHADE, 1);
      g.strokeCircle(C, 9, 4);
      cap(g, [
        [48, 30],
        [42, 22],
        [30, 20],
        [18, 22],
        [12, 30],
      ]);
    },
    rearExtra: (g) => circle(g, C, 9, 9, HAIR, HAIR_LINE),
  },
  curly: {
    back: (g) => puffs(g, [[12, 36, 7], [48, 36, 7]], HAIR_SHADE),
    front: (g) => {
      puffs(g, [...arcPuffs(16, 8, 7), [C, 15, 9], [22, 18, 6], [38, 18, 6]]);
    },
    rearExtra: (g) => puffs(g, arcPuffs(16, 8, 7)),
  },
  long: {
    back: (g) => rrect(g, 8, 18, 44, 40, 16, HAIR_SHADE, HAIR_LINE),
    front: (g) => {
      cap(g, [
        [48, 32],
        [40, 20],
        [32, 22],
        [22, 28],
        [12, 32],
      ]);
      rrect(g, 9, 26, 9, 30, 4, HAIR, HAIR_LINE);
      rrect(g, 42, 26, 9, 30, 4, HAIR, HAIR_LINE);
    },
    rearExtra: (g) => rrect(g, 9, 20, 42, 38, 16, HAIR, HAIR_LINE),
  },
  perm: {
    back: (g) => puffs(g, [[10, 34, 8], [50, 34, 8], [14, 44, 6], [46, 44, 6]], HAIR_SHADE),
    front: (g) => {
      puffs(g, [...arcPuffs(18, 9, 8), [20, 10, 9], [40, 10, 9], [C, 6, 10], [C, 18, 8]]);
      g.lineStyle(1.5, HAIR_SHADE, 1);
      for (const [x, y] of [[20, 10], [40, 10], [30, 6]] as const) g.strokeCircle(x, y, 4);
    },
    rearExtra: (g) => puffs(g, [...arcPuffs(18, 9, 8), [20, 10, 9], [40, 10, 9], [C, 6, 10]]),
  },
  bald: {
    front: (g) => {
      rrect(g, 12, 26, 6, 12, 3, HAIR, HAIR_LINE, 1.5);
      rrect(g, 42, 26, 6, 12, 3, HAIR, HAIR_LINE, 1.5);
    },
  },
};

function generateHair(scene: Phaser.Scene): void {
  for (const [style, d] of Object.entries(HAIR_DRAWERS)) {
    if (d.front) makeTexture(scene, hairFrontKey(style), HAIR_SIZE, HAIR_SIZE, d.front);
    if (d.back) makeTexture(scene, hairBackKey(style), HAIR_SIZE, HAIR_SIZE, d.back);
    // Rear view: the hair seen from behind, drawn over the head.
    makeTexture(scene, hairRearKey(style), HAIR_SIZE, HAIR_SIZE, (g) => {
      d.back?.(g);
      if (style === 'bald') {
        d.front?.(g);
        return;
      }
      circle(g, C, C + 1, 17, HAIR, HAIR_LINE);
      g.fillStyle(HAIR_SHADE, 1);
      g.fillEllipse(C, C + 10, 24, 8);
      d.rearExtra?.(g);
    });
  }
}

function drawTorso(g: G, shirt: number, sleeve: number, line: number): void {
  rrect(g, 2, 6, 10, 24, 5, sleeve, line);
  rrect(g, 28, 6, 10, 24, 5, sleeve, line);
  rrect(g, 7, 2, 26, 31, 10, shirt, line);
}

export function generateCharacterTextures(scene: Phaser.Scene): void {
  generateHair(scene);

  // Head (tinted with skin). 40x40, center (20, 20).
  makeTexture(scene, TEX.head, 40, 40, (g) => {
    circle(g, 5, 22, 4, 0xf0f0f0, TINT_LINE, 1.5);
    circle(g, 35, 22, 4, 0xf0f0f0, TINT_LINE, 1.5);
    circle(g, 20, 20, 15, 0xffffff, TINT_LINE, 2);
  });

  // Hands (tinted with skin), aligned under the sleeves
  makeTexture(scene, TEX.hands, 36, 10, (g) => {
    circle(g, 5, 5, 3.5, 0xffffff, TINT_LINE, 1.5);
    circle(g, 31, 5, 3.5, 0xffffff, TINT_LINE, 1.5);
  });

  makeTexture(scene, TEX.leg, 12, 16, (g) => {
    rrect(g, 1, 0, 10, 13, 4, 0xffffff, TINT_LINE, 1.5);
    rrect(g, 0, 10, 12, 6, 3, 0x6a6a6a, 0x505050, 1.5);
  });

  // Tintable torso: white with grey shading
  makeTexture(scene, TEX.body, 40, 34, (g) => {
    drawTorso(g, 0xffffff, 0xe4e4e4, TINT_LINE);
    poly(g, [[15, 3], [20, 11], [25, 3]], 0xd6d6d6, TINT_LINE, 1.5);
    g.fillStyle(0xffffff, 0.6);
    g.fillRoundedRect(10, 6, 5, 18, 2);
  });

  // The hairdressers: shirt + apron, told apart by apron color, pocket tool and hair
  hairdresserBody(scene, TEX.rasmusBody, P.rasmusShirt, 0xe6e0d8, P.rasmusApron, P.rasmusApronDark, scissorsEmblem);
  hairdresserBody(scene, TEX.karlBody, P.karlShirt, 0xccd8e6, P.karlApron, P.karlApronDark, combEmblem);
}

/** Crossed scissors on the apron pocket. */
function scissorsEmblem(g: G): void {
  g.lineStyle(1.5, P.chrome, 1);
  g.lineBetween(16, 17, 22, 24);
  g.lineBetween(22, 17, 16, 24);
}

/** A comb on the apron pocket. */
function combEmblem(g: G): void {
  rrect(g, 15, 17, 11, 4, 1.5, P.chrome, P.outline, 1);
  g.lineStyle(1.2, P.outline, 1);
  for (let x = 17; x <= 24; x += 2.2) g.lineBetween(x, 21, x, 24);
}

function hairdresserBody(
  scene: Phaser.Scene,
  key: string,
  shirt: number,
  sleeve: number,
  apron: number,
  apronDark: number,
  emblem: (g: G) => void,
): void {
  makeTexture(scene, key, 40, 34, (g) => {
    drawTorso(g, shirt, sleeve, P.outline);
    g.lineStyle(2, apronDark, 1);
    g.lineBetween(13, 3, 14, 10);
    g.lineBetween(27, 3, 26, 10);
    rrect(g, 10, 9, 20, 24, 6, apron, P.outline, 2);
    rrect(g, 14, 20, 12, 8, 3, apronDark, null);
    emblem(g);
    g.fillStyle(0xffffff, 0.3);
    g.fillRoundedRect(12, 11, 4, 12, 2);
  });
}
